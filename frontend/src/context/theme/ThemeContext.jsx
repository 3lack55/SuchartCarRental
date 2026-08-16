import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { STORAGE_MODE_KEY, STORAGE_THEME_ID_KEY, themeModes, themes, defaultThemeId } from './themeOptions';

// คำนวณความสว่างสัมพัทธ์ของสี hex เพื่อเลือกสีตัวอักษร/ไอคอนที่อ่านง่ายเสมอ
// แก้ bug: เดิม panel ซ้าย/ปุ่ม submit ใช้ var(--page-text) ซ้อนบน var(--primary-color)
// ทำให้บางธีม (เช่น cream) สีตัวอักษรกลืนกับพื้นหลังจนมองไม่เห็น
function getRelativeLuminance(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.substring(0, 2), 16) / 255;
  const g = parseInt(full.substring(2, 4), 16) / 255;
  const b = parseInt(full.substring(4, 6), 16) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function getOnColor(hex, { soft } = {}) {
  const isLight = getRelativeLuminance(hex) > 0.5;
  if (soft) return isLight ? 'rgba(17,24,39,0.62)' : 'rgba(255,255,255,0.72)';
  return isLight ? '#171310' : '#ffffff';
}

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
  const themeSoft = currentTheme.soft[themeMode];

  // helper: convert hex or rgb string to "R,G,B" for use with rgba(var(--primary-color-rgb), a)
  const toRgbString = (color) => {
    if (!color) return '0,0,0';
    const c = color.trim();
    if (c.startsWith('rgb')) {
      // rgb(a) -> extract numbers
      const nums = c.replace(/rgba?\(|\)|\s/g, '').split(',').slice(0, 3);
      return nums.join(',');
    }
    if (c.startsWith('#')) {
      let hex = c.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map((h) => h + h).join('');
      }
      const int = parseInt(hex, 16);
      const r = (int >> 16) & 255;
      const g = (int >> 8) & 255;
      const b = int & 255;
      return `${r},${g},${b}`;
    }
    return '0,0,0';
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeColor);
    root.style.setProperty('--primary-color-rgb', toRgbString(themeColor));
    root.style.setProperty('--primary-color-soft', themeSoft);
    root.style.setProperty('--page-bg', themeMode === 'dark' ? '#111827' : themeMode === 'cream' ? '#F4EBDC' : '#f9fafb');
    root.style.setProperty('--page-text', themeMode === 'dark' ? '#f8fafc' : themeMode === 'cream' ? '#5b4636' : '#111827');
    root.style.setProperty('--sub-text', themeMode === 'dark' ? '#f8fafc' : themeMode === 'cream' ? '#8A7660' : '#111827');
    root.style.setProperty('--surface', themeMode === 'dark' ? '#0f172a' : themeMode === 'cream' ? '#fff7ee' : '#ffffff');
    root.style.setProperty('--surface-soft', themeMode === 'dark' ? '#1f2937' : themeMode === 'cream' ? '#f6ebe0' : '#f8fafc');
    // แก้: dark เดิม '#111827' ซ้ำกับ --surface ทำให้ active state กลืนพื้นหลัง เปลี่ยนเป็นสว่างกว่า surface-soft อีกขั้น
    root.style.setProperty('--surface-strong', themeMode === 'dark' ? '#2a3441' : themeMode === 'cream' ? '#5e4531' : '#e5e7eb');
    // แก้: เพิ่ม opacity จาก 0.08 -> 0.14 ให้ขอบการ์ดเห็นชัดขึ้นบนพื้นมืด
    root.style.setProperty('--surface-border', themeMode === 'dark' ? 'rgba(255,255,255,0.14)' : themeMode === 'cream' ? '#624A38' : '#d1d5db');
    root.style.setProperty('--status-warning', themeMode === 'dark' ? '#fb923c' : '#f97316');
    root.style.setProperty('--status-warning-soft', themeMode === 'dark' ? '#7c2d12' : '#ffedd5');
    root.style.setProperty('--status-danger', themeMode === 'dark' ? '#fca5a5' : '#dc2626');
    root.style.setProperty('--status-danger-soft', themeMode === 'dark' ? '#4b1010' : '#fee2e2');
    root.style.setProperty('--status-success', themeMode === 'dark' ? '#4ade80' : '#16a34a');
    root.style.setProperty('--status-success-soft', themeMode === 'dark' ? '#166534' : '#dcfce7');
    root.style.setProperty('--avatar-hover-bg', themeMode === 'dark' ? '#1f2937' : themeMode === 'cream' ? '#f3e5d9' : '#eeeeee');

    // สีที่ "อยู่บน" พื้น primary-color เสมอ (เช่น แผงแบรนด์ด้านซ้าย, ปุ่ม submit)
    // คำนวณจาก luminance จริงของ themeColor แต่ละธีม/โหมด แทนการเดาสีตายตัว
    const onPrimary = getOnColor(themeColor);
    root.style.setProperty('--on-primary', onPrimary);
    root.style.setProperty('--on-primary-soft', themeMode === 'dark' ? '#f8fafc' : themeMode === 'cream' ? '#E3D5BE' : '#111827');
    root.style.setProperty('--button-text', onPrimary);

    // สีไอคอนแบบจางๆ ที่ปรับตามโหมด (เดิม hardcode rgba(0,0,0,..) ทำให้จมหายในโหมดมืด)
    root.style.setProperty(
      '--icon-muted',
      themeMode === 'dark' ? 'rgba(226,232,240,0.45)' : themeMode === 'cream' ? 'rgba(91,70,54,0.45)' : 'rgba(15,23,42,0.4)'
    );

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