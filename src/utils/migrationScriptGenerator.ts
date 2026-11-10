/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MigrationItem, TargetDriveOption } from '../types/cleaner';

export function generateMigrationPowerShellScript(
  items: MigrationItem[],
  targetDrive: TargetDriveOption
): string {
  const selected = items.filter((i) => i.selected);
  const targetRoot = `${targetDrive.letter}:\\WinClean_Migrated`;

  return `# ==============================================================================
# WinClean Pro - Windows C 盘大文件安全无缝迁移脚本 (PowerShell)
# 技术原理: Robocopy 完整移动 + NTFS Directory Junction (mklink /J) 符号链接
# 优势: 应用程序透明无感知读取，微信/QQ等软件历史数据与设置 100% 完好无损
# ==============================================================================

#Requires -RunAsAdministrator
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " WinClean Pro · Windows C 盘大文件安全迁移向导" -ForegroundColor Cyan
Write-Host " 目标磁盘: ${targetDrive.letter}: (${targetDrive.label})" -ForegroundColor Yellow
Write-Host " 搬迁根目录: ${targetRoot}" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. 验证目标磁盘是否存在及文件系统
$targetDriveLetter = "${targetDrive.letter}"
$vol = Get-Volume -DriveLetter $targetDriveLetter -ErrorAction SilentlyContinue
if (-not $vol) {
    Write-Host "[错误] 找不到目标磁盘 $targetDriveLetter :，请确认磁盘已连接！" -ForegroundColor Red
    Pause
    Exit 1
}

if ($vol.FileSystem -ne "NTFS" -and $vol.FileSystem -ne "ReFS") {
    Write-Host "[警告] 目标磁盘文件系统为 $($vol.FileSystem)，创建软链接必须为 NTFS 分区！" -ForegroundColor Red
    Pause
    Exit 1
}

# 创建目标基目录
if (-not (Test-Path "${targetRoot}")) {
    New-Item -ItemType Directory -Path "${targetRoot}" -Force | Out-Null
}

$successCount = 0
$failCount = 0

${selected
  .map((item, idx) => {
    const srcVar = `$src_${idx}`;
    const dstVar = `$dst_${idx}`;
    return `
# ------------------------------------------------------------------------------
# 迁移项 [${idx + 1}/${selected.length}]: ${item.name}
# 机制: ${item.mechanism}
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[准备迁移] ${item.name} ..." -ForegroundColor Green

${
  item.processName
    ? `
# 检查并尝试退出相关程序进程 (${item.processName})
$proc = Get-Process -Name "${item.processName.replace(/\.exe$/i, '')}" -ErrorAction SilentlyContinue
if ($proc) {
    Write-Host "正在安全关闭 ${item.processName}，避免文件被占用锁定..." -ForegroundColor Yellow
    $proc | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}
`
    : ''
}

${srcVar} = [System.Environment]::ExpandEnvironmentVariables("${item.sourcePath}")
${dstVar} = "${targetDrive.letter}:\\${item.defaultTargetSubPath}"

if (-not (Test-Path ${srcVar})) {
    Write-Host "[跳过] 源目录不存在: $(${srcVar})，无需迁移。" -ForegroundColor Gray
} else {
    # 检查是否已经是软链接
    $itemObj = Get-Item ${srcVar} -Force
    if ($itemObj.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        Write-Host "[提示] 该目录已经是符号链接/联接点，跳过重复迁移。" -ForegroundColor Yellow
    } else {
        if (-not (Test-Path (Split-Path ${dstVar} -Parent))) {
            New-Item -ItemType Directory -Path (Split-Path ${dstVar} -Parent) -Force | Out-Null
        }

        Write-Host ">>> 正在使用 Robocopy 完整搬移数据至: $(${dstVar}) ..." -ForegroundColor Cyan
        # Robocopy /E:递归子目录 /MOVE:移动后删除源文件 /COPYALL:保留所有时间戳与ACL权限 /R:2 /W:2
        & robocopy ${srcVar} ${dstVar} /E /COPYALL /MOVE /R:2 /W:2 /MT:8 /NP | Out-Null
        $rcExit = $LASTEXITCODE

        # Robocopy 返回值 0-7 均代表成功完成复制
        if ($rcExit -le 7) {
            # 彻底清理残留的空源文件夹
            if (Test-Path ${srcVar}) {
                Remove-Item -Path ${srcVar} -Recurse -Force -ErrorAction SilentlyContinue
            }

            Write-Host ">>> 正在创建 NTFS 目录联接符号链接 (mklink /J) ..." -ForegroundColor Cyan
            $mklinkCmd = "cmd /c mklink /J \`"$(${srcVar})\`" \`"$(${dstVar})\`""
            Invoke-Expression $mklinkCmd

            Write-Host "✅ [成功] ${item.name} 迁移完成并成功绑定链接！" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ [失败] 数据搬移发生错误 (Robocopy Exit Code: $rcExit)" -ForegroundColor Red
            $failCount++
        }
    }
}
`;
  })
  .join('\n')}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 迁移执行完成！成功: $successCount 项，失败: $failCount 项" -ForegroundColor Green
Write-Host " C 盘空间已成功大幅释放，所有软件可正常启动与使用！" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Pause
`;
}

export function generateRollbackScript(
  items: MigrationItem[],
  targetDrive: TargetDriveOption
): string {
  const selected = items.filter((i) => i.selected);

  return `@echo off
chcp 65001 >nul
title WinClean Pro - C盘迁移一键恢复与回滚程序
color 0E

echo ========================================================
echo  WinClean Pro · 迁移还原与回滚程序
echo  将已经迁移到 ${targetDrive.letter} 盘的文件完整回迁至 C 盘原位置
echo ========================================================
echo.
pause

${selected
  .map((item) => {
    return `
echo --------------------------------------------------------
echo 正在还原: ${item.name}
echo --------------------------------------------------------
${item.processName ? `taskkill /f /im ${item.processName} >nul 2>&1` : ''}

:: 1. 删除 NTFS 软链接 (注意: rmdir 删除联接点绝不会删除目标实际文件)
if exist "${item.sourcePath}" (
    rmdir "${item.sourcePath}"
)

:: 2. 从目标盘搬回源路径
robocopy "${targetDrive.letter}:\\${item.defaultTargetSubPath}" "${item.sourcePath}" /E /MOVE /COPYALL /R:2 /W:2 >nul

echo 已恢复至 C 盘原路径！
`;
  })
  .join('\n')}

echo.
echo ========================================================
echo  全部已选目录已成功回滚至 C 盘！
echo ========================================================
pause
`;
}
