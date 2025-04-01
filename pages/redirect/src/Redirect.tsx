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
  icons,
} from '@extension/ui';
import { t } from '@extension/i18n';
import type { Rule } from '@extension/storage';
import { ipInfoStorage, ruleStorage } from '@extension/storage';
import { useEffect, useRef, useState } from 'react';

const { SquareArrowOutUpRight } = icons;

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

  const goOption = () => {
    chrome.runtime.openOptionsPage();
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
      <Card className="min-w-[350px] max-w-full w-1/4 ">
        <CardHeader>
          <CardTitle className="text-lg">{t('extensionName')} IP 检查</CardTitle>
          <CardDescription className="text-sm">请求 {new URL(targetLocation).hostname} 触发 IP 检查</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 items-center w-full px-8">
          <div className="w-1/3 shrink-0 flex justify-center">
            <CheckStatusIcon status={checkResult} showBackground={true} />
          </div>
          <div className="w-2/3 shrink-0 flex justify-start ">
            <CheckInfoCard status={checkResult} ipInfo={ipInfo} blockRule={blockRule} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-around">
          {checkResult === CheckResult.PASS && <Button onClick={handleVisit}>访问页面</Button>}
          {checkResult !== CheckResult.PASS && (
            <Button variant="destructive" onClick={handleVisit}>
              无视风险, 访问页面
            </Button>
          )}
          {checkResult !== CheckResult.PENDING && (
            <Button variant="secondary" onClick={requestCheckIpInfo}>
              重新检查
            </Button>
          )}
        </CardFooter>
        <Button variant="link" onClick={goOption} className="p-0 text-muted-foreground font-light gap-1">
          配置策略
          <SquareArrowOutUpRight size={12} className="text-muted-foreground" />
        </Button>
      </Card>
    </main>
  );
};

export default withErrorBoundary(withSuspense(Redirect, <div> Loading ... </div>), <div> Error Occur </div>);
