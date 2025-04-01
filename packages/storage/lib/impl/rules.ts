import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';
import { v4 } from 'uuid';

export type Rule = {
  id: string;
  enable: boolean;
  urlRegex: string;
  countryCodeRegex: string;
  checkBeforeVisit: boolean;
  checkOnVisit: boolean;
};

export type Rules = Rule[];

type RuleStorage = BaseStorage<Rules> & {
  toggleEnabled: (id: string) => Promise<boolean>;
  addRules: (rules: Omit<Rule, 'id'>[]) => Promise<boolean>;
  removeRules: (ids: string[]) => Promise<boolean>;
  updateRule: (id: string, rule: Rule) => Promise<boolean>;
  clearRules: () => Promise<boolean>;
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
  addRules: async rules => {
    const newRules = rules.map(it => ({ ...it, id: v4() }));
    await storage.set(rules => [...rules, ...newRules]);
    return true;
  },
  removeRules: async ids => {
    await storage.set(rules => rules.filter(rule => !ids.includes(rule.id)));
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
  clearRules: async () => {
    await storage.set([]);
    return true;
  },
};
