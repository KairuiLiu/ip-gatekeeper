import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { ruleStorage } from '@extension/storage';
import { Button } from '../../../packages/ui/dist';
import { t } from '@extension/i18n';

function goOptions() {
  chrome.runtime.openOptionsPage();
}

const Popup = () => {
  const rules = useStorage(ruleStorage);
  const enabledRules = rules.filter(rule => rule.enable);

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 text-center h-full p-4 flex flex-col items-center justify-center gap-2">
      <h1 className="text-lg">{t('extensionName')}</h1>
      <img src={chrome.runtime.getURL('popup/logo_512.png')} alt="logo" className="size-36" />
      <p>
        {t('currentRulesCount', enabledRules.length)}
        <Button onClick={goOptions} variant="link">
          {t('clickToConfigure')}
        </Button>
      </p>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
