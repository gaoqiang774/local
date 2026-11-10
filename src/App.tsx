/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { WindowsVersionBanner } from './components/WindowsVersionBanner';
import { DiskOverviewCard } from './components/DiskOverviewCard';
import { CategoryList } from './components/CategoryList';
import { SchedulerView } from './components/SchedulerView';
import { WhitelistManager } from './components/WhitelistManager';
import { LogViewer } from './components/LogViewer';
import { ScriptExportView } from './components/ScriptExportView';
import { ExePackagingView } from './components/ExePackagingView';
import { CleanModal } from './components/CleanModal';
import { MigrationView } from './components/MigrationView';

import {
  CleanLogItem,
  DriveUsageState,
  JunkCategory,
  ScheduledTaskConfig,
  WhitelistRule,
  WindowsVersionInfo,
  MigrationItem,
} from './types/cleaner';
import { INITIAL_JUNK_CATEGORIES } from './utils/categoriesData';
import { DEFAULT_WHITELIST_RULES } from './utils/whitelistDefaults';
import { INITIAL_MIGRATION_ITEMS } from './utils/migrationData';
import { detectWindowsEnvironment, WINDOWS_PRESETS } from './utils/windowsDetector';

const INITIAL_LOGS: CleanLogItem[] = [
  {
    id: 'log_prev_01',
    timestamp: '2026-11-08 22:15:40',
    totalFreedBytes: 14_850_000_000, // 14.85 GB
    totalFilesCleaned: 1240,
    durationMs: 2450,
    status: 'success',
    triggerType: 'scheduled',
    skippedByWhitelistCount: 16,
    categoryBreakdown: [
      { categoryId: 'windows_update', categoryName: 'Windows Update 更新下载包与分发缓存', freedBytes: 6_450_000_000, fileCount: 89 },
      { categoryId: 'user_temp', categoryName: '用户临时缓存文件 (%TEMP%)', freedBytes: 3_840_000_000, fileCount: 384 },
      { categoryId: 'recycle_bin', categoryName: 'Windows 回收站未清理数据', freedBytes: 2_600_000_000, fileCount: 180 },
      { categoryId: 'delivery_opt', categoryName: '传递优化服务 P2P 下载缓存', freedBytes: 1_960_000_000, fileCount: 42 },
    ],
  },
  {
    id: 'log_prev_02',
    timestamp: '2026-11-04 10:30:12',
    totalFreedBytes: 8_420_000_000, // 8.42 GB
    totalFilesCleaned: 680,
    durationMs: 1820,
    status: 'success',
    triggerType: 'manual',
    skippedByWhitelistCount: 12,
    categoryBreakdown: [
      { categoryId: 'browser_cache', categoryName: '浏览器历史网页与多媒体缓存 (Chrome / Edge)', freedBytes: 3_120_000_000, fileCount: 420 },
      { categoryId: 'sys_temp', categoryName: 'Windows 系统临时文件 (C:\\Windows\\Temp)', freedBytes: 1_920_000_000, fileCount: 156 },
      { categoryId: 'thumbnails', categoryName: 'Windows 资源管理器缩略图缓存', freedBytes: 1_280_000_000, fileCount: 18 },
      { categoryId: 'error_dumps', categoryName: '系统错误转储与崩溃报告', freedBytes: 1_650_000_000, fileCount: 14 },
    ],
  },
];

