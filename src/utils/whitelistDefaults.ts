/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WhitelistRule } from '../types/cleaner';

export const DEFAULT_WHITELIST_RULES: WhitelistRule[] = [
  {
    id: 'wl_wechat',
    name: '微信核心数据与聊天记录',
    pathOrPattern: 'C:\\Users\\*\\Documents\\WeChat Files\\*',
    type: 'folder',
    description: '保护微信好友聊天记录、重要图片、收发文件与本地 SQLite 数据库，避免被误判清理。',
    enabled: true,
    isPreset: true,
  },
  {
    id: 'wl_qq',
    name: '腾讯 QQ 聊天记录与个人文档',
    pathOrPattern: 'C:\\Users\\*\\Documents\\Tencent Files\\*',
    type: 'folder',
    description: '保护 QQ 个人资料、离线文件与消息存储库。',
    enabled: true,
    isPreset: true,
  },
  {
    id: 'wl_dev_node',
    name: '前端与开发环境依赖 (node_modules)',
    pathOrPattern: '*\\node_modules\\*',
    type: 'folder',
    description: '防止清理工程项目中的 Node 依赖库，避免重构编译损坏。',
    enabled: true,
    isPreset: true,
  },
  {
    id: 'wl_git',
    name: 'Git 版本控制元数据 (.git)',
    pathOrPattern: '*\\.git\\*',
    type: 'folder',
    description: '保护本地代码仓库的版本提交历史与未暂存记录。',
    enabled: true,
    isPreset: true,
  },
  {
    id: 'wl_databases',
    name: 'SQL 数据库与数据文件 (*.mdf, *.ldf, *.db)',
    pathOrPattern: '*.mdf;*.ldf;*.sqlite;*.db',
    type: 'extension',
    description: '保护本地运行的 SQL Server、SQLite、Access 数据库实体文件。',
    enabled: true,
    isPreset: true,
  },
  {
    id: 'wl_desktop',
    name: '桌面重要文件与快捷方式',
    pathOrPattern: 'C:\\Users\\*\\Desktop\\*',
    type: 'folder',
    description: '确保桌面放置的工作文档、表格与常用工具绝不被扫描删除。',
    enabled: true,
    isPreset: true,
  },
  {
    id: 'wl_vm',
    name: '虚拟机镜像与系统安装盘 (*.vmdk, *.vhdx, *.iso)',
    pathOrPattern: '*.vmdk;*.vhdx;*.iso',
    type: 'extension',
    description: '防止误删 VMware、Hyper-V 或 VirtualBox 的大容量虚拟磁盘镜像。',
    enabled: true,
    isPreset: true,
  },
  {
    id: 'wl_backup',
    name: '系统与应用备份归档 (*.bak, *.backup)',
    pathOrPattern: '*.bak;*.backup',
    type: 'extension',
    description: '保留软件自动生成的安全回滚与备份副本。',
    enabled: false,
    isPreset: true,
  },
];
