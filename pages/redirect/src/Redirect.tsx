import '@src/Redirect.css';
import {
  useStorage,
  withErrorBoundary,
  withSuspense,
  checkIpInfo,
  CheckResult,
  getBlockRule,
  BackgroundRequestAction,
} from '@extension/shared';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CheckStatusIcon,
  CheckInfoCard,
} from '@extension/ui';
import { t } from '@extension/i18n';
import type { Rule } from '@extension/storage';
import { IpInfoStatue, ipInfoStorage, ruleStorage } from '@extension/storage';
import { useEffect, useRef, useState } from 'react';

const Redirect = () => {
  const loadTime = useRef(Date.now());
  const ipInfo = useStorage(ipInfoStorage);
  const rules = useStorage(ruleStorage);
  const queryLocation = new URLSearchParams(window.location.search).get('location');

  // IP 检查结果. 通过, 阻止, 等待, 失败
  const [checkResult, setCheckResult] = useState(CheckResult.PENDING);
  // 若是被阻止, 被阻止的原因
  const [blockRule, setBlockRule] = useState<Rule>();

  useEffect(() => {
    if (!queryLocation) return;
    const checkResult = checkIpInfo(queryLocation, loadTime.current, ipInfo, rules);

    setCheckResult(checkResult);
    setBlockRule(checkResult === CheckResult.BLOCKED ? getBlockRule(queryLocation, ipInfo, rules) : undefined);
  }, [ipInfo, rules, queryLocation]);

  const requestCheckIpInfo = () => {
    chrome.runtime.sendMessage({ action: BackgroundRequestAction.REFRESH_IP_INFO });
  };

  const handleClose = () => {
    window.close();
  };

  // 首次加载时, 立即触发一次检查
  useEffect(() => {
    requestCheckIpInfo();
  }, []);

  return (
    <main className="w-screen h-screen flex items-center justify-evenly">
      <Card className="w-[350px]  ">
        <CardHeader>
          <CardTitle>{t('extensionName')} 安全检查</CardTitle>
        </CardHeader>
        <CardContent className="flex gap">
          <CheckStatusIcon status={checkResult} showBackground={true} />
          <CheckInfoCard status={checkResult} ipInfo={ipInfo} blockRule={blockRule} />
        </CardContent>
        <CardFooter className="flex justify-around">
          {checkResult === CheckResult.PASS && <Button>访问页面</Button>}
          {(checkResult === CheckResult.FAILED || checkResult === CheckResult.BLOCKED) && (
            <Button onClick={handleClose}>关闭窗口</Button>
          )}
          {checkResult !== CheckResult.PENDING && (
            <Button variant="secondary" onClick={requestCheckIpInfo}>
              重新检查
            </Button>
          )}
          {checkResult !== CheckResult.PASS && <Button variant="destructive">无视风险, 访问页面</Button>}
        </CardFooter>
      </Card>
    </main>
  );
};

export default withErrorBoundary(withSuspense(Redirect, <div> Loading ... </div>), <div> Error Occur </div>);
