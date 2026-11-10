/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * WinClean Pro - Native Windows C Drive Automatic Cleaner GUI Application
 */

#define UNICODE
#define _UNICODE
#define _WIN32_WINNT 0x0601

#include <windows.h>
#include <commctrl.h>
#include <shellapi.h>
#include <shlobj.h>
#include <stdio.h>
#include <wchar.h>

#pragma comment(lib, "comctl32.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "user32.lib")
#pragma comment(lib, "gdi32.lib")

#define ID_BTN_CLEAN    1001
#define ID_BTN_REFRESH  1002
#define ID_BTN_SCHEDULE 1003
#define ID_PROGRESS     1004
#define ID_EDIT_LOG     1005

static HWND g_hWnd = NULL;
static HWND g_hDriveText = NULL;
static HWND g_hProgress = NULL;
static HWND g_hBtnClean = NULL;
static HWND g_hBtnRefresh = NULL;
static HWND g_hBtnSchedule = NULL;
static HWND g_hStatusText = NULL;
static HWND g_hEditLog = NULL;

static HFONT g_hFontTitle = NULL;
static HFONT g_hFontMain = NULL;
static HFONT g_hFontBold = NULL;
static HFONT g_hFontMono = NULL;

static const wchar_t* g_whitelist[] = {
    L"WeChat Files",
    L"Tencent Files",
    L"node_modules",
    L".git",
    L".mdf",
    L".ldf",
    L".sqlite",
    L"Desktop",
    L"Documents",
    NULL
};

void AppendLog(const wchar_t* format, ...) {
    if (!g_hEditLog) return;
    wchar_t buffer[1024];
    va_list args;
    va_start(args, format);
    vswprintf(buffer, 1024, format, args);
    va_end(args);

    SYSTEMTIME st;
    GetLocalTime(&st);
    wchar_t timePrefix[64];
    swprintf(timePrefix, 64, L"[%02d:%02d:%02d] ", st.wHour, st.wMinute, st.wSecond);

    int len = GetWindowTextLength(g_hEditLog);
    SendMessage(g_hEditLog, EM_SETSEL, (WPARAM)len, (LPARAM)len);
    SendMessage(g_hEditLog, EM_REPLACESEL, 0, (LPARAM)timePrefix);
    SendMessage(g_hEditLog, EM_REPLACESEL, 0, (LPARAM)buffer);
    SendMessage(g_hEditLog, EM_REPLACESEL, 0, (LPARAM)L"\r\n");
    SendMessage(g_hEditLog, EM_SCROLLCARET, 0, 0);
}

BOOL IsElevated(void) {
    BOOL fRet = FALSE;
    HANDLE hToken = NULL;
    if (OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &hToken)) {
        TOKEN_ELEVATION elevation;
        DWORD cbSize = sizeof(TOKEN_ELEVATION);
        if (GetTokenInformation(hToken, TokenElevation, &elevation, sizeof(elevation), &cbSize)) {
            fRet = elevation.TokenIsElevated;
        }
        CloseHandle(hToken);
    }
    return fRet;
}

void RequestAdminRelaunch(void) {
    wchar_t szPath[MAX_PATH];
    if (GetModuleFileName(NULL, szPath, ARRAYSIZE(szPath))) {
        SHELLEXECUTEINFO sei = { sizeof(sei) };
        sei.lpVerb = L"runas";
        sei.lpFile = szPath;
        sei.hwnd = NULL;
        sei.nShow = SW_NORMAL;
        ShellExecuteEx(&sei);
    }
}

void UpdateDiskInfo(void) {
    ULARGE_INTEGER freeBytes, totalBytes, totalFreeBytes;
    if (GetDiskFreeSpaceEx(L"C:\\", &freeBytes, &totalBytes, &totalFreeBytes)) {
        double totalGB = (double)totalBytes.QuadPart / (1024.0 * 1024.0 * 1024.0);
        double freeGB = (double)freeBytes.QuadPart / (1024.0 * 1024.0 * 1024.0);
        double usedGB = totalGB - freeGB;
        int pct = (int)((usedGB / totalGB) * 100.0);

        wchar_t buf[256];
        swprintf(buf, 256, L"系统 C 盘容量: %.2f GB | 已使用: %.2f GB (%d%%) | 当前剩余可用: %.2f GB",
                 totalGB, usedGB, pct, freeGB);
        SetWindowText(g_hDriveText, buf);
        SendMessage(g_hProgress, PBM_SETPOS, (WPARAM)pct, 0);

        AppendLog(L"C 盘状态扫描完成: 剩余容量 %.2f GB (%d%% 已用)", freeGB, pct);
    }
}

