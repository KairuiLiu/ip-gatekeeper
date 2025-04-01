import { useStorage } from '@extension/shared';
import { IpInfoStatue, ipInfoStorage } from '../../../packages/storage/lib';

const ipInfoStatusMap = {
  [IpInfoStatue.PENDING]: '检查中',
  [IpInfoStatue.FAILED]: '失败',
  [IpInfoStatue.SUCCESS]: '成功',
};

export const IpInfo = () => {
  const ipInfo = useStorage(ipInfoStorage);
  return (
    <div>
      <p>状态: {ipInfoStatusMap[ipInfo.status]}</p>
      <p>IP: {ipInfo.ip}</p>
      <p>位置: {ipInfo.country}</p>
      <p>更新时间: {ipInfo.checkTime}</p>
    </div>
  );
};
