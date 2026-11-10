/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JunkCategory } from '../types/cleaner';

export const INITIAL_JUNK_CATEGORIES: JunkCategory[] = [
  {
    id: 'user_temp',
    group: 'system',
    groupName: 'Windows 系统核心垃圾',
    name: '用户临时缓存文件 (%TEMP%)',
    description: '日常应用程序运行、解压、更新后遗留的无用临时交换数据，清理完全安全。',
    pathTemplate: '%LOCALAPPDATA%\\Temp\\*',
    safety: 'safe',
    safetyLabel: '极度安全',
    fileCount: 384,
    totalSizeBytes: 3_840_000_000, // ~3.84 GB
    selected: true,
    sampleFiles: [
      { name: 'tmp_inst_9401.tmp', path: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\tmp_inst_9401.tmp', size: 482000000, lastModified: '2026-11-08' },
      { name: 'scoped_dir_1142_cache.bin', path: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\scoped_dir_1142_cache.bin', size: 312000000, lastModified: '2026-11-07' },
      { name: 'electron_crash_temp.dmp', path: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\electron_crash_temp.dmp', size: 94000000, lastModified: '2026-11-06' },
      { name: '~DF94A0B7C62E.tmp', path: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\~DF94A0B7C62E.tmp', size: 125000000, lastModified: '2026-11-05' },
    ],
    powershellSnippet: 'Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue',
    cmdSnippet: 'del /f /s /q "%temp%\\*" >nul 2>&1',
  },
  {
    id: 'sys_temp',
    group: 'system',
    groupName: 'Windows 系统核心垃圾',
    name: 'Windows 系统临时文件 (C:\\Windows\\Temp)',
    description: 'Windows 系统服务、驱动安装程序和补丁升级解压生成的全局临时堆叠。',
    pathTemplate: 'C:\\Windows\\Temp\\*',
    safety: 'safe',
    safetyLabel: '极度安全',
    fileCount: 156,
    totalSizeBytes: 1_920_000_000, // ~1.92 GB
    selected: true,
    sampleFiles: [
      { name: 'MpCmdRun.log', path: 'C:\\Windows\\Temp\\MpCmdRun.log', size: 85000000, lastModified: '2026-11-08' },
      { name: 'cab_9940_4.tmp', path: 'C:\\Windows\\Temp\\cab_9940_4.tmp', size: 340000000, lastModified: '2026-11-07' },
      { name: 'DISM_Mount_Cache.tmp', path: 'C:\\Windows\\Temp\\DISM_Mount_Cache.tmp', size: 620000000, lastModified: '2026-11-04' },
    ],
    powershellSnippet: 'Remove-Item -Path "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue',
    cmdSnippet: 'del /f /s /q "C:\\Windows\\Temp\\*" >nul 2>&1',
  },
  {
    id: 'windows_update',
    group: 'system',
    groupName: 'Windows 系统核心垃圾',
    name: 'Windows Update 更新下载包与分发缓存',
    description: '系统成功安装补丁后遗留在 SoftwareDistribution 的庞大安装包，释放可达数 GB。',
    pathTemplate: 'C:\\Windows\\SoftwareDistribution\\Download\\*',
    safety: 'safe',
    safetyLabel: '极度安全',
    fileCount: 89,
    totalSizeBytes: 6_450_000_000, // ~6.45 GB
    selected: true,
    sampleFiles: [
      { name: 'windows11.0-kb5044284-x64.cab', path: 'C:\\Windows\\SoftwareDistribution\\Download\\windows11.0-kb5044284-x64.cab', size: 2850000000, lastModified: '2026-10-24' },
      { name: 'windows11.0-kb5043145-express.esd', path: 'C:\\Windows\\SoftwareDistribution\\Download\\windows11.0-kb5043145-express.esd', size: 2100000000, lastModified: '2026-10-15' },
      { name: 'UpdateSessionMeta.dat', path: 'C:\\Windows\\SoftwareDistribution\\Download\\UpdateSessionMeta.dat', size: 120000000, lastModified: '2026-10-15' },
    ],
    powershellSnippet: 'Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue; Remove-Item -Path "C:\\Windows\\SoftwareDistribution\\Download\\*" -Recurse -Force -ErrorAction SilentlyContinue; Start-Service -Name wuauserv',
    cmdSnippet: 'net stop wuauserv & del /f /s /q "C:\\Windows\\SoftwareDistribution\\Download\\*" & net start wuauserv',
  },
  {
    id: 'recycle_bin',
    group: 'system',
    groupName: 'Windows 系统核心垃圾',
    name: 'Windows 回收站未清理数据 ($Recycle.Bin)',
    description: '用户已删除但仍占用 C 盘空间的回收站滞留文件，清空后直接归还物理可用空间。',
    pathTemplate: 'C:\\$Recycle.Bin\\*',
    safety: 'safe',
    safetyLabel: '极度安全',
    fileCount: 215,
    totalSizeBytes: 4_200_000_000, // ~4.20 GB
    selected: true,
    sampleFiles: [
      { name: '$R9FA812.zip', path: 'C:\\$Recycle.Bin\\S-1-5-21...\\$R9FA812.zip', size: 1950000000, lastModified: '2026-11-06' },
      { name: '$RI02931.mp4', path: 'C:\\$Recycle.Bin\\S-1-5-21...\\$RI02931.mp4', size: 1420000000, lastModified: '2026-11-03' },
    ],
    powershellSnippet: 'Clear-RecycleBin -DriveLetter C -Force -ErrorAction SilentlyContinue',
    cmdSnippet: 'powershell -Command "Clear-RecycleBin -DriveLetter C -Force"',
  },
  {
    id: 'delivery_opt',
    group: 'system',
    groupName: 'Windows 系统核心垃圾',
    name: '传递优化服务 P2P 下载缓存',
    description: 'Windows 局域网更新传递优化服务在后台积累的历史数据，可随时释放。',
    pathTemplate: 'C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache\\*',
    safety: 'safe',
    safetyLabel: '极度安全',
    fileCount: 42,
    totalSizeBytes: 2_150_000_000, // ~2.15 GB
    selected: true,
    sampleFiles: [
      { name: 'do_cache_chunk_01.dat', path: 'C:\\Windows\\...\\DeliveryOptimization\\Cache\\do_cache_chunk_01.dat', size: 980000000, lastModified: '2026-10-30' },
      { name: 'do_cache_chunk_02.dat', path: 'C:\\Windows\\...\\DeliveryOptimization\\Cache\\do_cache_chunk_02.dat', size: 850000000, lastModified: '2026-10-28' },
    ],
    powershellSnippet: 'Stop-Service dosvc -Force -ErrorAction SilentlyContinue; Remove-Item "C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache\\*" -Recurse -Force -ErrorAction SilentlyContinue; Start-Service dosvc',
    cmdSnippet: 'net stop dosvc & del /f /s /q "C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache\\*" & net start dosvc',
  },
  {
    id: 'thumbnails',
    group: 'browser_app',
    groupName: '软件与浏览器缓存',
    name: 'Windows 资源管理器缩略图缓存 (Thumbcache)',
    description: '查看图片和视频时生成的缩略图索引数据库。重建无损，能释放上千兆空间并修复缩略图黑屏。',
    pathTemplate: '%LOCALAPPDATA%\\Microsoft\\Windows\\Explorer\\thumbcache_*.db',
    safety: 'safe',
    safetyLabel: '极度安全',
    fileCount: 18,
    totalSizeBytes: 1_280_000_000, // ~1.28 GB
    selected: true,
    sampleFiles: [
      { name: 'thumbcache_256.db', path: 'C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Windows\\Explorer\\thumbcache_256.db', size: 480000000, lastModified: '2026-11-08' },
      { name: 'thumbcache_1024.db', path: 'C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Windows\\Explorer\\thumbcache_1024.db', size: 690000000, lastModified: '2026-11-08' },
    ],
    powershellSnippet: 'taskkill /f /im explorer.exe; Remove-Item "$env:LOCALAPPDATA\\Microsoft\\Windows\\Explorer\\thumbcache_*.db" -Force -ErrorAction SilentlyContinue; Start-Process explorer.exe',
    cmdSnippet: 'taskkill /f /im explorer.exe & del /f /q "%localappdata%\\Microsoft\\Windows\\Explorer\\thumbcache_*.db" & start explorer.exe',
  },
  {
    id: 'browser_cache',
    group: 'browser_app',
    groupName: '软件与浏览器缓存',
    name: '浏览器历史网页与多媒体缓存 (Chrome / Edge)',
    description: 'Chrome 与 Edge 浏览器加载的网页图片、脚本、音视频缓存。不影响保存的书签和登录密码。',
    pathTemplate: '%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Cache\\*',
    safety: 'safe',
    safetyLabel: '极度安全',
    fileCount: 1420,
    totalSizeBytes: 3_120_000_000, // ~3.12 GB
    selected: true,
    sampleFiles: [
      { name: 'data_0', path: 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache\\Cache_Data\\data_0', size: 1400000000, lastModified: '2026-11-09' },
      { name: 'f_0042a1', path: 'C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache\\Cache_Data\\f_0042a1', size: 85000000, lastModified: '2026-11-09' },
    ],
    powershellSnippet: 'Remove-Item "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Cache\\*" -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Default\\Cache\\*" -Recurse -Force -ErrorAction SilentlyContinue',
    cmdSnippet: 'del /f /s /q "%localappdata%\\Google\\Chrome\\User Data\\Default\\Cache\\*" >nul 2>&1',
  },
  {
    id: 'app_cache_chat',
    group: 'browser_app',
    groupName: '软件与浏览器缓存',
    name: '社交软件临时图片/短视频流缓存 (已受白名单保护)',
    description: '微信、QQ、钉钉浏览群动态、小程序产生的临时媒体流。已自动排查白名单，绝不删除聊天记录与重要文档。',
    pathTemplate: '%APPDATA%\\Tencent\\WeChat\\*\\Cache\\*',
    safety: 'recommended',
    safetyLabel: '建议清理',
    fileCount: 960,
    totalSizeBytes: 4_680_000_000, // ~4.68 GB
    selected: true,
    sampleFiles: [
      { name: 'sns_moment_cache_1092.dat', path: 'C:\\Users\\Admin\\AppData\\Roaming\\Tencent\\WeChat\\Cache\\sns_moment_cache_1092.dat', size: 1120000000, lastModified: '2026-11-07' },
      { name: 'mini_program_pkg_839.wxapkg', path: 'C:\\Users\\Admin\\AppData\\Roaming\\Tencent\\WeChat\\WMPF\\mini_program_pkg_839.wxapkg', size: 450000000, lastModified: '2026-11-06' },
      { name: 'dingtalk_stream_temp.tmp', path: 'C:\\Users\\Admin\\AppData\\Roaming\\DingTalk\\Cache\\dingtalk_stream_temp.tmp', size: 320000000, lastModified: '2026-11-05' },
    ],
    powershellSnippet: '# Safe cleaning: Skips WeChat Files and Tencent Files Documents folder according to active Whitelist\nWrite-Host "Cleaning chat apps temp preview caches..."',
    cmdSnippet: 'echo Cleaning chat apps media caches (with whitelist protection)',
  },
  {
    id: 'error_dumps',
    group: 'system',
    groupName: 'Windows 系统核心垃圾',
    name: '系统错误转储与崩溃报告 (Crash Dumps / WER)',
    description: '应用程序闪退、蓝屏后 Windows 收集的调试内存转储文件 (MEMORY.DMP、Minidump)。',
    pathTemplate: 'C:\\Windows\\Minidump\\*.dmp',
    safety: 'safe',
    safetyLabel: '极度安全',
    fileCount: 14,
    totalSizeBytes: 1_650_000_000, // ~1.65 GB
    selected: true,
    sampleFiles: [
      { name: 'MEMORY.DMP', path: 'C:\\Windows\\MEMORY.DMP', size: 1450000000, lastModified: '2026-10-18' },
      { name: '101826-14022-01.dmp', path: 'C:\\Windows\\Minidump\\101826-14022-01.dmp', size: 120000000, lastModified: '2026-10-18' },
    ],
    powershellSnippet: 'Remove-Item "C:\\Windows\\Minidump\\*" -Force -ErrorAction SilentlyContinue; if (Test-Path "C:\\Windows\\MEMORY.DMP") { Remove-Item "C:\\Windows\\MEMORY.DMP" -Force }',
    cmdSnippet: 'del /f /q "C:\\Windows\\Minidump\\*.dmp" & if exist "C:\\Windows\\MEMORY.DMP" del /f /q "C:\\Windows\\MEMORY.DMP"',
  },
  {
    id: 'log_files',
    group: 'system',
    groupName: 'Windows 系统核心垃圾',
    name: 'Windows 组件服务与安装维护日志 (CBS Logs)',
    description: '长期累积的 CBS 系统组件维护、DISM 处理与 Windows 错误汇报纯文本日志。',
    pathTemplate: 'C:\\Windows\\Logs\\CBS\\*.log',
    safety: 'recommended',
    safetyLabel: '建议清理',
    fileCount: 32,
    totalSizeBytes: 890_000_000, // ~890 MB
    selected: true,
    sampleFiles: [
      { name: 'CbsPersist_20261012.log', path: 'C:\\Windows\\Logs\\CBS\\CbsPersist_20261012.log', size: 420000000, lastModified: '2026-10-12' },
      { name: 'dism.log', path: 'C:\\Windows\\Logs\\DISM\\dism.log', size: 160000000, lastModified: '2026-11-08' },
    ],
    powershellSnippet: 'Remove-Item "C:\\Windows\\Logs\\CBS\\CbsPersist_*.log" -Force -ErrorAction SilentlyContinue',
    cmdSnippet: 'del /f /q "C:\\Windows\\Logs\\CBS\\CbsPersist_*.log"',
  },
  {
    id: 'installer_patch',
    group: 'deep_storage',
    groupName: '系统深层与大文件',
    name: 'Windows Installer 冗余安装补丁缓存 ($PatchCache$)',
    description: 'MSI 软件在安装过程中遗留的历史补丁基线备份，通常仅在重装修复旧程序时参考。',
    pathTemplate: 'C:\\Windows\\Installer\\$PatchCache$\\*',
    safety: 'recommended',
    safetyLabel: '建议清理',
    fileCount: 48,
    totalSizeBytes: 2_450_000_000, // ~2.45 GB
    selected: false,
    sampleFiles: [
      { name: 'PatchCache_R01.msp', path: 'C:\\Windows\\Installer\\$PatchCache$\\Managed\\PatchCache_R01.msp', size: 920000000, lastModified: '2026-08-14' },
      { name: 'OfficePatchBackup.msp', path: 'C:\\Windows\\Installer\\$PatchCache$\\Managed\\OfficePatchBackup.msp', size: 750000000, lastModified: '2026-07-20' },
    ],
    powershellSnippet: 'Remove-Item "C:\\Windows\\Installer\\$PatchCache$\\*" -Recurse -Force -ErrorAction SilentlyContinue',
    cmdSnippet: 'del /f /s /q "C:\\Windows\\Installer\\$PatchCache$\\*" >nul 2>&1',
  },
  {
    id: 'windows_old',
    group: 'deep_storage',
    groupName: '系统深层与大文件',
    name: 'Windows 早期安装备份副本 (Windows.old)',
    description: '大版本升级后保留的上一版操作系统文件，便于10天内回滚。若当前版本运行良好，清除可一次性回血 15~30 GB！',
    pathTemplate: 'C:\\Windows.old\\*',
    safety: 'caution',
    safetyLabel: '需谨慎确认',
    fileCount: 14820,
    totalSizeBytes: 18_400_000_000, // ~18.4 GB
    selected: false,
    sampleFiles: [
      { name: 'Previous Windows System32', path: 'C:\\Windows.old\\WINDOWS\\System32\\...', size: 8400000000, lastModified: '2026-09-20' },
      { name: 'Previous Program Files', path: 'C:\\Windows.old\\Program Files\\...', size: 6800000000, lastModified: '2026-09-20' },
    ],
    powershellSnippet: '# Using Windows Storage Sense / cleanmgr automation to safely purge Windows.old\ncleanmgr /sageset:1; cleanmgr /sagerun:1',
    cmdSnippet: 'RD /S /Q %SystemDrive%\\Windows.old',
  },
];

/**
 * Formats bytes to human-readable format (MB / GB / KB).
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
