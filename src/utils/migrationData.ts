/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MigrationItem, TargetDriveOption, MigrationAssessmentResult } from '../types/cleaner';

export const INITIAL_MIGRATION_ITEMS: MigrationItem[] = [
  {
    id: 'wechat_files',
    name: '微信电脑版聊天记录与文件缓存 (WeChat Files)',
    category: 'chat',
    categoryLabel: '社交通讯数据',
    sourcePath: '%USERPROFILE%\\Documents\\WeChat Files',
    defaultTargetSubPath: 'WinClean_Migrated\\WeChat Files',
    sizeBytes: 38.6 * 1024 * 1024 * 1024, // 38.6 GB
    fileCount: 42180,
    riskLevel: 'safe',
    riskLabel: '极度推荐 · 零风险',
    mechanism: 'NTFS 目录联接符号链接 (mklink /J)',
    riskDetail: '采用 Windows 原生内核级 NTFS Directory Junction。将几十 GB 的聊天媒体文件搬移至新盘，并在原目录保留无缝虚拟映射。微信读取与接收新消息完全无感知，聊天记录 100% 完好无损。',
    processName: 'WeChat.exe',
    selected: true,
    recommendation: 'strongly_recommended',
  },
  {
    id: 'user_downloads',
    name: 'Windows 系统「下载」文件夹 (Downloads)',
    category: 'user_folder',
    categoryLabel: '系统个人大目录',
    sourcePath: '%USERPROFILE%\\Downloads',
    defaultTargetSubPath: 'WinClean_Migrated\\Downloads',
    sizeBytes: 32.4 * 1024 * 1024 * 1024, // 32.4 GB
    fileCount: 1420,
    riskLevel: 'safe',
    riskLabel: '极高收益 · 微软原生兼容',
    mechanism: 'Shell 路径重定向 + mklink /J 目录联接',
    riskDetail: '浏览器下载的安装包、压缩包常年淤积在 C 盘。搬移至副盘后，日常下载软件及浏览器新下载均直接存入副盘，终结 C 盘越用越小的问题。',
    processName: null,
    selected: true,
    recommendation: 'strongly_recommended',
  },
  {
    id: 'qq_files',
    name: 'QQ / TIM 个人数据与接收文件 (Tencent Files)',
    category: 'chat',
    categoryLabel: '社交通讯数据',
    sourcePath: '%USERPROFILE%\\Documents\\Tencent Files',
    defaultTargetSubPath: 'WinClean_Migrated\\Tencent Files',
    sizeBytes: 18.8 * 1024 * 1024 * 1024, // 18.8 GB
    fileCount: 18920,
    riskLevel: 'safe',
    riskLabel: '极度推荐 · 零风险',
    mechanism: 'NTFS 目录联接符号链接 (mklink /J)',
    riskDetail: '群文件、图片与聊天记录整体搬移到新盘，原路径由 NTFS 联接透明转发，历史收发文件可随时正常打开。',
    processName: 'QQ.exe',
    selected: true,
    recommendation: 'strongly_recommended',
  },
  {
    id: 'user_documents',
    name: 'Windows 用户「我的文档」文件夹 (Documents)',
    category: 'user_folder',
    categoryLabel: '系统个人大目录',
    sourcePath: '%USERPROFILE%\\Documents',
    defaultTargetSubPath: 'WinClean_Migrated\\Documents',
    sizeBytes: 24.5 * 1024 * 1024 * 1024, // 24.5 GB
    fileCount: 15300,
    riskLevel: 'safe',
    riskLabel: '收益显著 · 推荐',
    mechanism: 'Windows 用户个人文件夹注册表与符号重定向',
    riskDetail: '包含单机游戏存档、办公文档与个人配置。转移后释放大量主盘固态空间，同时保障重装系统时数据安枕无忧。',
    processName: null,
    selected: false,
    recommendation: 'recommended',
  },
  {
    id: 'wsl2_docker',
    name: 'Docker / WSL2 Linux 子系统虚拟硬盘 (ext4.vhdx)',
    category: 'dev_tool',
    categoryLabel: '开发虚拟机镜像',
    sourcePath: '%LOCALAPPDATA%\\Docker\\wsl\\data',
    defaultTargetSubPath: 'WinClean_Migrated\\Docker\\wsl_data',
    sizeBytes: 46.2 * 1024 * 1024 * 1024, // 46.2 GB
    fileCount: 3,
    riskLevel: 'safe',
    riskLabel: '开发者刚需 · 瞬间腾挪几十GB',
    mechanism: 'wsl --shutdown + 目录软链接迁移',
    riskDetail: 'Docker 镜像与容器随拉取不断膨胀，是 C 盘暴满的元凶之一。脚本会先安全关闭 WSL，移动 vhdx 文件后建立软链接，完美保留所有容器与镜像。',
    processName: 'Docker Desktop.exe',
    selected: false,
    recommendation: 'recommended',
  },
  {
    id: 'gradle_m2_cache',
    name: 'Java Gradle & Maven 构建依赖缓存 (.gradle / .m2)',
    category: 'dev_tool',
    categoryLabel: '开发工具缓存',
    sourcePath: '%USERPROFILE%\\.gradle\\caches',
    defaultTargetSubPath: 'WinClean_Migrated\\.gradle\\caches',
    sizeBytes: 15.6 * 1024 * 1024 * 1024, // 15.6 GB
    fileCount: 28400,
    riskLevel: 'safe',
    riskLabel: '平稳安全 · 零兼容问题',
    mechanism: 'NTFS Junction mklink /J',
    riskDetail: '长期累积的海量 jar 包和缓存无损转移，IDEA 和 Android Studio 编译构建依然秒级读取。',
    processName: null,
    selected: false,
    recommendation: 'recommended',
  },
  {
    id: 'user_desktop',
    name: 'Windows 用户「桌面」文件夹 (Desktop)',
    category: 'user_folder',
    categoryLabel: '系统个人大目录',
    sourcePath: '%USERPROFILE%\\Desktop',
    defaultTargetSubPath: 'WinClean_Migrated\\Desktop',
    sizeBytes: 12.3 * 1024 * 1024 * 1024, // 12.3 GB
    fileCount: 380,
    riskLevel: 'low_risk',
    riskLabel: '低风险 · 桌面将短暂刷新',
    mechanism: 'Shell 目录重定向与软链接',
    riskDetail: '将随手扔在桌面的视频、大文件直接搬运至新盘，桌面显示外观与快捷方式完全相同，迁移时资源管理器将平滑重载一次。',
    processName: 'explorer.exe',
    selected: false,
    recommendation: 'optional',
  },
];

