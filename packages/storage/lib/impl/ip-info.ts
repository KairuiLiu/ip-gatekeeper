import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';

export enum IpInfoStatue {
  PENDING,
  FAILED,
  SUCCESS,
}

export type IpInfo = {
  ip?: string;
  country?: string;
  status: IpInfoStatue;
  checkTime: number;
};

type RuleStorage = BaseStorage<IpInfo> & {
  setIpInfo: (passKey: IpInfo) => Promise<boolean>;
};

const storage = createStorage<IpInfo>(
  'ip-info',
  {
    status: IpInfoStatue.FAILED,
    checkTime: 0,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const ipInfoStorage: RuleStorage = {
  ...storage,
  setIpInfo: async info => {
    await storage.set(info);
    return true;
  },
};
