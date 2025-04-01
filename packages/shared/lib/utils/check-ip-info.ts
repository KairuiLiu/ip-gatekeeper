import { IpInfoStatue, type IpInfo, type Rules } from '@extension/storage';

// 返回最终检查结果 => 通过、 拦截、 等待验证, 超时
export enum CheckResult {
  PASS, // IP 检查通过
  BLOCKED, // IP 检查拦截
  PENDING, // IP 获取中
  FAILED, // IP 获取失败
}

export function checkIpInfo(url: string, startTime: number, ipInfo: IpInfo, rules: Rules) {
  if (!ipInfo.checkTime || ipInfo.checkTime < startTime || ipInfo.status === IpInfoStatue.PENDING) {
    return CheckResult.PENDING;
  }
  if (ipInfo.status === IpInfoStatue.FAILED) {
    return CheckResult.FAILED;
  }
  const blockRules = getBlockRule(url, ipInfo, rules);
  return blockRules ? CheckResult.BLOCKED : CheckResult.PASS;
}

export function getBlockRule(url: string, ipInfo: IpInfo, rules: Rules) {
  return rules.find(rule => {
    return rule.checkBeforeVisit && url.match(rule.urlRegex) && !ipInfo.country?.match(rule.countryCodeRegex);
  });
}
