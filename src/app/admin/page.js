'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Briefcase, FileSearch, Calendar, 
  ArrowRight, ShieldAlert, Award, FileText,
  BarChart3, PieChart, TrendingUp, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeJobs: 0,
    pendingApplicants: 0,
    pendingLeaves: 0
  });
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [pendingLeavesList, setPendingLeavesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analytics states
  const [deptStats, setDeptStats] = useState([]);
  const [pipelineGauges, setPipelineGauges] = useState({ 
    screening: 0, 
    interviewing: 0, 
    compliance: 0,
    screeningCount: 0,
    interviewingCount: 0,
    complianceCount: 0
  });
  const [payrollTrend, setPayrollTrend] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Fetch all dependencies concurrently
        const [empRes, jobRes, appRes, leaveRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/jobs?status=All'),
          fetch('/api/applicants'),
          fetch('/api/leaves')
        ]);

        if (empRes.ok && jobRes.ok && appRes.ok && leaveRes.ok) {
          const employees = await empRes.json();
          const jobs = await jobRes.json();
          const applicants = await appRes.json();
          const leaves = await leaveRes.json();

          const activeJobsCount = jobs.filter(j => j.status === 'OPEN').length;
          const pendingApplicantsCount = applicants.filter(a => 
            !['COMPLETED', 'REJECTED'].includes(a.status)
          ).length;
          const pendingLeavesCount = leaves.filter(l => l.status === 'PENDING').length;

          setStats({
            totalEmployees: employees.length,
            activeJobs: activeJobsCount,
            pendingApplicants: pendingApplicantsCount,
            pendingLeaves: pendingLeavesCount
          });

          setRecentApplicants(applicants.slice(0, 4));
          setPendingLeavesList(leaves.filter(l => l.status === 'PENDING').slice(0, 4));

          // --- 1. Department Counts ---
          const depts = {};
          employees.forEach(emp => {
            const d = emp.department || 'Other';
            depts[d] = (depts[d] || 0) + 1;
          });
          const parsedDepts = Object.keys(depts).map(d => ({
            department: d,
            count: depts[d]
          })).sort((a, b) => b.count - a.count);
          setDeptStats(parsedDepts);

          // --- 2. Recruitment Phases (Active Candidates) ---
          const activeApps = applicants.filter(a => !['COMPLETED', 'REJECTED'].includes(a.status));
          const totalActiveCount = activeApps.length || 1;
          const screening = activeApps.filter(a => ['RECEIVED', 'APPLIED', 'BOARD_REVIEW', 'SHORTLISTED'].includes(a.status)).length;
          const interviewing = activeApps.filter(a => ['INTERVIEW_SCHEDULED', 'INTERVIEW_CONDUCTED', 'OFFER_PREPARING', 'OFFER_SENT', 'OFFER_ISSUED', 'OFFER_ACCEPTED'].includes(a.status)).length;
          const compliance = activeApps.filter(a => ['DOCUMENTS_RECEIVED', 'ONBOARDING'].includes(a.status)).length;

          setPipelineGauges({
            screening: Math.round((screening / totalActiveCount) * 100),
            interviewing: Math.round((interviewing / totalActiveCount) * 100),
            compliance: Math.round((compliance / totalActiveCount) * 100),
            screeningCount: screening,
            interviewingCount: interviewing,
            complianceCount: compliance
          });

          // --- 3. Monthly Cumulative Salary Trend ---
          const sortedEmps = [...employees].sort((a, b) => new Date(a.joinDate) - new Date(b.joinDate));
          const monthlyData = {};
          let runningTotal = 0;
          sortedEmps.forEach(emp => {
            const date = new Date(emp.joinDate);
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            runningTotal += emp.salary || 60000;
            monthlyData[label] = Math.round(runningTotal / 12);
          });
          
          let parsedTrend = Object.keys(monthlyData).map(label => ({
            label,
            value: monthlyData[label]
          }));

          if (parsedTrend.length < 2) {
            parsedTrend = [
              { label: 'Jan 26', value: 38000 },
              { label: 'Feb 26', value: 41000 },
              { label: 'Mar 26', value: 46000 },
              { label: 'Apr 26', value: 50000 },
              { label: 'May 26', value: 54000 },
              { label: 'Jun 26', value: 58000 }
            ];
          } else {
            parsedTrend = parsedTrend.slice(-6);
          }
          setPayrollTrend(parsedTrend);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Helper for rendering radial progress gauges
  const renderRadialProgress = (percentage, count, label, color) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius; // 175.92
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
        <div style={{ position: 'relative', width: '70px', height: '70px' }}>
          <svg width="70" height="70" viewBox="0 0 70 70">
            {/* Underlay */}
            <circle cx="35" cy="35" r="28" fill="none" stroke="var(--border-mute)" strokeWidth="5" />
            {/* Progress circle */}
            <circle 
              cx="35" 
              cy="35" 
              r="28" 
              fill="none" 
              stroke={color} 
              strokeWidth="5" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 35 35)"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{percentage}%</span>
          </div>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>{label}</span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{count} Candidates</span>
      </div>
    );
  };

  // Helper to generate Line Chart SVG paths
  const generateLineChart = () => {
    if (payrollTrend.length === 0) return null;
    const chartW = 340;
    const chartH = 150;
    const paddingL = 50;
    const paddingR = 15;
    const paddingT = 15;
    const paddingB = 25;

    const width = chartW - paddingL - paddingR;
    const height = chartH - paddingT - paddingB;

    const vals = payrollTrend.map(d => d.value);
    const maxVal = Math.max(...vals, 1000);
    const minVal = Math.min(...vals, 0);
    const range = maxVal - minVal || 1;

    const points = payrollTrend.map((d, index) => {
      const x = paddingL + (index * width) / (payrollTrend.length - 1);
      const y = paddingT + height - ((d.value - minVal) * height) / range;
      return { x, y, label: d.label, value: d.value };
    });

    const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${lineD} L ${points[points.length - 1].x} ${chartH - paddingB} L ${points[0].x} ${chartH - paddingB} Z`;

    return { chartH, chartW, paddingL, paddingT, height, maxVal, minVal, range, points, lineD, areaD, paddingB, paddingR };
  };

  const lineChartData = generateLineChart();

  // Bar colors
  const deptColors = {
    'Engineering': 'var(--primary)',
    'Product': 'var(--secondary)',
    'Design': 'var(--accent)',
    'QA': 'var(--color-conducted)',
    'HR': 'var(--color-onboarding)',
    'Other': 'var(--text-muted)'
  };

  const maxStaffCount = Math.max(...deptStats.map(d => d.count), 1);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={28} style={{ color: 'var(--primary)' }} />
          HR Management Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Real-time overview of hiring pipelines, active employee indexes, and operational analytics.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Active Employees</span>
            <strong style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{stats.totalEmployees}</strong>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--secondary)'
          }}>
            <Briefcase size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Open Positions</span>
            <strong style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{stats.activeJobs}</strong>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-scheduled)'
          }}>
            <FileSearch size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Active Hires</span>
            <strong style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{stats.pendingApplicants}</strong>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-rejected)'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Pending Leaves</span>
            <strong style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{stats.pendingLeaves}</strong>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Chart Card 1: Radial Progress */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} style={{ color: 'var(--secondary)' }} />
            Hiring Pipeline Breakdown
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '12px', flex: 1, padding: '10px 0' }}>
            {renderRadialProgress(pipelineGauges.screening, pipelineGauges.screeningCount, 'Screening', 'var(--primary)')}
            {renderRadialProgress(pipelineGauges.interviewing, pipelineGauges.interviewingCount, 'Interviewing', 'var(--secondary)')}
            {renderRadialProgress(pipelineGauges.compliance, pipelineGauges.complianceCount, 'Compliance', 'var(--color-completed)')}
          </div>
        </div>

        {/* Chart Card 2: Horizontal Bars */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
            Staff Distribution by Department
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
            {deptStats.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No employees cataloged.</div>
            ) : (
              deptStats.map((d) => {
                const color = deptColors[d.department] || 'var(--text-muted)';
                const pct = Math.round((d.count / maxStaffCount) * 100);
                return (
                  <div key={d.department} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{d.department}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{d.count} staff</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-mute)' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.8s ease-in-out' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chart Card 3: Line Chart */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--color-completed)' }} />
            Monthly Cumulative Payroll Cost
          </h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {lineChartData && (
              <svg width="100%" height={lineChartData.chartH} viewBox={`0 0 ${lineChartData.chartW} ${lineChartData.chartH}`}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={lineChartData.paddingL} y1={lineChartData.paddingT} x2={lineChartData.chartW - lineChartData.paddingR} y2={lineChartData.paddingT} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1={lineChartData.paddingL} y1={lineChartData.paddingT + lineChartData.height / 2} x2={lineChartData.chartW - lineChartData.paddingR} y2={lineChartData.paddingT + lineChartData.height / 2} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1={lineChartData.paddingL} y1={lineChartData.chartH - lineChartData.paddingB} x2={lineChartData.chartW - lineChartData.paddingR} y2={lineChartData.chartH - lineChartData.paddingB} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Area under line */}
                <path d={lineChartData.areaD} fill="url(#areaGrad)" />

                {/* Line path */}
                <path d={lineChartData.lineD} fill="none" stroke="var(--secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Points & Labels */}
                {lineChartData.points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="var(--secondary)" strokeWidth="2" />
                    {/* X axis label */}
                    <text x={p.x} y={lineChartData.chartH - 8} fill="var(--text-muted)" fontSize="8" textAnchor="middle">
                      {p.label}
                    </text>
                  </g>
                ))}

                {/* Y axis labels */}
                <text x={lineChartData.paddingL - 8} y={lineChartData.paddingT + 4} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                  ${Math.round(lineChartData.maxVal / 1000)}k/mo
                </text>
                <text x={lineChartData.paddingL - 8} y={lineChartData.paddingT + lineChartData.height / 2 + 4} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                  ${Math.round((lineChartData.maxVal + lineChartData.minVal) / 2000)}k/mo
                </text>
                <text x={lineChartData.paddingL - 8} y={lineChartData.chartH - lineChartData.paddingB + 4} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                  ${Math.round(lineChartData.minVal / 1000)}k/mo
                </text>
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '24px'
      }}>
        {/* Recent Applicants Section */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Active Pipeline Applicants</h3>
            <Link href="/admin/applicants" style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View hiring pipeline
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentApplicants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No active applications in the recruitment pipeline.
              </div>
            ) : (
              recentApplicants.map((app) => (
                <div 
                  key={app.id} 
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-mute)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>{app.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Applying for: {app.job.title}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`status-badge badge-${app.status.toLowerCase().replace(/_/g, '-')}`} style={{ fontSize: '0.65rem' }}>
                      {app.status.replace('_', ' ')}
                    </span>
                    <Link href={`/admin/applicants?highlightedId=${app.id}`} style={{ color: 'var(--text-secondary)' }}>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leave Requests Section */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Pending Leave Approvals</h3>
            <Link href="/admin/leaves" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Manage leaves
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingLeavesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                All clear! No pending leave requests.
              </div>
            ) : (
              pendingLeavesList.map((leave) => (
                <div 
                  key={leave.id} 
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-mute)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                      {leave.employee?.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Type: {leave.type} · Reason: {leave.reason}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                    <span className="status-badge badge-scheduled" style={{ fontSize: '0.65rem' }}>
                      Pending
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
