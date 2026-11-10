/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FolderSync,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
  RefreshCw,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import {
  MigrationItem,
  TargetDriveOption,
  DriveUsageState,
  WindowsVersionInfo,
} from '../types/cleaner';
import {
  DEFAULT_TARGET_DRIVES,
  assessMigrationFeasibility,
  formatBytes,
} from '../utils/migrationData';
import {
  generateMigrationPowerShellScript,
  generateRollbackScript,
} from '../utils/migrationScriptGenerator';
import { MigrationConfirmModal } from './MigrationConfirmModal';

interface MigrationViewProps {
  items: MigrationItem[];
  onToggleItem: (id: string) => void;
  onSelectAllRecommended: () => void;
  onSelectOnlyChat: () => void;
  onClearSelection: () => void;
  driveUsage: DriveUsageState;
  winVersion: WindowsVersionInfo;
  onMigrateSuccess: (freedBytes: number, migratedNames: string[]) => void;
}

export const MigrationView: React.FC<MigrationViewProps> = ({
  items,
  onToggleItem,
  onSelectAllRecommended,
  onSelectOnlyChat,
  onClearSelection,
  driveUsage,
  winVersion,
  onMigrateSuccess,
}) => {
  const [targetDrives, setTargetDrives] = useState<TargetDriveOption[]>(DEFAULT_TARGET_DRIVES);
  const [selectedDriveLetter, setSelectedDriveLetter] = useState<string>('D');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>('wechat_files');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptPreview, setShowScriptPreview] = useState(false);

  const currentTargetDrive =
    targetDrives.find((d) => d.letter === selectedDriveLetter) || targetDrives[0];

  const selectedItems = items.filter((i) => i.selected);

  // Assessment calculation
  const assessment = assessMigrationFeasibility(
    selectedItems,
    currentTargetDrive,
    driveUsage.totalBytes
  );

  const filteredItems = items.filter((item) => {
    if (activeCategoryFilter === 'all') return true;
    return item.category === activeCategoryFilter;
  });

  const handleDownloadPowerShellScript = () => {
    const script = generateMigrationPowerShellScript(items, currentTargetDrive);
    const blob = new Blob([script], { type: 'application/x-powershell;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WinClean_Migrate_to_${currentTargetDrive.letter}.ps1`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyScript = () => {
    const script = generateMigrationPowerShellScript(items, currentTargetDrive);
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleExecute = () => {
    setIsConfirmModalOpen(false);
    onMigrateSuccess(
      assessment.totalSelectedBytes,
      selectedItems.map((i) => i.name)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
              <FolderSync className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Windows C 盘大文件智能无缝迁移中心
                </h2>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  双阶段评估与确认 · 零数据丢失
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                普通清理只能删除临时缓存，微信聊天记录、QQ 数据、系统下载目录动辄占用 30~80GB 空间。
                本功能基于 Windows 原生 <strong>NTFS 目录联接符号链接 (mklink /J)</strong> 技术，将数据安全搬迁至 D 盘并在原位置保留透明映射，软件使用毫无感知，彻底根治 C 盘飘红！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={selectedItems.length === 0 || !assessment.hasEnoughSpace}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>启动安全评估与确认迁移 →</span>
            </button>
          </div>
        </div>

        {/* Target Drive Selector & Assessment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5">
          {/* Left Column: Target Drive Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>选择迁移目标副盘（支持 NTFS / ReFS）：</span>
              </span>
            </div>

            <div className="space-y-2">
              {targetDrives.map((drive) => {
                const isSelected = drive.letter === selectedDriveLetter;
                const freeGB = (drive.freeBytes / 1073741824).toFixed(0);
                const totalGB = (drive.totalBytes / 1073741824).toFixed(0);
                const percent = Math.round(((drive.totalBytes - drive.freeBytes) / drive.totalBytes) * 100);

                return (
                  <div
                    key={drive.letter}
                    onClick={() => setSelectedDriveLetter(drive.letter)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {drive.letter}: 盘
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {drive.label}
                        </span>
                        {drive.isRecommended && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            首选推荐
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        剩余 {freeGB} GB / 共 {totalGB} GB
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${percent > 85 ? 'bg-amber-500' : 'bg-blue-600'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Assessment Scoreboard (7 cols) */}
          <div className="lg:col-span-7 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-5 flex flex-col justify-between border border-slate-800 shadow-md">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">智能可行性预评估模型</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    安全评分: {assessment.safetyScore} 分 (极度推荐)
                  </span>
                </div>
                <span className="text-xs text-slate-400">已选中 {selectedItems.length} 个迁移项</span>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">待释放 C 盘空间</span>
                  <span className="text-xl font-extrabold text-blue-400 mt-1 block">
                    +{formatBytes(assessment.totalSelectedBytes)}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">目标 {currentTargetDrive.letter} 盘迁移后余量</span>
                  <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                    {formatBytes(assessment.remainingTargetFreeBytes)}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">C 盘空间释放比例</span>
                  <span className="text-xl font-extrabold text-amber-300 mt-1 block">
                    约 {assessment.freedCPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                💡 <strong>评估结论：</strong> {assessment.recommendationSummary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>技术核心: 微软 NTFS Directory Junction 软链接 + 一键回退保障</span>
              </div>
              <button
                onClick={() => setShowScriptPreview(!showScriptPreview)}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                {showScriptPreview ? '收起底层脚本' : '预览原生迁移脚本 (.ps1)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Script Preview Collapsible */}
      {showScriptPreview && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md animate-in fade-in duration-150">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>WinClean_Migrate_to_{currentTargetDrive.letter}.ps1 (Windows 原生 PowerShell 迁移脚本)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? '已复制' : '复制代码'}</span>
              </button>
              <button
                onClick={handleDownloadPowerShellScript}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-sans font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载脚本文件</span>
              </button>
            </div>
          </div>
          <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[280px]">
            <code>{generateMigrationPowerShellScript(items, currentTargetDrive)}</code>
          </pre>
        </div>
      )}

      {/* Candidate Items Toolbar & List */}
      <div className="space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {[
              { id: 'all', label: '全部项目 (7)' },
              { id: 'chat', label: '微信/QQ社交聊天 (2)' },
              { id: 'user_folder', label: '系统下载/文档个人目录 (3)' },
              { id: 'dev_tool', label: 'Docker/开发缓存 (2)' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveCategoryFilter(chip.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  activeCategoryFilter === chip.id
                    ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Quick Selection Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs shrink-0">
            <button
              onClick={onSelectAllRecommended}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
            >
              全选推荐项
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={onSelectOnlyChat}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
            >
              仅选微信与QQ
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={onClearSelection}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-red-600 font-semibold"
            >
              取消选择
            </button>
          </div>
        </div>

        {/* Item Cards */}
        <div className="grid grid-cols-1 gap-3.5">
          {filteredItems.map((item) => {
            const isExpanded = expandedItemId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all ${
                  item.selected
                    ? 'border-blue-500/80 dark:border-blue-500/80 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5">
                    <input
                      type="checkbox"
                      id={`chk_${item.id}`}
                      checked={item.selected}
                      onChange={() => onToggleItem(item.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <label
                          htmlFor={`chk_${item.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {item.name}
                        </label>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.categoryLabel}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.riskLevel === 'safe'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          {item.riskLabel}
                        </span>
                      </div>

                      {/* Path row */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">源路径:</span>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                          {item.sourcePath}
                        </code>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">目标:</span>
                        <code className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[11px]">
                          {currentTargetDrive.letter}:\{item.defaultTargetSubPath}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Right: Size & Toggle */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 block">
                        {formatBytes(item.sizeBytes)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {item.fileCount.toLocaleString()} 个文件
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={isExpanded ? '收起详情' : '展开详情'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Technical Details */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 animate-in fade-in duration-150">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        <span>技术机制与原理解析：</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {item.riskDetail}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-2">
                        <span>底层迁移技术: <strong className="text-slate-700 dark:text-slate-300">{item.mechanism}</strong></span>
                        {item.processName && (
                          <span className="text-amber-600 dark:text-amber-400">
                            (迁移时需暂时关闭: {item.processName})
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ 支持随时无损回滚撤销
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <MigrationConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        items={items}
        targetDrive={currentTargetDrive}
        assessment={assessment}
        onExecuteMigration={handleExecute}
      />
    </div>
  );
};
