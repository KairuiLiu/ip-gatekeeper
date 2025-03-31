import { CheckResult } from '@extension/shared';
import type { IpInfo, Rule } from '@extension/storage';
import type { FC } from 'react';

type Props = {
  status: CheckResult;
  ipInfo: IpInfo;
  blockRule?: Rule;
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
          <div>
            位置: {ipInfo.country} ({ipInfo.ip})
          </div>
        </>
      )}
      {status === CheckResult.BLOCKED && blockRule && (
        <>
          <div>规发生大范德萨范德萨发则: {blockRule.urlRegex}</div>
        </>
      )}
    </section>
  );
};
