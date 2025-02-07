import {
  getModelForClass,
  prop,
  DocumentType,
  Ref,
  ReturnModelType,
  modelOptions,
  Severity,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import _ from 'lodash';
import { Types } from 'mongoose';
import {
  allPermission,
  call,
  GroupPanelType,
  NoPermissionError,
  PERMISSION,
  SYSTEM_USERID,
  TcContext,
} from 'tailchat-server-sdk';
import { User } from '../user/user';

class GroupMember {
  @prop({
    type: () => String,
  })
  roles?: string[]; // 角色权限组id

  @prop({
    ref: () => User,
  })
  userId: Ref<User>;

  /**
   * 禁言到xxx 为止
   */
  @prop()
  muteUntil?: Date;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class GroupPanel {
  @prop()
  id: string; // 在群组中唯一, 可以用任意方式进行生成。这里使用ObjectId, 但不是ObjectId类型

  @prop()
  name: string; // 用于显示的名称

  @prop()
  parentId?: string; // 父节点id

  /**
   * 面板类型:
   *  0 文本频道
   *  1 面板分组
   *  2 插件
   *
   * Reference: https://discord.com/developers/docs/resources/channel#channel-object-channel-types
   */
  @prop({
    type: () => Number,
  })
  type: GroupPanelType;

  @prop()
  provider?: string; // 面板提供者，为插件的标识，仅面板类型为插件时有效

  @prop()
  pluginPanelName?: string; // 插件面板名, 如 com.msgbyte.webview/grouppanel

  /**
   * 面板的其他数据
   */
  @prop()
  meta?: object;

  /**
   * 身份组或者用户的权限
   * 如果没有设定则应用群组权限
   *
   * key 为身份组id或者用户id
   * value 为权限字符串列表
   */
  @prop()
  permissionMap?: Record<string, string[]>;

  /**
   * 所有人的权限列表
   * 如果没有设定则应用群组权限
   */
  @prop({
    type: () => String,
    default: () => [],
  })
  fallbackPermissions?: string[];
}

/**
 * 群组权限组
 */
export class GroupRole implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop()
  name: string; // 权限组名

  @prop({
    type: () => String,
  })
  permissions: string[]; // 拥有的权限, 是一段字符串
}

/**
 * 群组
 */
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Group extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop({
    trim: true,
    maxlength: [100, 'group name is too long'],
  })
  name!: string;

  @prop()
  avatar?: string;

  @prop({
    ref: () => User,
  })
  owner: Ref<User>;

  @prop({
    maxlength: 120,
  })
  description?: string;

  @prop({ type: () => GroupMember, _id: false })
  members: GroupMember[];

  @prop({ type: () => GroupPanel, _id: false })
  panels: GroupPanel[];

  @prop({
    type: () => GroupRole,
    default: [],
  })
  roles: GroupRole[];

  /**
   * 所有人的权限列表
   * 为群组中的最低权限
   */
  @prop({
    type: () => String,
    default: () => [],
  })
  fallbackPermissions: string[];

  /**
   * 群组的配置信息
   */
  @prop({ default: () => ({}) })
  config: object;

  /**
   * 创建群组
   */
  static async createGroup(
    this: ReturnModelType<typeof Group>,
    options: {
      name: string;
      avatarBase64?: string; // base64版本的头像字符串
      panels?: GroupPanel[];
      owner: string;
    }
  ): Promise<GroupDocument> {
    const { name, avatarBase64, panels = [], owner } = options;
    if (typeof avatarBase64 === 'string') {
      // TODO: 处理头像上传逻辑
    }

    // 预处理panels信息, 变换ID为objectid
    const panelSectionMap: Record<string, string> = {};
    panels.forEach((panel) => {
      const originPanelId = panel.id;
      panel.id = String(new Types.ObjectId());
      if (panel.type === GroupPanelType.GROUP) {
        panelSectionMap[originPanelId] = panel.id;
      }

      if (typeof panel.parentId === 'string') {
        if (typeof panelSectionMap[panel.parentId] !== 'string') {
          throw new Error('创建失败, 面板参数不合法');
        }
        panel.parentId = panelSectionMap[panel.parentId];
      }
    });

    // NOTE: Expression produces a union type that is too complex to represent.
    const res = await this.create({
      name,
      panels,
      owner,
      members: [
        {
          roles: [],
          userId: owner,
        },
      ],
    });

    return res;
  }

  /**
   * 获取用户加入的群组列表
   * @param userId 用户ID
   */
  static async getUserGroups(
    this: ReturnModelType<typeof Group>,
    userId: string
  ): Promise<GroupDocument[]> {
    return this.find({
      'members.userId': userId,
    });
  }

  /**
   * 修改群组角色名
   */
  static async updateGroupRoleName(
    this: ReturnModelType<typeof Group>,
    groupId: string,
    roleId: string,
    roleName: string
  ): Promise<Group> {
    const group = await this.findById(groupId);
    if (!group) {
      throw new Error('Not Found Group');
    }

    const modifyRole = group.roles.find((role) => String(role._id) === roleId);
    if (!modifyRole) {
      throw new Error('Not Found Role');
    }

    modifyRole.name = roleName;
    await group.save();

    return group;
  }

  /**
   * 修改群组角色权限
   */
  static async updateGroupRolePermission(
    this: ReturnModelType<typeof Group>,
    groupId: string,
    roleId: string,
    permissions: string[]
  ): Promise<Group> {
    const group = await this.findById(groupId);
    if (!group) {
      throw new Error('Not Found Group');
    }

    const modifyRole = group.roles.find((role) => String(role._id) === roleId);
    if (!modifyRole) {
      throw new Error('Not Found Role');
    }

    modifyRole.permissions = [...permissions];
    await group.save();

    return group;
  }

  /**
   * 获取用户所有权限
   */
  static async getGroupUserPermission(
    this: ReturnModelType<typeof Group>,
    groupId: string,
    userId: string
  ): Promise<string[]> {
    const group = await this.findById(groupId);
    if (!group) {
      throw new Error('Not Found Group');
    }

    if (userId === SYSTEM_USERID) {
      return allPermission;
    }

    const member = group.members.find(
      (member) => String(member.userId) === userId
    );

    if (!member) {
      throw new Error('Not Found Member');
    }

    const allRoles = member.roles;
    const allRolesPermission = allRoles.map((roleName) => {
      const p = group.roles.find((r) => String(r._id) === roleName);

      return p?.permissions ?? [];
    });

    if (String(group.owner) === userId) {
      /**
       * 群组管理者有所有权限
       * 这里是为了避免插件权限无法预先感知到的问题
       */

      return _.uniq([
        ...allPermission,
        ..._.flatten(allRolesPermission),
        ...group.fallbackPermissions,
      ]);
    } else {
      return _.uniq([
        ..._.flatten(allRolesPermission),
        ...group.fallbackPermissions,
      ]);
    }
  }

  /**
   * 检查群组字段操作权限，如果没有权限会直接抛出异常
   */
  static async checkGroupFieldPermission<
    K extends keyof Pick<GroupMember, 'roles' | 'muteUntil'>
  >(
    this: ReturnModelType<typeof Group>,
    ctx: TcContext,
    groupId: string,
    fieldName: K
  ) {
    const userId = ctx.meta.userId;
    const t = ctx.meta.t;

    if (fieldName === 'roles') {
      // 检查操作用户是否有管理角色的权限
      const [hasRolePermission] = await call(ctx).checkUserPermissions(
        groupId,
        userId,
        [PERMISSION.core.manageRoles]
      );
      if (!hasRolePermission) {
        throw new NoPermissionError(t('没有操作角色权限'));
      }
    } else {
      // 检查操作用户是否有管理用户权限
      const [hasUserPermission] = await call(ctx).checkUserPermissions(
        groupId,
        userId,
        [PERMISSION.core.manageUser]
      );
      if (!hasUserPermission) {
        throw new NoPermissionError(t('没有操作用户权限'));
      }
    }
  }

  /**
   * 修改群组成员的字段信息
   *
   * 带权限验证
   */
  static async updateGroupMemberField<
    K extends keyof Pick<GroupMember, 'roles' | 'muteUntil'>
  >(
    this: ReturnModelType<typeof Group>,
    ctx: TcContext,
    groupId: string,
    memberId: string,
    fieldName: K,
    fieldValue: GroupMember[K] | ((member: GroupMember) => void)
  ): Promise<Group> {
    const group = await this.findById(groupId);
    const t = ctx.meta.t;

    await this.checkGroupFieldPermission(ctx, groupId, fieldName);

    const member = group.members.find((m) => String(m.userId) === memberId);
    if (!member) {
      throw new Error(t('没有找到该成员'));
    }

    if (typeof fieldValue === 'function') {
      fieldValue(member);
    } else {
      member[fieldName] = fieldValue;
    }

    await group.save();

    return group;
  }
}

export type GroupDocument = DocumentType<Group>;

const model = getModelForClass(Group);

export type GroupModel = typeof model;

export default model;
