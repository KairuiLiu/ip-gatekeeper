import { fetchWithTimeout } from '@extension/shared';
import { IpInfoStatue, ipInfoStorage } from '@extension/storage';

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
}

async function fetchIpInfo() {
  const res = await fetchWithTimeout(`https://api.country.is/`, {}, 5000);
  return await res.json();
}
