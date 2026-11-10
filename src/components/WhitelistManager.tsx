/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Folder,
  FileCode,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { WhitelistRule } from '../types/cleaner';

interface WhitelistManagerProps {
  whitelist: WhitelistRule[];
  onToggleRule: (id: string) => void;
  onAddRule: (rule: Omit<WhitelistRule, 'id' | 'isPreset'>) => void;
  onDeleteRule: (id: string) => void;
  onResetToDefaults: () => void;
}

export const WhitelistManager: React.FC<WhitelistManagerProps> = ({
  whitelist,
  onToggleRule,
  onAddRule,
  onDeleteRule,
  onResetToDefaults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Rule Form State
  const [newName, setNewName] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [newType, setNewType] = useState<WhitelistRule['type']>('folder');
  const [newDesc, setNewDesc] = useState('');

  const filteredRules = whitelist.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.pathOrPattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = whitelist.filter((w) => w.enabled).length;

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPattern.trim()) return;

    onAddRule({
      name: newName.trim(),
      pathOrPattern: newPattern.trim(),
      type: newType,
      description: newDesc.trim() || '用户自定义白名单防护项',
      enabled: true,
    });

    setNewName('');
    setNewPattern('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const getTypeIcon = (type: WhitelistRule['type']) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-4 h-4 text-amber-500" />;
      case 'extension':
        return <FileCode className="w-4 h-4 text-blue-500" />;
      case 'file':
        return <FileText className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">系统安全白名单防护设置</h2>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {activeCount} 项防护已开启
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                添加至白名单的路径、文件夹及特定文件格式在任何自动或手动清理时将<strong>被严格跳过并保护</strong>，防止误删工作数据与个人资料。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>添加保护路径</span>
            </button>
            <button
              onClick={onResetToDefaults}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              恢复推荐预设
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索受保护的文件路径、扩展名或软件名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            共 {whitelist.length} 条白名单规则
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">未找到匹配的白名单规则</div>
            <p className="text-xs text-slate-400 mt-1">您可以尝试更换搜索词，或点击上方「添加保护路径」新增规则。</p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                rule.enabled ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-950/30 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getTypeIcon(rule.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {rule.name}
                    </span>
                    {rule.isPreset && (
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        官方推荐预设
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {rule.description}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400 text-[11px]">匹配规则:</span>
                    <code className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                      {rule.pathOrPattern}
                    </code>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => onToggleRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-12">
                  {rule.enabled ? '已受保护' : '未开启'}
                </span>

                {!rule.isPreset && (
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
                    title="删除自定义规则"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>新增安全白名单防护规则</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  规则名称 (例如：我的工作文档 / 虚拟机大文件)
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: 财务表格备份目录"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    防护类型
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="folder">指定文件夹目录 (Folder)</option>
                    <option value="extension">特定文件扩展名 (Extension)</option>
                    <option value="file">具体文件路径 (File)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    路径或通配符表达式
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newType === 'folder' ? 'C:\\MyProjects\\*' : '*.psd;*.ai'}
                    value={newPattern}
                    onChange={(e) => setNewPattern(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  防护备注说明
                </label>
                <textarea
                  rows={2}
                  placeholder="简述为何需要保护此目录（如：存放公司核心财报数据）"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  保存并加入白名单
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