BOOL IsPathWhitelisted(const wchar_t* path) {
    for (int i = 0; g_whitelist[i] != NULL; ++i) {
        if (wcsstr(path, g_whitelist[i]) != NULL) {
            return TRUE;
        }
    }
    return FALSE;
}

long long CleanFolderRecursive(const wchar_t* folderPath, int* fileCount) {
    long long freedBytes = 0;
    wchar_t searchPath[MAX_PATH * 2];
    swprintf(searchPath, MAX_PATH * 2, L"%s\\*", folderPath);

    WIN32_FIND_DATA ffd;
    HANDLE hFind = FindFirstFile(searchPath, &ffd);
    if (hFind == INVALID_HANDLE_VALUE) return 0;

    do {
        if (wcscmp(ffd.cFileName, L".") == 0 || wcscmp(ffd.cFileName, L"..") == 0) {
            continue;
        }

        wchar_t fullPath[MAX_PATH * 2];
        swprintf(fullPath, MAX_PATH * 2, L"%s\\%s", folderPath, ffd.cFileName);

        if (IsPathWhitelisted(fullPath)) {
            continue;
        }

        if (ffd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
            freedBytes += CleanFolderRecursive(fullPath, fileCount);
            RemoveDirectory(fullPath);
        } else {
            LARGE_INTEGER sz;
            sz.LowPart = ffd.nFileSizeLow;
            sz.HighPart = ffd.nFileSizeHigh;

            SetFileAttributes(fullPath, FILE_ATTRIBUTE_NORMAL);
            if (DeleteFile(fullPath)) {
                freedBytes += sz.QuadPart;
                if (fileCount) (*fileCount)++;
            }
        }
    } while (FindNextFile(hFind, &ffd));

    FindClose(hFind);
    return freedBytes;
}

DWORD WINAPI CleanThreadProc(LPVOID lpParam) {
    EnableWindow(g_hBtnClean, FALSE);
    EnableWindow(g_hBtnRefresh, FALSE);
    EnableWindow(g_hBtnSchedule, FALSE);
    SetWindowText(g_hStatusText, L"正在全速清理垃圾文件并核验白名单，请稍候...");

    AppendLog(L"=== 启动 WinClean Pro 智能极速清理 ===");

    ULARGE_INTEGER beforeFree, dummy1, dummy2;
    GetDiskFreeSpaceEx(L"C:\\", &beforeFree, &dummy1, &dummy2);

    int totalFiles = 0;
    long long totalBytesFreed = 0;

    // 1. 清空回收站
    SHEmptyRecycleBin(g_hWnd, NULL, SHERB_NOCONFIRMATION | SHERB_NOPROGRESSUI | SHERB_NOSOUND);
    AppendLog(L"[√] Windows 回收站已安全清空完毕");

    // 2. 清理用户 Temp (%LOCALAPPDATA%\Temp)
    wchar_t localTemp[MAX_PATH];
    if (GetEnvironmentVariable(L"LOCALAPPDATA", localTemp, MAX_PATH)) {
        wcscat(localTemp, L"\\Temp");
        AppendLog(L"正在清理用户临时文件: %s", localTemp);
        totalBytesFreed += CleanFolderRecursive(localTemp, &totalFiles);
    }

    // 3. 清理系统 Temp (C:\Windows\Temp)
    AppendLog(L"正在清理系统级临时文件: C:\\Windows\\Temp");
    totalBytesFreed += CleanFolderRecursive(L"C:\\Windows\\Temp", &totalFiles);

    // 4. 清理 Windows Update 补丁下载缓存
    AppendLog(L"正在清理 Windows Update 补丁缓存: C:\\Windows\\SoftwareDistribution\\Download");
    totalBytesFreed += CleanFolderRecursive(L"C:\\Windows\\SoftwareDistribution\\Download", &totalFiles);

    // 5. 清理 传递优化 P2P 下载缓存
    AppendLog(L"正在清理传递优化缓存 (DeliveryOptimization)...");
    totalBytesFreed += CleanFolderRecursive(L"C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache", &totalFiles);

    // 6. 清理 崩溃转储 (Minidump)
    totalBytesFreed += CleanFolderRecursive(L"C:\\Windows\\Minidump", &totalFiles);

    ULARGE_INTEGER afterFree;
    GetDiskFreeSpaceEx(L"C:\\", &afterFree, &dummy1, &dummy2);
    double actualFreedGB = (double)(afterFree.QuadPart - beforeFree.QuadPart) / (1024.0 * 1024.0 * 1024.0);
    if (actualFreedGB < 0.0) actualFreedGB = 0.0;

    UpdateDiskInfo();

    AppendLog(L"==========================================");
    AppendLog(L"清理大获成功！本次累计清理文件碎片: %d 个", totalFiles);
    AppendLog(L"累计释放磁盘物理可用空间: %.2f GB", actualFreedGB);
    AppendLog(L"==========================================");

    wchar_t statusMsg[256];
    swprintf(statusMsg, 256, L"清理完成！本次已安全释放 %.2f GB 可用空间 (清除 %d 个文件)", actualFreedGB, totalFiles);
    SetWindowText(g_hStatusText, statusMsg);

    EnableWindow(g_hBtnClean, TRUE);
    EnableWindow(g_hBtnRefresh, TRUE);
    EnableWindow(g_hBtnSchedule, TRUE);

    wchar_t prompt[512];
    swprintf(prompt, 512, L"C 盘清理顺利完成！\n\n本次成功为您释放 C 盘可用空间: %.2f GB\n累计清理垃圾文件: %d 个\n\n安全白名单（微信聊天记录、桌面、工程代码）已受全程保护！", actualFreedGB, totalFiles);
    MessageBox(g_hWnd, prompt, L"WinClean Pro 清理报告", MB_OK | MB_ICONINFORMATION);

    return 0;
}

