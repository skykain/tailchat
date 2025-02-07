import React, { useEffect, useRef, useState } from 'react';
import { useEvent, useSharedEventHandler } from 'tailchat-shared';
import { ChatMessageHeader } from './ChatMessageHeader';
import { buildMessageItemRow } from './Item';
import { ScrollToBottom } from './ScrollToBottom';
import type { MessageListProps } from './types';

/**
 * 距离顶部触发加载更多的 buffer
 * 并处理在某些场景下计算位置会少1px导致无法正确触发加载的问题
 */
const topTriggerBuffer = 100;
const bottomTriggerBuffer = 40;

/**
 * 没有虚拟化版本的聊天列表
 */
export const NormalMessageList: React.FC<MessageListProps> = React.memo(
  (props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lockRef = useRef(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const scrollToBottom = useEvent(() => {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });

    useEffect(() => {
      if (props.messages.length === 0) {
        return;
      }

      // 消息长度发生变化，滚动到底部
      if (lockRef.current === false) {
        scrollToBottom();
      }
    }, [props.messages.length]);

    useSharedEventHandler('sendMessage', scrollToBottom);

    const handleScroll = useEvent(() => {
      if (props.messages.length === 0) {
        return;
      }

      if (!containerRef.current) {
        return;
      }

      if (-containerRef.current.scrollTop <= bottomTriggerBuffer) {
        // 滚动到最底部
        lockRef.current = false;
        setShowScrollToBottom(false);
      } else if (
        -containerRef.current.scrollTop + containerRef.current.clientHeight >=
        containerRef.current.scrollHeight - topTriggerBuffer
      ) {
        // 滚动条碰触到最顶部
        props.onLoadMore();
      } else {
        // 滚动在中间
        // 锁定位置不自动滚动
        lockRef.current = true;
        setShowScrollToBottom(true);
      }
    });

    return (
      <div
        className="flex-1 overflow-y-scroll overflow-x-hidden flex flex-col-reverse"
        ref={containerRef}
        onScroll={handleScroll}
      >
        <div>
          {props.messages.map((message, index, arr) =>
            buildMessageItemRow(arr, index)
          )}
        </div>

        {showScrollToBottom && <ScrollToBottom onClick={scrollToBottom} />}

        {/* 因为是倒过来的，因此要前面的要放在后面 */}
        {props.title && !props.hasMoreMessage && (
          <ChatMessageHeader title={props.title} />
        )}
      </div>
    );
  }
);
NormalMessageList.displayName = 'NormalMessageList';