export const DEFAULT_TARGET_DRIVES: TargetDriveOption[] = [
  {
    letter: 'D',
    label: '本地机械/副固态数据盘 (D:)',
    totalBytes: 1024 * 1024 * 1024 * 1024, // 1 TB
    freeBytes: 680 * 1024 * 1024 * 1024, // 680 GB
    fileSystem: 'NTFS',
    isRecommended: true,
  },
  {
    letter: 'E',
    label: '日常工作与娱乐存储盘 (E:)',
    totalBytes: 512 * 1024 * 1024 * 1024, // 512 GB
    freeBytes: 240 * 1024 * 1024 * 1024, // 240 GB
    fileSystem: 'NTFS',
    isRecommended: false,
  },
  {
    letter: 'F',
    label: '大容量备份盘 (F:)',
    totalBytes: 2048 * 1024 * 1024 * 1024, // 2 TB
    freeBytes: 1450 * 1024 * 1024 * 1024, // 1.45 TB
    fileSystem: 'NTFS',
    isRecommended: false,
  },
];

export function assessMigrationFeasibility(
  selectedItems: MigrationItem[],
  targetDrive: TargetDriveOption,
  cTotalBytes: number
): MigrationAssessmentResult {
  const totalSelectedBytes = selectedItems.reduce((acc, item) => acc + item.sizeBytes, 0);
  const remainingTargetFreeBytes = targetDrive.freeBytes - totalSelectedBytes;
  const hasEnoughSpace = remainingTargetFreeBytes > 10 * 1024 * 1024 * 1024; // Ensure at least 10GB margin
  const freedCPercentage = (totalSelectedBytes / cTotalBytes) * 100;

  const runningProcesses = selectedItems
    .map((item) => item.processName)
    .filter((p): p is string => Boolean(p && p !== 'explorer.exe'));

  // Calculate safety score (0 - 100)
  let safetyScore = 100;
  if (!hasEnoughSpace) safetyScore -= 50;
  if (targetDrive.fileSystem !== 'NTFS') safetyScore -= 30;
  if (selectedItems.some((i) => i.riskLevel === 'low_risk')) safetyScore -= 10;
  if (selectedItems.some((i) => i.riskLevel === 'attention')) safetyScore -= 20;

  let recommendationSummary = '';
  if (!hasEnoughSpace) {
    recommendationSummary = `目标 ${targetDrive.letter} 盘剩余空间仅剩 ${(targetDrive.freeBytes / 1073741824).toFixed(1)} GB，不足以安全容纳选中的 ${(totalSelectedBytes / 1073741824).toFixed(1)} GB 数据，请清理目标盘或选择其他盘符！`;
  } else if (totalSelectedBytes === 0) {
    recommendationSummary = '请至少勾选一个需要迁移的目录。';
  } else {
    recommendationSummary = `评估通过！迁移后将为 C 盘瞬间腾出 ${(totalSelectedBytes / 1073741824).toFixed(1)} GB 宝贵空间（占 C 盘 ${freedCPercentage.toFixed(1)}%），目标 ${targetDrive.letter} 盘迁移后仍有 ${(remainingTargetFreeBytes / 1073741824).toFixed(1)} GB 充足余量。`;
  }

  return {
    totalSelectedBytes,
    targetDrive,
    hasEnoughSpace,
    remainingTargetFreeBytes,
    freedCPercentage,
    runningProcesses: Array.from(new Set(runningProcesses)),
    safetyScore: Math.max(0, safetyScore),
    recommendationSummary,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
