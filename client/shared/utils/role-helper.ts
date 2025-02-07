import { GroupPanelType } from 'tailchat-types';
import { model, t } from '..';

/**
 * 所有人权限
 * 群组最低权限标识
 */
export const ALL_PERMISSION = Symbol('AllPermission');

export interface PermissionItemType {
  /**
   * 权限唯一key, 用于写入数据库
   * 如果为插件则权限点应当符合命名规范, 如: plugin.com.msgbyte.github.manage
   */
  key: string;
  /**
   * 权限点显示名称
   */
  title: string;
  /**
   * 权限描述
   */
  desc: string;
  /**
   * 是否默认开启
   */
  default: boolean;
  /**
   * 是否依赖其他权限点
   */
  required?: string[];
  /**
   * 面板权限
   * 如果是内置类型(数字) 则仅会在规定的类型中展示
   * 如果是字符串数组则仅会在特定的插件面板中显示
   * 如果不传则视为不适用于面板
   *
   * @default undefined
   */
  panel?: boolean | (string | GroupPanelType)[];
}

export const PERMISSION = {
  /**
   * 非插件的权限点都叫core
   */
  core: {
    viewPanel: 'core.viewPanel',
    message: 'core.message',
    invite: 'core.invite',
    unlimitedInvite: 'core.unlimitedInvite',
    editInvite: 'core.editInvite',
    groupDetail: 'core.groupDetail',
    groupBaseInfo: 'core.groupBaseInfo',
    groupConfig: 'core.groupConfig',
    manageUser: 'core.manageUser',
    managePanel: 'core.managePanel',
    manageInvite: 'core.manageInvite',
    manageRoles: 'core.manageRoles',
    deleteMessage: 'core.deleteMessage',
  },
};

export const getPermissionList = (): PermissionItemType[] => [
  {
    key: PERMISSION.core.viewPanel,
    title: t('查看面板'),
    desc: t('允许成员查看面板'),
    default: true,
    panel: true,
  },
  {
    key: PERMISSION.core.message,
    title: t('发送消息'),
    desc: t('允许成员在文字频道发送消息'),
    default: true,
    panel: [GroupPanelType.TEXT],
  },
  {
    key: PERMISSION.core.invite,
    title: t('邀请链接'),
    desc: t('允许成员创建邀请链接'),
    default: false,
  },
  {
    key: PERMISSION.core.unlimitedInvite,
    title: t('不限时邀请链接'),
    desc: t('允许成员创建不限时邀请链接'),
    default: false,
    required: [PERMISSION.core.invite],
  },
  {
    key: PERMISSION.core.editInvite,
    title: t('编辑邀请链接'),
    desc: t('允许成员编辑邀请链接'),
    default: false,
    required: [PERMISSION.core.unlimitedInvite],
  },
  {
    key: PERMISSION.core.groupDetail,
    title: t('查看群组详情'),
    desc: t('允许成员查看群组详情'),
    default: false,
  },
  {
    key: PERMISSION.core.groupBaseInfo,
    title: t('修改群组基本信息'),
    desc: t('允许成员修改群组基本信息'),
    default: false,
    required: [PERMISSION.core.groupDetail],
  },
  {
    key: PERMISSION.core.groupConfig,
    title: t('修改群组配置'),
    desc: t('允许成员修改群组配置'),
    default: false,
    required: [PERMISSION.core.groupDetail],
  },
  {
    key: PERMISSION.core.manageUser,
    title: t('允许管理用户'),
    desc: t('允许成员管理用户，如禁言、移除用户等操作'),
    default: false,
    required: [PERMISSION.core.groupDetail],
  },
  {
    key: PERMISSION.core.managePanel,
    title: t('允许管理频道'),
    desc: t('允许成员查看管理频道'),
    default: false,
    required: [PERMISSION.core.groupDetail],
  },
  {
    key: PERMISSION.core.manageInvite,
    title: t('允许管理邀请链接'),
    desc: t('允许成员管理邀请链接'),
    default: false,
    required: [PERMISSION.core.groupDetail],
  },
  {
    key: PERMISSION.core.manageRoles,
    title: t('允许管理身份组'),
    desc: t('允许成员管理身份组'),
    default: false,
    required: [PERMISSION.core.groupDetail],
  },
  {
    key: PERMISSION.core.deleteMessage,
    title: t('删除消息'),
    desc: t('允许删除用户信息'),
    default: false,
    required: [PERMISSION.core.groupDetail],
  },
];

/**
 * 获取默认权限列表
 *
 * @default ['core.message']
 */
export function getDefaultPermissionList(): string[] {
  return getPermissionList()
    .filter((p) => p.default === true)
    .map((p) => p.key);
}

/**
 * 初始化默认所有人身份组权限
 */
export async function applyDefaultFallbackGroupPermission(groupId: string) {
  await model.group.modifyGroupField(
    groupId,
    'fallbackPermissions',
    getDefaultPermissionList()
  );
}
