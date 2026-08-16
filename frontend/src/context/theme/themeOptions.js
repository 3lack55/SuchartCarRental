export const STORAGE_THEME_ID_KEY = 'suchart-primary-theme-id';
export const STORAGE_MODE_KEY = 'suchart-theme-mode';

export const themes = [
  {
    id: 'blue',
    name: 'Blue',
    swatch: '#2563eb', // สีคงที่สำหรับแสดงใน color picker ทุกโหมด
    value: { light: '#2563eb', dark: '#2563eb', cream: '#2563eb' },
    soft: { light: '#1249BF', dark: '#1249BF', cream: '#1249BF' },
  },
  {
    id: 'green',
    name: 'Green',
    swatch: '#16a34a',
    value: { light: '#16a34a', dark: '#16a34a', cream: '#16a34a' },
    soft: { light: '#0E672F', dark: '#0E672F', cream: '#0E672F' },
  },
  {
    id: 'amber',
    name: 'Amber',
    swatch: '#f59e0b',
    value: { light: '#f59e0b', dark: '#d97706', cream: '#d97706' },
    soft: { light: '#C98208', dark: '#9F5704', cream: '#9F5704' },
  },
  {
    id: 'rose',
    name: 'Rose',
    swatch: '#ef4444',
    value: { light: '#ef4444', dark: '#be123c', cream: '#be123c' },
    soft: { light: '#C01111', dark: '#950E30', cream: '#950E30' },
  },
  {
    id: 'violet',
    name: 'Violet',
    swatch: '#7c3aed',
    value: { light: '#7c3aed', dark: '#7c3aed', cream: '#7c3aed' },
    soft: { light: '#5112BF', dark: '#5112BF', cream: '#5112BF' },
  },
  {
    id: 'cream',
    name: 'Cream Brown',
    swatch: '#5B4636',
    value: { light: '#5B4636', dark: '#4A3524', cream: '#4A3524' },
    soft: { light: '#6B5236', dark: '#5e4531', cream: '#5e4531' },
  },
];

export const themeModes = [
  { id: 'light', name: 'Light', value: 'light' },
  { id: 'dark', name: 'Dark', value: 'dark' },
  { id: 'cream', name: 'Cream', value: 'cream' },
];

export const defaultThemeId = themes[0].id;