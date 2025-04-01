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
  CardDescription,
  icons,
} from '@extension/ui';
import { t } from '@extension/i18n';
import type { Rule } from '@extension/storage';
import { ipInfoStorage, ruleStorage } from '@extension/storage';
import { useEffect, useRef, useState } from 'react';

const { SquareArrowOutUpRight } = icons;

const statusTextMap = {
  [CheckResult.PENDING]: t('ipStatusPending'),
  [CheckResult.PASS]: t('ipStatusPass'),
  [CheckResult.BLOCKED]: t('ipStatusBlock'),
  [CheckResult.FAILED]: t('ipStatusFailed'),
};

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
          <CardTitle className="text-lg">{t('ipCheck')}</CardTitle>
          <CardDescription className="text-sm">
            {t('requestTriggerCheck', new URL(targetLocation).hostname)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 items-center w-full px-8">
          <div className="w-1/3 shrink-0 flex justify-center">
            <CheckStatusIcon status={checkResult} showBackground={true} />
          </div>
          <div className="w-2/3 shrink-0 flex justify-start ">
            <section className="flex flex-col gap-2 item-left text-left w-full">
              <div>{statusTextMap[checkResult]}</div>
              {(checkResult === CheckResult.PASS || checkResult === CheckResult.BLOCKED) && (
                <>
                  <div className="max-w-full truncate">
                    {t('location')}: {ipInfo.country} ({ipInfo.ip})
                  </div>
                </>
              )}
              {checkResult === CheckResult.BLOCKED && blockRule && (
                <>
                  <div>{t('violateRule', blockRule.urlRegex)}</div>
                </>
              )}
            </section>
          </div>
        </CardContent>
        <CardFooter className="flex justify-around">
          {checkResult === CheckResult.PASS && <Button onClick={handleVisit}>{t('visitPage')}</Button>}
          {checkResult !== CheckResult.PASS && (
            <Button variant="destructive" onClick={handleVisit}>
              {t('ignoreRiskVisit')}
            </Button>
          )}
          {checkResult !== CheckResult.PENDING && (
            <Button variant="secondary" onClick={requestCheckIpInfo}>
              {t('recheckIp')}
            </Button>
          )}
        </CardFooter>
        <Button variant="link" onClick={goOption} className="p-0 text-muted-foreground font-light gap-1">
          {t('configurePolicy')}
          <SquareArrowOutUpRight size={12} className="text-muted-foreground" />
        </Button>
      </Card>
    </main>
  );
};

export default withErrorBoundary(withSuspense(Redirect, <div> Loading ... </div>), <div> Error Occur </div>);
