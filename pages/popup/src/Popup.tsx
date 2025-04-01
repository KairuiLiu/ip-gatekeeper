import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { ruleStorage } from '@extension/storage';
import { Button } from '../../../packages/ui/dist';

function goOptions() {
  chrome.runtime.openOptionsPage();
}

const Popup = () => {
  const rules = useStorage(ruleStorage);
  const enabledRules = rules.filter(rule => rule.enable);

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 text-center h-full p-4">
      当前开启了 {enabledRules.length} 条规则.
      <Button onClick={goOptions}> 点击配置 </Button>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
