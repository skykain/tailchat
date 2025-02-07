import React from 'react';
import { Translate } from '../translate';
import { OfficialGachaIndex, OfficialGachaType, util } from 'genshin-gacha-kit';
import { useAsync } from '@capital/common';
import { PillTabs, LoadingSpinner } from '@capital/component';
import { GachaPool } from './GachaPool';
import _groupBy from 'lodash/groupBy';
import './index.less';

const GenshinPanel: React.FC = React.memo(() => {
  const { value: gachaList, loading } = useAsync(async () => {
    const gacha = await util.getGachaIndex();
    const dict = _groupBy(gacha, 'gacha_type') as unknown as Record<
      keyof OfficialGachaType,
      OfficialGachaIndex[]
    >;

    // 顺序: 角色 -> 武器 -> 常驻 -> 新手
    return [
      ...(dict['301'] ?? []),
      ...(dict['302'] ?? []),
      ...(dict['200'] ?? []),
      ...(dict['100'] ?? []),
    ];
  }, []);

  return (
    <div className="plugin-genshin-panel">
      <div className="gacha-title">
        {Translate.genshin} - {Translate.gacha}
      </div>

      {loading && <LoadingSpinner />}

      <PillTabs
        items={(gachaList ?? []).map((item) => ({
          key: String(item.gacha_id),
          label: `${item.gacha_name}(${item.begin_time} - ${item.end_time})`,
          children: <GachaPool gachaId={item.gacha_id} />,
        }))}
      />
    </div>
  );
});
GenshinPanel.displayName = 'GenshinPanel';

export default GenshinPanel;
