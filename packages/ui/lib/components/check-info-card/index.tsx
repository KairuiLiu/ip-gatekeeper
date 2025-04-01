import { CheckResult } from '@extension/shared';
import type { IpInfo, Rule } from '@extension/storage';
import type { FC } from 'react';
import { t } from '@extension/i18n';

type Props = {
  status: CheckResult;
  ipInfo: IpInfo;
  blockRule?: Rule;
};

const statusTextMap = {
  [CheckResult.PENDING]: t('ipStatusPending'),
  [CheckResult.PASS]: t('ipStatusPass'),
  [CheckResult.BLOCKED]: t('ipStatusBlock'),
  [CheckResult.FAILED]: t('ipStatusFailed'),
};

export const CheckInfoCard: FC<Props> = ({ status, ipInfo, blockRule }) => {
  return (
    <section className="flex flex-col gap-2 item-left text-left w-full">
      <div>{statusTextMap[status]}</div>
      {(status === CheckResult.PASS || status === CheckResult.BLOCKED) && (
        <>
          <div className="max-w-full truncate">
            {t('location')}: {ipInfo.country} ({ipInfo.ip})
          </div>
        </>
      )}
      {status === CheckResult.BLOCKED && blockRule && (
        <>
          <div>{t('violateRule', blockRule.urlRegex)}</div>
        </>
      )}
    </section>
  );
};
