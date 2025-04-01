import '@src/Options.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { RulesTable } from './RulesTable';
// import { GeneralConfig } from './GeneralConfig';
// import { IpInfo } from './IpInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@extension/ui';
import { t } from '@extension/i18n';

const Options = () => {
  return (
    <div className="size-full flex justify-center items-center">
      <Card className="w-[960px] max-w-full">
        <CardHeader>
          <CardTitle className="text-lg">{t('configureMatchRules')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <GeneralConfig /> */}
          <RulesTable />
        </CardContent>
        {/* <CardFooter>
          <IpInfo />
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);
