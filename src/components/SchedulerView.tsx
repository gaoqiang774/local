/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  HardDrive,
  CheckCircle2,
  Bell,
  Copy,
  Terminal,
  Play,
  Shield,
  Layers,
} from 'lucide-react';
import { ScheduledTaskConfig, WindowsVersionInfo } from '../types/cleaner';
import { generateTaskSchedulerCommand } from '../utils/scriptGenerator';

interface SchedulerViewProps {
  config: ScheduledTaskConfig;
  onUpdateConfig: (newConfig: ScheduledTaskConfig) => void;
  winVersion: WindowsVersionInfo;
  onRunTestSchedule: () => void;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  config,
  onUpdateConfig,
  winVersion,
  onRunTestSchedule,
}) => {
  const [copied, setCopied] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const command = generateTaskSchedulerCommand(config);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegisterTask = () => {
    onUpdateConfig({ ...config, taskSchedulerRegistered: true });
    setSuccessToast('已生成 Windows 计划任务配置，并激活自动清理守护计划！');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Overview & Master Switch */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Windows C 盘定时自动清理服务</h2>
                {config.enabled && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    已启用定时守护
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                无需人工手动点击，在夜间闲置或 C 盘空间告急时自动在后台执行静默清理，持续维持系统充沛空间。
              </p>
            </div>
          </div>

          {/* Master Enable Toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => onUpdateConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {config.enabled ? '自动清理已开启' : '已暂停'}
            </span>
          </div>
        </div>

        {/* Detailed Configuration Grid */}
        <div className={`pt-6 space-y-6 ${config.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          {/* 1. Frequency Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2.5">
              1. 触发频率与执行周期
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'daily',
                  name: '每日夜间清理 (推荐)',
                  desc: '每天固定时刻静默整理，C盘始终清爽',
                },
                {
                  id: 'weekly',
                  name: '每周定期大扫除',
                  desc: '在设定的周末或工作日集中维护',
                },
                {
                  id: 'monthly',
                  name: '每月月度维护',
                  desc: '在每月固定日期执行深层清理',
                },
                {
                  id: 'low_space',
                  name: '低空间紧急自救',
                  desc: '当C盘剩余空间不足时立即智能触发',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, frequency: item.id as any })}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    config.frequency === item.id
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                    {config.frequency === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time & Threshold Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl">
            {/* Execution Time */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>任务执行时刻</span>
              </label>
              <input
                type="time"
                value={config.executionTime}
                onChange={(e) => onUpdateConfig({ ...config, executionTime: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">建议设为凌晨（如 03:00），不打扰工作</span>
            </div>

            {/* Day of Week / Month selector */}
            {config.frequency === 'weekly' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  执行星期
                </label>
                <select
                  value={config.dayOfWeek}
                  onChange={(e) => onUpdateConfig({ ...config, dayOfWeek: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  {['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'].map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">在每周该日指定时刻自动运行</span>
              </div>
            )}

            {config.frequency === 'monthly' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  每月执行日
                </label>
                <select
                  value={config.dayOfMonth}
                  onChange={(e) => onUpdateConfig({ ...config, dayOfMonth: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      每月 {d} 日
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">避开月末29-31日异常</span>
              </div>
            )}

            {/* Low Space Threshold */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                <span>低空间自救阈值</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={config.lowSpaceThresholdGB}
                  onChange={(e) => onUpdateConfig({ ...config, lowSpaceThresholdGB: parseInt(e.target.value, 10) || 15 })}
                  className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">GB 剩余量</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">当 C 盘剩余小于该值时将强力释放</span>
            </div>

            {/* Cleaning Profile */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>定时清理方案</span>
              </label>
              <select
                value={config.cleanProfile}
                onChange={(e) => onUpdateConfig({ ...config, cleanProfile: e.target.value as any })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              >
                <option value="safe_only">仅清理极度安全垃圾 (推荐)</option>
                <option value="standard">标准日常维护 (含浏览器缓存)</option>
                <option value="deep">深度彻底清理 (包含组件补丁)</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">自动跳过所有白名单设置的项目</span>
            </div>
          </div>

          {/* Behavior switches */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <input
                type="checkbox"
                checked={config.silentMode}
                onChange={(e) => onUpdateConfig({ ...config, silentMode: e.target.checked })}
                className="mt-0.5 text-blue-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">静默后台执行</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">隐藏 PowerShell 黑色运行窗口，无感完成</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <input
                type="checkbox"
                checked={config.autoEmptyRecycleBin}
                onChange={(e) => onUpdateConfig({ ...config, autoEmptyRecycleBin: e.target.checked })}
                className="mt-0.5 text-blue-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">自动清空回收站</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">定时彻底清空 C 盘滞留的垃圾桶废件</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <input
                type="checkbox"
                checked={config.notifyOnCompletion}
                onChange={(e) => onUpdateConfig({ ...config, notifyOnCompletion: e.target.checked })}
                className="mt-0.5 text-blue-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">清理完毕系统弹窗</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">在右下角通知中心显示释放容量简报</span>
              </div>
            </label>
          </div>

          {/* Test & Trigger Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onRunTestSchedule}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg shadow-2xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>立即模拟触发一次定时任务</span>
            </button>

            {config.lastExecutedTime && (
              <span className="text-xs text-slate-500 font-mono">
                上次定时执行: {config.lastExecutedTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Windows Native Task Scheduler Command Section */}
      <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Windows 原生任务计划程序集成 (schtasks.exe)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                支持直接向 {winVersion.name} 注册系统级守护任务，开机自启且无依赖。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCommand}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? '已复制命令' : '复制命令'}</span>
            </button>
            <button
              onClick={handleRegisterTask}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>一键保存并激活任务</span>
            </button>
          </div>
        </div>

        {/* Code Block */}
        <div className="p-3 bg-black/40 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
          <code>{command}</code>
        </div>

        <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
          <span className="text-slate-500">操作提示:</span>
          <span>在 Windows 中按 Win + X 选择【终端 (管理员)】或【PowerShell (管理员)】，粘贴上方指令回车即可立即生效！</span>
        </div>

        {successToast && (
          <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
