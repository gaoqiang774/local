/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HardDrive, AlertTriangle, CheckCircle, ShieldCheck, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { DriveUsageState, JunkCategory } from '../types/cleaner';
import { formatBytes } from '../utils/categoriesData';

interface DiskOverviewCardProps {
  driveUsage: DriveUsageState;
  categories: JunkCategory[];
  onStartClean: () => void;
  onRescan: () => void;
  isScanning: boolean;
  isCleaning: boolean;
  onSimulateLowSpace: (scenario: 'critical' | 'moderate' | 'healthy') => void;
}

export const DiskOverviewCard: React.FC<DiskOverviewCardProps> = ({
  driveUsage,
  categories,
  onStartClean,
  onRescan,
  isScanning,
  isCleaning,
  onSimulateLowSpace,
}) => {
  const selectedCategories = categories.filter((c) => c.selected);
  const totalCleanableBytes = selectedCategories.reduce((sum, c) => sum + c.totalSizeBytes, 0);
  const safeBytes = selectedCategories
    .filter((c) => c.safety === 'safe')
    .reduce((sum, c) => sum + c.totalSizeBytes, 0);

  const usedPercentage = Math.round((driveUsage.usedBytes / driveUsage.totalBytes) * 100);
  const afterCleaningFreeBytes = Math.min(driveUsage.totalBytes, driveUsage.freeBytes + totalCleanableBytes);
  const afterCleaningUsedPercent = Math.max(0, Math.round(((driveUsage.totalBytes - afterCleaningFreeBytes) / driveUsage.totalBytes) * 100));

  const isLowSpace = driveUsage.freeBytes < 15 * 1024 * 1024 * 1024; // < 15GB

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      {/* Top Header & Scenario Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                系统本地磁盘 ({driveUsage.driveLetter}:) 状态监测
              </h2>
              {isLowSpace && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  空间极度告急
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              NTFS 文件系统 · 卷标: {driveUsage.label} · 智能识别无风险垃圾与临时缓存
            </p>
          </div>
        </div>

        {/* Disk Scenario Simulator for User Testing */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-lg text-xs self-start sm:self-auto">
          <span className="px-2 text-slate-400 text-[11px] font-medium hidden md:inline">测试场景:</span>
          <button
            onClick={() => onSimulateLowSpace('critical')}
            className="px-2.5 py-1 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            空间告急 (仅剩 6.8 GB)
          </button>
          <button
            onClick={() => onSimulateLowSpace('moderate')}
            className="px-2.5 py-1 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-2xs"
          >
            日常维护 (典型状态)
          </button>
          <button
            onClick={() => onSimulateLowSpace('healthy')}
            className="px-2.5 py-1 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            空间充足
          </button>
        </div>
      </div>

      {/* Main Visual Progress Bar */}
      <div className="py-6">
        <div className="flex items-end justify-between mb-2.5">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">已使用空间</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                {formatBytes(driveUsage.usedBytes)}
              </span>
              <span className="text-sm font-semibold text-slate-500 font-mono">
                / {formatBytes(driveUsage.totalBytes)} ({usedPercentage}%)
              </span>
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">当前剩余可用</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-700 dark:text-slate-300">
              {formatBytes(driveUsage.freeBytes)}
            </div>
          </div>
        </div>

        {/* Multi-segment Meter Bar */}
        <div className="relative w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {/* Permanent used (used minus cleanable) */}
          <div
            style={{ width: `${Math.max(0, afterCleaningUsedPercent)}%` }}
            className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-500"
            title="系统及正常文件占用"
          />
          {/* Cleanable portion (striped or accented) */}
          <div
            style={{ width: `${Math.min(100 - afterCleaningUsedPercent, usedPercentage - afterCleaningUsedPercent)}%` }}
            className="h-full bg-amber-500 dark:bg-amber-500/90 transition-all duration-500 animate-pulse"
            title="可安全清理的垃圾文件空间"
          />
        </div>

        {/* Visual Legend below progress bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2.5 gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 dark:bg-slate-600" />
              <span>系统核心与必要软件</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                可立即清理释放 ({formatBytes(totalCleanableBytes)})
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" />
              <span>可用空闲容量</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium font-mono text-xs">
            <span>清理后可用将达:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatBytes(afterCleaningFreeBytes)}</span>
          </div>
        </div>
      </div>

      {/* Action Strip: Big CTA Buttons + Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>智能无风险垃圾</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatBytes(safeBytes)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">包含临时文件、更新缓存、回收站等，可直接一键清除</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>已勾选待清理项</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {selectedCategories.length} / {categories.length} 个分类
          </div>
          <div className="text-[11px] text-slate-500 mt-1">预计可清理累计 {selectedCategories.reduce((s, c) => s + c.fileCount, 0)} 个垃圾碎片</div>
        </div>

        <div className="flex flex-col justify-center gap-2">
          <button
            onClick={onStartClean}
            disabled={isCleaning || isScanning || selectedCategories.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCleaning ? '正在清理中...' : `一键清理释放 (${formatBytes(totalCleanableBytes)})`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onRescan}
            disabled={isScanning || isCleaning}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? '正在扫描垃圾目录...' : '重新全面扫描 C 盘'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
