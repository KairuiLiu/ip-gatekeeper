import { CheckResult } from '@extension/shared';
import type { IpInfo, Rule } from '@extension/storage';
import type { FC } from 'react';

type Props = {
  status: CheckResult;
  ipInfo: IpInfo;
  blockRule: Rule;
};

const statusTextMap = {
  [CheckResult.PENDING]: '检查中',
  [CheckResult.PASS]: '通过',
  [CheckResult.BLOCKED]: '阻止',
  [CheckResult.FAILED]: '失败',
};

export const CheckInfoCard: FC<Props> = ({ status, ipInfo, blockRule }) => {
  return (
    <section className="flex flex-col gap-2">
      <div>{statusTextMap[status]}</div>
      {(status === CheckResult.PASS || status === CheckResult.BLOCKED) && (
        <>
          <div>IP: {ipInfo.ip}</div>
          <div>位置: {ipInfo.country}</div>
          <div>更新时间: {ipInfo.checkTime}</div>
        </>
      )}
      {status === CheckResult.BLOCKED && (
        <>
          <div>阻止原因: 匹配到了 {blockRule.urlRegex}</div>
        </>
      )}
    </section>
  );
};