void RegisterScheduledTask(void) {
    wchar_t szPath[MAX_PATH];
    GetModuleFileName(NULL, szPath, MAX_PATH);

    wchar_t cmd[MAX_PATH * 3];
    swprintf(cmd, MAX_PATH * 3, L"schtasks /Create /TN \"WinCleanPro_DailyAutoClean\" /TR \"\"%s\" /silent\" /SC DAILY /ST 03:00 /RL HIGHEST /F", szPath);

    int res = (int)ShellExecute(NULL, L"open", L"cmd.exe", L"/c schtasks /Create /TN \"WinCleanPro_DailyAutoClean\" /TR \"schtasks\" /SC DAILY /ST 03:00 /RL HIGHEST /F", NULL, SW_HIDE);
    
    // Direct system invocation
    _wsystem(cmd);

    AppendLog(L"[√] 已注册系统级任务计划程序: 每天凌晨 03:00 静默自动维护");
    MessageBox(g_hWnd, L"已成功为您的 Windows 系统注册每日自动清理任务！\n\n任务名称: WinCleanPro_DailyAutoClean\n执行时刻: 每天凌晨 03:00\n执行方式: 静默后台无感运行\n\n系统将自动维持充足的 C 盘可用空间！", L"定时任务已激活", MB_OK | MB_ICONINFORMATION);
}

void SilentCleanMode(void) {
    int totalFiles = 0;
    SHEmptyRecycleBin(NULL, NULL, SHERB_NOCONFIRMATION | SHERB_NOPROGRESSUI | SHERB_NOSOUND);
    
    wchar_t localTemp[MAX_PATH];
    if (GetEnvironmentVariable(L"LOCALAPPDATA", localTemp, MAX_PATH)) {
        wcscat(localTemp, L"\\Temp");
        CleanFolderRecursive(localTemp, &totalFiles);
    }
    CleanFolderRecursive(L"C:\\Windows\\Temp", &totalFiles);
    CleanFolderRecursive(L"C:\\Windows\\SoftwareDistribution\\Download", &totalFiles);
    CleanFolderRecursive(L"C:\\Windows\\Minidump", &totalFiles);
}

LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
        case WM_CREATE: {
            INITCOMMONCONTROLSEX icex;
            icex.dwSize = sizeof(icex);
            icex.dwICC = ICC_PROGRESS_CLASS;
            InitCommonControlsEx(&icex);

            g_hFontTitle = CreateFont(-18, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Segoe UI");
            g_hFontBold = CreateFont(-13, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Segoe UI");
            g_hFontMain = CreateFont(-13, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Segoe UI");
            g_hFontMono = CreateFont(-12, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, FIXED_PITCH | FF_MODERN, L"Consolas");

            HWND hTitle = CreateWindow(L"STATIC", L"WinClean Pro - Windows C 盘智能自动清理大师", WS_CHILD | WS_VISIBLE, 24, 18, 650, 24, hWnd, NULL, NULL, NULL);
            SendMessage(hTitle, WM_SETFONT, (WPARAM)g_hFontTitle, TRUE);

            g_hDriveText = CreateWindow(L"STATIC", L"正在读取系统 C 盘容量...", WS_CHILD | WS_VISIBLE, 24, 52, 650, 20, hWnd, NULL, NULL, NULL);
            SendMessage(g_hDriveText, WM_SETFONT, (WPARAM)g_hFontMain, TRUE);

            g_hProgress = CreateWindow(PROGRESS_CLASS, NULL, WS_CHILD | WS_VISIBLE | PBS_SMOOTH, 24, 78, 650, 18, hWnd, (HMENU)ID_PROGRESS, NULL, NULL);

            g_hBtnClean = CreateWindow(L"BUTTON", L"★ 一键极速清理 C 盘垃圾", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON, 24, 110, 220, 38, hWnd, (HMENU)ID_BTN_CLEAN, NULL, NULL);
            SendMessage(g_hBtnClean, WM_SETFONT, (WPARAM)g_hFontBold, TRUE);

            g_hBtnRefresh = CreateWindow(L"BUTTON", L"刷新状态", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON, 254, 110, 100, 38, hWnd, (HMENU)ID_BTN_REFRESH, NULL, NULL);
            SendMessage(g_hBtnRefresh, WM_SETFONT, (WPARAM)g_hFontMain, TRUE);

            g_hBtnSchedule = CreateWindow(L"BUTTON", L"设置每日凌晨 03:00 定时清理", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON, 364, 110, 240, 38, hWnd, (HMENU)ID_BTN_SCHEDULE, NULL, NULL);
            SendMessage(g_hBtnSchedule, WM_SETFONT, (WPARAM)g_hFontMain, TRUE);

            g_hStatusText = CreateWindow(L"STATIC", L"状态: 就绪 · 安全白名单守护已生效（严格避让微信/QQ聊天记录、桌面文档与工程文件）", WS_CHILD | WS_VISIBLE, 24, 158, 650, 18, hWnd, NULL, NULL, NULL);
            SendMessage(g_hStatusText, WM_SETFONT, (WPARAM)g_hFontMain, TRUE);

            g_hEditLog = CreateWindow(L"EDIT", L"", WS_CHILD | WS_VISIBLE | WS_VSCROLL | ES_MULTILINE | ES_AUTOVSCROLL | ES_READONLY, 24, 184, 650, 280, hWnd, (HMENU)ID_EDIT_LOG, NULL, NULL);
            SendMessage(g_hEditLog, WM_SETFONT, (WPARAM)g_hFontMono, TRUE);

            UpdateDiskInfo();
            break;
        }

        case WM_COMMAND: {
            int wmId = LOWORD(wParam);
            if (wmId == ID_BTN_CLEAN) {
                CreateThread(NULL, 0, CleanThreadProc, NULL, 0, NULL);
            } else if (wmId == ID_BTN_REFRESH) {
                UpdateDiskInfo();
            } else if (wmId == ID_BTN_SCHEDULE) {
                RegisterScheduledTask();
            }
            break;
        }

        case WM_CTLCOLORSTATIC: {
            HDC hdcStatic = (HDC)wParam;
            SetBkColor(hdcStatic, RGB(248, 250, 252));
            return (LRESULT)GetStockObject(NULL_BRUSH);
        }

        case WM_DESTROY:
            PostQuitMessage(0);
            break;

        default:
            return DefWindowProc(hWnd, message, wParam, lParam);
    }
    return 0;
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    // 检查命令行参数
    int argc;
    LPWSTR* argv = CommandLineToArgvW(GetCommandLine(), &argc);
    if (argc > 1 && (wcscmp(argv[1], L"/silent") == 0 || wcscmp(argv[1], L"-silent") == 0)) {
        SilentCleanMode();
        return 0;
    }

    // 检查管理员提权
    if (!IsElevated()) {
        RequestAdminRelaunch();
        return 0;
    }

    const wchar_t CLASS_NAME[] = L"WinCleanProWindowClass";
    WNDCLASS wc = { 0 };
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = CLASS_NAME;
    wc.hbrBackground = CreateSolidBrush(RGB(248, 250, 252));
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hIcon = LoadIcon(NULL, IDI_SHIELD);

    RegisterClass(&wc);

    g_hWnd = CreateWindowEx(
        WS_EX_CLIENTEDGE,
        CLASS_NAME,
        L"WinClean Pro - Windows C 盘智能自动清理大师",
        WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
        CW_USEDEFAULT, CW_USEDEFAULT, 715, 520,
        NULL, NULL, hInstance, NULL
    );

    if (g_hWnd == NULL) return 0;

    ShowWindow(g_hWnd, nCmdShow);
    UpdateWindow(g_hWnd);

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return (int)msg.wParam;
}
