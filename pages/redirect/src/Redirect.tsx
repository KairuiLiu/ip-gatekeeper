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
  CardDescription,
} from '@extension/ui';
import { t } from '@extension/i18n';
import type { Rule } from '@extension/storage';
import { ipInfoStorage, ruleStorage } from '@extension/storage';
import { useEffect, useRef, useState } from 'react';

const Redirect = () => {
  const loadTime = useRef(Date.now());
  const ipInfo = useStorage(ipInfoStorage);
  const rules = useStorage(ruleStorage);
  const targetLocation = decodeURIComponent(location.hash.slice(1));

  // IP 检查结果. 通过, 阻止, 等待, 失败
  const [checkResult, setCheckResult] = useState(CheckResult.PENDING);
  // 若是被阻止, 被阻止的原因
  const [blockRule, setBlockRule] = useState<Rule>();

  useEffect(() => {
    if (!targetLocation) return;
    const checkResult = checkIpInfo(targetLocation, loadTime.current, ipInfo, rules);

    setCheckResult(checkResult);
    setBlockRule(checkResult === CheckResult.BLOCKED ? getBlockRule(targetLocation, ipInfo, rules) : undefined);
  }, [ipInfo, rules, targetLocation]);

  const requestCheckIpInfo = () => {
    chrome.runtime.sendMessage({ action: BackgroundRequestAction.REFRESH_IP_INFO });
  };

  const handleClose = () => {
    window.close();
  };

  const goOption = () => {
    window.open(chrome.runtime.getURL('/options/index.html'), '_blank');
  };

  const handleVisit = async () => {
    const matchedRules = rules.filter(
      rule => rule.enable && rule.checkBeforeVisit && targetLocation.match(rule.urlRegex),
    );
    const response = await chrome.runtime.sendMessage({
      action: BackgroundRequestAction.ADD_SESSION_ACCESS_RULE,
      rules: matchedRules,
    });
    if (response) location.href = targetLocation;
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
          <CardDescription>请求 {targetLocation} 触发安全检查</CardDescription>
        </CardHeader>
        <CardContent className="flex gap">
          <CheckStatusIcon status={checkResult} showBackground={true} />
          <CheckInfoCard status={checkResult} ipInfo={ipInfo} blockRule={blockRule} />
        </CardContent>
        <CardFooter className="flex justify-around">
          {checkResult === CheckResult.PASS && <Button onClick={handleVisit}>访问页面</Button>}
          {(checkResult === CheckResult.FAILED || checkResult === CheckResult.BLOCKED) && (
            <Button onClick={handleClose}>关闭窗口</Button>
          )}
          {checkResult !== CheckResult.PENDING && (
            <Button variant="secondary" onClick={requestCheckIpInfo}>
              重新检查
            </Button>
          )}
          {checkResult !== CheckResult.PASS && (
            <Button variant="destructive" onClick={handleVisit}>
              无视风险, 访问页面
            </Button>
          )}
        </CardFooter>
        <Button variant="link" onClick={goOption}>
          配置策略
        </Button>
      </Card>
    </main>
  );
};

export default withErrorBoundary(withSuspense(Redirect, <div> Loading ... </div>), <div> Error Occur </div>);
