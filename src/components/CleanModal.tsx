/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { JunkCategory, WhitelistRule } from '../types/cleaner';
import { formatBytes } from '../utils/categoriesData';

interface CleanModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: JunkCategory[];
  whitelist: WhitelistRule[];
  onCompleteClean: (freedBytes: number, totalFiles: number, breakdown: any[]) => void;
}

export const CleanModal: React.FC<CleanModalProps> = ({
  isOpen,
  onClose,
  categories,
  whitelist,
  onCompleteClean,
}) => {
  const [stage, setStage] = useState<'cleaning' | 'done'>('cleaning');
  const [progress, setProgress] = useState(0);
  const [currentActionText, setCurrentActionText] = useState('正在初始化清理引擎...');
  const [currentFilePath, setCurrentFilePath] = useState('C:\\Windows\\Temp\\MpCmdRun.log');
  const [freedBytesAccumulator, setFreedBytesAccumulator] = useState(0);
  const [filesCleanedCount, setFilesCleanedCount] = useState(0);

  const selectedCategories = categories.filter((c) => c.selected);
  const totalTargetBytes = selectedCategories.reduce((sum, c) => sum + c.totalSizeBytes, 0);
  const totalTargetFiles = selectedCategories.reduce((sum, c) => sum + c.fileCount, 0);

  useEffect(() => {
    if (!isOpen) {
      setStage('cleaning');
      setProgress(0);
      setFreedBytesAccumulator(0);
      setFilesCleanedCount(0);
      return;
    }

    // Run progressive cleaning animation
    let currentStep = 0;
    const totalSteps = 40;
    const stepDuration = 55; // ms per tick

    const samplePaths = selectedCategories.flatMap((c) => c.sampleFiles.map((s) => s.path));
    if (samplePaths.length === 0) {
      samplePaths.push('C:\\Windows\\Temp\\scoped_dir_cache.tmp');
    }

    const interval = setInterval(() => {
      currentStep++;
      const pct = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(pct);

      // Random path from samples
      const randomIdx = Math.floor(Math.random() * samplePaths.length);
      setCurrentFilePath(samplePaths[randomIdx] || 'C:\\Windows\\Temp\\temp.log');

      // Accumulate bytes and files
      const currentBytes = Math.round((pct / 100) * totalTargetBytes);
      const currentFiles = Math.round((pct / 100) * totalTargetFiles);
      setFreedBytesAccumulator(currentBytes);
      setFilesCleanedCount(currentFiles);

      if (pct < 30) {
        setCurrentActionText('正在清空用户临时缓存与浏览器遗留数据...');
      } else if (pct < 70) {
        setCurrentActionText('正在处理 Windows Update 补丁缓存与系统错误转储...');
      } else if (pct < 95) {
        setCurrentActionText('正在核验白名单目录，安全释放传递优化与缩略图数据库...');
      } else {
        setCurrentActionText('正在整理 C 盘 NTFS MFT 索引与归还可用空间...');
      }

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setStage('done');
        const breakdown = selectedCategories.map((c) => ({
          categoryId: c.id,
          categoryName: c.name,
          freedBytes: c.totalSizeBytes,
          fileCount: c.fileCount,
        }));
        onCompleteClean(totalTargetBytes, totalTargetFiles, breakdown);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-all">
        {stage === 'cleaning' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  正在智能清理 C 盘垃圾文件
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  全自动避开安全白名单，请勿切断电源
                </p>
              </div>
            </div>

            {/* Circular / Linear Progress Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">{currentActionText}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{progress}%</span>
              </div>

              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-blue-600 rounded-full transition-all duration-150 ease-out"
                />
              </div>
            </div>

            {/* Real-time stats ticker */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">已累计释放空间</span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatBytes(freedBytesAccumulator)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">已清理垃圾碎片</span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {filesCleanedCount.toLocaleString()} 个
                </span>
              </div>
            </div>

            {/* Dynamic File Path Preview */}
            <div className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-xs border border-slate-800">
              <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                <span>正在清除文件:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  白名单实时拦截生效中
                </span>
              </div>
              <div className="truncate text-slate-200 font-mono text-[11px]">{currentFilePath}</div>
            </div>
          </div>
        ) : (
          /* Done State */
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                C 盘清理已顺利完成！
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                已安全彻底删除无用缓存，C 盘空间已大幅释放，系统运行更轻快。
              </p>
            </div>

            {/* Big Success Metrics */}
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-center space-y-1">
              <span className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">本次累计释放空间</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-300 tabular-nums">
                +{formatBytes(totalTargetBytes)}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block pt-1">
                已成功清除 {totalTargetFiles} 个碎片文件 · 白名单 0 误删
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>确定并返回主界面</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
