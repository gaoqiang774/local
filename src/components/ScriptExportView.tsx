/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Code2,
  Download,
  Copy,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  FileCode,
  Laptop,
} from 'lucide-react';
import { JunkCategory, ScheduledTaskConfig, WhitelistRule, WindowsVersionInfo } from '../types/cleaner';
import { generateBatchScript, generatePowerShellScript } from '../utils/scriptGenerator';

interface ScriptExportViewProps {
  categories: JunkCategory[];
  whitelist: WhitelistRule[];
  winVersion: WindowsVersionInfo;
  schedulerConfig: ScheduledTaskConfig;
}

export const ScriptExportView: React.FC<ScriptExportViewProps> = ({
  categories,
  whitelist,
  winVersion,
  schedulerConfig,
}) => {
  const [activeFormat, setActiveFormat] = useState<'powershell' | 'bat'>('powershell');
  const [copied, setCopied] = useState(false);

  const psScript = generatePowerShellScript(categories, whitelist, winVersion, schedulerConfig);
  const batScript = generateBatchScript(categories, winVersion);

  const currentCode = activeFormat === 'powershell' ? psScript : batScript;
  const currentFileName = activeFormat === 'powershell' ? 'WinCleanPro_Clean.ps1' : 'WinCleanPro_Clean.bat';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], {
      type: activeFormat === 'powershell' ? 'text/plain;charset=utf-8' : 'application/x-bat;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Download Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Windows 本机离线运行脚本生成器
                </h2>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                  适配 {winVersion.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                无需安装第三方流氓软件，基于 Windows 官方推荐 PowerShell / Batch 语法。直接下载脚本到电脑上右键【以管理员身份运行】，即可自动安全清理。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? '已复制到剪贴板' : '复制代码'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>一键下载 ({currentFileName})</span>
            </button>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
            <button
              onClick={() => setActiveFormat('powershell')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFormat === 'powershell'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              <span>PowerShell 脚本 (.ps1) [强力推荐]</span>
            </button>
            <button
              onClick={() => setActiveFormat('bat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFormat === 'bat'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-amber-500" />
              <span>传统批处理文件 (.bat)</span>
            </button>
          </div>

          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hidden md:flex font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>已自动内嵌您当前选中的 {whitelist.filter((w) => w.enabled).length} 条白名单安全策略</span>
          </div>
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-semibold text-slate-300">{currentFileName}</span>
          </div>
          <span>UTF-8 · 管理员提权自检模式</span>
        </div>

        <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[500px] select-all">
          <code>{currentCode}</code>
        </pre>
      </div>

      {/* How to use instruction card */}
      <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
          在 Windows 电脑上使用指南 (30秒上手)
        </h4>
        <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>点击右上角「一键下载」将脚本文件保存到您的电脑（如放在桌面）。</li>
          <li>
            若是 <strong>.bat</strong> 文件：直接在文件上<strong>右键</strong>，选择<strong>【以管理员身份运行】</strong>。
          </li>
          <li>
            若是 <strong>.ps1</strong> 文件：右键选择<strong>【使用 PowerShell 运行】</strong>（若系统提示脚本策略受限，在管理员终端输入 <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-slate-800 dark:text-slate-200">Set-ExecutionPolicy RemoteSigned -Scope CurrentUser</code> 即可）。
          </li>
          <li>清理完毕后，按任意键关闭窗口，即刻查验 C 盘已恢复的可用空间！</li>
        </ol>
      </div>
    </div>
  );
};
