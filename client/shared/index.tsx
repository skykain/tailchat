// api
export { buildStorage } from './api/buildStorage';
export { request } from './api/request';
export type { RequestConfig } from './api/request';
export { createSocket } from './api/socket';
export type { AppSocket } from './api/socket';

// cache
export {
  getCachedUserInfo,
  getCachedConverseInfo,
  getCachedBaseGroupInfo,
  getCachedGroupInviteInfo,
  getCachedRegistryPlugins,
  getCachedUserSettings,
} from './cache/cache';
export { useCachedOnlineStatus } from './cache/useCache';

// components
export { buildPortal, DefaultEventEmitter } from './components/Portal';
export { AlphaContainer } from './components/AlphaContainer';
export { DevContainer } from './components/DevContainer';
export { TcProvider } from './components/Provider';

// contexts
export {
  ChatBoxContextProvider,
  useChatBoxContext,
} from './contexts/ChatBoxContext';
export { useColorScheme } from './contexts/ColorSchemeContext';
export {
  ConverseMessageProvider,
  useConverseMessageContext,
} from './contexts/ConverseMessageContext';
export {
  GroupInfoContextProvider,
  useGroupInfoContext,
} from './contexts/GroupInfoContext';

// event
export { sharedEvent, useSharedEventHandler } from './event/index';
export type { SharedEventType } from './event/index';

// helper
export { getDMConverseName } from './helper/converse-helper';

// i18n
export {
  t,
  localTrans,
  setLanguage,
  getLanguage,
  useTranslation,
  onLanguageLoaded,
} from './i18n';
export type { AllowedLanguage } from './i18n';
export { Trans } from './i18n/Trans';
export { useLanguage } from './i18n/language';

// hooks
export { createUseStorageState } from './hooks/factory/createUseStorageState';
export { useAvailableServices } from './hooks/model/useAvailableServices';
export { useMessageNotifyEventFilter } from './hooks/model/useMessageNotifyEventFilter';
export { useCachedUserInfo } from './hooks/model/useUserInfo';
export { useUserInfoList } from './hooks/model/useUserInfoList';
export { useUsernames } from './hooks/model/useUsernames';
export {
  useUserSettings,
  useSingleUserSetting,
  useUserNotifyMute,
} from './hooks/model/useUserSettings';
export { useAlphaMode } from './hooks/useAlphaMode';
export { useAsync } from './hooks/useAsync';
export { useAsyncFn } from './hooks/useAsyncFn';
export { useAsyncRefresh } from './hooks/useAsyncRefresh';
export { useAsyncRequest } from './hooks/useAsyncRequest';
export { useDataReady } from './hooks/useDataReady';
export { useDebounce } from './hooks/useDebounce';
export { useEditValue } from './hooks/useEditValue';
export { useEvent } from './hooks/useEvent';
export { useInterval } from './hooks/useInterval';
export { useLazyValue } from './hooks/useLazyValue';
export { useMemoizedFn } from './hooks/useMemoizedFn';
export { useMountedState } from './hooks/useMountedState';
export { usePrevious } from './hooks/usePrevious';
export { useRafState } from './hooks/useRafState';
export { useSearch, useUserSearch } from './hooks/useSearch';
export { useShallowObject } from './hooks/useShallowObject';
export { useUpdateRef } from './hooks/useUpdateRef';
export { useWatch } from './hooks/useWatch';
export { useWhyDidYouUpdate } from './hooks/useWhyDidYouUpdate';

// manager
export { buildRegFn, buildRegList, buildRegMap } from './manager/buildReg';
export { getServiceUrl, setServiceUrl } from './manager/service';
export {
  setTokenGetter,
  refreshTokenGetter,
  setErrorHook,
} from './manager/request';
export { regSocketEventListener } from './manager/socket';
export { getStorage, setStorage, useStorage } from './manager/storage';
export {
  showToasts,
  setToasts,
  showErrorToasts,
  showSuccessToasts,
  showAlert,
  setAlert,
  showGlobalLoading,
  setGlobalLoading,
  showNotification,
  setNotification,
} from './manager/ui';

