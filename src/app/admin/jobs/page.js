'use client';

import { useState, useEffect } from 'react';
import { Briefcase, PlusCircle, X, MapPin, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';

export default function AdminJobsManager() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    location: '',
    type: 'Full-time',
    salaryRange: '',
    description: '',
    requirements: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs?status=All');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create job');
      }

      // Reset
      setShowAddForm(false);
      setNewJob({
        title: '',
        department: 'Engineering',
        location: '',
        type: 'Full-time',
        salaryRange: '',
        description: '',
        requirements: ''
      });
      await loadJobs();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error creating job opening.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Briefcase size={32} style={{ color: 'var(--primary)' }} />
            Manage Job Openings
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Create and edit job specifications. Active postings will show up immediately in the Career portal.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          <PlusCircle size={16} />
          Post New Job
        </button>
      </div>

      {/* Jobs grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          <span>Accessing active postings registry...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Briefcase size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
          <h3>No job openings found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Click 'Post New Job' to release your first job advertisement.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {jobs.map((job) => (
            <div key={job.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              
              {/* Upper Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="status-badge" style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    fontSize: '0.7rem',
                    marginBottom: '6px'
                  }}>
                    {job.department}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', marginTop: '4px' }}>{job.title}</h3>
                </div>
                
                <span className={`status-badge badge-${job.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                  {job.status}
                </span>
              </div>

              {/* Specs info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--border-mute)',
                paddingTop: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} style={{ color: 'var(--secondary)' }} />
                  <span>{job.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} style={{ color: 'var(--secondary)' }} />
                  <span>{job.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={14} style={{ color: 'var(--secondary)' }} />
                  <span>{job.salaryRange}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-mute)', paddingTop: '10px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    <Users size={12} />
                    {job._count?.applicants || 0} Applicants
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      {showAddForm && (
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
              maxWidth: '620px',
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
              onClick={() => setShowAddForm(false)}
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
              <div style={{ borderBottom: '1px solid var(--border-mute)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Post New Job Opening</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Define the role parameters. Once created, candidates can view and apply for it immediately.
                </p>
              </div>

              <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Job Title</label>
                  <input 
                    type="text" 
                    name="title"
                    required
                    placeholder="e.g. Lead Database Architect"
                    value={newJob.title}
                    onChange={handleInputChange}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Department</label>
                    <select 
                      name="department"
                      value={newJob.department}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Location</label>
                    <input 
                      type="text" 
                      name="location"
                      required
                      placeholder="e.g. Remote, or New York, NY"
                      value={newJob.location}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Job Type</label>
                    <select 
                      name="type"
                      value={newJob.type}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Salary Range</label>
                    <input 
                      type="text" 
                      name="salaryRange"
                      required
                      placeholder="e.g. $80,000 - $105,000"
                      value={newJob.salaryRange}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Job Description</label>
                  <textarea 
                    name="description"
                    required
                    rows={4}
                    placeholder="Enter detailed description of responsibilities..."
                    value={newJob.description}
                    onChange={handleInputChange}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Key Requirements (Separate by semicolons ';')</label>
                  <textarea 
                    name="requirements"
                    required
                    rows={3}
                    placeholder="Requirement 1; Requirement 2; Requirement 3"
                    value={newJob.requirements}
                    onChange={handleInputChange}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                    {submitting ? 'Posting...' : 'Publish Job opening'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 0.5 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
