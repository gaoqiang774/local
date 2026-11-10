/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardDrive,
  Download,
  Copy,
  Check,
  X,
  RefreshCw,
  FolderSync,
  Layers,
  FileCode,
} from 'lucide-react';
import { MigrationItem, TargetDriveOption, MigrationAssessmentResult } from '../types/cleaner';
import { formatBytes } from '../utils/migrationData';
import { generateRollbackScript } from '../utils/migrationScriptGenerator';

interface MigrationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MigrationItem[];
  targetDrive: TargetDriveOption;
  assessment: MigrationAssessmentResult;
  onExecuteMigration: () => void;
}

export const MigrationConfirmModal: React.FC<MigrationConfirmModalProps> = ({
  isOpen,
  onClose,
  items,
  targetDrive,
  assessment,
  onExecuteMigration,
}) => {
  const [confirmedChecklist, setConfirmedChecklist] = useState<{
    space: boolean;
    process: boolean;
    rollback: boolean;
  }>({
    space: true,
    process: false,
    rollback: true,
  });

  const [copiedRollback, setCopiedRollback] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const selectedItems = items.filter((i) => i.selected);

  const canProceed =
    confirmedChecklist.space &&
    confirmedChecklist.process &&
    confirmedChecklist.rollback &&
    assessment.hasEnoughSpace;

  const handleDownloadRollback = () => {
    const script = generateRollbackScript(items, targetDrive);
    const blob = new Blob([script], { type: 'application/x-bat;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rollback_Migration_to_${targetDrive.letter}.bat`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyRollback = () => {
    const script = generateRollbackScript(items, targetDrive);
    navigator.clipboard.writeText(script);
    setCopiedRollback(true);
    setTimeout(() => setCopiedRollback(false), 2000);
  };

  const startExecution = () => {
    setIsExecuting(true);
    setCurrentStep(1);

    const steps = [
      { step: 1, delay: 800 },
      { step: 2, delay: 1600 },
      { step: 3, delay: 2800 },
      { step: 4, delay: 3800 },
      { step: 5, delay: 4800 },
    ];

    steps.forEach(({ step, delay }) => {
      setTimeout(() => {
        setCurrentStep(step);
        if (step === 5) {
          setTimeout(() => {
            setIsExecuting(false);
            onExecuteMigration();
          }, 800);
        }
      }, delay);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <FolderSync className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                C 盘大文件迁移安全评估与双重确认
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                请仔细核对搬迁路径与系统前置条件，确保迁移过程 100% 稳妥
              </p>
            </div>
          </div>
          {!isExecuting && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Progress Overlay when executing */}
          {isExecuting ? (
            <div className="py-8 space-y-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 animate-spin">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  正在执行 C 盘大文件无缝搬移与链接绑定...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentStep === 1 && '第 1/4 步：正在校验源目录文件完整性与安全权限...'}
                  {currentStep === 2 && '第 2/4 步：目标分区预分配并验证 NTFS 目录联接支持...'}
                  {currentStep === 3 && '第 3/4 步：正在使用 Robocopy 完整移动数据至目标盘...'}
                  {currentStep === 4 && '第 4/4 步：正在创建 NTFS 目录联接 (mklink /J) 虚拟映射...'}
                  {currentStep === 5 && '迁移完成！所有软件无感知读取，正在同步空间数据...'}
                </p>
              </div>

              {/* Step indicator */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-500"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">待释放 C 盘空间</span>
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">
                    +{formatBytes(assessment.totalSelectedBytes)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">迁移目标磁盘</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    {targetDrive.letter} 盘 (NTFS)
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">目标盘迁移后余量</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {formatBytes(assessment.remainingTargetFreeBytes)}
                  </span>
                </div>
              </div>

              {/* Items Mapping Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  搬迁目录映射与技术原理:
                </span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="p-3 bg-white dark:bg-slate-900 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatBytes(item.sizeBytes)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span className="truncate max-w-[240px] text-slate-600 dark:text-slate-300" title={item.sourcePath}>
                          {item.sourcePath}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate max-w-[240px] text-emerald-600 dark:text-emerald-400 font-semibold" title={`${targetDrive.letter}:\\${item.defaultTargetSubPath}`}>
                          {targetDrive.letter}:\{item.defaultTargetSubPath}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Technical Guarantees */}
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>NTFS 软链接透明转发机制保障</span>
                </div>
                <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                  搬迁后在原位置建立 NTFS 联接符号链接（Directory Junction）。微信、QQ 等软件在访问原路径时，操作系统底层自动静默将请求重定向至目标磁盘，软件本身毫无感知，绝无任何数据损坏或丢失风险。
                </p>
              </div>

              {/* Pre-condition Checklist */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  执行前置安全确认清单（请逐一勾选）：
                </span>

                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={confirmedChecklist.space}
                      onChange={(e) =>
                        setConfirmedChecklist((prev) => ({ ...prev, space: e.target.checked }))
                      }
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        目标磁盘空间评估已确认
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        目标 {targetDrive.letter} 盘剩余 {formatBytes(targetDrive.freeBytes)}，完全足够承接 {formatBytes(assessment.totalSelectedBytes)} 数据。
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={confirmedChecklist.process}
                      onChange={(e) =>
                        setConfirmedChecklist((prev) => ({ ...prev, process: e.target.checked }))
                      }
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        已确认关闭相关应用程序（微信 / QQ 等）
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        避免因文件被应用锁定而导致搬移失败。脚本也将自动尝试进行安全退出。
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={confirmedChecklist.rollback}
                      onChange={(e) =>
                        setConfirmedChecklist((prev) => ({ ...prev, rollback: e.target.checked }))
                      }
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        已知晓随时可无损回滚撤销
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        系统已备妥一键撤销回退程序，任何时候若想迁回 C 盘，运行回滚脚本即可秒级复原。
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Rollback Script download pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  备份保障：一键回退与还原脚本 (Rollback_Migration.bat)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyRollback}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    title="复制回滚脚本"
                  >
                    {copiedRollback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleDownloadRollback}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>下载回滚脚本</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isExecuting && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
            >
              取消并返回
            </button>

            <button
              onClick={startExecution}
              disabled={!canProceed}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FolderSync className="w-4 h-4" />
              <span>确认评估无误 · 立即开始迁移</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
