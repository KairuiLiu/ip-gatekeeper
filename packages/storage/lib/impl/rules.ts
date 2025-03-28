import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';
import { v4 } from 'uuid';

type Rule = {
  id: string;
  enable: boolean;
  urlRegex: string;
  countryCodeRegex: string;
  checkIpBeforeVisit: boolean;
  checkIpOnVisit: boolean;
};

type Rules = Rule[];

type RuleStorage = BaseStorage<Rules> & {
  toggleEnabled: (id: string) => Promise<boolean>;
  addRule: (rule: Rule) => Promise<boolean>;
  removeRule: (id: string) => Promise<boolean>;
  updateRule: (id: string, rule: Rule) => Promise<boolean>;
};

const storage = createStorage<Rules>('rules', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const ruleStorage: RuleStorage = {
  ...storage,
  toggleEnabled: async id => {
    const rules = await storage.get();
    if (!rules.find(rule => rule.id === id)) return false;
    await storage.set(rules => {
      return rules.map(rule => {
        return rule.id === id ? { ...rule, enable: !rule.enable } : rule;
      });
    });
    return true;
  },
  addRule: async rule => {
    const newRule = { ...rule, id: v4() };
    await storage.set(rules => [...rules, newRule]);
    return true;
  },
  removeRule: async id => {
    await storage.set(rules => rules.filter(rule => rule.id !== id));
    return true;
  },
  updateRule: async (id, rule) => {
    const rules = await storage.get();
    if (!rules.find(r => r.id === id)) return false;
    await storage.set(rules => {
      return rules.map(r => {
        return r.id === id ? rule : r;
      });
    });
    return true;
  },
};
