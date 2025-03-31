import { CheckResult } from '@extension/shared';
import { RefreshCcw, ShieldBan, ShieldCheck, Unlink } from 'lucide-react';
import type { FC } from 'react';

type Props = {
  status: CheckResult;
  showBackground: boolean;
};

const statueColorMap = {
  [CheckResult.PASS]: { background: 'bg-green-300', front: 'text-green-500' },
  [CheckResult.BLOCKED]: { background: 'bg-red-300', front: 'text-red-500' },
  [CheckResult.PENDING]: { background: 'bg-slate-300', front: 'text-slate-500' },
  [CheckResult.FAILED]: { background: 'bg-orange-300', front: 'text-orange-500' },
};

const statusTextMap = {
  [CheckResult.PASS]: ShieldCheck,
  [CheckResult.BLOCKED]: ShieldBan,
  [CheckResult.PENDING]: RefreshCcw,
  [CheckResult.FAILED]: Unlink,
};

export const CheckStatusIcon: FC<Props> = ({ status, showBackground }) => {
  const Component = statusTextMap[status];
  const color = statueColorMap[status];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full w-16 h-16 ${showBackground ? color.background : ''}`}>
      <Component className={color.front} size={36} />
    </div>
  );
};
