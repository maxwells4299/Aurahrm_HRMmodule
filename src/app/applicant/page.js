'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  Upload, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';

export default function ApplicantDashboardPage() {
  const [session, setSession] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Offer acceptance signature state
  const [signatureName, setSignatureName] = useState('');
  const [acceptingOffer, setAcceptingOffer] = useState(false);

  // File upload state for onboarding tasks
  const [uploadingTaskId, setUploadingTaskId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Verify session
        const sessRes = await fetch('/api/auth/session');
        const sessData = await sessRes.json();
        
        if (!sessData.session) {
          setLoading(false);
          return;
        }
        setSession(sessData.session);

        // Fetch applications for this user
        const appsRes = await fetch('/api/applicants/my-applications');
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData);
          if (appsData.length > 0) {
            setSelectedAppId(appsData[0].id);
          }
        } else {
          setError('Failed to retrieve your application records.');
        }
      } catch (err) {
        console.error('Error loading applicant workspace:', err);
        setError('An unexpected error occurred while loading your portal.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0];

  // Helper to calculate stage progress percentage
  const getStageStep = (status) => {
    switch (status) {
      case 'RECEIVED': return 1;
      case 'APPLIED': return 1;
      case 'BOARD_REVIEW': return 2;
      case 'SHORTLISTED': return 2;
      case 'INTERVIEW_SCHEDULED': return 3;
      case 'INTERVIEW_CONDUCTED': return 3;
      case 'OFFER_PREPARING': return 4;
      case 'OFFER_SENT': return 4;
      case 'OFFER_ISSUED': return 4;
      case 'OFFER_ACCEPTED': return 5;
      case 'DOCUMENTS_RECEIVED': return 5;
      case 'ONBOARDING': return 5;
      case 'COMPLETED': return 6;
      case 'REJECTED': return -1;
      default: return 1;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'OFFER_ACCEPTED':
      case 'ONBOARDING':
        return 'var(--color-completed)';
      case 'OFFER_ISSUED':
      case 'OFFER_SENT':
      case 'SHORTLISTED':
        return 'var(--color-offer-issued)';
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_CONDUCTED':
        return 'var(--color-scheduled)';
      case 'REJECTED':
        return 'var(--color-rejected)';
      default:
        return 'var(--secondary)';
    }
  };

  const handleAcceptOffer = async (e) => {
    e.preventDefault();
    if (!selectedApp || !signatureName.trim()) return;

    try {
      setAcceptingOffer(true);
      const res = await fetch(`/api/applicants/${selectedApp.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'OFFER_ACCEPTED',
          signedName: signatureName
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setApplications(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
        setSignatureName('');
      } else {
        alert('Failed to sign and submit offer. Please try again.');
      }
    } catch (err) {
      console.error('Error signing offer:', err);
      alert('Network error while signing offer.');
    } finally {
      setAcceptingOffer(false);
    }
  };

  const handleFileUpload = async (taskId, file) => {
    if (!file || !selectedApp) return;

    try {
      setUploadingTaskId(taskId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicantId', selectedApp.id);
      formData.append('taskId', taskId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        // Update task file url
        const taskRes = await fetch(`/api/applicants/${selectedApp.id}/onboarding`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, fileUrl: data.fileUrl, status: 'COMPLETED' })
        });

        if (taskRes.ok) {
          const updatedApp = await taskRes.json();
          setApplications(prev => prev.map(a => a.id === updatedApp.id ? { ...a, ...updatedApp } : a));
        }
      } else {
        alert('File upload failed. Please verify file format.');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('File upload failed.');
    } finally {
      setUploadingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={36} className="pulse-glow" style={{ margin: '0 auto 16px auto', color: 'var(--primary)' }} />
          <h3>Accessing Candidate Portal Workspace...</h3>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <User size={48} style={{ color: 'var(--primary)', margin: '0 auto 16px auto' }} />
          <h2>Candidate Workspace Sign In</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px', fontSize: '0.9rem' }}>
            Please sign in to your applicant account to view your applications, interview schedules, and onboarding documents.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/login" className="btn btn-primary">Sign In</Link>
            <Link href="/register" className="btn btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      
      {/* Portal Banner Header */}
      <div style={{
        backgroundColor: 'var(--bg-canvas)',
        border: '1px solid var(--border-mute)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="status-badge badge-applied" style={{ fontSize: '0.7rem' }}>CANDIDATE PORTAL</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{session.email}</span>
          </div>
          <h1 style={{ fontSize: '2rem', marginTop: '6px', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Welcome back, candidate
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Track active recruitment status, view scheduled panel interviews, and complete onboarding requirements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/jobs" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={16} />
            Browse Openings
          </Link>
          <Link href="/track" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} />
            Lookup by Tracking ID
          </Link>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Briefcase size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto' }} />
          <h3>No Submitted Applications Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '460px', margin: '6px auto 24px auto' }}>
            You haven't submitted any job applications yet using <strong>{session.email}</strong>. Explore our active careers page and apply today!
          </p>
          <Link href="/jobs" className="btn btn-primary">
            Explore Open Positions
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          
          {/* Applications Sidebar List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>Your Submitted Applications ({applications.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applications.map(app => {
                const isSelected = app.id === selectedApp?.id;
                const statusColor = getStatusColor(app.status);

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    style={{
                      padding: '18px 20px',
                      backgroundColor: 'var(--bg-canvas)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-mute)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>{app.id}</span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'var(--bg-base)', color: statusColor, fontWeight: '700' }}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: '2px 0' }}>{app.job?.title || 'Job Opening'}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.job?.department || 'Department'}</span>

                    <div style={{ borderTop: '1px dashed var(--border-mute)', paddingTop: '8px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      <ChevronRight size={14} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Details Workspace */}
          {selectedApp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Main Card Header */}
              <div className="glass-panel" style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tracking ID: <strong>{selectedApp.id}</strong></span>
                    <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginTop: '4px' }}>{selectedApp.job?.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                      {selectedApp.job?.department} · {selectedApp.job?.location} ({selectedApp.job?.type})
                    </p>
                  </div>
                  <span className="status-badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '6px 14px', fontSize: '0.8rem' }}>
                    {selectedApp.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress Pipeline Stepper */}
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-mute)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Recruitment Pipeline Progress</span>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', position: 'relative' }}>
                    
                    {/* Stepper Bar Background */}
                    <div style={{ position: 'absolute', top: '16px', left: '20px', right: '20px', height: '3px', backgroundColor: 'var(--border-mute)', zIndex: 0 }} />

                    {/* Stepper Node 1 */}
                    <div style={{ zIndex: 1, textAlign: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: getStageStep(selectedApp.status) >= 1 ? 'var(--primary)' : 'var(--bg-canvas)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: getStageStep(selectedApp.status) >= 1 ? '#ffffff' : 'var(--text-muted)', margin: '0 auto', fontSize: '0.8rem', fontWeight: '700' }}>
                        1
                      </div>
                      <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '6px', color: 'var(--text-primary)', fontWeight: '600' }}>Applied</span>
                    </div>

                    {/* Stepper Node 2 */}
                    <div style={{ zIndex: 1, textAlign: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: getStageStep(selectedApp.status) >= 2 ? 'var(--primary)' : 'var(--bg-canvas)', border: `2px solid ${getStageStep(selectedApp.status) >= 2 ? 'var(--primary)' : 'var(--border-mute)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getStageStep(selectedApp.status) >= 2 ? '#ffffff' : 'var(--text-muted)', margin: '0 auto', fontSize: '0.8rem', fontWeight: '700' }}>
                        2
                      </div>
                      <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '6px', color: 'var(--text-primary)', fontWeight: '600' }}>Review</span>
                    </div>

                    {/* Stepper Node 3 */}
                    <div style={{ zIndex: 1, textAlign: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: getStageStep(selectedApp.status) >= 3 ? 'var(--primary)' : 'var(--bg-canvas)', border: `2px solid ${getStageStep(selectedApp.status) >= 3 ? 'var(--primary)' : 'var(--border-mute)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getStageStep(selectedApp.status) >= 3 ? '#ffffff' : 'var(--text-muted)', margin: '0 auto', fontSize: '0.8rem', fontWeight: '700' }}>
                        3
                      </div>
                      <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '6px', color: 'var(--text-primary)', fontWeight: '600' }}>Interview</span>
                    </div>

                    {/* Stepper Node 4 */}
                    <div style={{ zIndex: 1, textAlign: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: getStageStep(selectedApp.status) >= 4 ? 'var(--primary)' : 'var(--bg-canvas)', border: `2px solid ${getStageStep(selectedApp.status) >= 4 ? 'var(--primary)' : 'var(--border-mute)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getStageStep(selectedApp.status) >= 4 ? '#ffffff' : 'var(--text-muted)', margin: '0 auto', fontSize: '0.8rem', fontWeight: '700' }}>
                        4
                      </div>
                      <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '6px', color: 'var(--text-primary)', fontWeight: '600' }}>Offer</span>
                    </div>

                    {/* Stepper Node 5 */}
                    <div style={{ zIndex: 1, textAlign: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: getStageStep(selectedApp.status) >= 5 ? 'var(--color-completed)' : 'var(--bg-canvas)', border: `2px solid ${getStageStep(selectedApp.status) >= 5 ? 'var(--color-completed)' : 'var(--border-mute)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getStageStep(selectedApp.status) >= 5 ? '#ffffff' : 'var(--text-muted)', margin: '0 auto', fontSize: '0.8rem', fontWeight: '700' }}>
                        5
                      </div>
                      <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '6px', color: 'var(--text-primary)', fontWeight: '600' }}>Onboarding</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduled Interview Card */}
              {selectedApp.interviewDate && (
                <div className="glass-panel" style={{ padding: '24px 32px', borderLeft: '4px solid var(--secondary)' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Calendar size={18} style={{ color: 'var(--secondary)' }} />
                    Scheduled Panel Interview
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                      <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px' }}>
                        {new Date(selectedApp.interviewDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Interviewer / Panel Lead:</span>
                      <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px' }}>
                        {selectedApp.interviewer || 'HR Panel Assigned'}
                      </p>
                    </div>
                  </div>
                  {selectedApp.interviewNotes && (
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--border-mute)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>HR Instructions:</strong> {selectedApp.interviewNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Digital Offer Acceptance Panel */}
              {(selectedApp.status === 'OFFER_ISSUED' || selectedApp.status === 'OFFER_ACCEPTED') && (
                <div className="glass-panel" style={{ padding: '28px 32px', borderLeft: '4px solid var(--color-completed)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={20} style={{ color: 'var(--color-completed)' }} />
                      Employment Offer Terms
                    </h3>
                    <span className="status-badge badge-completed" style={{ fontSize: '0.7rem' }}>
                      {selectedApp.status === 'OFFER_ACCEPTED' ? 'SIGNED & ACCEPTED' : 'AWAITING SIGNATURE'}
                    </span>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-mute)', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem', marginBottom: '20px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Offered Annual Compensation:</span>
                      <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-completed)', marginTop: '2px' }}>
                        ${selectedApp.salaryOffered?.toLocaleString()} / year
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Proposed Start Date:</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
                        {selectedApp.startDate ? new Date(selectedApp.startDate).toLocaleDateString() : 'Immediate'}
                      </p>
                    </div>
                  </div>

                  {selectedApp.status === 'OFFER_ISSUED' ? (
                    <form onSubmit={handleAcceptOffer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                        Type your Full Legal Name to digitally sign & accept position:
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={acceptingOffer}>
                          {acceptingOffer ? 'Signing...' : 'Accept & Sign Offer'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', color: 'var(--color-completed)', fontSize: '0.85rem', fontWeight: '600' }}>
                      ✓ Offer accepted and digitally signed on {selectedApp.signedAt ? new Date(selectedApp.signedAt).toLocaleDateString() : new Date().toLocaleDateString()}.
                    </div>
                  )}
                </div>
              )}

              {/* Onboarding Requirements Tracker */}
              {(selectedApp.status === 'OFFER_ACCEPTED' || selectedApp.status === 'DOCUMENTS_RECEIVED' || selectedApp.status === 'ONBOARDING' || selectedApp.status === 'COMPLETED') && (
                <div className="glass-panel" style={{ padding: '28px 32px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                    Onboarding Verification Checklist
                  </h3>

                  {selectedApp.onboardingTasks?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending onboarding documents assigned by HR.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedApp.onboardingTasks?.map(task => (
                        <div
                          key={task.id}
                          style={{
                            padding: '16px 20px',
                            backgroundColor: 'var(--bg-canvas)',
                            border: '1px solid var(--border-mute)',
                            borderRadius: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>{task.title}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{task.description}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {task.status === 'COMPLETED' ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-completed)', fontSize: '0.8rem', fontWeight: '700' }}>
                                <CheckCircle2 size={16} />
                                Uploaded
                              </span>
                            ) : (
                              <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Upload size={14} />
                                {uploadingTaskId === task.id ? 'Uploading...' : 'Upload File'}
                                <input
                                  type="file"
                                  hidden
                                  disabled={uploadingTaskId === task.id}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileUpload(task.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submitted File Attachments Summary */}
              <div className="glass-panel" style={{ padding: '24px 32px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Application Credentials</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
                  <a href={selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-mute)', borderRadius: '8px', color: 'var(--secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} />
                    View Submitted Resume
                  </a>
                  <a href={selectedApp.transcriptUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-mute)', borderRadius: '8px', color: 'var(--secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} />
                    View Academic Transcript
                  </a>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
