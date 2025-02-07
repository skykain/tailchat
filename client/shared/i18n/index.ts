import i18next, {
  StringMap,
  TFunctionKeys,
  TOptions,
  TOptionsBase,
} from 'i18next';
import {
  useTranslation as useI18NTranslation,
  initReactI18next,
} from 'react-i18next';
import { crc32 } from 'crc';
import { defaultLanguage, languageDetector } from './language';
import { useState, useEffect } from 'react';
import HttpApi from 'i18next-http-backend'; // https://github.com/i18next/i18next-http-backend

/**
 * 允许出现的语言
 */
export type AllowedLanguage = 'zh-CN' | 'en-US';

i18next
  .use(languageDetector)
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLanguage,
    load: 'currentOnly',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      allowMultiLoading: false,
      addPath: (...args: any[]) => {
        console.log('Lost translate:', ...args);
      },
    },
    react: {
      // Reference: https://react.i18next.com/latest/trans-component#i-18-next-options
      hashTransKey(defaultValue: string) {
        // return a key based on defaultValue or if you prefer to just remind you should set a key return false and throw an error
        return `k${crc32(defaultValue).toString(16)}`;
      },
    },
  } as any);

type TFunctionResult = string | React.ReactNode;

// Fork from i18next
interface TFunction {
  // basic usage
  <TKeys extends TFunctionKeys = string>(key: TKeys): string;
  <
    TResult extends TFunctionResult = string,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap
  >(
    key: TKeys,
    options?: TOptions<TInterpolationMap> | string
  ): TResult;
  // overloaded usage
  <
    TResult extends TFunctionResult = string,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap
  >(
    key: TKeys,
    defaultValue?: string,
    options?: TOptions<TInterpolationMap> | string
  ): TResult;
}

/**
 * 国际化翻译
 */
export const t: TFunction = (
  key: string,
  defaultValue?: string,
  options?: TOptionsBase & Record<string, unknown>
) => {
  try {
    const hashKey = `k${crc32(key).toString(16)}`;
    let words = i18next.t(hashKey, defaultValue, options);
    if (words === hashKey) {
      words = key;
      console.info(`[i18n] 翻译缺失: [${hashKey}]${key}`);
    }
    return words;
  } catch (err) {
    console.error(err);
    return key;
  }
};

/**
 * 本地翻译
 * @example
 * localTrans({'zh-CN': '你好', 'en-US': 'Hello'});
 *
 * @param trans 翻译对象
 */
export function localTrans(trans: Record<AllowedLanguage, string>) {
  const lang = i18next.language as AllowedLanguage;
  return trans[lang] ?? trans['zh-CN'] ?? trans['en-US'];
}

/**
 * 设置i18next的语言
 */
export async function setLanguage(lang: AllowedLanguage): Promise<void> {
  return new Promise((resolve, reject) => {
    i18next.changeLanguage(lang, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * 获取i18n语言
 */
export function getLanguage(): AllowedLanguage {
  return i18next.language as AllowedLanguage;
}

/**
 * 语言加载
 */
export function onLanguageLoaded(
  cb: (loaded: { [language: string]: { [namespace: string]: boolean } }) => void
) {
  i18next.on('loaded', cb);
}

/**
 * 监听语言变更
 */
export function onLanguageChanged(cb: (lang: string) => void) {
  i18next.on('languageChanged', cb);
}

/**
 * fork from i18next/react-i18next/-/blob/src/useTranslation.js
 * i18n for react 使用hooks
 */
export function useTranslation() {
  const { t: i18nT, ready } = useI18NTranslation();

  const [_t, _setT] = useState<TFunction>(() => t);
  useEffect(() => {
    _setT(
      () =>
        (...args: any[]) =>
          (t as any)(...args)
    );
  }, [i18nT]);

  return { t: _t, ready };
}
