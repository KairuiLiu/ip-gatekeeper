import { fetchWithTimeout } from '@extension/shared';
import { IpInfoStatue, ipInfoStorage, ruleStorage } from '@extension/storage';

export async function refreshIpInfo() {
  await ipInfoStorage.setIpInfo({
    status: IpInfoStatue.PENDING,
    checkTime: Date.now(),
  });
  try {
    const info = (await fetchIpInfo()) as { ip: string; country: string };
    await ipInfoStorage.setIpInfo({
      ...info,
      status: IpInfoStatue.SUCCESS,
      checkTime: Date.now(),
    });
  } catch {
    await ipInfoStorage.setIpInfo({
      status: IpInfoStatue.FAILED,
      checkTime: Date.now(),
    });
  }
  return true;
}

async function fetchIpInfo() {
  const res = await fetchWithTimeout(`https://api.country.is/`, {}, 5000);
  return await res.json();
}

async function bgCheckTabUrls() {
  const tabs = await chrome.tabs.query({});
  const rules = ruleStorage.getSnapshot() || [];
  const needCheck = tabs.some(tab => rules.some(it => it.enable && it.checkOnVisit && tab.url?.match(it.urlRegex)));
  if (needCheck) await refreshIpInfo();
  setTimeout(bgCheckTabUrls, 5000);
}

bgCheckTabUrls();
