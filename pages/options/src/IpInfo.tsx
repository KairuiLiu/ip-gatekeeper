import { useStorage } from '@extension/shared';
import { IpInfoStatue, ipInfoStorage } from '../../../packages/storage/lib';
import { t } from '@extension/i18n';

const ipInfoStatusMap = {
  [IpInfoStatue.PENDING]: '检查中',
  [IpInfoStatue.FAILED]: '失败',
  [IpInfoStatue.SUCCESS]: '成功',
};

export const IpInfo = () => {
  const ipInfo = useStorage(ipInfoStorage);
  return (
    <div>
      <p>
        {t('status')}: {ipInfoStatusMap[ipInfo.status]}
      </p>
      <p>IP: {ipInfo.ip}</p>
      <p>
        {t('location')}: {ipInfo.country}
      </p>
      <p>
        {t('updateTime')}: {ipInfo.checkTime}
      </p>
    </div>
  );
};
