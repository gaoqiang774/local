/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JunkCategory, ScheduledTaskConfig, WhitelistRule, WindowsVersionInfo } from '../types/cleaner';

/**
 * Generates an automated, zero-dependency Windows batch file that uses Windows'
 * preinstalled .NET / PowerShell compiler to build a standalone native WinCleanPro.exe.
 */
export function generateStandaloneExeBuilderScript(
  categories: JunkCategory[],
  whitelist: WhitelistRule[],
  winVersion: WindowsVersionInfo,
  schedulerConfig?: ScheduledTaskConfig
): string {
  return `@echo off
chcp 65001 >nul
title WinClean Pro - 一键编译生成原生 EXE 客户端
color 0B

echo ===============================================================================
echo                WinClean Pro - Windows 本机 EXE 独立客户端生成器
echo ===============================================================================
echo.
echo 正在调用 Windows 内置编译器（零依赖，无需安装任何开发环境）...
echo 请稍候约 2 秒钟...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"$code = @'
using System;
using System.IO;
using System.Drawing;
using System.Windows.Forms;
using System.Diagnostics;
using System.Collections.Generic;
using System.Security.Principal;
using System.Runtime.InteropServices;
using System.Threading;

namespace WinCleanPro {
    public class Program {
        [DllImport(\\"Shell32.dll\\")]
        public static extern int SHEmptyRecycleBin(IntPtr hwnd, string pszRootPath, uint dwFlags);
        public const uint SHERB_NOCONFIRMATION = 0x00000001;
        public const uint SHERB_NOPROGRESSUI   = 0x00000002;
        public const uint SHERB_NOSOUND        = 0x00000004;

        [STAThread]
        public static void Main(string[] args) {
            // 1. 管理员权限自动提权验证
            if (!IsAdmin()) {
                try {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = Application.ExecutablePath;
                    psi.Arguments = string.Join(\\" \\", args);
                    psi.Verb = \\"runas\\";
                    Process.Start(psi);
                    return;
                } catch {
                    MessageBox.Show(\\"请右键【以管理员身份运行】WinCleanPro.exe，以确保系统临时文件和更新缓存的清理权限！\\", \\"需要管理员权限\\", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
            }

            // 2. 支持命令行静默参数 (供 Windows 计划任务后台自动调用)
            if (args.Length > 0 && (args[0] == \\"/silent\\" || args[0] == \\"/auto\\")) {
                ExecuteSilentClean();
                return;
            }

            // 3. 启动图形化桌面客户端窗口
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainWindow());
        }

        public static bool IsAdmin() {
            WindowsIdentity identity = WindowsIdentity.GetCurrent();
            WindowsPrincipal principal = new WindowsPrincipal(identity);
            return principal.IsInRole(WindowsBuiltInRole.Administrator);
        }

        public static void ExecuteSilentClean() {
            CleanerEngine.PerformClean(null, null);
        }
    }

    public class CleanerEngine {
        // 内置安全白名单关键词 (严格保护个人隐私与工程代码)
        public static readonly List<string> Whitelist = new List<string> {
            \\"WeChat Files\\", \\"Tencent Files\\", \\"node_modules\\", \\".git\\", \\".mdf\\", \\".ldf\\", \\".sqlite\\", \\"Desktop\\", \\"Documents\\"
        };

        public static long PerformClean(Action<string> logCallback, Action<int> progressCallback) {
            long totalFreed = 0;
            try {
                // 1. 清空回收站
                try {
                    Program.SHEmptyRecycleBin(IntPtr.Zero, null, Program.SHERB_NOCONFIRMATION | Program.SHERB_NOPROGRESSUI | Program.SHERB_NOSOUND);
                    if (logCallback != null) logCallback(\\"[√] Windows 回收站已安全清空\\");
                } catch {}

                // 2. 清理 用户临时文件 (%TEMP%)
                string userTemp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + @\\"\\Temp\\";
                totalFreed += CleanDirectory(userTemp, logCallback);
                if (progressCallback != null) progressCallback(30);

                // 3. 清理 Windows 系统临时文件 (C:\\Windows\\Temp)
                totalFreed += CleanDirectory(@\\"C:\\Windows\\Temp\\", logCallback);
                if (progressCallback != null) progressCallback(50);

                // 4. 清理 传递优化服务下载缓存 (DeliveryOptimization)
                totalFreed += CleanDirectory(@\\"C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache\\", logCallback);
                if (progressCallback != null) progressCallback(70);

                // 5. 清理 系统错误崩溃转储 (Minidump)
                totalFreed += CleanDirectory(@\\"C:\\Windows\\Minidump\\", logCallback);
                if (progressCallback != null) progressCallback(85);

                // 6. 清理 Windows Update 更新下载缓存
                totalFreed += CleanDirectory(@\\"C:\\Windows\\SoftwareDistribution\\Download\\", logCallback);
                if (progressCallback != null) progressCallback(100);

            } catch {}
            return totalFreed;
        }

        private static long CleanDirectory(string path, Action<string> log) {
            long freed = 0;
            if (!Directory.Exists(path)) return 0;

            try {
                DirectoryInfo di = new DirectoryInfo(path);
                foreach (FileInfo file in di.GetFiles(\\"*\\", SearchOption.AllDirectories)) {
                    try {
                        // 白名单拦截检查
                        bool isProtected = false;
                        foreach (string wl in Whitelist) {
                            if (file.FullName.IndexOf(wl, StringComparison.OrdinalIgnoreCase) >= 0) {
                                isProtected = true;
                                break;
                            }
                        }
                        if (isProtected) continue;

                        long sz = file.Length;
                        file.Attributes = FileAttributes.Normal;
                        file.Delete();
                        freed += sz;
                        if (log != null) log(\\"清理文件: \\" + file.Name + \\" (+\\" + FormatBytes(sz) + \\")\\");
                    } catch {}
                }
            } catch {}
            return freed;
        }

        public static string FormatBytes(long bytes) {
            if (bytes < 1024) return bytes + \\" B\\";
            if (bytes < 1048576) return (bytes / 1024.0).ToString(\\"0.0\\") + \\" KB\\";
            if (bytes < 1073741824) return (bytes / 1048576.0).ToString(\\"0.0\\") + \\" MB\\";
            return (bytes / 1073741824.0).ToString(\\"0.00\\") + \\" GB\\";
        }
    }

    public class MainWindow : Form {
        private Label lblHeader;
        private Label lblDriveInfo;
        private ProgressBar progressBar;
        private Button btnClean;
        private Button btnRescan;
        private Button btnSchedule;
        private Label lblStatus;
        private TextBox txtLog;

        public MainWindow() {
            this.Text = \\"WinClean Pro - Windows C盘智能自动清理大师\\";
            this.Size = new Size(720, 560);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(248, 250, 252);
            InitializeUI();
            RefreshDisk();
        }

        private void InitializeUI() {
            lblHeader = new Label {
                Text = \\"WinClean Pro - C 盘智能自动清理桌面版\\",
                Font = new Font(\\"Segoe UI\\", 13, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                Location = new Point(24, 20),
                AutoSize = true
            };

            lblDriveInfo = new Label {
                Text = \\"正在读取 C 盘存储状态...\\",
                Font = new Font(\\"Segoe UI\\", 10),
                ForeColor = Color.FromArgb(71, 85, 105),
                Location = new Point(24, 55),
                Size = new Size(655, 30)
            };

            progressBar = new ProgressBar {
                Location = new Point(24, 95),
                Size = new Size(655, 20),
                Style = ProgressBarStyle.Continuous
            };

            btnClean = new Button {
                Text = \\"一键极速清理 C 盘垃圾\\",
                Font = new Font(\\"Segoe UI\\", 10, FontStyle.Bold),
                BackColor = Color.FromArgb(37, 99, 235),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Location = new Point(24, 130),
                Size = new Size(220, 42),
                Cursor = Cursors.Hand
            };
            btnClean.FlatAppearance.BorderSize = 0;
            btnClean.Click += BtnClean_Click;

            btnRescan = new Button {
                Text = \\"重新检测\\",
                Font = new Font(\\"Segoe UI\\", 9),
                Location = new Point(255, 130),
                Size = new Size(110, 42),
                Cursor = Cursors.Hand
            };
            btnRescan.Click += (s, e) => RefreshDisk();

            btnSchedule = new Button {
                Text = \\"设置每日凌晨自动守护\\",
                Font = new Font(\\"Segoe UI\\", 9),
                Location = new Point(375, 130),
                Size = new Size(180, 42),
                Cursor = Cursors.Hand
            };
            btnSchedule.Click += BtnSchedule_Click;

            lblStatus = new Label {
                Text = \\"就绪 · 安全白名单守护已生效（严格避让微信/QQ聊天记录、桌面文档与工程代码）\\",
                Font = new Font(\\"Segoe UI\\", 9),
                ForeColor = Color.FromArgb(22, 101, 52),
                Location = new Point(24, 185),
                Size = new Size(655, 22)
            };

            txtLog = new TextBox {
                Multiline = true,
                ReadOnly = true,
                ScrollBars = ScrollBars.Vertical,
                BackColor = Color.FromArgb(15, 23, 42),
                ForeColor = Color.FromArgb(226, 232, 240),
                Font = new Font(\\"Consolas\\", 9),
                Location = new Point(24, 215),
                Size = new Size(655, 280)
            };

            this.Controls.Add(lblHeader);
            this.Controls.Add(lblDriveInfo);
            this.Controls.Add(progressBar);
            this.Controls.Add(btnClean);
            this.Controls.Add(btnRescan);
            this.Controls.Add(btnSchedule);
            this.Controls.Add(lblStatus);
            this.Controls.Add(txtLog);
        }

        private void RefreshDisk() {
            try {
                DriveInfo c = new DriveInfo(\\"C\\");
                double totalGB = Math.Round((double)c.TotalSize / 1073741824, 2);
                double freeGB = Math.Round((double)c.AvailableFreeSpace / 1073741824, 2);
                double usedGB = Math.Round(totalGB - freeGB, 2);
                int pct = (int)((usedGB / totalGB) * 100);

                lblDriveInfo.Text = string.Format(\\"C 盘容量: {0} GB | 已用: {1} GB ({2}%) | 当前可用剩余: {3} GB\\", totalGB, usedGB, pct, freeGB);
                progressBar.Value = Math.Min(100, pct);
                txtLog.AppendText(string.Format(\\"[{0}] 读取 C 盘状态正常，当前剩余空间: {1} GB\\r\\n\\", DateTime.Now.ToString(\\"HH:mm:ss\\"), freeGB));
            } catch {}
        }

        private void BtnClean_Click(object sender, EventArgs e) {
            btnClean.Enabled = false;
            btnRescan.Enabled = false;
            btnSchedule.Enabled = false;
            lblStatus.Text = \\"正在全速清理垃圾文件，请稍候...\\";
            txtLog.AppendText(string.Format(\\"\\r\\n[{0}] >>> 开始执行智能清理 <<<\\r\\n\\", DateTime.Now.ToString(\\"HH:mm:ss\\")));

            long beforeFree = new DriveInfo(\\"C\\").AvailableFreeSpace;

            Thread t = new Thread(() => {
                long freed = CleanerEngine.PerformClean(
                    (msg) => {
                        this.Invoke((MethodInvoker)delegate {
                            txtLog.AppendText(msg + \\"\\r\\n\\");
                        });
                    },
                    (pct) => {
                        this.Invoke((MethodInvoker)delegate {
                            progressBar.Value = pct;
                        });
                    }
                );

                long afterFree = new DriveInfo(\\"C\\").AvailableFreeSpace;
                double freedGB = Math.Round((double)(afterFree - beforeFree) / 1073741824, 2);
                if (freedGB < 0) freedGB = 0;

                this.Invoke((MethodInvoker)delegate {
                    RefreshDisk();
                    btnClean.Enabled = true;
                    btnRescan.Enabled = true;
                    btnSchedule.Enabled = true;
                    lblStatus.Text = string.Format(\\"清理完成！本次累计释放约 {0} GB 可用空间。\\", freedGB);
                    txtLog.AppendText(string.Format(\\"[{0}] 清理成功结束！累计恢复可用容量: {1} GB\\r\\n\\", DateTime.Now.ToString(\\"HH:mm:ss\\"), freedGB));
                    MessageBox.Show(string.Format(\\"C 盘清理顺利完成！\\n\\n已成功为您释放可用空间约 {0} GB。\\n重要聊天记录与工作文件已受白名单全面保护。\\", freedGB), \\"清理完成\\", MessageBoxButtons.OK, MessageBoxIcon.Information);
                });
            });
            t.IsBackground = true;
            t.Start();
        }

        private void BtnSchedule_Click(object sender, EventArgs e) {
            try {
                string exePath = Application.ExecutablePath;
                string taskCmd = string.Format(\\"schtasks /Create /TN \\\\\\"WinCleanPro_DailyAutoClean\\\\\\" /TR \\\\\\"{0} /silent\\\\\\" /SC DAILY /ST 03:00 /RL HIGHEST /F\\", exePath);
                
                ProcessStartInfo psi = new ProcessStartInfo(\\"cmd.exe\\", \\"/c \\" + taskCmd);
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                Process p = Process.Start(psi);
                p.WaitForExit();

                MessageBox.Show(\\"已成功为您的系统注册 Windows 任务计划程序：\\n\\n任务名称: WinCleanPro_DailyAutoClean\\n执行时间: 每天凌晨 03:00 静默自动清理\\n\\n无需人工干预，系统将持续保持充沛空间！\\", \\"定时任务设置成功\\", MessageBoxButtons.OK, MessageBoxIcon.Information);
                txtLog.AppendText(string.Format(\\"[{0}] 已注册每日凌晨 03:00 静默自动维护任务\\r\\n\\", DateTime.Now.ToString(\\"HH:mm:ss\\")));
            } catch (Exception ex) {
                MessageBox.Show(\\"创建任务失败: \\" + ex.Message, \\"提示\\", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
'@;

try {
    Add-Type -TypeDefinition $code -Language CSharp -OutputAssembly 'WinCleanPro.exe' -OutputType WindowsApplication -ReferencedAssemblies 'System.Windows.Forms', 'System.Drawing', 'System.Core', 'System.Data'
} catch {
    Write-Host 'Add-Type 编译告警，切换为 csc 引擎...' -ForegroundColor Yellow
}
"

if exist "WinCleanPro.exe" (
    echo.
    echo ===============================================================================
    echo 【恭喜，编译成功！】
    echo 已在当前目录生成正宗原生的 Windows 独立可执行程序:
    echo.
    echo       ---^>  WinCleanPro.exe  ^<---
    echo.
    echo 客户端亮点:
    echo  1. 纯绿色单文件，体积小巧，双击即可直接弹出原生桌面窗口。
    echo  2. 自动获得 Windows 管理员权限，强力清理系统临时文件与更新缓存。
    echo  3. 内置微信/QQ聊天记录、桌面文档、SQL数据库等安全白名单避让。
    echo  4. 具备「每日凌晨 03:00 自动维护」一键注册功能。
    echo  5. 支持无窗口静默参数: WinCleanPro.exe /silent
    echo ===============================================================================
    echo.
    echo 按任意键即可立即启动 WinCleanPro.exe 体验...
    pause >nul
    start "" "WinCleanPro.exe"
) else (
    echo.
    echo [提示] 正在使用系统备用 csc 编译器尝试输出...
    set CSC=C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe
    if not exist "%CSC%" set CSC=C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe
    if exist "%CSC%" (
        powershell -NoProfile -Command "Set-Content -Path 'WinCleanPro.cs' -Value $code -Encoding utf8"
        "%CSC%" /target:winexe /out:WinCleanPro.exe /optimize+ /reference:System.Windows.Forms.dll,System.Drawing.dll WinCleanPro.cs
        if exist "WinCleanPro.exe" (
            del WinCleanPro.cs >nul 2>&1
            echo [成功] 备用引擎编译成功！已生成 WinCleanPro.exe。
            start "" "WinCleanPro.exe"
            exit /b 0
        )
    )
    echo [错误] 未能生成 WinCleanPro.exe，请确认系统 PowerShell 权限。
    pause
)

exit /b 0
`;
}

/**
 * Generates Windows IExpress (.sed) configuration file for packaging
 * scripts or files into a self-extracting .exe installer.
 */
export function generateIExpressSedConfig(): string {
  return `[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=0
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=
DisplayLicense=
FinishMessage=WinClean Pro 绿色独立版已准备就绪！
TargetName=WinCleanPro_Portable.exe
FriendlyName=WinClean Pro - Windows C盘智能自动清理大师
AppLaunched=cmd.exe /c Build_WinCleanPro_EXE.bat
PostInstallCmd=<None>
AdminQuietInst=1
`;
}
