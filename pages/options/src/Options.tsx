import '@src/Options.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { Button } from '@extension/ui';
import { t } from '@extension/i18n';

const Options = () => {
  const isLight = true;
  const logo = isLight ? 'options/logo_horizontal.svg' : 'options/logo_horizontal_dark.svg';
  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  return (
    <div className={`App ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      <button onClick={goGithubSite}>
        <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
      </button>
      <p>
        Edit <code>pages/options/src/Options.tsx</code>
      </p>
      <Button onClick={() => alert('ok')}>{t('toggleTheme')}</Button>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);
