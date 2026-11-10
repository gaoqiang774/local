/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Terminal,
  CheckCircle2,
  Box,
  Monitor,
  Laptop,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { JunkCategory, ScheduledTaskConfig, WhitelistRule, WindowsVersionInfo } from '../types/cleaner';
import { generateStandaloneExeBuilderScript, generateIExpressSedConfig } from '../utils/exeGenerator';

interface ExePackagingViewProps {
  categories: JunkCategory[];
  whitelist: WhitelistRule[];
  winVersion: WindowsVersionInfo;
  schedulerConfig: ScheduledTaskConfig;
}

export const ExePackagingView: React.FC<ExePackagingViewProps> = ({
  categories,
  whitelist,
  winVersion,
  schedulerConfig,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'oneclick' | 'iexpress' | 'electron'>('oneclick');

  const builderScript = generateStandaloneExeBuilderScript(categories, whitelist, winVersion, schedulerConfig);
  const sedConfig = generateIExpressSedConfig();

  const handleDownloadBuilderBat = () => {
    const blob = new Blob([builderScript], { type: 'application/x-bat;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Build_WinCleanPro_EXE.bat';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSed = () => {
    const blob = new Blob([sedConfig], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'WinCleanPro.sed';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(builderScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Windows 原生 EXE 客户端打包生成中心
                </h2>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  独立单文件 · 绿色免安装
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                针对普通 Windows 用户，我们提供了<strong>「零环境依赖一键生成 EXE」</strong>方案。借助 Windows 10/11 系统内置的原生 .NET 编译器，下载后只需双击，2秒内便可在您的电脑中生成真实的原生 <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 font-mono">WinCleanPro.exe</code> 桌面程序！
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            <a
              href="/WinCleanPro_hta.txt"
              download="WinCleanPro_hta.txt"
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-md transition-all whitespace-nowrap"
              title="1.5倍大窗口 + 纯Unicode编码绝无乱码！杀软不拦截，下载后重命名将 .txt 改为 .hta 双击运行"
            >
              <Download className="w-4 h-4" />
              <span>下载 WinCleanPro_hta.txt (1.5倍大窗口·绝无乱码)</span>
            </a>
            <a
              href="/WinCleanPro_hta"
              download="WinCleanPro_hta"
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md transition-all whitespace-nowrap"
              title="无扩展名，下载后加上 .hta 即可运行"
            >
              <Monitor className="w-4 h-4" />
              <span>下载 WinCleanPro_hta (无扩展名)</span>
            </a>
            <a
              href="/WinCleanPro.hta"
              download="WinCleanPro.hta"
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all whitespace-nowrap"
              title="直接运行版 HTA"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>直接下载 WinCleanPro.hta</span>
            </a>
          </div>
        </div>

        {/* Feature Cards Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>零依赖 · 瞬间编译</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              无需安装 Visual Studio、Python 或 Node.js，Windows 10/11 全系列内置原生编译器。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>管理员提权与白名单</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              生成的 EXE 自动申请 UAC 管理员提权，并严格避开微信聊天记录与重要工程文件。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Monitor className="w-4 h-4 text-blue-500" />
              <span>支持双模式运行</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              双击打开图形化窗口；亦支持 <code className="font-mono text-[11px]">WinCleanPro.exe /silent</code> 供计划任务静默执行。
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for Multiple packaging options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs max-w-xl">
          <button
            onClick={() => setActiveTab('oneclick')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-center ${
              activeTab === 'oneclick'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            方案一：一键自动生成原生 EXE (强烈推荐)
          </button>
          <button
            onClick={() => setActiveTab('iexpress')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-center ${
              activeTab === 'iexpress'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            方案二：Windows IExpress 单文件封包
          </button>
          <button
            onClick={() => setActiveTab('electron')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-center ${
              activeTab === 'electron'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            方案三：Electron / Tauri 跨平台打包
          </button>
        </div>

        {/* Tab 1: One-click EXE Generator */}
        {activeTab === 'oneclick' && (
          <div className="space-y-5">
            {/* Direct No-Extension Download Highlight Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    🛡️ 1.5倍大窗口 · 纯 Unicode 彻底杜绝乱码版本
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-600 text-white">
                    已放大1.5倍 · 零乱码
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  已全面升级窗口尺寸至 <strong>1080 × 840（1.5倍放大）</strong>，字号与间距全面适配高分辨率屏幕；底层采用纯 ASCII 实体编码，彻底杜绝所有 Windows 语言环境下的乱码问题！
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <a
                  href="/WinCleanPro_hta.txt"
                  download="WinCleanPro_hta.txt"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                  title="推荐：纯文本下载防拦截，下载后将 .txt 后缀改为 .hta 即可"
                >
                  <Download className="w-4 h-4" />
                  <span>下载 WinCleanPro_hta.txt (改.hta即开)</span>
                </a>
                <a
                  href="/WinCleanPro_hta"
                  download="WinCleanPro_hta"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                  title="无扩展名防拦截，下载后重命名为 WinCleanPro.hta 即可"
                >
                  <Download className="w-4 h-4" />
                  <span>下载 WinCleanPro_hta (无扩展名)</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>使用指南与亮点:</span>
                </h4>
                <ol className="text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside space-y-1 pl-1">
                  <li>
                    点击上方绿色按钮，下载 <strong>WinCleanPro.exe</strong> 到您的电脑（如放在桌面）。
                  </li>
                  <li>
                    在 <strong>WinCleanPro.exe</strong> 上<strong>双击运行</strong>（自动请求 UAC 管理员提权以保证清理系统更新与临时文件的完整权限）。
                  </li>
                  <li>
                    在弹出的窗口中点击「★ 一键智能极速清理 C 盘垃圾」，几秒内即可彻底释放数 GB 可用空间，微信聊天记录与桌面工作文件受白名单全程保护！
                  </li>
                </ol>
              </div>
            </div>

            {/* Code Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Build_WinCleanPro_EXE.bat (包含完整 C# 原生图形化客户端源码)</span>
                <span>目标输出: WinCleanPro.exe</span>
              </div>
              <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[360px]">
                <code>{builderScript}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Windows IExpress */}
        {activeTab === 'iexpress' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>IExpress</strong> 是微软从 Windows NT / 2000 开始内置于所有 Windows 系统（在 <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono">C:\Windows\System32\iexpress.exe</code>）中的官方自解压和单文件可执行封包工具。
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                如何利用 IExpress 制作独立单文件绿色 EXE:
              </h5>
              <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>按键盘 <strong>Win + R</strong> 键打开运行对话框，输入 <code className="font-mono text-blue-600">iexpress</code> 回车。</li>
                <li>在向导中选择「Open an existing Self Extraction Directive file」，点击 Browse 选择下载的 <code className="font-mono">WinCleanPro.sed</code>。</li>
                <li>一路点击「Next」直到完成，向导会自动将清理脚本压制为单一的独立可执行文件 <strong>WinCleanPro_Portable.exe</strong>！</li>
              </ol>

              <button
                onClick={handleDownloadSed}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载 IExpress 配置文件 (WinCleanPro.sed)</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
                WinCleanPro.sed 配置参数
              </div>
              <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                <code>{sedConfig}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Electron / Tauri */}
        {activeTab === 'electron' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              如果您希望将当前的精美 Web 界面作为完整的桌面 GUI 打包分发为 Windows 安装包（如 <code className="font-mono text-blue-600">WinCleanPro-Setup.exe</code> 或绿色便携版）：
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                使用 electron-builder 打包命令:
              </span>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto">
                <code>
                  # 1. 安装 Electron 打包工具<br />
                  npm install -D electron electron-builder concurrently<br /><br />
                  # 2. 构建并生成 Windows EXE 安装包<br />
                  npm run build<br />
                  npx electron-builder --win nsis --x64
                </code>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                执行完毕后，生成的安装文件将存放在 <code className="font-mono">/dist/WinCleanPro Setup.exe</code> 中，双击即可在 Windows 电脑上安装使用。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
