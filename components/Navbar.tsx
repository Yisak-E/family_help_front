'use client';
// components/Navbar.tsx

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const links = [
    { href: '/dashboard', label: '🏠 Dashboard' },
    { href: '/offers',    label: '🤝 Browse Offers' },
    { href: '/requests',  label: '📋 My Requests' },
    { href: '/history',   label: '📜 History' },
    { href: '/profile',   label: '👤 Profile' },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/dashboard" className="navbar-brand">
          Family<span>Help</span>UAE
        </Link>

        <div className="navbar-links">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${pathname === l.href ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <button onClick={handleLogout} className="nav-link danger btn-ghost btn">
              🚪 Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
