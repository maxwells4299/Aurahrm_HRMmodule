'use client';

import { useState, useEffect } from 'react';
import { Calendar, Check, X, AlertCircle, RefreshCw } from 'lucide-react';

export default function LeaveManager() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leaves');
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update leave request status');
      }

      await loadLeaves();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error updating request.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper to calculate total leave days
  const calculateDays = (start, end) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diffTime = Math.abs(eDate - sDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={32} style={{ color: 'var(--primary)' }} />
            Leave Request Administration
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Review, approve, or reject employee leave balance allocations (Annual, Sick, and Unpaid leaves).
          </p>
        </div>
        <button 
          onClick={loadLeaves}
          className="btn btn-secondary"
          style={{ padding: '10px' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Requests table */}
      {loading && leaves.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          <span>Accessing employee calendar entries...</span>
        </div>
      ) : leaves.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Calendar size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
          <h3>No leave requests lodged</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Leave administration queries will show up here when logged by team members.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: '12px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border-mute)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)' }}>Employee</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)' }}>Leave Type</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)' }}>Duration</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)' }}>Reason</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => {
                const days = calculateDays(leave.startDate, leave.endDate);

                return (
                  <tr key={leave.id} style={{
                    borderBottom: '1px solid var(--border-mute)',
                    transition: 'background-color 0.2s',
                    backgroundColor: 'rgba(9, 13, 26, 0.1)'
                  }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    
                    {/* Employee Info */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{leave.employee?.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{leave.employee?.role}</span>
                      </div>
                    </td>

                    {/* Leave Type */}
                    <td style={{ padding: '16px 24px' }}>
                      <span className="status-badge" style={{
                        background: 'rgba(255,255,255,0.04)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-mute)',
                        fontSize: '0.7rem',
                        padding: '4px 10px'
                      }}>
                        {leave.type}
                      </span>
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-onboarding)', fontWeight: '600', marginTop: '2px' }}>
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </td>

                    {/* Reason */}
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {leave.reason}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`status-badge badge-${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {leave.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleUpdateStatus(leave.id, 'APPROVED')}
                            disabled={updatingId === leave.id}
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              color: 'var(--color-completed)',
                              borderColor: 'rgba(34, 197, 94, 0.2)',
                              backgroundColor: 'rgba(34, 197, 94, 0.05)'
                            }}
                          >
                            <Check size={14} />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(leave.id, 'REJECTED')}
                            disabled={updatingId === leave.id}
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              color: 'var(--color-rejected)',
                              borderColor: 'rgba(239, 68, 68, 0.2)',
                              backgroundColor: 'rgba(239, 68, 68, 0.05)'
                            }}
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Closed</span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
