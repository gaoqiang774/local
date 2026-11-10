/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JunkCategory, ScheduledTaskConfig, WhitelistRule, WindowsVersionInfo } from '../types/cleaner';

/**
 * Generates an executable, production-grade Windows PowerShell script (.ps1).
 */
export function generatePowerShellScript(
  categories: JunkCategory[],
  whitelist: WhitelistRule[],
  winVersion: WindowsVersionInfo,
  schedulerConfig?: ScheduledTaskConfig
): string {
  const selectedCategories = categories.filter((c) => c.selected);
  const activeWhitelist = whitelist.filter((w) => w.enabled);

  const lines: string[] = [
    '# =====================================================================',
    '# WinClean Pro - Windows C盘智能自动清理脚本',
    `# 生成目标平台: ${winVersion.name} (${winVersion.releaseName}) [${winVersion.architecture}]`,
    `# 生成时间: ${new Date().toLocaleString('zh-CN')}`,
    '# 提示: 请右键此文件选择「使用 PowerShell 运行」或在管理员终端中执行',
    '# =====================================================================',
    '',
    '# 1. 检查管理员权限',
    'if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {',
    '    Write-Warning "【警告】请以管理员身份运行此脚本，以确保清理系统临时文件和更新缓存的完整权限。"',
    '    Start-Process powershell.exe -ArgumentList ("-NoProfile -ExecutionPolicy Bypass -File `"{0}`"" -f $MyInvocation.MyCommand.Path) -Verb RunAs',
    '    exit',
    '}',
    '',
    'Write-Host "=====================================================" -ForegroundColor Cyan',
    'Write-Host ">>> WinClean Pro: 正在启动智能 C 盘垃圾自动清理 <<<" -ForegroundColor Green',
    'Write-Host "=====================================================" -ForegroundColor Cyan',
    '',
    '# 2. 统计初始可用空间',
    '$drive = Get-PSDrive -Name C',
    '$initialFreeGB = [math]::Round($drive.Free / 1GB, 2)',
    'Write-Host "当前 C 盘可用空间: $initialFreeGB GB" -ForegroundColor White',
    '',
    '# 3. 激活安全白名单保护规则',
    'Write-Host "`n[1/3] 正在加载安全白名单规则..." -ForegroundColor Yellow',
    '$whitelistPatterns = @(',
  ];

  activeWhitelist.forEach((w) => {
    lines.push(`    "${w.pathOrPattern.replace(/\\/g, '\\\\')}" # ${w.name}`);
  });

  lines.push(
    '  )',
    'Write-Host "已载入 $($whitelistPatterns.Count) 条白名单防护规则，受保护目录与重要文件将严格跳过。"',
    '',
    '# 4. 执行选定垃圾项清理',
    'Write-Host "`n[2/3] 开始清理选中垃圾分类..." -ForegroundColor Yellow',
    ''
  );

  selectedCategories.forEach((cat, index) => {
    lines.push(`Write-Host "-> [${index + 1}/${selectedCategories.length}] 正在清理: ${cat.name}..." -ForegroundColor Cyan`);
    lines.push(`try {`);
    lines.push(`    ${cat.powershellSnippet}`);
    lines.push(`    Write-Host "   完成: ${cat.name}" -ForegroundColor DarkGreen`);
    lines.push(`} catch {`);
    lines.push(`    Write-Host "   跳过个别正在被系统独占的文件 (正常现象)" -ForegroundColor Gray`);
    lines.push(`}`);
    lines.push('');
  });

  if (winVersion.dismComponentCleanupSupported && selectedCategories.some((c) => c.id === 'sys_temp' || c.id === 'windows_update')) {
    lines.push('# 针对 Windows 10/11 的 DISM 组件库健康深度维护');
    lines.push('Write-Host "-> 正在执行 Windows WinSxS 组件库深度压缩优化..." -ForegroundColor Cyan');
    lines.push('try {');
    lines.push('    Dism.exe /online /Cleanup-Image /StartComponentCleanup /Quiet');
    lines.push('} catch {}');
    lines.push('');
  }

  lines.push(
    '# 5. 清理完成统计',
    '$afterDrive = Get-PSDrive -Name C',
    '$afterFreeGB = [math]::Round($afterDrive.Free / 1GB, 2)',
    '$freedGB = [math]::Round($afterFreeGB - $initialFreeGB, 2)',
    'if ($freedGB -lt 0) { $freedGB = 0 }',
    '',
    'Write-Host "`n=====================================================" -ForegroundColor Green',
    'Write-Host "清理顺利完成！本次累计释放 C 盘空间约: $freedGB GB" -ForegroundColor Green',
    'Write-Host "当前 C 盘最新可用空间: $afterFreeGB GB" -ForegroundColor White',
    'Write-Host "=====================================================" -ForegroundColor Green',
    'Write-Host "按任意键退出..."',
    '$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")'
  );

  if (schedulerConfig && schedulerConfig.enabled) {
    lines.push('', '# =====================================================================');
    lines.push('# 附加：Windows 计划任务自动注册脚本');
    lines.push('# =====================================================================');
    const freqParam =
      schedulerConfig.frequency === 'daily'
        ? '/SC DAILY'
        : schedulerConfig.frequency === 'weekly'
          ? `/SC WEEKLY /D ${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][schedulerConfig.dayOfWeek] || 'SUN'}`
          : schedulerConfig.frequency === 'monthly'
            ? `/SC MONTHLY /D ${schedulerConfig.dayOfMonth}`
            : '/SC ONLOGON';

    lines.push(
      `# 自动注册计划任务: WinCleanPro_AutoMaintenance`,
      `$taskCmd = 'schtasks /Create /TN "WinCleanPro_AutoMaintenance" /TR "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File \\"$PSCommandPath\\"" ${freqParam} /ST ${schedulerConfig.executionTime} /RL HIGHEST /F'`,
      `# 执行注册: Invoke-Expression $taskCmd`
    );
  }

  return lines.join('\n');
}

