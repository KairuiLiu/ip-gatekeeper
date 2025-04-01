import { BackgroundRequestAction, checkIpInfo, CheckResult, useStorage } from '@extension/shared';
import { Button, Card, CardContent, CardFooter, CheckInfoCard, cn, icons } from '@extension/ui';
import type { IpInfo } from '../../../packages/storage/lib';
import { ipInfoStorage, ruleStorage } from '../../../packages/storage/lib';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';

const { Loader2 } = icons;

const containerColorMap = {
  [CheckResult.PASS]: 'bg-green-50/90 text-green-500',
  [CheckResult.BLOCKED]: 'bg-red-50/90 text-red-500',
  [CheckResult.PENDING]: 'bg-slate-50/90 text-slate-500',
  [CheckResult.FAILED]: 'bg-orange-50/90 text-orange-500',
};

function closeWindow() {
  window.close();
}

export default function App() {
  const [show, setShow] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const cardWidth = 320;
  const cardHeight = 150;

  const startTime = useRef(Date.now());
  const ipInfo = useStorage(ipInfoStorage);
  const rules = useStorage(ruleStorage);
  const checkResult = checkIpInfo(location.href, startTime.current, ipInfo, rules);

  const [lastResult, setLastResult] = useState<{ result: CheckResult; info: IpInfo }>({
    result: checkResult,
    info: ipInfo,
  });
  const [loading, setLoading] = useState(false);

  function recheck() {
    setLoading(true);
    chrome.runtime.sendMessage({ action: BackgroundRequestAction.REFRESH_IP_INFO });
  }

  // 保存拖动后的位置
  const handleDragStop = (_: unknown, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y });
  };

  // 设置初始位置并确保窗口大小变化时卡片仍在可视区域内
  useEffect(() => {
    if (!show) return;
    setPosition({
      x: Math.max(0, window.innerWidth - cardWidth - 20),
      y: 10,
    });

    const handleResize = () => {
      setPosition(prev => {
        const newX = Math.min(prev.x, Math.max(0, window.innerWidth - cardWidth - 20));
        const newY = Math.min(prev.y, Math.max(0, window.innerHeight - cardHeight - 20));
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [show]);

  useEffect(() => {
    const shouldShow = rules.some(rule => rule.enable && rule.checkOnVisit && location.href.match(rule.urlRegex));
    setShow(shouldShow);
  }, [rules]);

  useEffect(() => {
    setLastResult(prev => {
      const newOne = { result: checkResult, info: ipInfo };
      // 如果上次是 PENDING，接受任何结果
      if (prev.result === CheckResult.PENDING) {
        return newOne;
      }
      // 如果上次不是 PENDING，只接受终态结果
      if (checkResult === CheckResult.PENDING) {
        return prev;
      }
      return newOne;
    });
  }, [checkResult, ipInfo]);

  useEffect(() => {
    if (checkResult !== CheckResult.PENDING) {
      setLoading(false);
    }
  }, [checkResult]);

  if (!show) return null;

  return (
    <div className="unset fixed inset-0 overflow-hidden z-[2147483640] pointer-events-none">
      <Draggable
        nodeRef={nodeRef as RefObject<HTMLElement>}
        position={position}
        onStop={handleDragStop}
        bounds={{
          left: 0,
          top: 0,
          right: window.innerWidth - cardWidth,
          bottom: window.innerHeight - cardHeight,
        }}>
        <div ref={nodeRef} className="absolute z-[2147483647] select-none pointer-events-auto">
          <Card className={cn('w-80 p-4', containerColorMap[lastResult.result])}>
            <CardContent className="min-h-14 p-0 cursor-move">
              <CheckInfoCard status={lastResult.result} ipInfo={lastResult.info} />
            </CardContent>
            <CardFooter className="p-0">
              {(lastResult.result === CheckResult.BLOCKED || lastResult.result === CheckResult.FAILED) && (
                <div className="pt-4 flex items-center gap-2">
                  {lastResult.result === CheckResult.BLOCKED && (
                    <Button onClick={closeWindow} variant="destructive" className="cursor-pointer">
                      关闭页面
                    </Button>
                  )}
                  <Button
                    onClick={recheck}
                    variant="outline"
                    className="bg-slate-50/20 text-slate-400 border-slate-400 hover:bg-slate-150/40 hover:text-slate-400 hover:border-slate-400 cursor-pointer">
                    {loading && <Loader2 className="animate-spin" />}
                    重新检查
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </Draggable>
    </div>
  );
}
