import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
  icons,
  Button,
  Input,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@extension/ui';
import { useState } from 'react';
import type { Rule } from '../../../packages/storage/lib';
import { ruleStorage } from '../../../packages/storage/lib';
const { Trash2, Info } = icons;
import { v4 } from 'uuid';
import { t } from '@extension/i18n';

export const RulesTable = () => {
  const [rules, setRules] = useState(ruleStorage.getSnapshot() || []);

  const handleChangeRules = (id: string, v: Partial<Rule>) => {
    setRules(rules => {
      return rules.map(rule => {
        return rule.id === id ? { ...rule, ...v } : rule;
      });
    });
  };

  const readySaving = rules.every(rule => rule.urlRegex.trim().length > 0 && rule.countryCodeRegex.trim().length > 0);

  const addRule = () => {
    setRules(rules => {
      return [
        ...rules,
        { id: v4(), enable: false, urlRegex: '', countryCodeRegex: '', checkBeforeVisit: false, checkOnVisit: false },
      ];
    });
  };

  const removeRule = (id: string) => {
    setRules(rules => {
      return rules.filter(rule => rule.id !== id);
    });
  };

  const reset = () => {
    setRules(ruleStorage.getSnapshot() || []);
  };

  const save = () => {
    ruleStorage.set(rules);
  };

  return (
    <div className="h-[30dvh] min-h-80 flex flex-col space-y-4">
      <section className="w-full relative overflow-y-auto h-full shrink-1 ">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="text-center">{t('enableRule')}</TableHead>
              <TableHead className="text-center w-[200px]">{t('urlMatchRule')}</TableHead>
              <TableHead className="text-center w-[200px]">
                <div className="flex items-center justify-center gap-1">
                  {t('regionMatchRule')}
                  <HoverCard>
                    <HoverCardTrigger>
                      <Info size={16} />
                    </HoverCardTrigger>
                    <HoverCardContent side="right" className="text-left w-fit">
                      <p>{t('reference')}</p>
                      <p>{t('onlyJapanIp')}</p>
                      <p>{t('anyIpExceptChina')}</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </TableHead>
              <TableHead className="text-center">{t('checkWhenAccess')}</TableHead>
              <TableHead className="text-center">{t('checkWhenRuntime')}</TableHead>
              <TableHead className="text-center">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map(rule => {
              return (
                <TableRow key={rule.id} className="h-fit">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={rule.enable}
                      onCheckedChange={v => handleChangeRules(rule.id, { enable: !!v })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="^http[s]://chatgpt\.com"
                      value={rule.urlRegex}
                      onChange={v => {
                        handleChangeRules(rule.id, { urlRegex: v.target.value });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="^(?!CN$).*$"
                      value={rule.countryCodeRegex}
                      onChange={v => {
                        handleChangeRules(rule.id, { countryCodeRegex: v.target.value });
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Checkbox
                      checked={rule.checkBeforeVisit}
                      onCheckedChange={v => handleChangeRules(rule.id, { checkBeforeVisit: !!v })}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={rule.checkOnVisit}
                      onCheckedChange={v => handleChangeRules(rule.id, { checkOnVisit: !!v })}
                    />
                  </TableCell>
                  <TableCell className="text-xs flex items-center justify-center">
                    <Button
                      variant="destructive"
                      className="flex items-center justify-center p-1 aspect-square"
                      onClick={() => removeRule(rule.id)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
      <section className="w-full flex justify-between mt-4 ">
        <div>
          <Button onClick={addRule} variant="outline">
            {t('addNewRule')}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button disabled={!readySaving} onClick={save}>
            {t('save')}
          </Button>
          <Button onClick={reset} variant="outline">
            {t('reset')}
          </Button>
        </div>
      </section>
    </div>
  );
};