// model
export * as model from './model/__all__';
export { fetchAvailableServices } from './model/common';
export { fetchGlobalClientConfig, getGlobalConfig } from './model/config';
export {
  createDMConverse,
  appendDMConverseMembers,
  updateAck,
} from './model/converse';
export {
  addFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  denyFriendRequest,
  removeFriend,
} from './model/friend';
export type { FriendRequest } from './model/friend';
export {
  GroupPanelType,
  createGroup,
  createGroupInviteCode,
  getAllGroupInviteCode,
  getGroupBasicInfo,
  quitGroup,
  applyGroupInvite,
  deleteGroupInvite,
  modifyGroupField,
  createGroupPanel,
  modifyGroupPanel,
  deleteGroupPanel,
  createGroupRole,
  deleteGroupRole,
  updateGroupRoleName,
  updateGroupRolePermission,
  getGroupConfigWithInfo,
} from './model/group';
export type {
  GroupPanel,
  GroupInfo,
  GroupBasicInfo,
  GroupInvite,
  GroupMember,
  GroupPanelFeature,
} from './model/group';
export type {
  BasicInboxItem,
  MessageInboxItem,
  MarkdownInboxItem,
  InboxItem,
} from './model/inbox';
export {
  sendMessage,
  recallMessage,
  deleteMessage,
  addReaction,
  removeReaction,
} from './model/message';
export type {
  ChatMessageReaction,
  ChatMessage,
  SendMessagePayloadMeta,
} from './model/message';
export type { PluginManifest } from './model/plugin';
export type { UserBaseInfo, UserLoginInfo, UserSettings } from './model/user';
export {
  loginWithEmail,
  loginWithToken,
  registerWithEmail,
  modifyUserPassword,
  forgetPassword,
  resetPassword,
  createTemporaryUser,
  claimTemporaryUser,
  searchUserWithUniqueName,
  checkTokenValid,
  modifyUserField,
} from './model/user';

// redux
export {
  useAppSelector,
  useAppDispatch,
  useAppStore,
} from './redux/hooks/useAppSelector';
export { useDMConverseList } from './redux/hooks/useConverse';
export { useConverseAck } from './redux/hooks/useConverseAck';
export { useConverseMessage } from './redux/hooks/useConverseMessage';
export { useDMConverseName } from './redux/hooks/useDMConverseName';
export {
  useFriendNickname,
  useFriendNicknameMap,
} from './redux/hooks/useFriendNickname';
export {
  useGroupInfo,
  useGroupMemberIds,
  useGroupMemberInfos,
  useGroupPanels,
  useGroupPanelInfo,
  useIsGroupOwner,
  useGroupTextPanelUnread,
} from './redux/hooks/useGroup';
export { useGroupAck } from './redux/hooks/useGroupAck';
export { useGroupMemberMute } from './redux/hooks/useGroupMemberMute';
export {
  useGroupMemberAllPermissions,
  useGroupPanelMemberAllPermissions,
  useHasGroupPermission,
  useHasGroupPanelPermission,
} from './redux/hooks/useGroupPermission';
export { useUserInfo, useUserId } from './redux/hooks/useUserInfo';
export { useInboxList, useInboxItem } from './redux/hooks/useInbox';
export { useUnread } from './redux/hooks/useUnread';
export {
  userActions,
  groupActions,
  uiActions,
  chatActions,
  globalActions,
} from './redux/slices';
export type { ChatConverseState } from './redux/slices/chat';
export { setupRedux } from './redux/setup';
export { getReduxStore, ReduxProvider } from './redux/store';
export type { AppStore, AppState, AppDispatch } from './redux/store';

// store
export { useGlobalConfigStore } from './store/globalConfig';

// utils
export { joinArray } from './utils/array-helper';
export { NAME_REGEXP, SYSTEM_USERID } from './utils/consts';
export {
  shouldShowMessageTime,
  getMessageTimeDiff,
  showMessageTime,
  formatShortTime,
  formatFullTime,
  datetimeToNow,
  datetimeFromNow,
  humanizeMsDuration,
} from './utils/date-helper';
export {
  isBrowser,
  isNavigator,
  isDevelopment,
  isProduction,
  version,
} from './utils/environment';
export type { PermissionItemType } from './utils/role-helper';
export { isValidStr } from './utils/string-helper';
export { isValidJson } from './utils/json-helper';
export { MessageHelper } from './utils/message-helper';
export {
  PERMISSION,
  ALL_PERMISSION,
  getPermissionList,
  getDefaultPermissionList,
  applyDefaultFallbackGroupPermission,
} from './utils/role-helper';
export { uploadFile } from './utils/upload-helper';
export type { UploadFileResult, UploadFileUsage } from './utils/upload-helper';
export { parseUrlStr } from './utils/url-helper';
export { sleep } from './utils/utils';
