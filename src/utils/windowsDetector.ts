/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WindowsVersionId, WindowsVersionInfo } from '../types/cleaner';

export const WINDOWS_PRESETS: Record<WindowsVersionId, WindowsVersionInfo> = {
  win11: {
    id: 'win11',
    name: 'Windows 11',
    releaseName: '24H2 / 23H2 (Build 26100.2033)',
    buildNumber: '26100',
    architecture: 'x64',
    storageSenseSupported: true,
    dismComponentCleanupSupported: true,
    deliveryOptimizationSupported: true,
    features: ['智能存储感知 2.0', 'WinSxS 深度组件精简', 'DeliveryOptimization 传递优化清理', 'Windows.old 自动回滚回收'],
    kernelVersion: 'NT 10.0 (Win11 Branch)',
  },
  win10: {
    id: 'win10',
    name: 'Windows 10',
    releaseName: '22H2 (Build 19045.4894)',
    buildNumber: '19045',
    architecture: 'x64',
    storageSenseSupported: true,
    dismComponentCleanupSupported: true,
    deliveryOptimizationSupported: true,
    features: ['基础存储感知', 'DISM 组件清理', 'SoftwareDistribution 缓存管理', '传统磁盘清理 (cleanmgr)'],
    kernelVersion: 'NT 10.0 (Win10 Branch)',
  },
  win_server: {
    id: 'win_server',
    name: 'Windows Server',
    releaseName: '2022 Datacenter (Build 20348)',
    buildNumber: '20348',
    architecture: 'x64',
    storageSenseSupported: false,
    dismComponentCleanupSupported: true,
    deliveryOptimizationSupported: false,
    features: ['服务器日志归档清理', 'IIS 临时压缩文件清理', 'CBS 维护日志精简', 'WinSxS 组件分析'],
    kernelVersion: 'NT 10.0 (Server)',
  },
  win7_8: {
    id: 'win7_8',
    name: 'Windows 7 / 8.1',
    releaseName: 'SP1 / Windows 8.1 Pro',
    buildNumber: '7601 / 9600',
    architecture: 'x64',
    storageSenseSupported: false,
    dismComponentCleanupSupported: false,
    deliveryOptimizationSupported: false,
    features: ['经典 cleanmgr 批处理', 'Temp 目录强制清空', 'Prefetch 预读加速整理', '系统休眠文件调整'],
    kernelVersion: 'NT 6.1 / 6.3',
  },
};

/**
 * Automatically inspects the browser environment and Navigator API to detect Windows version.
 */
export function detectWindowsEnvironment(): WindowsVersionInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return WINDOWS_PRESETS.win11;
  }

  const ua = navigator.userAgent;
  const isWindows = /Windows/i.test(ua);

  // Modern browsers support navigator.userAgentData
  const uaData = (navigator as unknown as { userAgentData?: { platform?: string; platformVersion?: string; architecture?: string } })
    .userAgentData;

  let arch: 'x64' | 'ARM64' | 'x86' = 'x64';
  if (/ARM64|aarch64/i.test(ua)) {
    arch = 'ARM64';
  } else if (/x86|WOW64|Win32/i.test(ua) && !/x64|Win64|AMD64/i.test(ua)) {
    arch = 'x86';
  }

  if (isWindows) {
    // Windows 11 platformVersion check: >= 13.0.0 corresponds to Windows 11 in Client Hints
    if (uaData && uaData.platformVersion) {
      const major = parseInt(uaData.platformVersion.split('.')[0], 10);
      if (major >= 13) {
        return { ...WINDOWS_PRESETS.win11, architecture: arch };
      }
    }

    if (/Windows NT 10.0/i.test(ua)) {
      // High chance modern user is on Windows 11 or 10
      return { ...WINDOWS_PRESETS.win11, architecture: arch };
    }
    if (/Windows NT 6.3|Windows NT 6.2|Windows NT 6.1/i.test(ua)) {
      return { ...WINDOWS_PRESETS.win7_8, architecture: arch };
    }
    if (/Windows NT/i.test(ua) && /Server/i.test(ua)) {
      return { ...WINDOWS_PRESETS.win_server, architecture: arch };
    }
  }

  // Default to Windows 11 (the predominant modern OS for users looking for automatic C drive cleaners)
  return { ...WINDOWS_PRESETS.win11, architecture: arch };
}
