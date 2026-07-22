'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, DollarSign, Clock, ArrowRight, X } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  // Departments list
  const departments = ['All', 'Engineering', 'Product', 'Human Resources'];

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs?status=OPEN`);
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesDept = selectedDept === 'All' || job.department === selectedDept;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      {/* Careers Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
          Shape the Future With Us
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Explore our open roles, submit your application, and track your hiring and onboarding progress in real-time.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel" style={{
        padding: '20px',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '12px'
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <input 
            type="text" 
            placeholder="Search open roles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-mute)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-mute)'}
          />
        </div>

        {/* Filter Categories */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className="btn"
              style={{
                background: selectedDept === dept ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-surface)',
                color: selectedDept === dept ? '#ffffff' : 'var(--text-secondary)',
                border: selectedDept === dept ? 'none' : '1px solid var(--border-mute)',
                padding: '8px 16px',
                fontSize: '0.8rem',
                borderRadius: '8px'
              }}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <div className="pulse-glow" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--primary)',
            borderTopColor: 'transparent',
            animation: 'spin 1s infinite linear',
            margin: '0 auto 16px auto'
          }} />
          <span>Searching for active opportunities...</span>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Briefcase size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
          <h3>No positions found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Try modifying your keywords or select another department.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredJobs.map((job) => (
            <div 
              key={job.id} 
              className="glass-panel glass-panel-hover" 
              style={{
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedJob(job)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="status-badge" style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  alignSelf: 'flex-start'
                }}>
                  {job.department}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{job.title}</h3>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '4px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} style={{ color: 'var(--secondary)' }} />
                    {job.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} style={{ color: 'var(--secondary)' }} />
                    {job.type}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={14} style={{ color: 'var(--secondary)' }} />
                    {job.salaryRange}
                  </span>
                </div>
              </div>

              <button className="btn btn-secondary" onClick={(e) => {
                e.stopPropagation();
                setSelectedJob(job);
              }}>
                View details
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(2, 4, 10, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div 
            className="glass-panel pulse-glow no-scrollbar" 
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              backgroundColor: 'var(--bg-canvas)',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              border: '1px solid var(--border-mute)'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedJob(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="status-badge" style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  alignSelf: 'flex-start'
                }}>
                  {selectedJob.department}
                </span>
                <h2 style={{ fontSize: '1.75rem', marginTop: '4px' }}>{selectedJob.title}</h2>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                  borderBottom: '1px solid var(--border-mute)',
                  paddingBottom: '16px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> {selectedJob.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {selectedJob.type}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={14} /> {selectedJob.salaryRange}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Role Description</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Key Requirements</h4>
                <ul style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.9rem', 
                  lineHeight: '1.6',
                  paddingLeft: '20px'
                }}>
                  {selectedJob.requirements.split(';').map((req, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{req.trim()}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-mute)', paddingTop: '20px' }}>
                <Link 
                  href={`/jobs/apply/${selectedJob.id}`}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Apply For This Job
                </Link>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedJob(null)}
                  style={{ flex: 0.5 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
