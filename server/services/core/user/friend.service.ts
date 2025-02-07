import type {
  Friend,
  FriendDocument,
  FriendModel,
} from '../../../models/user/friend';
import { TcService, TcDbService, TcContext } from 'tailchat-server-sdk';
import { isNil } from 'lodash';

interface FriendService
  extends TcService,
    TcDbService<FriendDocument, FriendModel> {}
class FriendService extends TcService {
  get serviceName(): string {
    return 'friend';
  }
  onInit(): void {
    this.registerLocalDb(require('../../../models/user/friend').default);
    // this.registerMixin(TcCacheCleaner(['cache.clean.friend']));

    this.registerAction('getAllFriends', this.getAllFriends);
    this.registerAction('buildFriendRelation', this.buildFriendRelation, {
      params: {
        user1: 'string',
        user2: 'string',
      },
    });
    this.registerAction('removeFriend', this.removeFriend, {
      params: {
        friendUserId: 'string',
      },
    });
    this.registerAction('checkIsFriend', this.checkIsFriend, {
      params: {
        targetId: 'string',
      },
    });
    this.registerAction('setFriendNickname', this.setFriendNickname, {
      params: {
        targetId: 'string',
        nickname: 'string',
      },
    });
  }

  /**
   * 获取所有好友
   */
  async getAllFriends(ctx: TcContext<{}>) {
    const userId = ctx.meta.userId;

    const list = await this.adapter.find({
      query: {
        from: userId,
      },
    });

    const records: Friend[] = await this.transformDocuments(ctx, {}, list);
    const res = records.map((r) => ({
      id: r.to,
      nickname: r.nickname,
    }));

    return res;
  }

  /**
   * 构建好友关系
   */
  async buildFriendRelation(ctx: TcContext<{ user1: string; user2: string }>) {
    const { user1, user2 } = ctx.params;
    await this.adapter.model.buildFriendRelation(user1, user2);

    this.unicastNotify(ctx, user1, 'add', {
      userId: user2,
    });
    this.unicastNotify(ctx, user2, 'add', {
      userId: user1,
    });
  }

  /**
   * 移除单项好友关系
   */
  async removeFriend(ctx: TcContext<{ friendUserId: string }>) {
    const { friendUserId } = ctx.params;
    const { userId } = ctx.meta;

    await this.adapter.model.findOneAndRemove({
      from: userId,
      to: friendUserId,
    });
  }

  /**
   * 检查对方是否为自己好友
   */
  async checkIsFriend(ctx: TcContext<{ targetId: string }>) {
    const { targetId } = ctx.params;
    const userId = ctx.meta.userId;

    const isFriend = await this.adapter.model.exists({
      from: userId,
      to: targetId,
    });

    return isFriend;
  }

  /**
   * 设置好友昵称
   */
  async setFriendNickname(
    ctx: TcContext<{ targetId: string; nickname: string }>
  ) {
    const { targetId, nickname } = ctx.params;
    const userId = ctx.meta.userId;
    const t = ctx.meta.t;

    const res = await this.adapter.model.findOneAndUpdate(
      {
        from: userId,
        to: targetId,
      },
      {
        nickname: nickname,
      }
    );

    if (isNil(res)) {
      throw new Error(t('设置昵称失败, 没有找到好友关系信息'));
    }

    return true;
  }
}
export default FriendService;