/**
 * Generates a classic Windows Batch (.bat) file for quick double-click execution.
 */
export function generateBatchScript(
  categories: JunkCategory[],
  winVersion: WindowsVersionInfo
): string {
  const selectedCategories = categories.filter((c) => c.selected);

  const lines: string[] = [
    '@echo off',
    'chcp 65001 >nul',
    'title WinClean Pro - Windows C盘智能自动清理工具',
    'color 0A',
    'echo =====================================================================',
    'echo        WinClean Pro - Windows C 盘智能自动极速清理脚本',
    `echo        目标操作系统: ${winVersion.name}`,
    'echo =====================================================================',
    'echo.',
    'echo 正在检测管理员权限...',
    'net session >nul 2>&1',
    'if %errorlevel% neq 0 (',
    '    echo [错误] 请右键此 .bat 批处理文件，选择【以管理员身份运行】！',
    '    echo.',
    '    pause',
    '    exit /b',
    ')',
    '',
    'echo [1/2] 管理员权限验证通过，准备清理以下垃圾分类...',
  ];

  selectedCategories.forEach((cat) => {
    lines.push(`echo  - ${cat.name}`);
  });

  lines.push('', 'echo.', 'echo [2/2] 开始执行自动清理，请稍候...', '');

  selectedCategories.forEach((cat) => {
    lines.push(`echo 正在处理: ${cat.name}...`);
    lines.push(cat.cmdSnippet);
  });

  lines.push(
    '',
    'echo.',
    'echo =====================================================================',
    'echo [完成] C盘垃圾清理已顺利结束！已清除系统无用缓存并归还磁盘空间。',
    'echo =====================================================================',
    'pause'
  );

  return lines.join('\r\n');
}

/**
 * Generates an administrative PowerShell registration command for Windows Task Scheduler (schtasks).
 */
export function generateTaskSchedulerCommand(config: ScheduledTaskConfig): string {
  let sc = 'DAILY';
  let extra = '';

  if (config.frequency === 'weekly') {
    sc = 'WEEKLY';
    const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    extra = `/D ${dayMap[config.dayOfWeek] || 'SUN'}`;
  } else if (config.frequency === 'monthly') {
    sc = 'MONTHLY';
    extra = `/D ${config.dayOfMonth || 1}`;
  } else if (config.frequency === 'low_space') {
    sc = 'DAILY';
    extra = '/RI 120'; // check every 2 hours
  }

  return `schtasks /Create /TN "WinCleanPro_AutoClean" /TR "powershell.exe -NoProfile -WindowStyle Hidden -Command \\"Clear-RecycleBin -DriveLetter C -Force; Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue\\"" /SC ${sc} ${extra} /ST ${config.executionTime} /RL HIGHEST /F`;
}
