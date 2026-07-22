'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Users, Calendar, CheckCircle2, AlertCircle, FileText, 
  User, Check, X, ShieldAlert, Award, ArrowRight, DollarSign 
} from 'lucide-react';

function HiringPipelineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightedId = searchParams.get('id');

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  
  // Transition Form States
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    interviewDate: '',
    interviewer: '',
    interviewNotes: '',
  });

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    interviewNotes: '',
    interviewScore: 'Pass', // Pass or Fail
  });

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState({
    salaryOffered: '',
    startDate: '',
  });

  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    loadApplicants();
  }, []);

  useEffect(() => {
    if (highlightedId && applicants.length > 0) {
      const found = applicants.find(a => a.id === highlightedId);
      if (found) setSelectedApplicant(found);
    }
  }, [highlightedId, applicants]);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/applicants');
      if (res.ok) {
        const data = await res.json();
        setApplicants(data);
        // Refresh selected applicant if active
        if (selectedApplicant) {
          const updatedSelected = data.find(a => a.id === selectedApplicant.id);
          if (updatedSelected) setSelectedApplicant(updatedSelected);
        }
      }
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status, extraData = {}) => {
    setTransitioning(true);
    try {
      const res = await fetch(`/api/applicants/${selectedApplicant.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          ...extraData
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status.');
      }

      // Close modal forms
      setShowScheduleForm(false);
      setShowFeedbackForm(false);
      setShowOfferForm(false);
      
      // Reload records
      await loadApplicants();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error updating recruitment stage.');
    } finally {
      setTransitioning(false);
    }
  };

  // Group applicants into BPMN-based columns
  const columns = {
    RECEIVED: { title: 'Received', color: 'var(--text-secondary)', bg: 'rgba(156, 163, 175, 0.03)' },
    APPLIED: { title: 'Applied', color: 'var(--color-applied)', bg: 'rgba(59, 130, 246, 0.05)' },
    BOARD_REVIEW: { title: 'Board Review', color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.05)' },
    SHORTLISTED: { title: 'Shortlisted', color: 'var(--color-shortlisted)', bg: 'rgba(139, 92, 246, 0.05)' },
    INTERVIEWING: { title: 'Interviewing', color: 'var(--color-scheduled)', bg: 'rgba(234, 179, 8, 0.05)' },
    OFFER_PREP: { title: 'Offer Prep', color: 'var(--color-offer-prep)', bg: 'rgba(249, 115, 22, 0.04)' },
    OFFER_SENT: { title: 'Offer Sent', color: 'var(--color-offer-issued)', bg: 'rgba(6, 182, 212, 0.04)' },
    OFFER_EXTENDED: { title: 'Offer Extended', color: 'var(--accent)', bg: 'rgba(217, 70, 239, 0.04)' },
    DOCS_RECEIVED: { title: 'Docs Received', color: 'var(--secondary)', bg: 'rgba(6, 182, 212, 0.05)' },
    ONBOARDING: { title: 'Onboarding', color: 'var(--color-onboarding)', bg: 'rgba(16, 185, 129, 0.05)' },
    HIRED: { title: 'Hired', color: 'var(--color-completed)', bg: 'rgba(34, 197, 94, 0.05)' },
    REJECTED: { title: 'Rejected', color: 'var(--color-rejected)', bg: 'rgba(239, 68, 68, 0.03)' }
  };

  // Maps applicant database status to the correct column key
  const getColumnKey = (status) => {
    if (status === 'REJECTED') return 'REJECTED';
    if (status === 'COMPLETED') return 'HIRED';
    if (['INTERVIEW_SCHEDULED', 'INTERVIEW_CONDUCTED'].includes(status)) return 'INTERVIEWING';
    if (status === 'OFFER_PREPARING') return 'OFFER_PREP';
    if (status === 'OFFER_SENT') return 'OFFER_SENT';
    if (['OFFER_ISSUED', 'OFFER_ACCEPTED'].includes(status)) return 'OFFER_EXTENDED';
    if (status === 'DOCUMENTS_RECEIVED') return 'DOCS_RECEIVED';
    if (status === 'ONBOARDING') return 'ONBOARDING';
    return status; // RECEIVED, APPLIED, BOARD_REVIEW, SHORTLISTED
  };

  // Organize applicants by column
  const groupedApplicants = {
    RECEIVED: [],
    APPLIED: [],
    BOARD_REVIEW: [],
    SHORTLISTED: [],
    INTERVIEWING: [],
    OFFER_PREP: [],
    OFFER_SENT: [],
    OFFER_EXTENDED: [],
    DOCS_RECEIVED: [],
    ONBOARDING: [],
    HIRED: [],
    REJECTED: []
  };

  applicants.forEach(app => {
    const colKey = getColumnKey(app.status);
    if (groupedApplicants[colKey]) {
      groupedApplicants[colKey].push(app);
    }
  });

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', paddingBottom: '60px', paddingLeft: '20px', paddingRight: '20px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)' }}>Recruitment & Onboarding Pipeline</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Monitor and update candidate applications through structured phases on a single screen workspace.
        </p>
      </div>

      {/* Kanban Board Grid */}
      {loading && applicants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          <span>Analyzing candidate records...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {[
            {
              title: 'Phase 1: Screening & Assessment',
              color: 'var(--primary)',
              keys: ['RECEIVED', 'APPLIED', 'BOARD_REVIEW', 'SHORTLISTED']
            },
            {
              title: 'Phase 2: Interviewing & Offer Preparation',
              color: 'var(--secondary)',
              keys: ['INTERVIEWING', 'OFFER_PREP', 'OFFER_SENT', 'OFFER_EXTENDED']
            },
            {
              title: 'Phase 3: Compliance, Onboarding & Integration',
              color: 'var(--color-completed)',
              keys: ['DOCS_RECEIVED', 'ONBOARDING', 'HIRED', 'REJECTED']
            }
          ].map((section, sIdx) => {
            return (
              <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '1.2rem', color: section.color, borderBottom: '1px solid var(--border-mute)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: section.color }}></span>
                  {section.title}
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  width: '100%'
                }}>
                  {section.keys.map((colKey) => {
                    const column = columns[colKey];
                    const list = groupedApplicants[colKey] || [];

                    return (
                      <div 
                        key={colKey} 
                        className="glass-panel" 
                        style={{
                          padding: '16px',
                          backgroundColor: column.bg,
                          borderTop: `4px solid ${column.color}`,
                          borderRadius: '12px',
                          minHeight: '200px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Column Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-mute)', paddingBottom: '10px' }}>
                          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }}>{column.title}</h3>
                          <span className="status-badge" style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: column.color,
                            padding: '2px 8px',
                            fontSize: '0.65rem'
                          }}>
                            {list.length}
                          </span>
                        </div>

                        {/* Candidate Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '300px' }}>
                          {list.length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                              No applicants
                            </span>
                          ) : (
                            list.map(app => (
                              <div 
                                key={app.id} 
                                className="glass-panel glass-panel-hover" 
                                style={{
                                  padding: '10px 12px',
                                  cursor: 'pointer',
                                  backgroundColor: selectedApplicant?.id === app.id ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                                  borderColor: selectedApplicant?.id === app.id ? 'var(--secondary)' : 'var(--border-mute)'
                                }}
                                onClick={() => setSelectedApplicant(app)}
                              >
                                <strong style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-primary)' }}>{app.name}</strong>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                                  {app.job.title}
                                </span>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                    {app.id}
                                  </span>
                                  <span style={{
                                    fontSize: '0.58rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    color: column.color
                                  }}>
                                    {column.title}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Profile Drawer / Modal (Displays when selected) */}
      {selectedApplicant && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(2, 4, 10, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 900,
          display: 'flex',
          justifyContent: 'flex-end'
        }} onClick={() => setSelectedApplicant(null)}>
          
          <div 
            className="glass-panel no-scrollbar" 
            style={{
              width: '100%',
              maxWidth: '520px',
              height: '100%',
              backgroundColor: 'var(--bg-canvas)',
              borderLeft: '1px solid var(--border-mute)',
              boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.05)',
              padding: '32px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ borderBottom: '1px solid var(--border-mute)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="status-badge" style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.7rem'
                }}>
                  {selectedApplicant.id}
                </span>
                <h2 style={{ fontSize: '1.5rem', marginTop: '6px' }}>{selectedApplicant.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Applied to: <strong>{selectedApplicant.job.title}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>

            {/* General details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <span style={{ color: '#ffffff' }}>{selectedApplicant.email}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <span style={{ color: '#ffffff' }}>{selectedApplicant.phone}</span></div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Resume:</span>{' '}
                  <a href={selectedApplicant.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
                    View Resume
                  </a>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Transcript:</span>{' '}
                  <a href={selectedApplicant.transcriptUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
                    View Transcript
                  </a>
                </div>
                {selectedApplicant.portfolioUrl && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Portfolio:</span>{' '}
                    <a href={selectedApplicant.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
                      View Portfolio
                    </a>
                  </div>
                )}
              </div>
              {selectedApplicant.coverLetter && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cover Letter:</span>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.8rem', 
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-mute)',
                    marginTop: '4px',
                    lineHeight: '1.4'
                  }}>
                    {selectedApplicant.coverLetter}
                  </p>
                </div>
              )}
            </div>

            {/* BPMN Workflow Progress / Interactive State Actions */}
            <div style={{
              borderTop: '1px solid var(--border-mute)',
              paddingTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h4 style={{ fontSize: '0.95rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} style={{ color: 'var(--secondary)' }} />
                Recruitment Flow Management
              </h4>

              {/* Status Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Stage:</span>
                <span className={`status-badge badge-${selectedApplicant.status.toLowerCase().replace('_', '-')}`}>
                  {selectedApplicant.status.replace('_', ' ')}
                </span>
              </div>

              {/* Action Forms based on Status */}
              
              {/* 0. Stage: RECEIVED -> APPLIED */}
              {selectedApplicant.status === 'RECEIVED' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-primary" 
                    disabled={transitioning}
                    style={{ flex: 1 }}
                    onClick={() => handleUpdateStatus('APPLIED')}
                  >
                    Acknowledge & Register
                  </button>
                  <button 
                    className="btn btn-danger" 
                    disabled={transitioning}
                    onClick={() => handleUpdateStatus('REJECTED', { interviewNotes: 'Rejected at initial upload screening.' })}
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* 1. Stage: APPLIED -> BOARD_REVIEW */}
              {selectedApplicant.status === 'APPLIED' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-primary" 
                    disabled={transitioning}
                    style={{ flex: 1 }}
                    onClick={() => handleUpdateStatus('BOARD_REVIEW')}
                  >
                    Send to Board Review
                  </button>
                  <button 
                    className="btn btn-danger" 
                    disabled={transitioning}
                    onClick={() => handleUpdateStatus('REJECTED', { interviewNotes: 'Screened out at formal application stage.' })}
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* 1b. Stage: BOARD_REVIEW -> SHORTLISTED */}
              {selectedApplicant.status === 'BOARD_REVIEW' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-primary" 
                    disabled={transitioning}
                    style={{ flex: 1 }}
                    onClick={() => handleUpdateStatus('SHORTLISTED')}
                  >
                    Shortlist Candidate
                  </button>
                  <button 
                    className="btn btn-danger" 
                    disabled={transitioning}
                    onClick={() => handleUpdateStatus('REJECTED', { interviewNotes: 'Screened out by HR Recruitment Board.' })}
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* 2. Stage: SHORTLISTED -> HR Schedules Interview */}
              {selectedApplicant.status === 'SHORTLISTED' && (
                <div>
                  {!showScheduleForm ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1 }}
                        onClick={() => setShowScheduleForm(true)}
                      >
                        Schedule Interview
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleUpdateStatus('REJECTED', { interviewNotes: 'Decided not to move to interview rounds.' })}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateStatus('INTERVIEW_SCHEDULED', scheduleData);
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-mute)', borderRadius: '8px' }}>
                      <h5 style={{ fontSize: '0.85rem', color: '#ffffff' }}>Schedule Details</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Interview Date & Time</label>
                        <input 
                          type="datetime-local" 
                          required
                          value={scheduleData.interviewDate}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, interviewDate: e.target.value }))}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-mute)', backgroundColor: '#090d1a', color: '#ffffff', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Interviewer Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Bob White (Tech Lead)"
                          value={scheduleData.interviewer}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, interviewer: e.target.value }))}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-mute)', backgroundColor: '#090d1a', color: '#ffffff', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instructions / Zoom link</label>
                        <textarea 
                          placeholder="Provide interview details..."
                          value={scheduleData.interviewNotes}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, interviewNotes: e.target.value }))}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-mute)', backgroundColor: '#090d1a', color: '#ffffff', fontSize: '0.8rem', resize: 'vertical' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary" disabled={transitioning} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>
                          Confirm Schedule
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowScheduleForm(false)} style={{ padding: '8px', fontSize: '0.8rem' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 3. Stage: INTERVIEW_SCHEDULED -> HR Conducts Interview & logs result */}
              {selectedApplicant.status === 'INTERVIEW_SCHEDULED' && (
                <div>
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-mute)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '12px'
                  }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Upcoming Interview Details:</strong>
                    <span>Date: {new Date(selectedApplicant.interviewDate).toLocaleString()}</span><br />
                    <span>Interviewer: {selectedApplicant.interviewer}</span>
                  </div>

                  {!showFeedbackForm ? (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      onClick={() => setShowFeedbackForm(true)}
                    >
                      Record Interview Feedback
                    </button>
                  ) : (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const targetStatus = feedbackData.interviewScore === 'Pass' ? 'INTERVIEW_CONDUCTED' : 'REJECTED';
                      handleUpdateStatus(targetStatus, {
                        interviewScore: feedbackData.interviewScore,
                        interviewNotes: feedbackData.interviewNotes
                      });
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-mute)', borderRadius: '8px' }}>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Interview Result</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score / Decision</label>
                        <select 
                          value={feedbackData.interviewScore}
                          onChange={(e) => setFeedbackData(prev => ({ ...prev, interviewScore: e.target.value }))}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                        >
                          <option value="Pass">Pass (Recommended for Hire)</option>
                          <option value="Fail">Fail (Reject Candidate)</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Interviewer Feedback Notes</label>
                        <textarea 
                          required
                          placeholder="Summarize candidate performance..."
                          value={feedbackData.interviewNotes}
                          onChange={(e) => setFeedbackData(prev => ({ ...prev, interviewNotes: e.target.value }))}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8rem', resize: 'vertical' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary" disabled={transitioning} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>
                          Submit Feedback
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowFeedbackForm(false)} style={{ padding: '8px', fontSize: '0.8rem' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 4. Stage: INTERVIEW_CONDUCTED (Passed) -> Initiate Offer Prep */}
              {selectedApplicant.status === 'INTERVIEW_CONDUCTED' && (
                <div>
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '12px'
                  }}>
                    <strong style={{ color: 'var(--color-onboarding)', display: 'block', marginBottom: '4px' }}>Candidate Passed Interview!</strong>
                    <span>Interviewer feedback: "{selectedApplicant.interviewNotes}"</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    disabled={transitioning}
                    style={{ width: '100%' }}
                    onClick={() => handleUpdateStatus('OFFER_PREPARING')}
                  >
                    Initiate Offer Preparation
                  </button>
                </div>
              )}

              {/* 4a. Stage: OFFER_PREPARING -> Draft Offer Details */}
              {selectedApplicant.status === 'OFFER_PREPARING' && (
                <div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateStatus('OFFER_SENT', {
                      salaryOffered: parseInt(offerData.salaryOffered),
                      startDate: offerData.startDate
                    });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-mute)', borderRadius: '8px' }}>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Prepare Offer Details</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Annual Salary Offered ($)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="e.g. 95000"
                        value={offerData.salaryOffered}
                        onChange={(e) => setOfferData(prev => ({ ...prev, salaryOffered: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Proposed Start Date</label>
                      <input 
                        type="date" 
                        required
                        value={offerData.startDate}
                        onChange={(e) => setOfferData(prev => ({ ...prev, startDate: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button type="submit" className="btn btn-primary" disabled={transitioning} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>
                        Save Draft Offer
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 4b. Stage: OFFER_SENT -> Review & Extend Offer */}
              {selectedApplicant.status === 'OFFER_SENT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-mute)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Draft Offer Letter Details:</strong>
                    <span>Offered Salary: <strong>${selectedApplicant.salaryOffered?.toLocaleString()} / yr</strong></span><br />
                    <span>Start Date: <strong>{new Date(selectedApplicant.startDate).toLocaleDateString()}</strong></span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    disabled={transitioning}
                    style={{ width: '100%' }}
                    onClick={() => handleUpdateStatus('OFFER_ISSUED')}
                  >
                    Release & Extend Offer
                  </button>
                </div>
              )}

              {/* 5. Stage: OFFER_ISSUED -> Waiting for Signature */}
              {selectedApplicant.status === 'OFFER_ISSUED' && (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-mute)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Offer Extended to Candidate:</strong>
                  <span>Offered Salary: <strong>${selectedApplicant.salaryOffered?.toLocaleString()} / yr</strong></span><br />
                  <span>Start Date: <strong>{new Date(selectedApplicant.startDate).toLocaleDateString()}</strong></span><br />
                  <span style={{ display: 'block', marginTop: '8px', color: 'var(--color-scheduled)' }}>Waiting for the applicant to sign employment agreement.</span>
                </div>
              )}

              {/* 5a. Stage: OFFER_ACCEPTED -> Waiting for Docs */}
              {selectedApplicant.status === 'OFFER_ACCEPTED' && (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  <strong style={{ color: 'var(--color-onboarding)', display: 'block', marginBottom: '4px' }}>Offer Signed by Candidate!</strong>
                  <span style={{ color: 'var(--text-primary)' }}>Awaiting candidate onboarding document uploads.</span>
                </div>
              )}

              {/* 5b. Stage: DOCUMENTS_RECEIVED -> HR Reviews and approves onboarding */}
              {selectedApplicant.status === 'DOCUMENTS_RECEIVED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-completed)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                      All Onboarding Documents Received!
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedApplicant.onboardingTasks?.map(task => (
                        <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-mute)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{task.title}</span>
                          {task.fileUrl ? (
                            <a href={task.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--secondary)', textDecoration: 'underline' }}>
                              View File
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-rejected)' }}>Missing</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    disabled={transitioning}
                    style={{ width: '100%', background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }}
                    onClick={() => handleUpdateStatus('ONBOARDING')}
                  >
                    Approve Documents & Start Onboarding
                  </button>
                </div>
              )}

              {/* 6. Stage: ONBOARDING -> Orientation, setup & promotion */}
              {selectedApplicant.status === 'ONBOARDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <strong style={{ color: 'var(--color-onboarding)', display: 'block', marginBottom: '4px' }}>Documents Approved & Verified</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      Candidate is in final onboarding. Verify system integrations and complete promotion to Employee Directory.
                    </span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    disabled={transitioning}
                    style={{ width: '100%', background: 'linear-gradient(135deg, var(--color-onboarding), var(--color-completed))' }}
                    onClick={() => handleUpdateStatus('COMPLETED')}
                  >
                    Complete Onboarding & Hire
                  </button>
                </div>
              )}

              {/* 7. Stage: COMPLETED (Hired) */}
              {selectedApplicant.status === 'COMPLETED' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <Award size={24} style={{ color: 'var(--color-completed)' }} />
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.85rem', display: 'block' }}>Candidate Hired successfully!</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      This profile has been promoted to the active company Employee Directory.
                    </span>
                  </div>
                </div>
              )}

              {/* Rejected Candidate details */}
              {selectedApplicant.status === 'REJECTED' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.8rem'
                }}>
                  <strong style={{ color: '#ffffff', display: 'block', marginBottom: '4px' }}>Application Closed (Rejected)</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>Notes: "{selectedApplicant.interviewNotes}"</span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HiringPipeline() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>Loading recruitment pipeline...</div>}>
      <HiringPipelineContent />
    </Suspense>
  );
}
