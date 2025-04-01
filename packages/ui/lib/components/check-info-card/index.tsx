import { CheckResult } from '@extension/shared';
import type { IpInfo, Rule } from '@extension/storage';
import type { FC } from 'react';

type Props = {
  status: CheckResult;
  ipInfo: IpInfo;
  blockRule?: Rule;
};

const statusTextMap = {
  [CheckResult.PENDING]: '检查中...',
  [CheckResult.PASS]: '检查通过',
  [CheckResult.BLOCKED]: '禁止访问',
  [CheckResult.FAILED]: '检查失败',
};

export const CheckInfoCard: FC<Props> = ({ status, ipInfo, blockRule }) => {
  return (
    <section className="flex flex-col gap-2 item-left text-left w-full">
      <div>{statusTextMap[status]}</div>
      {(status === CheckResult.PASS || status === CheckResult.BLOCKED) && (
        <>
          <div className="max-w-full truncate">
            位置: {ipInfo.country} ({ipInfo.ip})
          </div>
        </>
      )}
      {status === CheckResult.BLOCKED && blockRule && (
        <>
          <div>违反规则: {blockRule.urlRegex}</div>
        </>
      )}
    </section>
  );
};
