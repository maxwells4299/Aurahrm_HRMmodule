'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, ArrowLeft, ArrowRight, FileText, CheckCircle2, Upload, AlertCircle } from 'lucide-react';

export default function ApplyPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    portfolioUrl: '',
    coverLetter: '',
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoadingJob(true);
        const res = await fetch(`/api/jobs`);
        if (res.ok) {
          const jobs = await res.json();
          const foundJob = jobs.find(j => j.id === jobId);
          setJob(foundJob);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoadingJob(false);
      }
    }
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleTranscriptChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTranscriptFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (!resumeFile) {
        setErrorMsg('Please upload your Resume/CV.');
        setIsSubmitting(false);
        return;
      }
      if (!transcriptFile) {
        setErrorMsg('Please upload your Academic Transcript.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.coverLetter.trim()) {
        setErrorMsg('Please provide a Cover Letter.');
        setIsSubmitting(false);
        return;
      }

      // 1. Upload Resume
      const resumeFormData = new FormData();
      resumeFormData.append('file', resumeFile);

      const resumeUploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: resumeFormData,
      });

      if (!resumeUploadRes.ok) {
        throw new Error('Failed to upload resume file.');
      }

      const { url: resumeUrl } = await resumeUploadRes.json();

      // 2. Upload Transcript
      const transcriptFormData = new FormData();
      transcriptFormData.append('file', transcriptFile);

      const transcriptUploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: transcriptFormData,
      });

      if (!transcriptUploadRes.ok) {
        throw new Error('Failed to upload academic transcript.');
      }

      const { url: transcriptUrl } = await transcriptUploadRes.json();

      // 3. Submit Application
      const applicationPayload = {
        ...formData,
        jobId,
        resumeUrl,
        transcriptUrl,
      };

      const appRes = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationPayload),
      });

      if (!appRes.ok) {
        const errorData = await appRes.json();
        throw new Error(errorData.error || 'Failed to submit application.');
      }

      const newApplicant = await appRes.json();
      setSuccessData(newApplicant);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
        <span>Loading job specifications...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--color-rejected)', marginBottom: '16px' }} />
        <h2>Position not found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>This job listing might have been filled or closed.</p>
        <Link href="/jobs" className="btn btn-secondary" style={{ marginTop: '20px' }}>
          Back to Listings
        </Link>
      </div>
    );
  }

  if (successData) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', width: '100%' }}>
        <div className="glass-panel pulse-glow" style={{
          padding: '40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          border: '1px solid var(--color-onboarding)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '2px dashed var(--color-onboarding)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-onboarding)'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Application Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Your application for <strong>{job.title}</strong> has been received successfully.
            </p>
          </div>

          <div style={{
            width: '100%',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid var(--border-mute)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>YOUR UNIQUE APPLICATION TRACKING ID</span>
            <strong style={{ fontSize: '1.5rem', letterSpacing: '0.1em', color: 'var(--secondary)' }}>
              {successData.id}
            </strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
              Copy this tracking ID to follow your application progress, check interview schedules, and complete onboarding tasks.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <Link 
              href={`/track?code=${successData.id}`} 
              className="btn btn-primary" 
              style={{ flex: 1 }}
            >
              Track Status Now
              <ArrowRight size={16} />
            </Link>
            <Link href="/jobs" className="btn btn-secondary" style={{ flex: 1 }}>
              Back to Job Board
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      <Link href="/jobs" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        marginBottom: '24px'
      }}>
        <ArrowLeft size={16} />
        Back to listings
      </Link>

      <div className="glass-panel" style={{ padding: '36px' }}>
        <div style={{ borderBottom: '1px solid var(--border-mute)', paddingBottom: '20px', marginBottom: '28px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Job Application
          </span>
          <h2 style={{ fontSize: '1.75rem', marginTop: '4px' }}>{job.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {job.department} · {job.location} · {job.type}
          </p>
        </div>

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
            marginBottom: '24px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Row 1: Name and Email */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="name" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                Full Name *
              </label>
              <input 
                type="text" 
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-mute)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                Email Address *
              </label>
              <input 
                type="email" 
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-mute)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Row 2: Phone and Portfolio */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="phone" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                Phone Number *
              </label>
              <input 
                type="text" 
                id="phone"
                name="phone"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-mute)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="portfolioUrl" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                Portfolio Link / Website URL
              </label>
              <input 
                type="url" 
                id="portfolioUrl"
                name="portfolioUrl"
                placeholder="https://myportfolio.dev"
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-mute)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Row 3: Resume and Transcript uploads */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Resume Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="resume" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                Upload Resume/CV * (PDF/DOCX)
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px dashed var(--border-mute)',
                cursor: 'pointer'
              }}>
                <Upload size={18} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.85rem', color: resumeFile ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {resumeFile ? resumeFile.name : 'Choose file...'}
                </span>
                <input 
                  type="file" 
                  id="resume"
                  accept=".pdf,.docx,.doc"
                  onChange={handleResumeChange}
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
            </div>

            {/* Transcript Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="transcript" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                Upload Academic Transcript * (PDF)
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px dashed var(--border-mute)',
                cursor: 'pointer'
              }}>
                <Upload size={18} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.85rem', color: transcriptFile ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {transcriptFile ? transcriptFile.name : 'Choose file...'}
                </span>
                <input 
                  type="file" 
                  id="transcript"
                  accept=".pdf"
                  onChange={handleTranscriptChange}
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
            </div>
          </div>

          {/* Cover Letter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="coverLetter" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
              Cover Letter / Message *
            </label>
            <textarea 
              id="coverLetter"
              name="coverLetter"
              required
              rows={5}
              placeholder="Tell us why you are a great fit..."
              value={formData.coverLetter}
              onChange={handleInputChange}
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-mute)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
            borderTop: '1px solid var(--border-mute)',
            paddingTop: '24px'
          }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ flex: 1, height: '44px' }}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
            <Link 
              href="/jobs" 
              className="btn btn-secondary"
              style={{ flex: 0.4, height: '44px' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
