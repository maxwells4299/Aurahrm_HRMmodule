'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  FileSearch, Search, Clock, Calendar, CheckCircle2, 
  AlertCircle, FileText, Upload, Award, User, Phone, Mail, 
  ChevronRight, ArrowLeft 
} from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeParam = searchParams.get('code') || '';

  const [trackCode, setTrackCode] = useState(codeParam);
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [signing, setSigning] = useState(false);
  
  // Track upload status for tasks
  const [uploadingTaskId, setUploadingTaskId] = useState(null);

  // BPMN stages in order - mapping exact process owner / location
  const stages = [
    { key: 'RECEIVED', label: 'Received', desc: 'Application Received' },
    { key: 'APPLIED', label: 'Applied', desc: 'Formally Registered' },
    { key: 'BOARD_REVIEW', label: 'Board Review', desc: 'Reviewing by Board' },
    { key: 'SHORTLISTED', label: 'Shortlisted', desc: 'With Scheduling Dept' },
    { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', desc: 'With Interview Panel' },
    { key: 'INTERVIEW_CONDUCTED', label: 'Interview Conducted', desc: 'Board Scorecard Review' },
    { key: 'OFFER_PREPARING', label: 'Offer Preparing', desc: 'HR Drafting Contract' },
    { key: 'OFFER_SENT', label: 'Offer Sent', desc: 'Contract Dispatched' },
    { key: 'OFFER_ISSUED', label: 'Offer Extended', desc: 'Awaiting Applicant Signature' },
    { key: 'DOCUMENTS_RECEIVED', label: 'Docs Received', desc: 'Awaiting Document Review' },
    { key: 'ONBOARDING', label: 'Onboarding', desc: 'Orientation Setup' },
    { key: 'COMPLETED', label: 'Ready to Start', desc: 'Hired & Active' }
  ];

  useEffect(() => {
    if (codeParam) {
      fetchTrackingDetails(codeParam, false);

      // Set up silent polling every 3 seconds for real-time tracking updates
      const interval = setInterval(() => {
        fetchTrackingDetails(codeParam, true);
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setApplicant(null);
    }
  }, [codeParam]);

  const fetchTrackingDetails = async (code, silent = false) => {
    if (!silent) setLoading(true);
    if (!silent) setErrorMsg('');
    try {
      const res = await fetch(`/api/applicants/${code}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Tracking code not found. Please verify the ID and try again.');
        } else {
          throw new Error('Failed to fetch tracking details.');
        }
      }
      const data = await res.json();
      setApplicant(data);
    } catch (err) {
      console.error(err);
      if (!silent) {
        setErrorMsg(err.message || 'Something went wrong.');
        setApplicant(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!trackCode.trim()) return;
    router.push(`/track?code=${trackCode.trim()}`);
  };

  const handleAcceptOffer = async (e) => {
    e.preventDefault();
    if (!signatureName.trim()) return;
    setSigning(true);

    try {
      const res = await fetch(`/api/applicants/${applicant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SIGN_OFFER',
          signature: signatureName,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to sign and accept offer.');
      }

      // Reload applicant details
      await fetchTrackingDetails(applicant.id);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to accept offer.');
    } finally {
      setSigning(false);
    }
  };

  const handleFileUpload = async (taskId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTaskId(taskId);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('taskId', taskId);
      uploadFormData.append('file', file);

      const res = await fetch(`/api/applicants/${applicant.id}/onboarding`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload document.');
      }

      // Reload details to reflect completed task
      await fetchTrackingDetails(applicant.id);
    } catch (err) {
      console.error(err);
      alert(err.message || 'File upload failed.');
    } finally {
      setUploadingTaskId(null);
    }
  };

  // Determine current stage index
  const getStageIndex = (status) => {
    if (status === 'REJECTED') return -1;
    // Offer Accepted maps to ONBOARDING for index tracking
    if (status === 'OFFER_ACCEPTED') return 10;
    return stages.findIndex(s => s.key === status);
  };

  const currentStageIndex = applicant ? getStageIndex(applicant.status) : -1;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      
      {/* Code Search Entry */}
      {!applicant && !loading && (
        <div style={{ maxWidth: '560px', margin: '60px auto', width: '100%' }}>
          <div className="glass-panel pulse-glow" style={{ padding: '36px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              margin: '0 auto 20px auto'
            }}>
              <FileSearch size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Track Application Status</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Enter the unique application tracking ID (e.g. APP-10101) you received upon submitting your resume.
            </p>

            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="APP-XXXXX" 
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-mute)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '1rem',
                  letterSpacing: '0.05em'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
                <Search size={18} />
                Search
              </button>
            </form>

            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.9rem',
                marginTop: '16px',
                textAlign: 'left'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          <span>Fetching real-time pipeline tracking logs...</span>
        </div>
      )}

      {/* Main Track Dashboard */}
      {!loading && applicant && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Header Bar */}
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid var(--border-mute)',
            paddingBottom: '20px'
          }}>
            <div>
              <Link href="/track" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                marginBottom: '8px'
              }}>
                <ArrowLeft size={14} /> Search different code
              </Link>
              <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>
                Application Tracking Portal
              </h1>
            </div>
            
            <div className="glass-panel" style={{ padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TRACKING CODE</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--secondary)' }}>{applicant.id}</strong>
              </div>
            </div>
          </div>

          {/* Stepper Pipeline Progress (The BPMN Stepper) */}
          <div className="glass-panel" style={{ padding: '32px 24px', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Application Lifecycle Timeline
            </h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              minWidth: '780px',
              position: 'relative',
              paddingBottom: '16px'
            }}>
              {/* Stepper connecting line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                height: '3px',
                background: 'rgba(255,255,255,0.06)',
                zIndex: 1
              }} />

              {/* Glowing active line */}
              {currentStageIndex > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  width: `${(currentStageIndex / (stages.length - 1)) * 96}%`,
                  height: '3px',
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  zIndex: 2,
                  transition: 'width 0.5s ease'
                }} />
              )}

              {stages.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isActive = idx === currentStageIndex;
                const isRejected = applicant.status === 'REJECTED';
                
                let stepColor = 'var(--text-muted)';
                let borderStyle = '1px solid var(--border-mute)';
                let bgStyle = 'rgba(9, 13, 26, 0.9)';

                if (isCompleted) {
                  stepColor = 'var(--primary)';
                  bgStyle = 'var(--primary)';
                  borderStyle = 'none';
                } else if (isActive) {
                  stepColor = isRejected ? 'var(--color-rejected)' : 'var(--secondary)';
                  bgStyle = 'rgba(9, 13, 26, 0.9)';
                  borderStyle = `2px solid ${isRejected ? 'var(--color-rejected)' : 'var(--secondary)'}`;
                }

                return (
                  <div 
                    key={stage.key} 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 3,
                      position: 'relative',
                      width: '100px',
                      textAlign: 'center'
                    }}
                  >
                    {/* Circle Node */}
                    <div className={isActive && !isRejected ? 'pulse-glow' : ''} style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: bgStyle,
                      border: borderStyle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCompleted ? '#ffffff' : stepColor,
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      marginBottom: '10px',
                      boxShadow: isActive && !isRejected ? '0 0 12px var(--secondary-glow)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>

                    {/* Node Text */}
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: isActive || isCompleted ? '700' : '500',
                      color: isActive ? '#ffffff' : (isCompleted ? 'var(--text-primary)' : 'var(--text-muted)'),
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      {stage.label}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {stage.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Left Detail Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Current Status Box */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={20} style={{ color: 'var(--secondary)' }} />
                  Current Application Status
                </h3>

                {/* Status-specific descriptions */}
                {applicant.status === 'RECEIVED' && (
                  <div>
                    <h4 style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Stage: Received</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      Your application for <strong>{applicant.job.title}</strong> has been successfully received by our servers.
                    </p>
                    <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Server Registry & Document Ingestion</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                        The system has securely saved your credentials, Cover Letter, Resume, and Academic Transcript files. It is awaiting initial verification by the HR team to be formally indexed.
                      </p>
                    </div>
                  </div>
                )}

                {applicant.status === 'APPLIED' && (
                  <div>
                    <h4 style={{ color: 'var(--color-applied)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Stage: Formally Applied</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      Your application has been verified and formally registered under tracking ID <strong>{applicant.id}</strong>.
                    </p>
                    <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Indexing & Department Allocation</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                        HR administrators have checked that your profile matches the minimum criteria for the position. Your profile is now being routed to the HR Recruitment Board for active screening.
                      </p>
                    </div>
                  </div>
                )}

                {applicant.status === 'BOARD_REVIEW' && (
                  <div>
                    <h4 style={{ color: 'var(--color-shortlisted)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Stage: Reviewing by Board</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      Your profile is currently under active evaluation by the <strong>HR Recruitment Board</strong>.
                    </p>
                    <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Credential Assessment & Scoring</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                        The board members are reviewing your cover letter, resume, transcript, and portfolio. They are scoring your credentials to decide whether to approve you for shortlist scheduling.
                      </p>
                    </div>
                  </div>
                )}

                {applicant.status === 'SHORTLISTED' && (
                  <div>
                    <h4 style={{ color: 'var(--color-shortlisted)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Stage: Shortlisted</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      Excellent! The HR Board has approved your profile credentials. Your application is now with the <strong>Interview Scheduling Department</strong>.
                    </p>
                    <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Interview Panel Coordination</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                        Scheduling coordinators are aligning interview panel availability (matching engineers/leads) and allocating secure video rooms. Meeting invitations and coordinates will be published here shortly.
                      </p>
                    </div>
                  </div>
                )}

                {applicant.status === 'INTERVIEW_SCHEDULED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <h4 style={{ color: 'var(--color-scheduled)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Stage: Interview Scheduled</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Your interview has been locked. Your application is now with the designated <strong>Technical Interview Panel</strong>.
                      </p>
                      <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Awaiting Panel Interview Conduction</span>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                          The panel leads have received your transcript files and portfolio details. They will evaluate your engineering competency and problem-solving skills during the scheduled round.
                        </p>
                      </div>
                    </div>

                    <div style={{
                      padding: '20px',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-mute)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                        <Calendar size={16} style={{ color: 'var(--secondary)' }} />
                        <span>Date & Time: <strong>{new Date(applicant.interviewDate).toLocaleString()}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                        <User size={16} style={{ color: 'var(--secondary)' }} />
                        <span>Interviewer: <strong>{applicant.interviewer}</strong></span>
                      </div>
                      {applicant.interviewNotes && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-mute)', paddingTop: '8px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>HR Instructions:</span>
                          <p>{applicant.interviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {applicant.status === 'INTERVIEW_CONDUCTED' && (
                  <div>
                    <h4 style={{ color: 'var(--color-conducted)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Stage: Interview Completed</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      Your panel interview with <strong>{applicant.interviewer}</strong> has concluded. Your application is now with the <strong>Hiring Decisions Committee</strong>.
                    </p>
                    <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Scorecard Evaluation & Decision Logging</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                        The panel is submitting detailed rating scorecards. The HR Hiring Committee will analyze the logs to determine if your profile passes the benchmark for contract preparation.
                      </p>
                    </div>
                  </div>
                )}

                {applicant.status === 'OFFER_PREPARING' && (
                  <div>
                    <h4 style={{ color: 'var(--color-offer-prep)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Stage: Offer Preparing</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      Congratulations! The Hiring Decisions Committee has approved your candidacy.
                    </p>
                    <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>HR Drafting Offer Terms</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                        Our HR compensation coordinators are preparing your draft offer letter, including salary benchmarks and start date details. You will receive the agreement terms here for review shortly.
                      </p>
                    </div>
                  </div>
                )}

                {applicant.status === 'OFFER_SENT' && (
                  <div>
                    <h4 style={{ color: 'var(--color-offer-issued)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Stage: Offer Sent</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      Your official offer terms have been calculated and saved.
                    </p>
                    <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Final Executive Authorization</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                        The offer details are awaiting final executive signature authorization. Once approved, the document will unlock on your portal for your digital signature.
                      </p>
                    </div>
                  </div>
                )}

                {applicant.status === 'OFFER_ISSUED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h4 style={{ color: 'var(--color-offer-issued)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Stage: Offer Letter Released</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        The Hiring Committee has approved your hire and extended an official offer. Your application is now with <strong>You (the Applicant)</strong> for contract review.
                      </p>
                      <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--bg-canvas)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Awaiting Digital Signature Acceptance</span>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                          Please review the details in the offer sheet below. To accept the position, type your name in the signature input and submit. This will initiate onboarding workflows.
                        </p>
                      </div>
                    </div>

                    {/* Offer document card */}
                    <div className="glass-panel pulse-glow" style={{
                      padding: '24px',
                      backgroundColor: 'rgba(9, 13, 26, 0.98)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div style={{ borderBottom: '1px solid var(--border-mute)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} style={{ color: 'var(--secondary)' }} />
                        <h4 style={{ fontSize: '1.05rem' }}>OFFER OF EMPLOYMENT</h4>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Role Offered:</span>
                          <p style={{ fontWeight: '600', marginTop: '2px' }}>{applicant.job.title}</p>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                          <p style={{ fontWeight: '600', marginTop: '2px' }}>{applicant.job.department}</p>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Salary Package:</span>
                          <p style={{ fontWeight: '600', marginTop: '2px', color: 'var(--color-onboarding)' }}>
                            ${applicant.salaryOffered?.toLocaleString()} / year
                          </p>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Proposed Start Date:</span>
                          <p style={{ fontWeight: '600', marginTop: '2px' }}>
                            {new Date(applicant.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.5',
                        borderTop: '1px solid var(--border-mute)',
                        paddingTop: '12px'
                      }}>
                        We offer premium health coverage, standard annual leave policies, performance-based bonuses, and a dynamic hybrid workspace environment.
                      </div>

                      {/* Signature Box */}
                      <form onSubmit={handleAcceptOffer} style={{
                        borderTop: '1px dashed var(--border-mute)',
                        paddingTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                          Type your Full Name to digitally sign:
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            required
                            placeholder="Johnathan Doe"
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--bg-canvas)',
                              border: '1px solid var(--border-mute)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              fontSize: '0.9rem',
                              fontFamily: 'var(--font-sans)'
                            }}
                          />
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={signing}
                            style={{
                              padding: '0 20px',
                              background: 'linear-gradient(135deg, var(--color-onboarding), var(--color-completed))',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                            }}
                          >
                            {signing ? 'Signing...' : 'Accept & Onboard'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {['ONBOARDING', 'DOCUMENTS_RECEIVED'].includes(applicant.status) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h4 style={{ color: 'var(--color-onboarding)', fontSize: '1.1rem', marginBottom: '8px' }}>
                        Application Stage: {applicant.status === 'DOCUMENTS_RECEIVED' ? 'Documents Received' : 'Onboarding Operations'}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {applicant.status === 'DOCUMENTS_RECEIVED' 
                          ? 'All onboarding document uploads have been received.' 
                          : 'Your offer acceptance is processed. Please upload your documents.'}
                      </p>
                      <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                        <span style={{ color: '#ffffff', fontWeight: '500' }}>
                          {applicant.status === 'DOCUMENTS_RECEIVED' ? 'HR Document Verification' : 'Compliance & Document Verification'}
                        </span>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                          {applicant.status === 'DOCUMENTS_RECEIVED'
                            ? 'The HR operations team has received your documents and is performing compliance validation.'
                            : 'Please upload all requested verification materials (ID, Degree Certificates, Deposit details) using the document drop slots below.'}
                        </p>
                      </div>
                    </div>

                    {/* Onboarding Checklist */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Required Onboarding Documents
                      </span>

                      {applicant.onboardingTasks?.map((task) => (
                        <div 
                          key={task.id} 
                          className="glass-panel" 
                          style={{
                            padding: '16px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '16px',
                            borderColor: task.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-mute)'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                            <div style={{
                              color: task.status === 'COMPLETED' ? 'var(--color-completed)' : 'var(--text-muted)',
                              marginTop: '2px'
                            }}>
                              <CheckCircle2 size={18} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <strong style={{ fontSize: '0.9rem', color: task.status === 'COMPLETED' ? '#ffffff' : 'var(--text-primary)' }}>
                                {task.title}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {task.description}
                              </span>
                              {task.fileUrl && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '4px' }}>
                                  Uploaded: {task.fileUrl.split('/').pop()}
                                </span>
                              )}
                            </div>
                          </div>

                          {task.status === 'PENDING' ? (
                            <div style={{ position: 'relative' }}>
                              <button 
                                className="btn btn-secondary" 
                                disabled={uploadingTaskId === task.id}
                                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                              >
                                <Upload size={14} />
                                {uploadingTaskId === task.id ? 'Uploading...' : 'Upload File'}
                              </button>
                              <input 
                                type="file" 
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => handleFileUpload(task.id, e)}
                                disabled={uploadingTaskId === task.id}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  opacity: 0,
                                  cursor: 'pointer'
                                }}
                              />
                            </div>
                          ) : (
                            <span className="status-badge badge-completed" style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
                              Complete
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {applicant.status === 'COMPLETED' && (
                  <div>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '2px dashed var(--color-completed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-completed)',
                      marginBottom: '16px'
                    }}>
                      <Award size={32} />
                    </div>
                    <h4 style={{ color: 'var(--color-completed)', fontSize: '1.25rem', marginBottom: '8px' }}>Application Stage: Hired & Integrated</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      Welcome to the company! Onboarding is completed and verified. You have been promoted to the active employee directory.
                    </p>
                    <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-mute)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Current Process:</span>{' '}
                      <span style={{ color: 'var(--color-completed)', fontWeight: '500' }}>Active System Integration</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                        Your record is active in Directory and Treasury Payroll databases. Team coordinators and IT coordinators will contact you shortly with directory credentials and work calendars.
                      </p>
                    </div>
                  </div>
                )}

                {applicant.status === 'REJECTED' && (
                  <div>
                    <h4 style={{ color: 'var(--color-rejected)', fontSize: '1.1rem', marginBottom: '8px' }}>Application Update</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      We appreciate your interest in the <strong>{applicant.job.title}</strong> opening and the time you spent applying. 
                      After a thorough review of all applicants, we regret to inform you that we have decided to move forward with other candidates who more closely align with the specific needs of this role. 
                    </p>
                    {applicant.interviewNotes && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.12)',
                        borderRadius: '8px',
                        fontSize: '0.85rem'
                      }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Feedback Details:</strong>
                        <p style={{ color: 'var(--text-secondary)' }}>{applicant.interviewNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cover Letter / Submission Details */}
              <div className="glass-panel" style={{ padding: '24px 32px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Submission Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Job Role:</span>
                    <p style={{ color: 'var(--text-primary)', marginTop: '2px', fontWeight: '600' }}>{applicant.job.title}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Submitted Resume:</span>
                      <p style={{ color: 'var(--secondary)', marginTop: '2px' }}>
                        <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                          <FileText size={14} />
                          View Resume
                        </a>
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Academic Transcript:</span>
                      <p style={{ color: 'var(--secondary)', marginTop: '2px' }}>
                        <a href={applicant.transcriptUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                          <FileText size={14} />
                          View Transcript
                        </a>
                      </p>
                    </div>
                    {applicant.portfolioUrl && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Portfolio / Website:</span>
                        <p style={{ color: 'var(--secondary)', marginTop: '2px' }}>
                          <a href={applicant.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                            <FileText size={14} />
                            View Portfolio
                          </a>
                        </p>
                      </div>
                    )}
                  </div>

                  {applicant.coverLetter && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Cover Letter:</span>
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        marginTop: '4px', 
                        lineHeight: '1.5',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-mute)' 
                      }}>
                        {applicant.coverLetter}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Contact Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* HR Assigned Coordinator */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} style={{ color: 'var(--primary)' }} />
                  Assigned Coordinator
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    fontWeight: '700'
                  }}>
                    AG
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>Alice Green</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HR Director</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} style={{ color: 'var(--primary)' }} />
                    <span>alice.green@company.com</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: 'var(--primary)' }} />
                    <span>+1 (555) 019-2834</span>
                  </div>
                </div>
              </div>

              {/* Checklist Progress Status */}
              {applicant.status === 'ONBOARDING' && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Checklist Status</h3>
                  
                  {(() => {
                    const total = applicant.onboardingTasks?.length || 0;
                    const completed = applicant.onboardingTasks?.filter(t => t.status === 'COMPLETED').length || 0;
                    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Task Progress</span>
                          <strong style={{ color: 'var(--color-onboarding)' }}>{completed} / {total} ({pct}%)</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-onboarding)', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>Loading tracking details...</div>}>
      <TrackContent />
    </Suspense>
  );
}
