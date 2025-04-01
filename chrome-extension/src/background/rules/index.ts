import { ruleStorage } from '@extension/storage';
import 'webextension-polyfill';

/**
 * 监听封锁规则变更, 并在规则变更时更新Chrome拦截规则
 */

function handleRuleChanged() {
  updateRules();
}

async function updateRules() {
  try {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = oldRules.map(rule => rule.id);
    const offset = Math.max(...removeRuleIds, 0);

    const newRules = (await ruleStorage.get()) || [];
    const addRules = newRules
      .filter(rule => rule.enable && rule.checkBeforeVisit)
      .map(
        (rule, index) =>
          ({
            id: offset + index + 1,
            priority: 1,
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
              redirect: {
                regexSubstitution: chrome.runtime.getURL('/redirect/index.html#\\0'),
              },
            },
            condition: {
              regexFilter: rule.urlRegex,
              resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
              excludedInitiatorDomains: [chrome.runtime.id],
            },
          }) satisfies chrome.declarativeNetRequest.Rule,
      );
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules,
    });
  } catch {
    //
  }
}

ruleStorage.subscribe(handleRuleChanged);

/**
 * 初始化拦截规则
 */

chrome.runtime.onInstalled.addListener(async () => {
  await ruleStorage.clearRules();
  await ruleStorage.addRules([
    {
      enable: true,
      urlRegex: '^http[s]://claude.ai',
      countryCodeRegex: 'JP',
      checkBeforeVisit: true,
      checkOnVisit: true,
    },
  ]);
});

export default '__KEEP__';
