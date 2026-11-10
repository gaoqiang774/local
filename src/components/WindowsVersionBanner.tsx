/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Laptop, Cpu, CheckCircle2, ChevronDown, RefreshCw } from 'lucide-react';
import { WindowsVersionId, WindowsVersionInfo } from '../types/cleaner';
import { WINDOWS_PRESETS } from '../utils/windowsDetector';

interface WindowsVersionBannerProps {
  winVersion: WindowsVersionInfo;
  onSelectVersion: (ver: WindowsVersionInfo) => void;
  onRedetect: () => void;
}

export const WindowsVersionBanner: React.FC<WindowsVersionBannerProps> = ({
  winVersion,
  onSelectVersion,
  onRedetect,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                已自动识别系统环境：{winVersion.name} ({winVersion.releaseName})
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {winVersion.architecture} · 内核 {winVersion.buildNumber}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              系统感知引擎已就绪：已针对 {winVersion.name} 的系统目录结构（如 SoftwareDistribution、Temp、WER 转储及传递优化）建立安全清理策略，并全面保护核心系统文件。
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
              {winVersion.features.map((feat, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{feat}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={onRedetect}
            title="重新检测本机环境"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重新检测</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>切换目标版本</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  选择目标 Windows 系统
                </div>
                {Object.values(WINDOWS_PRESETS).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectVersion(preset);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                      winVersion.id === preset.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-[11px] text-slate-400">{preset.releaseName}</div>
                    </div>
                    {winVersion.id === preset.id && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
