import 'webextension-polyfill';
import _ from './rules';
import __ from './events';

if ([_, __].includes('__KEEP__')) {
  console.log('WTF VITE');
}
