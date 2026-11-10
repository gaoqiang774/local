/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertCircle,
  FileText,
  FolderOpen,
  CheckSquare,
  Square,
  ShieldAlert,
} from 'lucide-react';
import { JunkCategory, SafetyLevel, WhitelistRule } from '../types/cleaner';
import { formatBytes } from '../utils/categoriesData';

interface CategoryListProps {
  categories: JunkCategory[];
  onToggleCategory: (id: string) => void;
  onSelectPreset: (mode: 'all' | 'safe_only' | 'recommended' | 'none') => void;
  whitelist: WhitelistRule[];
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onToggleCategory,
  onSelectPreset,
  whitelist,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group categories
  const groups: { key: JunkCategory['group']; title: string; subtitle: string }[] = [
    {
      key: 'system',
      title: 'Windows 系统核心垃圾',
      subtitle: '包括临时交换文件、Windows Update 补丁缓存、系统日志及回收站滞留项',
    },
    {
      key: 'browser_app',
      title: '软件与常用浏览器缓存',
      subtitle: '包括 Edge/Chrome 历史网页多媒体临时缓存与社交软件预览流数据（白名单保护开启）',
    },
    {
      key: 'deep_storage',
      title: '系统深层与大文件清理',
      subtitle: '包含升级残留 Windows.old 与 Installer 补丁缓存，释放空间极大',
    },
  ];

  const getSafetyBadge = (safety: SafetyLevel, label: string) => {
    switch (safety) {
      case 'safe':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{label}</span>
          </span>
        );
      case 'recommended':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{label}</span>
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{label}</span>
          </span>
        );
    }
  };

  const activeWhitelistCount = whitelist.filter((w) => w.enabled).length;

  return (
    <div className="space-y-6">
      {/* Quick Select Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">智能勾选方案:</span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => onSelectPreset('safe_only')}
              className="px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors font-medium"
            >
              仅选极度安全项
            </button>
            <button
              onClick={() => onSelectPreset('recommended')}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs"
            >
              智能推荐组合 (默认)
            </button>
            <button
              onClick={() => onSelectPreset('all')}
              className="px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              全选所有项
            </button>
            <button
              onClick={() => onSelectPreset('none')}
              className="px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              取消勾选
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>当前已生效 {activeWhitelistCount} 条白名单安全策略</span>
        </div>
      </div>

      {/* Category Groups */}
      {groups.map((group) => {
        const groupCategories = categories.filter((c) => c.group === group.key);
        if (groupCategories.length === 0) return null;

        const groupTotalBytes = groupCategories.reduce((sum, c) => sum + c.totalSizeBytes, 0);

        return (
          <div
            key={group.key}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs"
          >
            {/* Group Header */}
            <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{group.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{group.subtitle}</p>
              </div>
              <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                该分类共计: <span className="text-slate-900 dark:text-white">{formatBytes(groupTotalBytes)}</span>
              </div>
            </div>

            {/* Items inside Group */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {groupCategories.map((cat) => {
                const isExpanded = expandedId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className={`p-5 transition-colors ${
                      cat.selected ? 'bg-transparent' : 'bg-slate-50/40 dark:bg-slate-950/20 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Checkbox and Category Info */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleCategory(cat.id)}
                          className="mt-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 shrink-0 transition-transform active:scale-90"
                        >
                          {cat.selected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              onClick={() => onToggleCategory(cat.id)}
                              className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
                            >
                              {cat.name}
                            </span>
                            {getSafetyBadge(cat.safety, cat.safetyLabel)}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            {cat.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                            <span className="flex items-center gap-1">
                              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                              <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                {cat.pathTemplate}
                              </code>
                            </span>
                            <span>·</span>
                            <span>{cat.fileCount} 个待清文件</span>
                          </div>
                        </div>
                      </div>

                      {/* Right size and expand toggle */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                            {formatBytes(cat.totalSizeBytes)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {cat.selected ? '已就绪' : '已排除'}
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="查看文件明细"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable File Samples Preview Drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span>探测到的典型文件样本路径（清理时将自动核验白名单）:</span>
                          <span className="font-mono">已扫描样本 {cat.sampleFiles.length} 项</span>
                        </div>

                        <div className="space-y-1.5">
                          {cat.sampleFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-3 text-xs p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 font-mono"
                            >
                              <div className="flex items-center gap-2 min-w-0 truncate">
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300 truncate" title={file.path}>
                                  {file.path}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500">
                                <span>{file.lastModified}</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {formatBytes(file.size)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* PowerShell / CMD technical execution reference */}
                        <div className="pt-2 text-xs">
                          <span className="text-slate-500 font-medium">执行指令预览:</span>
                          <div className="mt-1 p-2 bg-slate-900 text-slate-300 font-mono text-[11px] rounded overflow-x-auto">
                            <code>{cat.powershellSnippet}</code>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
