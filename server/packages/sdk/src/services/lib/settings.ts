import dotenv from 'dotenv';
import _ from 'lodash';

dotenv.config();

/**
 * 配置信息
 */
const port = process.env.PORT ? Number(process.env.PORT) : 11000;
const apiUrl = process.env.API_URL || `http://127.0.0.1:${port}`;
const staticHost = process.env.STATIC_HOST || '{BACKEND}';
const staticUrl = process.env.STATIC_URL || `${staticHost}/static/`;
const requestTimeout = process.env.REQUEST_TIMEOUT
  ? Number(process.env.REQUEST_TIMEOUT)
  : 10 * 1000; // default 0 (unit: milliseconds)

export const config = {
  port,
  secret: process.env.SECRET || 'tailchat',
  env: process.env.NODE_ENV || 'development',
  /**
   * 是否打开socket admin ui
   */
  enableSocketAdmin: !!process.env.ADMIN,
  redisUrl: process.env.REDIS_URL,
  mongoUrl: process.env.MONGO_URL,
  storage: {
    type: 'minio', // 可选: minio
    minioUrl: process.env.MINIO_URL,
    ssl: checkEnvTrusty(process.env.MINIO_SSL) ?? false,
    user: process.env.MINIO_USER,
    pass: process.env.MINIO_PASS,
    bucketName: process.env.MINIO_BUCKET_NAME || 'tailchat',
    pathStyle: process.env.MINIO_PATH_STYLE === 'VirtualHosted' ? false : true,

    /**
     * 文件上传限制
     * 单位byte
     * 默认 1m
     */
    limit: process.env.FILE_LIMIT
      ? Number(process.env.FILE_LIMIT)
      : 1 * 1024 * 1024,
  },
  apiUrl,
  staticUrl,
  enableOpenapi: true, // 是否开始openapi

  emailVerification: checkEnvTrusty(process.env.EMAIL_VERIFY) || false, // 是否在注册后验证邮箱可用性
  smtp: {
    senderName: process.env.SMTP_SENDER, // 发邮件者显示名称
    connectionUrl: process.env.SMTP_URI || '',
  },
  enablePrometheus: checkEnvTrusty(process.env.PROMETHEUS),
  runner: {
    requestTimeout,
  },
  /**
   * 使用Tianji对网站进行监控
   */
  tianji: {
    scriptUrl: process.env.TIANJI_SCRIPT_URL,
    websiteId: process.env.TIANJI_WEBSITE_ID,
  },
  feature: {
    disableMsgpack: checkEnvTrusty(process.env.DISABLE_MESSAGEPACK), // 是否禁用socketio的 messgpack parser
    disableFileCheck: checkEnvTrusty(process.env.DISABLE_FILE_CHECK),
    disableLogger: checkEnvTrusty(process.env.DISABLE_LOGGER), // 是否关闭日志
    disableInfoLog: checkEnvTrusty(process.env.DISABLE_INFO_LOG), // 是否关闭常规日志(仅保留错误日志)
    disableTracing: checkEnvTrusty(process.env.DISABLE_TRACING), // 是否关闭链路追踪
    disableUserRegister: checkEnvTrusty(process.env.DISABLE_USER_REGISTER), // 是否关闭用户注册功能
    disableGuestLogin: checkEnvTrusty(process.env.DISABLE_GUEST_LOGIN), // 是否关闭用户游客登录功能
    disableCreateGroup: checkEnvTrusty(process.env.DISABLE_CREATE_GROUP), // 是否禁用用户创建群组功能
    disablePluginStore: checkEnvTrusty(process.env.DISABLE_PLUGIN_STORE), // 是否禁用用户插件中心功能
    disableAddFriend: checkEnvTrusty(process.env.DISABLE_ADD_FRIEND), // 是否禁用用户添加好友功能
    disableTelemetry: checkEnvTrusty(process.env.DISABLE_TELEMETRY), // 是否禁用遥测
  },
};

export const builtinAuthWhitelist = [
  '/gateway/health',
  '/debug/hello',
  '/user/login',
  '/user/register',
  '/user/createTemporaryUser',
  '/user/resolveToken',
  '/user/getUserInfo',
  '/user/getUserInfoList',
  '/user/checkTokenValid',
  '/group/getGroupBasicInfo',
  '/group/invite/findInviteByCode',
];

/**
 * 构建上传地址
 */
export function buildUploadUrl(objectName: string) {
  return config.staticUrl + objectName;
}

/**
 * 判断环境变量是否为true
 */
export function checkEnvTrusty(env: string): boolean {
  return env === '1' || env === 'true';
}
