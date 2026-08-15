export const STORAGE_THEME_ID_KEY = 'suchart-primary-theme-id';
export const STORAGE_MODE_KEY = 'suchart-theme-mode';

export const themes = [
  {
    id: 'blue',
    name: 'Blue',
    swatch: '#2563eb', // สีคงที่สำหรับแสดงใน color picker ทุกโหมด
    value: { light: '#2563eb', dark: '#60a5fa', cream: '#2563eb' },
    soft: { light: '#dbeafe', dark: '#1e293b', cream: '#eef2ff' },
  },
  {
    id: 'green',
    name: 'Green',
    swatch: '#16a34a',
    value: { light: '#16a34a', dark: '#22c55e', cream: '#16a34a' },
    soft: { light: '#d1fae5', dark: '#134e4a', cream: '#ecfdf5' },
  },
  {
    id: 'amber',
    name: 'Amber',
    swatch: '#f59e0b',
    value: { light: '#f59e0b', dark: '#facc15', cream: '#d97706' },
    soft: { light: '#fef3c7', dark: '#78350f', cream: '#ffedd5' },
  },
  {
    id: 'rose',
    name: 'Rose',
    swatch: '#ef4444',
    value: { light: '#ef4444', dark: '#fb7185', cream: '#be123c' },
    soft: { light: '#fee2e2', dark: '#881337', cream: '#ffe4e6' },
  },
  {
    id: 'violet',
    name: 'Violet',
    swatch: '#7c3aed',
    value: { light: '#7c3aed', dark: '#a78bfa', cream: '#7c3aed' },
    soft: { light: '#ede9fe', dark: '#4c1d95', cream: '#f5f3ff' },
  },
  {
    id: 'cream',
    name: 'Cream Brown',
    swatch: '#5B4636',
    value: { light: '#5B4636', dark: '#c9a67b', cream: '#4A3524' },
    soft: { light: '#f7efe7', dark: '#4a3528', cream: '#E3D5BE' },
  },
];

export const themeModes = [
  { id: 'light', name: 'Light', value: 'light' },
  { id: 'dark', name: 'Dark', value: 'dark' },
  { id: 'cream', name: 'Cream', value: 'cream' },
];

export const defaultThemeId = themes[0].id;