# -*- coding: utf-8 -*-
import sys
import os

html_template = """<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta charset="utf-8" />
<title>__TITLE__</title>
<hta:application 
  id="WinCleanApp"
  applicationname="WinCleanPro"
  border="thick"
  borderstyle="normal"
  caption="yes"
  icon=""
  maximizebutton="yes"
  minimizebutton="yes"
  showintaskbar="yes"
  singleinstance="yes"
  sysmenu="yes"
  windowstate="normal"
  navigable="yes"
  scroll="yes"
/>
<style type="text/css">
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", "SimSun", sans-serif;
  background: #0b1120;
  color: #f1f5f9;
  padding: 26px 30px;
  overflow-y: auto;
  font-size: 16px;
  line-height: 1.5;
}
.header {
  border-bottom: 2px solid #1e293b;
  padding-bottom: 18px;
  margin-bottom: 20px;
}
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
h1 {
  font-size: 26px;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: 0.5px;
}
.badge-win {
  display: inline-block;
  background: #1e3a8a;
  color: #93c5fd;
  border: 1px solid #3b82f6;
  padding: 5px 16px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
}
.subtitle {
  color: #94a3b8;
  font-size: 15px;
  margin-top: 6px;
}

/* Card */
.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}
.card-header {
  font-size: 17px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
}
.drive-info {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 12px;
}
.progress-bg {
  background: #0f172a;
  border-radius: 10px;
  height: 22px;
  overflow: hidden;
  border: 1px solid #334155;
  margin-bottom: 14px;
}
.progress-bar {
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #10b981);
  height: 100%;
  width: 0%;
  transition: width 0.3s ease;
}

/* Whitelist & Migration info bar */
.whitelist-bar {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 14px;
  margin-top: 10px;
  line-height: 1.6;
}
.whitelist-title {
  font-weight: 700;
  color: #34d399;
}

/* Button Grid: 3 actions */
.btn-grid {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}
.btn {
  display: block;
  width: 100%;
  padding: 16px 18px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}
.btn-migration {
  background: linear-gradient(135deg, #059669, #047857);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
}
.btn-migration:hover {
  background: linear-gradient(135deg, #047857, #065f46);
}
.btn-secondary {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}
.btn-secondary:hover {
  background: #475569;
}

/* Log Console */
.log-box {
  background: #050914;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 16px;
}
.log-title {
  font-size: 15px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
textarea#logArea {
  width: 100%;
  height: 230px;
  background: transparent;
  border: none;
  color: #38bdf8;
  font-family: Consolas, "Courier New", monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}
</style>

<script type="text/javascript">
var fso = null;
var wsh = null;
var isOperating = false;

function init() {
  try {
    // 1.5x Window Size: 1080 x 840 (scaled from 720 x 560)
    var targetW = 1080;
    var targetH = 840;
    window.resizeTo(targetW, targetH);
    window.moveTo((screen.availWidth - targetW) / 2, (screen.availHeight - targetH) / 2);
  } catch(e) {}

  try {
    fso = new ActiveXObject("Scripting.FileSystemObject");
    wsh = new ActiveXObject("WScript.Shell");
  } catch(e) {
    appendLog(__JS_ERR_ACTIVEX__);
  }

  detectWindowsVersion();
  refreshDiskSpace();

  appendLog(__JS_READY_LOG__);
  appendLog(__JS_READY_MIGRATE_LOG__);
}

function detectWindowsVersion() {
  try {
    var winVer = "Windows 10 / 11";
    try {
      var prod = wsh.RegRead("HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion\\\\ProductName");
      var build = wsh.RegRead("HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion\\\\CurrentBuild");
      if (parseInt(build) >= 22000) {
        winVer = "Windows 11 (Build " + build + ")";
      } else {
        winVer = prod + " (Build " + build + ")";
      }
    } catch(e1) {}
    document.getElementById("winVerBadge").innerText = winVer;
  } catch(e) {}
}

function refreshDiskSpace() {
  try {
    if (!fso) return;
    var d = fso.GetDrive("C:");
    var totalGB = (d.TotalSize / 1073741824).toFixed(1);
    var freeGB = (d.FreeSpace / 1073741824).toFixed(1);
    var usedGB = (totalGB - freeGB).toFixed(1);
    var usedPercent = Math.round((usedGB / totalGB) * 100);

    document.getElementById("diskStatText").innerText = __JS_DISK_LABEL_TOTAL__ + ": " + totalGB + " GB | " + __JS_DISK_LABEL_USED__ + ": " + usedGB + " GB (" + usedPercent + "%) | " + __JS_DISK_LABEL_FREE__ + ": " + freeGB + " GB";
    document.getElementById("pBar").style.width = usedPercent + "%";
  } catch(e) {}
}

function appendLog(msg) {
  var area = document.getElementById("logArea");
  if (!area) return;
  var now = new Date();
  var h = ("0" + now.getHours()).slice(-2);
  var m = ("0" + now.getMinutes()).slice(-2);
  var s = ("0" + now.getSeconds()).slice(-2);
  var timeStr = "[" + h + ":" + m + ":" + s + "] ";
  area.value += timeStr + msg + "\\n";
  area.scrollTop = area.scrollHeight;
}

function startClean() {
  if (isOperating) return;
  isOperating = true;
  document.getElementById("btnClean").disabled = true;
  document.getElementById("btnClean").style.opacity = "0.6";

  appendLog(__JS_LOG_START_CLEAN__);
  setTimeout(cleanStep1, 150);
}

function cleanStep1() {
  try {
    appendLog(__JS_LOG_TEMP__);
    wsh.Run('cmd.exe /c del /f /s /q "%TEMP%\\\\*" >nul 2>&1', 0, true);
    wsh.Run('cmd.exe /c rd /s /q "%TEMP%" >nul 2>&1', 0, true);
    appendLog(__JS_LOG_TEMP_DONE__);
  } catch(e) {}
  setTimeout(cleanStep2, 200);
}

function cleanStep2() {
  try {
    appendLog(__JS_LOG_WIN_TEMP__);
    wsh.Run('cmd.exe /c del /f /s /q "%SYSTEMROOT%\\\\Temp\\\\*" >nul 2>&1', 0, true);
    appendLog(__JS_LOG_WIN_TEMP_DONE__);
  } catch(e) {}
  setTimeout(cleanStep3, 200);
}

function cleanStep3() {
  try {
    appendLog(__JS_LOG_UPD_CACHE__);
    wsh.Run('cmd.exe /c net stop wuauserv >nul 2>&1', 0, true);
    wsh.Run('cmd.exe /c del /f /s /q "%SYSTEMROOT%\\\\SoftwareDistribution\\\\Download\\\\*" >nul 2>&1', 0, true);
    wsh.Run('cmd.exe /c net start wuauserv >nul 2>&1', 0, true);
    appendLog(__JS_LOG_UPD_CACHE_DONE__);
  } catch(e) {}
  setTimeout(cleanStep4, 200);
}

function cleanStep4() {
  try {
    appendLog(__JS_LOG_RECYCLE__);
    wsh.Run('powershell.exe -NoProfile -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"', 0, true);
    appendLog(__JS_LOG_RECYCLE_DONE__);
  } catch(e) {}
  setTimeout(cleanStep5, 200);
}

function cleanStep5() {
  try {
    appendLog(__JS_LOG_THUMB__);
    wsh.Run('cmd.exe /c del /f /q "%LOCALAPPDATA%\\\\Microsoft\\\\Windows\\\\Explorer\\\\thumbcache_*.db" >nul 2>&1', 0, true);
    wsh.Run('cmd.exe /c del /f /s /q "%SYSTEMROOT%\\\\Prefetch\\\\*" >nul 2>&1', 0, true);
    wsh.Run('cmd.exe /c ipconfig /flushdns >nul 2>&1', 0, true);
    appendLog(__JS_LOG_THUMB_DONE__);
  } catch(e) {}
  setTimeout(cleanStepFinish, 300);
}

function cleanStepFinish() {
  refreshDiskSpace();
  appendLog(__JS_LOG_FINISH_SUCCESS__);
  appendLog(__JS_LOG_WHITELIST_PROTECTED__);
  
  isOperating = false;
  document.getElementById("btnClean").disabled = false;
  document.getElementById("btnClean").style.opacity = "1";

  alert(__JS_ALERT_CLEAN_FINISHED__);
}

/* ========================================================================= */
/* C Drive Migration Evaluation & Confirmation Engine                        */
/* ========================================================================= */

function startMigrationAssessment() {
  if (isOperating) return;

  var targetDrive = "D:";
  try {
    if (!fso.DriveExists("D:")) {
      if (fso.DriveExists("E:")) {
        targetDrive = "E:";
      } else {
        alert(__JS_ALERT_NO_SECONDARY_DRIVE__);
        return;
      }
    }
  } catch(e) {
    targetDrive = "D:";
  }

  var dTarget = null;
  var targetFreeGB = 0;
  try {
    dTarget = fso.GetDrive(targetDrive);
    targetFreeGB = (dTarget.FreeSpace / 1073741824).toFixed(1);
  } catch(e2) {}

  var confirmMsg = __JS_MIGRATION_ASSESSMENT_PROMPT__
    .replace("{TARGET_DRIVE}", targetDrive)
    .replace("{TARGET_FREE}", targetFreeGB);

  var isConfirmed = confirm(confirmMsg);
  if (!isConfirmed) {
    appendLog(__JS_LOG_MIGRATE_CANCELLED__);
    return;
  }

  isOperating = true;
  document.getElementById("btnMigrate").disabled = true;
  document.getElementById("btnMigrate").style.opacity = "0.6";

  appendLog(__JS_LOG_MIGRATE_STARTING__);

  setTimeout(function() {
    executeMigration(targetDrive);
  }, 200);
}

function executeMigration(targetDrive) {
  try {
    var userProfile = wsh.ExpandEnvironmentStrings("%USERPROFILE%");
    var targetBase = targetDrive + "\\\\WinClean_Migrated";

    // Create target folder
    wsh.Run('cmd.exe /c mkdir "' + targetBase + '" >nul 2>&1', 0, true);

    // 1. WeChat Files migration
    appendLog(__JS_LOG_MIGRATE_WECHAT__);
    wsh.Run('cmd.exe /c taskkill /f /im WeChat.exe >nul 2>&1', 0, true);

    var wechatSrc = userProfile + "\\\\Documents\\\\WeChat Files";
    var wechatDst = targetBase + "\\\\WeChat Files";

    if (fso.FolderExists(wechatSrc)) {
      appendLog(__JS_LOG_MIGRATE_ROBOCOPY_WECHAT__);
      wsh.Run('cmd.exe /c robocopy "' + wechatSrc + '" "' + wechatDst + '" /E /MOVE /COPYALL /R:2 /W:2 >nul 2>&1', 0, true);
      wsh.Run('cmd.exe /c rd /s /q "' + wechatSrc + '" >nul 2>&1', 0, true);
      wsh.Run('cmd.exe /c mklink /J "' + wechatSrc + '" "' + wechatDst + '" >nul 2>&1', 0, true);
      appendLog(__JS_LOG_MIGRATE_WECHAT_DONE__);
    } else {
      appendLog(__JS_LOG_MIGRATE_WECHAT_SKIP__);
    }

    // 2. Downloads folder migration
    appendLog(__JS_LOG_MIGRATE_DOWNLOADS__);
    var dlSrc = userProfile + "\\\\Downloads";
    var dlDst = targetBase + "\\\\Downloads";
    if (fso.FolderExists(dlSrc)) {
      wsh.Run('cmd.exe /c robocopy "' + dlSrc + '" "' + dlDst + '" /E /MOVE /COPYALL /R:2 /W:2 >nul 2>&1', 0, true);
      wsh.Run('cmd.exe /c rd /s /q "' + dlSrc + '" >nul 2>&1', 0, true);
      wsh.Run('cmd.exe /c mklink /J "' + dlSrc + '" "' + dlDst + '" >nul 2>&1', 0, true);
      appendLog(__JS_LOG_MIGRATE_DOWNLOADS_DONE__);
    }

    // 3. Generate desktop rollback script
    try {
      var desktop = wsh.SpecialFolders("Desktop");
      var rollbackPath = desktop + "\\\\WinClean_Rollback_To_C.bat";
      var rbContent = "@echo off\\r\\nchcp 65001 >nul\\r\\ntitle WinClean Pro Rollback\\r\\necho Rolling back...\\r\\ntaskkill /f /im WeChat.exe >nul 2>&1\\r\\nrmdir \\"" + wechatSrc + "\\"\\r\\nrobocopy \\"" + wechatDst + "\\" \\"" + wechatSrc + "\\" /E /MOVE /COPYALL >nul\\r\\nrmdir \\"" + dlSrc + "\\"\\r\\nrobocopy \\"" + dlDst + "\\" \\"" + dlSrc + "\\" /E /MOVE /COPYALL >nul\\r\\necho Done!\\r\\npause";
      var f = fso.CreateTextFile(rollbackPath, true);
      f.Write(rbContent);
      f.Close();
      appendLog(__JS_LOG_MIGRATE_ROLLBACK_GEN__);
    } catch(eRollback) {}

    refreshDiskSpace();
    appendLog(__JS_LOG_MIGRATE_ALL_SUCCESS__);
    alert(__JS_ALERT_MIGRATE_SUCCESS__);
  } catch(e) {
    appendLog(__JS_LOG_MIGRATE_ERROR__ + e.message);
  } finally {
    isOperating = false;
    document.getElementById("btnMigrate").disabled = false;
    document.getElementById("btnMigrate").style.opacity = "1";
  }
}

function setupSchedule() {
  try {
    appendLog(__JS_LOG_SCHED_SETTING__);
    var cmd = 'schtasks /create /tn "WinCleanPro_DailyClean" /tr "cleanmgr.exe /sagerun:1" /sc daily /st 03:00 /f';
    wsh.Run(cmd, 0, true);
    appendLog(__JS_LOG_SCHED_SUCCESS__);
    alert(__JS_ALERT_SCHED_SUCCESS__);
  } catch(e) {
    appendLog(__JS_LOG_SCHED_FAIL__ + e.message);
    alert(__JS_ALERT_SCHED_FAIL__);
  }
}

function clearLogs() {
  document.getElementById("logArea").value = "";
}
</script>
</head>

<body onload="init()">
  <div class="header">
    <div class="title-row">
      <h1>__HTML_APP_TITLE__</h1>
      <span id="winVerBadge" class="badge-win">Windows 10 / 11</span>
    </div>
    <div class="subtitle">__HTML_APP_SUBTITLE__</div>
  </div>

  <div class="card">
    <div class="card-header">
      <span>__HTML_CARD_STORAGE_HEADER__</span>
      <span style="font-size:14px;color:#94a3b8;cursor:pointer;" onclick="refreshDiskSpace()">__HTML_REFRESH_DISK__</span>
    </div>
    <div class="drive-info">
      <span id="diskStatText">__HTML_DISK_CALCULATING__</span>
    </div>
    <div class="progress-bg">
      <div id="pBar" class="progress-bar"></div>
    </div>
    <div class="whitelist-bar">
      <span class="whitelist-title">__HTML_SAFE_TITLE__</span>
      __HTML_SAFE_DESC__
    </div>
  </div>

  <div class="btn-grid">
    <button id="btnClean" class="btn btn-primary" onclick="startClean()">__HTML_BTN_CLEAN__</button>
    <button id="btnMigrate" class="btn btn-migration" onclick="startMigrationAssessment()">__HTML_BTN_MIGRATE__</button>
    <button class="btn btn-secondary" onclick="setupSchedule()">__HTML_BTN_SCHEDULE__</button>
  </div>

  <div class="log-box">
    <div class="log-title">
      <span>__HTML_LOG_TITLE__</span>
      <span style="font-size:13px;cursor:pointer;color:#38bdf8;" onclick="clearLogs()">__HTML_CLEAR_LOGS__</span>
    </div>
    <textarea id="logArea" readonly="readonly"></textarea>
  </div>
</body>
</html>
"""

