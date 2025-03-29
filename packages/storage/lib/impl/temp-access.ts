import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';

export type TempAccessInfo = {
  tabId: number;
  urlReg: string;
};

type TempAccessInfos = TempAccessInfo[];

type RuleStorage = BaseStorage<TempAccessInfos> & {
  addTempAccessInfo: (info: TempAccessInfo) => Promise<boolean>;
  removeTempAccessInfo: (info: TempAccessInfo) => Promise<boolean>;
  clearTempAccessInfos: () => Promise<boolean>;
};

const storage = createStorage<TempAccessInfos>('temp-access', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const tempAccessInfoStorage: RuleStorage = {
  ...storage,
  addTempAccessInfo: async accessInfo => {
    const hasSameInfo = await storage.get().then(infos => {
      return infos.some(info => info.tabId === accessInfo.tabId && info.urlReg === accessInfo.urlReg);
    });
    if (hasSameInfo) return true;

    await storage.set(infos => [...infos, accessInfo]);
    return true;
  },
  removeTempAccessInfo: async info => {
    await storage.set(rules => rules.filter(rule => rule.tabId !== info.tabId || rule.urlReg !== info.urlReg));
    return true;
  },
  clearTempAccessInfos: async () => {
    await storage.set([]);
    return true;
  },
};
