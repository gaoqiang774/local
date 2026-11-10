/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  HardDrive,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CleanLogItem } from '../types/cleaner';
import { formatBytes } from '../utils/categoriesData';

interface LogViewerProps {
  logs: CleanLogItem[];
  onClearLogs: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter(
    (l) =>
      l.timestamp.includes(searchTerm) ||
      l.categoryBreakdown.some((c) => c.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalFreedAllTime = logs.reduce((sum, l) => sum + l.totalFreedBytes, 0);
  const totalCleanCount = logs.reduce((sum, l) => sum + l.totalFilesCleaned, 0);

  const handleExportTxt = () => {
    const lines = [
      '=====================================================================',
      'WinClean Pro - Windows C 盘清理历史审计日志导出',
      `导出时间: ${new Date().toLocaleString('zh-CN')}`,
      `累计释放空间: ${formatBytes(totalFreedAllTime)} | 累计清理文件数: ${totalCleanCount}`,
      '=====================================================================',
      '',
    ];

    logs.forEach((log, i) => {
      lines.push(`【记录 #${i + 1}】 ${log.timestamp}`);
      lines.push(`  触发机制: ${getTriggerLabel(log.triggerType)}`);
      lines.push(`  释放容量: ${formatBytes(log.totalFreedBytes)}`);
      lines.push(`  清理文件数: ${log.totalFilesCleaned} 个`);
      lines.push(`  执行耗时: ${(log.durationMs / 1000).toFixed(2)} 秒`);
      lines.push(`  白名单守护跳过文件: ${log.skippedByWhitelistCount} 个`);
      lines.push('  清理项细分:');
      log.categoryBreakdown.forEach((cat) => {
        lines.push(`    - ${cat.categoryName}: 释放 ${formatBytes(cat.freedBytes)} (${cat.fileCount} 个文件)`);
      });
      lines.push('---------------------------------------------------------------------');
    });

    const blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WinClean_Audit_Logs_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTriggerLabel = (type: CleanLogItem['triggerType']) => {
    switch (type) {
      case 'manual':
        return '手动一键清理';
      case 'scheduled':
        return '定时任务自动清理';
      case 'low_space_auto':
        return '低空间紧急自救';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Aggregate Stats */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">C 盘清理历史与审计日志</h2>
                <span className="text-xs font-semibold text-slate-500">
                  共计 {logs.length} 次记录
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                详细记录每次清理的精确时间、触发模式、释放容量、文件数目与白名单保护明细，所有动作均有据可查。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportTxt}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>导出审计日志 (.txt)</span>
            </button>
            <button
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空历史记录</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats Summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>历史累计释放空间</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatBytes(totalFreedAllTime)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>累计清除碎片文件</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalCleanCount.toLocaleString()} 个
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>白名单拦截有效率</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              100% 安全
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="pt-5">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="按清理时间或特定分类筛选日志..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Logs Table / Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <div className="text-sm font-semibold">暂无符合条件的清理日志</div>
            <p className="text-xs mt-1">执行一次「一键清理」后将在此生成审计条目。</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <div key={log.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {log.timestamp}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {getTriggerLabel(log.triggerType)}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        耗时 {(log.durationMs / 1000).toFixed(2)}s
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>已清除 {log.totalFilesCleaned} 个文件</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        已避开 {log.skippedByWhitelistCount} 个白名单文件
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">释放容量</span>
                      <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{formatBytes(log.totalFreedBytes)}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="展开分类明细"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      本次清理项逐项释放清单:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {log.categoryBreakdown.map((cat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
                        >
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                            {cat.categoryName}
                          </span>
                          <div className="flex items-center gap-2 font-mono shrink-0">
                            <span className="text-slate-400 text-[11px]">{cat.fileCount} 个文件</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatBytes(cat.freedBytes)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