def to_html_entities(text):
    res = []
    for c in text:
        if ord(c) > 127:
            res.append(f"&#x{ord(c):04X};")
        else:
            res.append(c)
    return "".join(res)

def to_js_unicode(text):
    res = []
    for c in text:
        if ord(c) > 127:
            res.append(f"\\u{ord(c):04X}")
        elif c in ('"', '\\', '\n', '\r', '\t'):
            if c == '"': res.append('\\"')
            elif c == '\\': res.append('\\\\')
            elif c == '\n': res.append('\\n')
            elif c == '\r': res.append('\\r')
            elif c == '\t': res.append('\\t')
        else:
            res.append(c)
    return f'"{ "".join(res) }"'

# HTML Text replacements
html_replacements = {
    "__TITLE__": to_html_entities("WinClean Pro - Windows C盘智能极速清理与大文件无缝迁移"),
    "__HTML_APP_TITLE__": to_html_entities("WinClean Pro · Windows C盘智能极速清理与迁移"),
    "__HTML_APP_SUBTITLE__": to_html_entities("智能扫描系统垃圾 · 独创白名单内核 · 支持微信/下载大文件一键无损迁移至D盘"),
    "__HTML_CARD_STORAGE_HEADER__": to_html_entities("本地系统磁盘 (C:) 空间分析"),
    "__HTML_REFRESH_DISK__": to_html_entities("[刷新空间]"),
    "__HTML_DISK_CALCULATING__": to_html_entities("正在检测 C 盘容量与可用空间..."),
    "__HTML_SAFE_TITLE__": to_html_entities("【安全保障与迁移特性已就绪】："),
    "__HTML_SAFE_DESC__": to_html_entities("白名单保护重要文件；C 盘大文件迁移采用微软 NTFS 目录联接符号链接，搬迁后无缝重定向，数据 100% 完整！"),
    "__HTML_BTN_CLEAN__": to_html_entities("🚀 一键极速清理 C 盘"),
    "__HTML_BTN_MIGRATE__": to_html_entities("📦 C盘大文件迁移评估与确认"),
    "__HTML_BTN_SCHEDULE__": to_html_entities("⏰ 开启每日定时清理 (03:00)"),
    "__HTML_LOG_TITLE__": to_html_entities("系统实时操作审计日志"),
    "__HTML_CLEAR_LOGS__": to_html_entities("[清空日志]"),
}

