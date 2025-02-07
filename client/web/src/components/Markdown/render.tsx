import { makeAbsoluteUrl } from '@/utils/url-helper';
import React, { useCallback, useMemo } from 'react';
import { isValidStr, parseUrlStr, useTranslation } from 'tailchat-shared';
import { Loadable } from '../Loadable';
import { Image } from 'tailchat-design';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import './render.less';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ReactMarkdown = Loadable(() => import('react-markdown'));

export const Markdown: React.FC<{
  raw: string;
  allowIframe?: boolean;
  baseUrl?: string;
}> = React.memo(({ raw, baseUrl, allowIframe }) => {
  const { t } = useTranslation();
  const transformUrl = useCallback(
    (url: string) => {
      url = parseUrlStr(url);
      if (!isValidStr(baseUrl)) {
        return url;
      }

      return new URL(url, makeAbsoluteUrl(baseUrl)).href;
    },
    [baseUrl]
  );

  /**
   * Markdown自定义渲染组件
   */
  const components = useMemo<
    React.ComponentProps<typeof ReactMarkdown>['components']
  >(
    () => ({
      img: (props) => (
        <Image
          style={props.style}
          width={props.width}
          height={props.height}
          src={props.src}
          preview={true}
        />
      ),
      svg: () => <div>not support svg</div>,
      iframe: (props) => {
        if (!allowIframe) {
          return <div>{t('不支持iframe')}</div>;
        }

        let src = props.src;

        if (!src) {
          return <div />;
        }

        if (!src.startsWith('http')) {
          return <div>{t('只支持http路径')}</div>;
        }

        if (src && src.includes('?')) {
          src += '&autoplay=0'; // make sure media autoplay is false
        }
        return <iframe {...props} src={src} />;
      },
      embed: () => <div>{t('不支持embed')}</div>,
      html: () => <div>{t('不支持自定义HTML')}</div>,
      style: () => <div>{t('不支持自定义样式')}</div>,
      meta: () => <div>{t('不支持自定义Meta')}</div>,
    }),
    []
  );
  // [md]<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=113350126076732&bvid=BV1ZpyHYkEQ3&cid=26409569922&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>[/md]
  // <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=113350126076732&bvid=BV1ZpyHYkEQ3&cid=26409569922&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
  return (
    <ReactMarkdown
      className="tailchat-markdown"
      transformImageUri={(src) => transformUrl(src)}
      transformLinkUri={(href) => transformUrl(href)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      linkTarget="_blank"
      skipHtml={true}
      components={components}
    >
      {raw}
    </ReactMarkdown>
  );
});
Markdown.displayName = 'Markdown';
