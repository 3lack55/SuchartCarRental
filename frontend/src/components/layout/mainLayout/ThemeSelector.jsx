import { useTheme } from '../../../context/theme/useTheme';

export default function ThemeSelector() {
  const { themes, themeModes, themeId, themeMode, setTheme, setMode } = useTheme();

  return (
    <div style={{ display: 'grid', gap: 12, color: 'var(--page-text)' }}>
      <div>
        <div style={{ marginBottom: 6, fontSize: 12, opacity: 0.75 }}>สีหลัก</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {themes.map((theme) => {
            const isActive = themeId === theme.id;
            // แก้: ใช้ theme.swatch (คงที่ทุกโหมด) แทน theme.value[themeMode]
            const color = theme.swatch;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setTheme(theme.id)}
                aria-label={`Select ${theme.name} theme`}
                title={theme.name}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: isActive ? '2px solid var(--primary-color)' : '2px solid var(--surface-border)',
                  background: color,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
                  transition: 'transform 150ms ease, box-shadow 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ marginBottom: 6, fontSize: 12, opacity: 0.75 }}>โหมด</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {themeModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setMode(mode.value)}
              style={{
                padding: '5px 10px',
                borderRadius: 999,
                border: '1px solid var(--surface-border)',
                background: themeMode === mode.value ? 'var(--primary-color)' : 'var(--surface-soft)',
                color: themeMode === mode.value ? '#ffffff' : 'var(--page-text)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {mode.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}