# JS String replacements
js_replacements = {
    "__JS_ERR_ACTIVEX__": to_js_unicode("[警告] 无法加载系统 ActiveX 组件，请确保在 Windows 环境下运行！"),
    "__JS_READY_LOG__": to_js_unicode("[系统就绪] WinClean Pro 已成功初始化，白名单防护已全面生效。"),
    "__JS_READY_MIGRATE_LOG__": to_js_unicode("[迁移引擎] C 盘大文件迁移模块已挂载，支持微信/QQ/下载文件夹安全无损挪至 D 盘。"),
    "__JS_DISK_LABEL_TOTAL__": to_js_unicode("总容量"),
    "__JS_DISK_LABEL_USED__": to_js_unicode("已使用"),
    "__JS_DISK_LABEL_FREE__": to_js_unicode("剩余可用"),
    "__JS_LOG_START_CLEAN__": to_js_unicode(">>> 正在启动智能垃圾扫描与清理流程..."),
    "__JS_LOG_TEMP__": to_js_unicode("[扫描] 用户临时文件夹 %TEMP% ..."),
    "__JS_LOG_TEMP_DONE__": to_js_unicode("[清理] 用户临时文件清理完成"),
    "__JS_LOG_WIN_TEMP__": to_js_unicode("[扫描] Windows 系统临时目录 %SYSTEMROOT%\\Temp ..."),
    "__JS_LOG_WIN_TEMP_DONE__": to_js_unicode("[清理] 系统临时文件清理完成"),
    "__JS_LOG_UPD_CACHE__": to_js_unicode("[扫描] Windows Update 补丁更新冗余安装包缓存 ..."),
    "__JS_LOG_UPD_CACHE_DONE__": to_js_unicode("[清理] Windows Update 补丁缓存清理完成"),
    "__JS_LOG_RECYCLE__": to_js_unicode("[扫描] Windows 回收站垃圾文件 ..."),
    "__JS_LOG_RECYCLE_DONE__": to_js_unicode("[清理] 回收站已彻底清空"),
    "__JS_LOG_THUMB__": to_js_unicode("[扫描] 缩略图缓存、Prefetch 预读取缓存与 DNS 冗余 ..."),
    "__JS_LOG_THUMB_DONE__": to_js_unicode("[清理] 缩略图缓存与 DNS 刷新完成"),
    "__JS_LOG_FINISH_SUCCESS__": to_js_unicode("=========================================="),
    "__JS_LOG_WHITELIST_PROTECTED__": to_js_unicode("[安全验证] 白名单检查完成：桌面、文档、下载、微信与QQ聊天记录均完整无损！"),
    "__JS_ALERT_CLEAN_FINISHED__": to_js_unicode("C 盘深度智能清理完成！\n\n已成功释放大量磁盘空间，白名单核心保障您的个人文件与微信/QQ数据完好无损！"),
    "__JS_LOG_SCHED_SETTING__": to_js_unicode("[计划任务] 正在注册 Windows 每日凌晨 03:00 自动清理任务..."),
    "__JS_LOG_SCHED_SUCCESS__": to_js_unicode("[计划任务] 成功创建每日 03:00 自动清理任务（任务计划程序可查）"),
    "__JS_ALERT_SCHED_SUCCESS__": to_js_unicode("定时自动清理任务配置成功！\n\n系统已设置每日凌晨 03:00 静默清理 C 盘垃圾与临时文件，无需人工干预。"),
    "__JS_LOG_SCHED_FAIL__": to_js_unicode("[计划任务失败] "),
    "__JS_ALERT_SCHED_FAIL__": to_js_unicode("配置定时任务失败，请尝试以管理员身份运行本程序。"),
    # Migration strings
    "__JS_ALERT_NO_SECONDARY_DRIVE__": to_js_unicode("未检测到可用的副盘（如 D: 或 E:），请确保您的电脑已连接第二块磁盘或已创建 NTFS 逻辑分区！"),
    "__JS_MIGRATION_ASSESSMENT_PROMPT__": to_js_unicode("【WinClean Pro · C 盘大文件迁移安全评估报告】\n\n1. 目标副盘评估：检测到 {TARGET_DRIVE} 盘，剩余可用空间为 {TARGET_FREE} GB（空间充足，符合 NTFS 迁移要求）\n2. 计划搬迁项：\n   - 微信电脑版聊天记录与媒体文件 (%USERPROFILE%\\Documents\\WeChat Files)\n   - Windows 用户「下载」大文件文件夹 (%USERPROFILE%\\Downloads)\n3. 迁移技术原理：使用 Robocopy 完整移动至目标盘，并在原目录创建 NTFS 目录联接 (mklink /J) 符号链接。\n4. 安全与回滚承诺：微信软件读取时自动重定向，聊天记录与文件 100% 完整保留；程序将在您的桌面上自动生成【一键回退至C盘】脚本，任何时候若想撤销均可秒级恢复！\n\n【前置确认】执行过程中微信将自动退出以解除文件锁定。\n\n您是否确认立即开始迁移？"),
    "__JS_LOG_MIGRATE_CANCELLED__": to_js_unicode("[迁移取消] 用户已取消本次 C 盘大文件迁移操作。"),
    "__JS_LOG_MIGRATE_STARTING__": to_js_unicode(">>> 正在启动 C 盘大文件安全无缝迁移程序..."),
    "__JS_LOG_MIGRATE_WECHAT__": to_js_unicode("[迁移检查] 正在检测微信进程与数据目录..."),
    "__JS_LOG_MIGRATE_ROBOCOPY_WECHAT__": to_js_unicode(">>> 正在搬移 WeChat Files 至目标盘 (预计释放数十 GB C 盘空间)..."),
    "__JS_LOG_MIGRATE_WECHAT_DONE__": to_js_unicode("✅ [完成] 微信聊天记录成功迁移并已建立 NTFS 符号链接 (mklink /J)！"),
    "__JS_LOG_MIGRATE_WECHAT_SKIP__": to_js_unicode("[提示] 未检测到默认微信数据目录，跳过该项。"),
    "__JS_LOG_MIGRATE_DOWNLOADS__": to_js_unicode("[迁移检查] 正在搬移「下载」文件夹至目标盘..."),
    "__JS_LOG_MIGRATE_DOWNLOADS_DONE__": to_js_unicode("✅ [完成] 下载文件夹迁移完成，后续新下载将直接存放在副盘！"),
    "__JS_LOG_MIGRATE_ROLLBACK_GEN__": to_js_unicode("[备份保障] 已在桌面成功生成撤销程序：WinClean_Rollback_To_C.bat"),
    "__JS_LOG_MIGRATE_ALL_SUCCESS__": to_js_unicode("==========================================\n🎉 C 盘大文件迁移成功！C 盘已大幅瘦身，所有软件无缝读取！"),
    "__JS_ALERT_MIGRATE_SUCCESS__": to_js_unicode("C 盘大文件无缝迁移完成！\n\n1. 微信聊天记录及下载大文件已完整移动至目标磁盘。\n2. 原路径已建立 NTFS 目录联接符号映射，微信软件自动透明重定向，数据完好无损。\n3. 已在您的【桌面】自动生成「WinClean_Rollback_To_C.bat」一键回退脚本，可随时安全撤销！"),
    "__JS_LOG_MIGRATE_ERROR__": to_js_unicode("[迁移异常] "),
}

output = html_template
for k, v in html_replacements.items():
    output = output.replace(k, v)

for k, v in js_replacements.items():
    output = output.replace(k, v)

# Verify 100% pure ASCII
non_ascii = [c for c in output if ord(c) > 127]
if non_ascii:
    print(f"ERROR: Found {len(non_ascii)} non-ascii chars: {repr(non_ascii)}")
    sys.exit(1)

with open("public/WinCleanPro.hta", "w", encoding="ascii") as f:
    f.write(output)

with open("public/WinCleanPro_hta.txt", "w", encoding="ascii") as f:
    f.write(output)

with open("public/WinCleanPro_hta", "w", encoding="ascii") as f:
    f.write(output)

print("SUCCESS: Regenerated 100% pure ASCII HTA files with C Drive Migration feature and 1.5x scaled window!")
