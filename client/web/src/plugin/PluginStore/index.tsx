/**
 * 插件商店
 */

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PillTabPane, PillTabs } from '@/components/PillTabs';
import { Divider } from 'antd';
import React from 'react';
import { t, useAsync } from 'tailchat-shared';
import { builtinPlugins } from '../builtin';
import { pluginManager } from '../manager';
import { PluginStoreItem } from './Item';
import { ManualInstall } from './ManualInstall';
import _uniqBy from 'lodash/uniqBy';

function usePluginStoreData() {
  const { loading: loading1, value: installedPluginList = [] } = useAsync(
    async () => pluginManager.getInstalledPlugins(),
    []
  );
  const { loading: loading2, value: allPlugins = [] } = useAsync(
    async () => pluginManager.getRegistryPlugins(),
    []
  );

  const loading = loading1 || loading2;

  return {
    loading,
    installedPluginList,
    allPlugins,
  };
}

export const PluginStore: React.FC = React.memo(() => {
  const { loading, installedPluginList, allPlugins } = usePluginStoreData();

  if (loading) {
    return <LoadingSpinner tip={t('正在加载插件列表')} />;
  }

  const installedPluginNameList = installedPluginList.map((p) => p.name);
  const builtinPluginNameList = builtinPlugins.map((p) => p.name);

  return (
    <div className="p-2 w-full">
      <PillTabs
        items={[
          {
            key: '1',
            label: t('已安装'),
            children: (
              <>
                <Divider orientation="left">{t('已安装')}</Divider>

                <div className="flex flex-wrap">
                  {_uniqBy(
                    [...builtinPlugins, ...installedPluginList],
                    'name'
                  ).map((plugin) => (
                    <PluginStoreItem
                      key={plugin.name}
                      manifest={plugin}
                      installed={true}
                      builtin={builtinPluginNameList.includes(plugin.name)}
                    />
                  ))}
                </div>
              </>
            ),
          },
          {
            key: '2',
            label: t('全部'),
            children: (
              <>
                <Divider orientation="left">{t('内置插件')}</Divider>

                <div className="flex flex-wrap">
                  {builtinPlugins.map((plugin) => (
                    <PluginStoreItem
                      key={plugin.name}
                      manifest={plugin}
                      installed={installedPluginNameList.includes(plugin.name)}
                      builtin={true}
                    />
                  ))}
                </div>

                <Divider orientation="left">{t('插件中心')}</Divider>

                <div className="flex flex-wrap">
                  {allPlugins
                    .filter((p) => !builtinPluginNameList.includes(p.name)) // 插件中心只显示不包含内置插件的插件
                    .map((plugin) => (
                      <PluginStoreItem
                        key={plugin.name}
                        manifest={plugin}
                        installed={installedPluginNameList.includes(
                          plugin.name
                        )}
                      />
                    ))}
                </div>
              </>
            ),
          },
          {
            key: '3',
            label: <span className="text-green-400">{t('手动安装')}</span>,
            children: <ManualInstall />,
          },
        ]}
      />
    </div>
  );
});
PluginStore.displayName = 'PluginStore';
