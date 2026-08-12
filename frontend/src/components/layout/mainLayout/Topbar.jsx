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

export default function Topbar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '';

  return (
    <div className={`w-full h-16 flex items-center justify-between border-b pl-4`} style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
      <h1 className="text-lg font-semibold tracking-wider">{title}</h1>

      <div className="flex items-center">
        <Avatar />
      </div>
    </div>
  );
}