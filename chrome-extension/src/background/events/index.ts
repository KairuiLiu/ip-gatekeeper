import 'webextension-polyfill';
import { refreshIpInfo } from '../check-ip';
import { handleAddSessionAccessRule } from '../session-rule';
import { BackgroundRequestAction } from '@extension/shared';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('onMessage', request);
  if (request.action === BackgroundRequestAction.REFRESH_IP_INFO) {
    refreshIpInfo().then(sendResponse);
    return true;
  }
  if (request.action === BackgroundRequestAction.ADD_SESSION_ACCESS_RULE) {
    handleAddSessionAccessRule(request, sender).then(() => sendResponse(true));
    return true;
  }
  return false;
});

export default '__KEEP__';
