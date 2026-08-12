import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { STORAGE_MODE_KEY, STORAGE_THEME_ID_KEY, themeModes, themes, defaultThemeId } from './themeOptions';

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    if (typeof window === 'undefined') return defaultThemeId;
    return localStorage.getItem(STORAGE_THEME_ID_KEY) || defaultThemeId;
  });

  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem(STORAGE_MODE_KEY) || 'light';
  });

  const currentTheme = useMemo(
    () => themes.find((theme) => theme.id === themeId) ?? themes[0],
    [themeId]
  );

  const themeColor = currentTheme.value[themeMode];
  const themeSoft = currentTheme.soft?.[themeMode] ?? (themeMode === 'dark' ? '#1e293b' : '#e0f2fe');

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeColor);
    root.style.setProperty('--primary-color-soft', themeSoft);
    root.style.setProperty('--page-bg', themeMode === 'dark' ? '#111827' : themeMode === 'cream' ? '#f5f3ef' : '#f9fafb');
    root.style.setProperty('--page-text', themeMode === 'dark' ? '#f8fafc' : themeMode === 'cream' ? '#5b4636' : '#111827');
    root.style.setProperty('--surface', themeMode === 'dark' ? '#0f172a' : themeMode === 'cream' ? '#fff7ee' : '#ffffff');
    root.style.setProperty('--surface-soft', themeMode === 'dark' ? '#1f2937' : themeMode === 'cream' ? '#f6ebe0' : '#f8fafc');
    // แก้: dark เดิม '#111827' ซ้ำกับ --surface ทำให้ active state กลืนพื้นหลัง เปลี่ยนเป็นสว่างกว่า surface-soft อีกขั้น
    root.style.setProperty('--surface-strong', themeMode === 'dark' ? '#2a3441' : themeMode === 'cream' ? '#e4d1c2' : '#e5e7eb');
    // แก้: เพิ่ม opacity จาก 0.08 -> 0.14 ให้ขอบการ์ดเห็นชัดขึ้นบนพื้นมืด
    root.style.setProperty('--surface-border', themeMode === 'dark' ? 'rgba(255,255,255,0.14)' : themeMode === 'cream' ? '#dac4ae' : '#d1d5db');
    root.style.setProperty('--status-warning', themeMode === 'dark' ? '#fb923c' : '#f97316');
    root.style.setProperty('--status-warning-soft', themeMode === 'dark' ? '#7c2d12' : '#ffedd5');
    root.style.setProperty('--status-danger', themeMode === 'dark' ? '#fca5a5' : '#dc2626');
    root.style.setProperty('--status-danger-soft', themeMode === 'dark' ? '#4b1010' : '#fee2e2');
    root.style.setProperty('--status-success', themeMode === 'dark' ? '#4ade80' : '#16a34a');
    root.style.setProperty('--status-success-soft', themeMode === 'dark' ? '#166534' : '#dcfce7');
    root.style.setProperty('--avatar-hover-bg', themeMode === 'dark' ? '#1f2937' : themeMode === 'cream' ? '#f3e5d9' : '#eeeeee');
    root.setAttribute('data-theme', themeMode);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_THEME_ID_KEY, themeId);
      localStorage.setItem(STORAGE_MODE_KEY, themeMode);
    }
  }, [themeColor, themeMode, themeId, themeSoft]);

  const value = useMemo(
    () => ({
      themes,
      themeModes,
      themeId,
      themeColor,
      themeMode,
      themeName: currentTheme.name,
      setTheme: (nextThemeId) => {
        if (themes.some((theme) => theme.id === nextThemeId)) {
          setThemeId(nextThemeId);
        }
      },
      setMode: (nextMode) => setThemeMode(nextMode),
    }),
    [themeColor, themeId, themeMode, currentTheme.name]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}