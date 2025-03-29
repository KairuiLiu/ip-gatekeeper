import 'webextension-polyfill';
import { refreshIpInfo } from '../check-ip';
import { BackgroundRequestAction } from '@extension/shared';

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('onMessage', request);
  if (request.action === BackgroundRequestAction.REFRESH_IP_INFO) {
    await refreshIpInfo();
    sendResponse(true);
  }
});

export default '__KEEP__';
