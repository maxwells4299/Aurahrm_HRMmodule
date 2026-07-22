'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, Briefcase, FileSearch, Calendar, 
  Layers, ShieldAlert, DollarSign, LogOut, KeyRound 
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    }
    checkSession();
  }, [pathname]); // Refresh session check on page changes

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setSession(null);
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Determine role configurations
  const isHRAdmin = session?.role === 'HR_ADMIN';

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '16px',
      margin: '0 24px 24px 24px',
      zIndex: 100,
      borderRadius: '12px',
      padding: '8px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      border: '1px solid var(--border-mute)',
      backgroundColor: 'var(--bg-surface)'
    }}>
      {/* Brand Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'var(--font-display)'
        }}>
          A
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: '700',
          fontSize: '1.25rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>
          Aura<span style={{ color: 'var(--secondary)' }}>HRM</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {!isHRAdmin ? (
          <>
            <Link 
              href="/jobs" 
              className="btn" 
              style={{
                background: pathname === '/jobs' || pathname?.startsWith('/jobs/apply') ? 'var(--primary-glow)' : 'transparent',
                color: pathname === '/jobs' || pathname?.startsWith('/jobs/apply') ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <Briefcase size={16} />
              Careers
            </Link>
            <Link 
              href="/track" 
              className="btn" 
              style={{
                background: pathname?.startsWith('/track') ? 'var(--primary-glow)' : 'transparent',
                color: pathname?.startsWith('/track') ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <FileSearch size={16} />
              Track Application
            </Link>
          </>
        ) : (
          <>
            <Link 
              href="/admin" 
              className="btn" 
              style={{
                background: pathname === '/admin' ? 'var(--primary-glow)' : 'transparent',
                color: pathname === '/admin' ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <Layers size={16} />
              Dashboard
            </Link>
            <Link 
              href="/admin/jobs" 
              className="btn" 
              style={{
                background: pathname?.startsWith('/admin/jobs') ? 'var(--primary-glow)' : 'transparent',
                color: pathname?.startsWith('/admin/jobs') ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <Briefcase size={16} />
              Openings
            </Link>
            <Link 
              href="/admin/applicants" 
              className="btn" 
              style={{
                background: pathname?.startsWith('/admin/applicants') ? 'var(--primary-glow)' : 'transparent',
                color: pathname?.startsWith('/admin/applicants') ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <Users size={16} />
              Hiring Pipeline
            </Link>
            <Link 
              href="/admin/employees" 
              className="btn" 
              style={{
                background: pathname?.startsWith('/admin/employees') ? 'var(--primary-glow)' : 'transparent',
                color: pathname?.startsWith('/admin/employees') ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <Users size={16} />
              Directory
            </Link>
            <Link 
              href="/admin/leaves" 
              className="btn" 
              style={{
                background: pathname?.startsWith('/admin/leaves') ? 'var(--primary-glow)' : 'transparent',
                color: pathname?.startsWith('/admin/leaves') ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <Calendar size={16} />
              Leaves
            </Link>
            <Link 
              href="/admin/payroll" 
              className="btn" 
              style={{
                background: pathname?.startsWith('/admin/payroll') ? 'var(--primary-glow)' : 'transparent',
                color: pathname?.startsWith('/admin/payroll') ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <DollarSign size={16} />
              Payroll
            </Link>
          </>
        )}
      </div>

      {/* User Session Profile & Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '500' }}>{session.email}</span>
              <span className={`status-badge ${
                session.role === 'HR_ADMIN' ? 'badge-completed' : session.role === 'EMPLOYEE' ? 'badge-shortlisted' : 'badge-applied'
              }`} style={{ fontSize: '0.58rem', padding: '1px 6px' }}>
                {session.role === 'HR_ADMIN' ? 'Admin' : session.role === 'EMPLOYEE' ? 'Employee' : 'Applicant'}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="status-badge"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              cursor: 'pointer',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}
          >
            <KeyRound size={14} />
            Portal Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