export default function App() {
  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('winclean_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('winclean_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('winclean_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'migration' | 'scheduler' | 'whitelist' | 'logs' | 'script' | 'package_exe'>('overview');

  // Windows Version Detection
  const [winVersion, setWinVersion] = useState<WindowsVersionInfo>(() => detectWindowsEnvironment());

  const handleRedetect = () => {
    const detected = detectWindowsEnvironment();
    setWinVersion(detected);
  };

  // C Drive Migration Candidates State
  const [migrationItems, setMigrationItems] = useState<MigrationItem[]>(() => {
    const saved = localStorage.getItem('winclean_migration_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_MIGRATION_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('winclean_migration_items', JSON.stringify(migrationItems));
  }, [migrationItems]);

  // C Drive Usage Simulation State
  const [driveUsage, setDriveUsage] = useState<DriveUsageState>({
    driveLetter: 'C',
    label: 'Windows 11 OS',
    totalBytes: 512 * 1024 * 1024 * 1024, // 512 GB
    usedBytes: 428 * 1024 * 1024 * 1024, // 428 GB used (~83.6%)
    freeBytes: 84 * 1024 * 1024 * 1024, // 84 GB free
  });

  // Junk Categories
  const [categories, setCategories] = useState<JunkCategory[]>(() => {
    const saved = localStorage.getItem('winclean_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_JUNK_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('winclean_categories', JSON.stringify(categories));
  }, [categories]);

  // Whitelist Rules
  const [whitelist, setWhitelist] = useState<WhitelistRule[]>(() => {
    const saved = localStorage.getItem('winclean_whitelist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_WHITELIST_RULES;
  });

  useEffect(() => {
    localStorage.setItem('winclean_whitelist', JSON.stringify(whitelist));
  }, [whitelist]);

  // Scheduled Task Configuration
  const [schedulerConfig, setSchedulerConfig] = useState<ScheduledTaskConfig>(() => {
    const saved = localStorage.getItem('winclean_scheduler');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      enabled: true,
      frequency: 'daily',
      executionTime: '03:00',
      dayOfWeek: 0,
      dayOfMonth: 1,
      lowSpaceThresholdGB: 15,
      cleanProfile: 'standard',
      silentMode: true,
      autoEmptyRecycleBin: true,
      notifyOnCompletion: true,
      lastExecutedTime: '2026-11-08 03:00:15',
      taskSchedulerRegistered: true,
    };
  });

  useEffect(() => {
    localStorage.setItem('winclean_scheduler', JSON.stringify(schedulerConfig));
  }, [schedulerConfig]);

  // Audit Logs
  const [logs, setLogs] = useState<CleanLogItem[]>(() => {
    const saved = localStorage.getItem('winclean_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('winclean_logs', JSON.stringify(logs));
  }, [logs]);

  // Clean Modal & Scanning State
  const [isCleanModalOpen, setIsCleanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Toggle Category selection
  const handleToggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  // Preset Selection Mode
  const handleSelectPreset = (mode: 'all' | 'safe_only' | 'recommended' | 'none') => {
    setCategories((prev) =>
      prev.map((c) => {
        if (mode === 'all') return { ...c, selected: true };
        if (mode === 'none') return { ...c, selected: false };
        if (mode === 'safe_only') return { ...c, selected: c.safety === 'safe' };
        if (mode === 'recommended') return { ...c, selected: c.safety !== 'caution' };
        return c;
      })
    );
  };

  // Rescan simulation
  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Give small variation to simulate scan
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          fileCount: c.fileCount + Math.floor(Math.random() * 5),
          totalSizeBytes: c.totalSizeBytes + Math.floor(Math.random() * 50_000_000),
        }))
      );
    }, 1200);
  };

  // Handle Clean Completion
  const handleCompleteClean = (freedBytes: number, totalFiles: number, breakdown: any[]) => {
    setIsCleaning(false);
    // Update C Drive state
    setDriveUsage((prev) => {
      const newFree = Math.min(prev.totalBytes, prev.freeBytes + freedBytes);
      const newUsed = Math.max(0, prev.totalBytes - newFree);
      return {
        ...prev,
        freeBytes: newFree,
        usedBytes: newUsed,
      };
    });

    // Zero out cleaned categories or reset
    setCategories((prev) =>
      prev.map((c) => (c.selected ? { ...c, totalSizeBytes: 0, fileCount: 0 } : c))
    );

    // Create Log Entry
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: CleanLogItem = {
      id: `log_${Date.now()}`,
      timestamp: dateStr,
      totalFreedBytes: freedBytes,
      totalFilesCleaned: totalFiles,
      durationMs: 2200,
      status: 'success',
      triggerType: 'manual',
      skippedByWhitelistCount: whitelist.filter((w) => w.enabled).length * 2,
      categoryBreakdown: breakdown,
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  // Whitelist operations
  const handleToggleWhitelistRule = (id: string) => {
    setWhitelist((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleAddWhitelistRule = (rule: Omit<WhitelistRule, 'id' | 'isPreset'>) => {
    const newRule: WhitelistRule = {
      ...rule,
      id: `custom_wl_${Date.now()}`,
      isPreset: false,
    };
    setWhitelist((prev) => [...prev, newRule]);
  };

  const handleDeleteWhitelistRule = (id: string) => {
    setWhitelist((prev) => prev.filter((w) => w.id !== id));
  };

  const handleResetWhitelistToDefaults = () => {
    setWhitelist(DEFAULT_WHITELIST_RULES);
  };

  // Simulate low space scenario
  const handleSimulateLowSpace = (scenario: 'critical' | 'moderate' | 'healthy') => {
    if (scenario === 'critical') {
      setDriveUsage({
        driveLetter: 'C',
        label: 'Windows 11 OS',
        totalBytes: 512 * 1024 * 1024 * 1024,
        usedBytes: 505.2 * 1024 * 1024 * 1024,
        freeBytes: 6.8 * 1024 * 1024 * 1024, // 6.8 GB free (CRITICAL)
      });
      // Re-populate categories with large junk sizes
      setCategories(INITIAL_JUNK_CATEGORIES);
    } else if (scenario === 'moderate') {
      setDriveUsage({
        driveLetter: 'C',
        label: 'Windows 11 OS',
        totalBytes: 512 * 1024 * 1024 * 1024,
        usedBytes: 428 * 1024 * 1024 * 1024,
        freeBytes: 84 * 1024 * 1024 * 1024,
      });
      setCategories(INITIAL_JUNK_CATEGORIES);
    } else {
      setDriveUsage({
        driveLetter: 'C',
        label: 'Windows 11 OS',
        totalBytes: 512 * 1024 * 1024 * 1024,
        usedBytes: 310 * 1024 * 1024 * 1024,
        freeBytes: 202 * 1024 * 1024 * 1024,
      });
    }
  };

  // Test schedule trigger
  const handleRunTestSchedule = () => {
    setIsCleanModalOpen(true);
  };

  // Migration Handlers
  const handleToggleMigrationItem = (id: string) => {
    setMigrationItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSelectAllRecommendedMigration = () => {
    setMigrationItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: item.recommendation === 'strongly_recommended' || item.recommendation === 'recommended',
      }))
    );
  };

  const handleSelectOnlyChatMigration = () => {
    setMigrationItems((prev) =>
      prev.map((item) => ({ ...item, selected: item.category === 'chat' }))
    );
  };

  const handleClearMigrationSelection = () => {
    setMigrationItems((prev) =>
      prev.map((item) => ({ ...item, selected: false }))
    );
  };

  const handleMigrateSuccess = (freedBytes: number, migratedNames: string[]) => {
    // 1. Update Drive C Usage
    setDriveUsage((prev) => {
      const newFree = Math.min(prev.totalBytes, prev.freeBytes + freedBytes);
      const newUsed = Math.max(0, prev.totalBytes - newFree);
      return {
        ...prev,
        freeBytes: newFree,
        usedBytes: newUsed,
      };
    });

    // 2. Mark migrated items
    setMigrationItems((prev) =>
      prev.map((item) =>
        item.selected ? { ...item, migrated: true, selected: false } : item
      )
    );

    // 3. Add to Audit Logs
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: CleanLogItem = {
      id: `migration_log_${Date.now()}`,
      timestamp: dateStr,
      totalFreedBytes: freedBytes,
      totalFilesCleaned: migratedNames.length,
      durationMs: 4800,
      status: 'success',
      triggerType: 'manual',
      skippedByWhitelistCount: 0,
      categoryBreakdown: migratedNames.map((name) => ({
        categoryId: 'c_migration',
        categoryName: `[C盘大文件迁移] ${name}`,
        freedBytes: Math.floor(freedBytes / migratedNames.length),
        fileCount: 1,
      })),
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      {/* Top Bar Contract (1 Row, 3 Zones, Single Brand Wordmark) */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        winVersion={winVersion}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onQuickCleanClick={() => setIsCleanModalOpen(true)}
        isCleaning={isCleaning}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Windows Detection & Version Banner */}
        <WindowsVersionBanner
          winVersion={winVersion}
          onSelectVersion={setWinVersion}
          onRedetect={handleRedetect}
        />

        {/* Tab 1: Overview & 1-Click Clean */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <DiskOverviewCard
              driveUsage={driveUsage}
              categories={categories}
              onStartClean={() => setIsCleanModalOpen(true)}
              onRescan={handleRescan}
              isScanning={isScanning}
              isCleaning={isCleaning}
              onSimulateLowSpace={handleSimulateLowSpace}
            />

            {/* Quick C Drive Migration Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    🚀 C 盘空间告急？全新升级「C 盘大文件安全无缝迁移」
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                    可释放 80GB+
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  采用 Windows 原生 NTFS 软链接技术，将微信/QQ聊天记录、下载、文档安全搬移至 D 盘，原路径完全无感映射，聊天记录与数据 100% 完好无损！
                </p>
              </div>
              <button
                onClick={() => setActiveTab('migration')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-lg shadow-2xs transition-colors shrink-0 whitespace-nowrap"
              >
                启动迁移评估与确认 →
              </button>
            </div>

            {/* Quick EXE Packaging Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    💻 需要桌面独立版？支持一键生成原生绿色 WinCleanPro.exe 单文件
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  基于 Windows 10/11 内置编译器，下载生成脚本双击 2 秒即可在电脑生成 EXE 独立客户端，免去任何安装环境。
                </p>
              </div>
              <button
                onClick={() => setActiveTab('package_exe')}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg shadow-2xs transition-colors shrink-0 whitespace-nowrap"
              >
                前往打包 EXE 桌面版 →
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">待清理垃圾项概览</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    勾选需要清理的目录，点击「垃圾项分析」标签页可查看更详细的底层文件样本与技术执行指令。
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  查看全部明细 →
                </button>
              </div>

              <CategoryList
                categories={categories}
                onToggleCategory={handleToggleCategory}
                onSelectPreset={handleSelectPreset}
                whitelist={whitelist}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Detailed Category Explorer */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="px-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Windows C 盘垃圾文件深度扫描与分析</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                对系统各目录进行细颗粒度筛查，直观标注安全级别并提供文件样本预览，保障您的系统稳定运行。
              </p>
            </div>
            <CategoryList
              categories={categories}
              onToggleCategory={handleToggleCategory}
              onSelectPreset={handleSelectPreset}
              whitelist={whitelist}
            />
          </div>
        )}

        {/* Tab 3: C Drive Large File Migration */}
        {activeTab === 'migration' && (
          <MigrationView
            items={migrationItems}
            onToggleItem={handleToggleMigrationItem}
            onSelectAllRecommended={handleSelectAllRecommendedMigration}
            onSelectOnlyChat={handleSelectOnlyChatMigration}
            onClearSelection={handleClearMigrationSelection}
            driveUsage={driveUsage}
            winVersion={winVersion}
            onMigrateSuccess={handleMigrateSuccess}
          />
        )}

        {/* Tab 3: Scheduler Configuration */}
        {activeTab === 'scheduler' && (
          <SchedulerView
            config={schedulerConfig}
            onUpdateConfig={setSchedulerConfig}
            winVersion={winVersion}
            onRunTestSchedule={handleRunTestSchedule}
          />
        )}

        {/* Tab 4: Whitelist Safeguards */}
        {activeTab === 'whitelist' && (
          <WhitelistManager
            whitelist={whitelist}
            onToggleRule={handleToggleWhitelistRule}
            onAddRule={handleAddWhitelistRule}
            onDeleteRule={handleDeleteWhitelistRule}
            onResetToDefaults={handleResetWhitelistToDefaults}
          />
        )}

        {/* Tab 5: Audit Logs */}
        {activeTab === 'logs' && (
          <LogViewer
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        )}

        {/* Tab 6: Native Scripts Export */}
        {activeTab === 'script' && (
          <ScriptExportView
            categories={categories}
            whitelist={whitelist}
            winVersion={winVersion}
            schedulerConfig={schedulerConfig}
          />
        )}

        {/* Tab 7: EXE Packaging & Generation */}
        {activeTab === 'package_exe' && (
          <ExePackagingView
            categories={categories}
            whitelist={whitelist}
            winVersion={winVersion}
            schedulerConfig={schedulerConfig}
          />
        )}
      </main>

      {/* Clean Modal Popup */}
      <CleanModal
        isOpen={isCleanModalOpen}
        onClose={() => setIsCleanModalOpen(false)}
        categories={categories}
        whitelist={whitelist}
        onCompleteClean={handleCompleteClean}
      />

      {/* Subtle Desktop Utility Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">WinClean Pro</span>
            <span aria-hidden="true">·</span>
            <span>Windows C盘智能自动清理工具</span>
            <span aria-hidden="true">·</span>
            <span>适配 Windows 11 / 10 / Server</span>
          </div>
          <div>
            <span>白名单严格避让 · 原生 PowerShell 与任务计划程序驱动</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
