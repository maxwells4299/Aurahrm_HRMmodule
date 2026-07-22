import Link from 'next/link';
import { Briefcase, ShieldAlert, ArrowRight, CheckCircle, Clock, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '40px auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48px',
      padding: '0 20px'
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '8px 16px',
          borderRadius: '99px',
          fontSize: '0.85rem',
          fontWeight: '600',
          color: 'var(--primary)',
          margin: '0 auto'
        }}>
          <span>AURA ERP v2.0 - Human Resource Management Module</span>
        </div>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          lineHeight: '1.1',
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 50%, var(--secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '800',
          letterSpacing: '-0.03em'
        }}>
          Next-Generation Talent & HR Lifecycle Platform
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          maxWidth: '680px',
          margin: '0 auto'
        }}>
          Manage your enterprise workforce from a single workspace. Job openings, interview pipelines, visual applicant tracking, and leave administration, combined with glassmorphism aesthetics.
        </p>
      </div>

      {/* Main Portals Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        width: '100%',
        marginTop: '20px'
      }}>
        {/* Portal Card 1: Careers */}
        <div className="glass-panel glass-panel-hover" style={{
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--secondary)',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Career & Tracking Portal</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Browse our active job listings, apply in seconds, and track your recruitment stages in real-time. Know exactly where your application is at any moment.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={14} style={{ color: 'var(--secondary)' }} />
                <span>Search and filter open roles</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Clock size={14} style={{ color: 'var(--secondary)' }} />
                <span>Real-time status tracking widget</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <FileText size={14} style={{ color: 'var(--secondary)' }} />
                <span>Submit required onboarding documents</span>
              </div>
            </div>

            <Link href="/jobs" className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
              Enter Careers space
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Portal Card 2: HR Admin */}
        <div className="glass-panel glass-panel-hover" style={{
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>HR Management Hub</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Administer employee directories, review leaves, update recruitment stages, schedule interviews, and issue offer letters with standard onboarding task flows.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={14} style={{ color: 'var(--primary)' }} />
                <span>Pipeline Board (BPMN tracking)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Clock size={14} style={{ color: 'var(--primary)' }} />
                <span>Approve or reject leave requests</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <FileText size={14} style={{ color: 'var(--primary)' }} />
                <span>Simulated payroll directory</span>
              </div>
            </div>

            <Link href="/admin" className="btn btn-secondary" style={{ width: '100%', display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
              Enter HR Management
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
