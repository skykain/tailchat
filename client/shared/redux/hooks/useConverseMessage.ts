import { useEffect } from 'react';
import { ensureDMConverse } from '../../helper/converse-helper';
import { useAsync } from '../../hooks/useAsync';
import { showErrorToasts } from '../../manager/ui';
import {
  fetchConverseMessage,
  sendMessage,
  SendMessagePayload,
} from '../../model/message';
import { chatActions } from '../slices';
import { useAppDispatch, useAppSelector } from './useAppSelector';
import _get from 'lodash/get';
import _isNil from 'lodash/isNil';
import _uniqueId from 'lodash/uniqueId';
import {
  ChatConverseState,
  isValidStr,
  t,
  useAsyncRequest,
  useChatBoxContext,
  useEvent,
  useMemoizedFn,
} from '../..';
import { MessageHelper } from '../../utils/message-helper';
import { ChatConverseType } from '../../model/converse';
import { sharedEvent } from '../../event';
import { useUpdateRef } from '../../hooks/useUpdateRef';

const genLocalMessageId = () => _uniqueId('localMessage_');

function useHandleSendMessage() {
  const userId = useAppSelector((state) => state.user.info?._id);
  const dispatch = useAppDispatch();
  const { hasContext, replyMsg, clearReplyMsg } = useChatBoxContext();
  const replyMsgRef = useUpdateRef(replyMsg); // NOTICE: 这个是为了修复一个边界case: 当先输入文本再选中消息回复时，直接发送无法带上回复信息

  /**
   * 发送消息
   */
  const handleSendMessage = useEvent((payload: SendMessagePayload) => {
    // 输入合法性检测
    if (payload.content === '') {
      showErrorToasts(t('无法发送空消息'));
      return;
    }

    if (hasContext === true) {
      // 如果有上下文, 则组装payload
      const msgHelper = new MessageHelper(payload);
      if (!_isNil(replyMsgRef.current)) {
        msgHelper.setReplyMsg(replyMsgRef.current);
        clearReplyMsg();
      }

      payload = msgHelper.generatePayload();
    }

    const localMessageId = genLocalMessageId();
    dispatch(
      chatActions.appendLocalMessage({
        author: userId,
        localMessageId,
        payload,
      })
    );

    sendMessage(payload)
      .then((message) => {
        dispatch(
          chatActions.deleteMessageById({
            converseId: payload.converseId,
            messageId: localMessageId,
          })
        );
        dispatch(
          chatActions.appendConverseMessage({
            converseId: payload.converseId,
            messages: [message],
          })
        ); // 确保删除消息后会立即显示消息，适用于网络卡顿的情况，同时远程的socket会接收到消息广播，在redux中会自动去重

        sharedEvent.emit('sendMessage', payload);
      })
      .catch((err) => {
        showErrorToasts(err);
        dispatch(
          chatActions.updateMessageInfo({
            messageId: localMessageId,
            message: {
              sendFailed: true,
            },
          })
        );
      });
  });

  return handleSendMessage;
}

/**
 * 会话消息管理
 */
interface ConverseContext {
  converseId: string;
  isGroup: boolean;
}
export function useConverseMessage(context: ConverseContext) {
  const { converseId, isGroup } = context;
  const converse = useAppSelector<ChatConverseState | undefined>(
    (state) => state.chat.converses[converseId]
  );
  const reconnectNum = useAppSelector((state) => state.global.reconnectNum);
  const hasMoreMessage = converse?.hasMoreMessage ?? true;
  const dispatch = useAppDispatch();
  const messages = converse?.messages ?? [];
  const currentUserId = useAppSelector((state) => state.user.info?._id);

  useEffect(() => {
    dispatch(chatActions.updateCurrentConverseId(converseId));

    return () => {
      dispatch(chatActions.updateCurrentConverseId(null));
    };
  }, [converseId]);

  // NOTICE: 该hook只会在converseId变化和重新链接时执行
  const { loading, error } = useAsync(async () => {
    if (!currentUserId) {
      // 如果当前用户不存在则跳过逻辑
      return;
    }

    if (!converse) {
      // 如果是一个新会话(或者当前会话列表中没有)
      if (!isGroup) {
        // 如果是私信会话
        // Step 1. 创建会话 并确保私信列表中存在该会话
        const converse = await ensureDMConverse(converseId, currentUserId);
        dispatch(chatActions.setConverseInfo(converse));
      } else {
        // 如果是群组会话(文本频道)
        // Step 1. 确保群组会话存在
        dispatch(
          chatActions.setConverseInfo({
            _id: converseId,
            name: '',
            type: ChatConverseType.Group,
            members: [],
          })
        );
      }

      // Step 2. 拉取消息
      const historyMessages = await fetchConverseMessage(converseId);
      dispatch(
        chatActions.initialHistoryMessage({
          converseId,
          historyMessages,
        })
      );
    } else {
      // 已存在会话
      if (!converse.hasFetchedHistory) {
        // 没有获取过历史消息
        // 拉取历史消息
        const startId = _isNil(converse.messages[0])
          ? undefined
          : converse.messages[0]._id;
        const messages = await fetchConverseMessage(converseId, startId);
        dispatch(
          chatActions.initialHistoryMessage({
            converseId,
            historyMessages: messages,
          })
        );
      }
    }
  }, [converseId, reconnectNum, currentUserId]);

  // 加载更多消息
  const [{ loading: isLoadingMore }, _handleFetchMoreMessage] =
    useAsyncRequest(async () => {
      const firstMessageId = _get(messages, [0, '_id']);
      if (!isValidStr(firstMessageId)) {
        return;
      }

      if (hasMoreMessage === false) {
        return;
      }

      const olderMessages = await fetchConverseMessage(
        converseId,
        firstMessageId
      );
      dispatch(
        chatActions.appendHistoryMessage({
          converseId,
          historyMessages: olderMessages,
        })
      );
    }, [converseId, hasMoreMessage, _get(messages, [0, '_id'])]);

  /**
   * 加载更多
   * 同一时间只能请求一次
   */
  const handleFetchMoreMessage = useMemoizedFn(async () => {
    if (isLoadingMore) {
      return;
    }

    await _handleFetchMoreMessage();
  });

  const handleSendMessage = useHandleSendMessage();

  return {
    messages,
    loading,
    error,
    isLoadingMore,
    hasMoreMessage,
    handleFetchMoreMessage,
    handleSendMessage,
  };
}
