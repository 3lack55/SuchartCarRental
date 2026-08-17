import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Avatar from './Avatar';

const pageTitles = {
  '/overview': 'ภาพรวม',
  '/drivers': 'คนขับ',
  '/vehicles': 'รถยนต์',
  '/reports': 'พรบ ภาษี และประกัน',
  '/maintenance': 'บันทึกการซ่อมบำรุง',
  '/violations': 'บันทึกการฝ่าฝืนกฎจราจร',
};

export default function Topbar({ onOpenMobileNav }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '';

  return (
    <header className={`w-full h-16 flex items-center justify-between gap-3 border-b pl-4 pr-4`} style={{ backgroundColor: 'var(--page-bg)', borderColor: 'var(--surface-border)' }}>
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="เปิดเมนู"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-opacity hover:opacity-70 md:hidden"
          style={{ color: 'var(--page-text)', backgroundColor: 'var(--surface-soft)' }}
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-lg font-semibold tracking-wider">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center">
        <Avatar />
      </div>
    </header>
  );
}