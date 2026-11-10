/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WindowsVersionId = 'win11' | 'win10' | 'win_server' | 'win7_8';

export interface WindowsVersionInfo {
  id: WindowsVersionId;
  name: string;
  buildNumber: string;
  releaseName: string;
  architecture: 'x64' | 'ARM64' | 'x86';
  storageSenseSupported: boolean;
  dismComponentCleanupSupported: boolean;
  deliveryOptimizationSupported: boolean;
  features: string[];
  kernelVersion: string;
}

export type SafetyLevel = 'safe' | 'recommended' | 'caution';

export interface CleanableFileItem {
  name: string;
  path: string;
  size: number; // in bytes
  lastModified: string;
  protectedByWhitelist?: boolean;
}

export interface JunkCategory {
  id: string;
  group: 'system' | 'browser_app' | 'deep_storage';
  groupName: string;
  name: string;
  description: string;
  pathTemplate: string;
  safety: SafetyLevel;
  safetyLabel: string;
  fileCount: number;
  totalSizeBytes: number;
  selected: boolean;
  minWinVersion?: WindowsVersionId[];
  sampleFiles: CleanableFileItem[];
  powershellSnippet: string;
  cmdSnippet: string;
}

export interface WhitelistRule {
  id: string;
  name: string;
  pathOrPattern: string;
  type: 'folder' | 'file' | 'extension';
  description: string;
  enabled: boolean;
  isPreset: boolean;
}

export interface CleanLogItem {
  id: string;
  timestamp: string;
  totalFreedBytes: number;
  totalFilesCleaned: number;
  durationMs: number;
  status: 'success' | 'partial';
  triggerType: 'manual' | 'scheduled' | 'low_space_auto';
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    freedBytes: number;
    fileCount: number;
  }[];
  skippedByWhitelistCount: number;
}

export interface ScheduledTaskConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'low_space';
  executionTime: string; // "03:00"
  dayOfWeek: number; // 0=Sunday, 1=Monday...
  dayOfMonth: number; // 1-31
  lowSpaceThresholdGB: number;
  cleanProfile: 'safe_only' | 'standard' | 'deep';
  silentMode: boolean;
  autoEmptyRecycleBin: boolean;
  notifyOnCompletion: boolean;
  lastExecutedTime?: string;
  taskSchedulerRegistered?: boolean;
}

export interface DriveUsageState {
  driveLetter: string;
  label: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
}

export type MigrationRiskLevel = 'safe' | 'low_risk' | 'attention';

export interface MigrationItem {
  id: string;
  name: string;
  category: 'chat' | 'user_folder' | 'dev_tool' | 'games_cache';
  categoryLabel: string;
  sourcePath: string;
  defaultTargetSubPath: string;
  sizeBytes: number;
  fileCount: number;
  riskLevel: MigrationRiskLevel;
  riskLabel: string;
  riskDetail: string;
  mechanism: string;
  processName: string | null;
  selected: boolean;
  recommendation: 'strongly_recommended' | 'recommended' | 'optional';
  migrated?: boolean;
}

export interface TargetDriveOption {
  letter: string;
  label: string;
  totalBytes: number;
  freeBytes: number;
  fileSystem: string;
  isRecommended: boolean;
}

export interface MigrationAssessmentResult {
  totalSelectedBytes: number;
  targetDrive: TargetDriveOption;
  hasEnoughSpace: boolean;
  remainingTargetFreeBytes: number;
  freedCPercentage: number;
  runningProcesses: string[];
  safetyScore: number; // 0-100
  recommendationSummary: string;
}
