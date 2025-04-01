import { BackgroundRequestAction, checkIpInfo, CheckResult, useStorage } from '@extension/shared';
import { Button, CheckInfoCard } from '@extension/ui';
import { ipInfoStorage, ruleStorage } from '../../../packages/storage/lib';
import { useEffect, useRef, useState } from 'react';

function closeWindow() {
  window.close();
}

function recheck() {
  chrome.runtime.sendMessage({ action: BackgroundRequestAction.REFRESH_IP_INFO });
}

export default function App() {
  const [show, setShow] = useState(false);

  const startTime = useRef(Date.now());
  const ipInfo = useStorage(ipInfoStorage);
  const rules = useStorage(ruleStorage);
  const checkResult = checkIpInfo(location.href, startTime.current, ipInfo, rules);

  useEffect(() => {
    const shouldShow = rules.some(rule => rule.enable && rule.checkOnVisit && location.href.match(rule.urlRegex));
    console.log('shouldShow', shouldShow);
    setShow(shouldShow);
  }, [rules]);

  if (!show) return null;

  return (
    <div className="fixed right-10 top-10 z-[2147483647]">
      <CheckInfoCard status={checkResult} ipInfo={ipInfo} />
      {(checkResult === CheckResult.BLOCKED || checkResult === CheckResult.FAILED) && (
        <Button onClick={recheck} variant="outline">
          重新检查
        </Button>
      )}
      {checkResult === CheckResult.BLOCKED && (
        <Button onClick={closeWindow} variant="destructive">
          关闭页面
        </Button>
      )}
    </div>
  );
}
