import type { Rule } from '@extension/storage';

export async function handleAddSessionAccessRule(
  request: {
    rules: Rule[];
  },
  sender: chrome.runtime.MessageSender,
) {
  const tabId = sender.tab?.id;
  const accessRules = (request.rules as Rule[]).map((rule, index) => ({
    id: index + 1, // 没啥用, 只是为了过 lint, 后期还会重赋
    priority: 2, // 1 = 全局配置, 2 = 会话配置
    condition: {
      regexFilter: rule.urlRegex,
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
      excludedInitiatorDomains: [chrome.runtime.id],
      tabIds: tabId === undefined ? [] : [tabId],
    },
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.ALLOW,
    },
  }));
  await addSessionRules(accessRules);
  return true;
}

async function addSessionRules(rules: chrome.declarativeNetRequest.Rule[]) {
  const oldRules = await chrome.declarativeNetRequest.getSessionRules();

  const removeRuleIds = oldRules.map(rule => rule.id);
  const offset = Math.max(...oldRules.map(rule => rule.id), 0); // 防报错...
  const addRules = [...oldRules, ...rules].map((it, index) => ({
    ...it,
    id: offset + index + 1,
  }));

  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds,
    addRules,
  });
}

chrome.tabs.onRemoved.addListener(async () => {
  try {
    const tabs = await chrome.tabs.query({});
    const activeTabIds = tabs.map(tab => tab.id);

    const sessionRules = await chrome.declarativeNetRequest.getSessionRules();

    const removeRuleIds = sessionRules
      .filter(rule => {
        if (rule.condition.tabIds === undefined) return true;
        return !rule.condition.tabIds.some(tabId => activeTabIds.includes(tabId));
      })
      .map(rule => rule.id);

    // 如果有需要删除的规则，则删除它们
    if (removeRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds,
      });
    }
  } catch {
    //
  }
});

export default '__KEEP__';
