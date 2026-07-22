'use client';

import { useState, useEffect } from 'react';
import { DollarSign, FileText, Download, ShieldCheck, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function PayrollOverview() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payPeriod, setPayPeriod] = useState('July 2026');

  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        const res = await fetch('/api/employees');
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
          if (data.length > 0) {
            setSelectedEmployee(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching employees for payroll:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmployees();
  }, []);

  // Calculations
  const totalMonthlyPayroll = employees.reduce((sum, emp) => sum + (emp.salary / 12), 0);
  const totalAnnualPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const averageSalary = employees.length > 0 ? totalAnnualPayroll / employees.length : 0;

  // Selected Employee Pay Slip Details
  const calculatePaySlip = (employee) => {
    if (!employee) return null;
    const gross = Math.round(employee.salary / 12);
    const tax = Math.round(gross * 0.20); // 20% flat tax
    const healthInsurance = 150; // flat health insurance
    const pension = Math.round(gross * 0.05); // 5% pension
    const net = gross - tax - healthInsurance - pension;

    return {
      gross,
      tax,
      healthInsurance,
      pension,
      net
    };
  };

  const slip = calculatePaySlip(selectedEmployee);

  const handleExportPDF = () => {
    if (!selectedEmployee || !slip) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is enabled. Please allow popups to export the payslip.');
      return;
    }

    const runDate = new Date().toLocaleDateString();
    const employeeIdShort = selectedEmployee.id.slice(0, 8);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${selectedEmployee.name}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              padding: 40px;
              margin: 0;
              line-height: 1.5;
            }
            .container {
              max-width: 650px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 1.6rem;
              font-weight: 800;
              color: #1e3a8a;
              letter-spacing: -0.025em;
            }
            .header .period {
              font-size: 0.85rem;
              color: #64748b;
              font-weight: 500;
              margin-top: 4px;
            }
            .badge-verified {
              background-color: #d1fae5;
              color: #065f46;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 700;
              letter-spacing: 0.05em;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              font-size: 0.85rem;
            }
            .company-info {
              color: #475569;
            }
            .company-info strong {
              color: #0f172a;
              font-size: 0.95rem;
            }
            .meta-info {
              text-align: right;
              color: #475569;
            }
            .payee-card {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 30px;
              font-size: 0.9rem;
            }
            .payee-card table {
              width: 100%;
              border-collapse: collapse;
            }
            .payee-card td {
              padding: 4px 0;
            }
            .payee-card .label {
              color: #64748b;
              width: 80px;
            }
            .payee-card .val {
              font-weight: 600;
              color: #0f172a;
            }
            .breakdown-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 0.9rem;
            }
            .breakdown-table th {
              text-align: left;
              padding: 10px 0;
              border-bottom: 1px solid #cbd5e1;
              color: #475569;
              font-weight: 600;
            }
            .breakdown-table td {
              padding: 12px 0;
              border-bottom: 1px solid #f1f5f9;
            }
            .breakdown-table .amount {
              text-align: right;
              font-variant-numeric: tabular-nums;
            }
            .breakdown-table .deduction-amount {
              color: #dc2626;
            }
            .breakdown-table .section-header {
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
              font-weight: 700;
              padding-top: 20px;
              border-bottom: none;
            }
            .net-row {
              border-top: 2px solid #e2e8f0;
              margin-top: 20px;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .net-row span {
              font-weight: 700;
              font-size: 1.1rem;
              color: #0f172a;
            }
            .net-row .net-amount {
              font-size: 1.5rem;
              color: #16a34a;
              font-weight: 800;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              font-size: 0.75rem;
              color: #94a3b8;
              border-top: 1px dashed #e2e8f0;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
              .container {
                border: none;
                box-shadow: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <h1>AURA Corp ERP Ltd</h1>
                <div class="period">Payroll Payment Period: ${payPeriod}</div>
              </div>
              <div>
                <span class="badge-verified">VERIFIED PAYSLIP</span>
              </div>
            </div>

            <div class="details-grid">
              <div class="company-info">
                <strong>AURA Corp ERP Ltd</strong><br />
                Treasury & Treasury Operations Div.<br />
                Enterprise Resource Systems
              </div>
              <div class="meta-info">
                Employee ID: <strong>${employeeIdShort}</strong><br />
                Run Date: ${runDate}<br />
                Status: Active Directory Record
              </div>
            </div>

            <div class="payee-card">
              <table>
                <tr>
                  <td class="label">Payee:</td>
                  <td class="val">${selectedEmployee.name}</td>
                </tr>
                <tr>
                  <td class="label">Job Title:</td>
                  <td class="val">${selectedEmployee.role}</td>
                </tr>
                <tr>
                  <td class="label">Department:</td>
                  <td class="val">${selectedEmployee.department}</td>
                </tr>
              </table>
            </div>

            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 600; color: #0f172a;">Gross Monthly Salary</td>
                  <td class="amount" style="font-weight: 700; color: #0f172a;">$${slip.gross.toLocaleString()}</td>
                </tr>
                
                <tr>
                  <td colspan="2" class="section-header">Deductions & Taxes</td>
                </tr>
                <tr>
                  <td>Income Tax (Flat 20%)</td>
                  <td class="amount deduction-amount">-$${slip.tax.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Pension Contribution (5%)</td>
                  <td class="amount deduction-amount">-$${slip.pension.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Corporate Health Premium</td>
                  <td class="amount deduction-amount">-$${slip.healthInsurance.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="net-row">
              <span>NET PAYABLE DISBURSED</span>
              <span class="net-amount">$${slip.net.toLocaleString()}</span>
            </div>

            <div class="footer">
              This document serves as an official confirmation of bank disbursement for the specified period.<br />
              Generated electronically by AuraHRM ERP Module. No physical signature required.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DollarSign size={32} style={{ color: 'var(--color-onboarding)' }} />
          Payroll & Compensation Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Review organizational compensation summaries and view/export simulated monthly pay slips for active employees.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          <span>Accessing corporate treasury registries...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <DollarSign size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
          <h3>No active payroll entries</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Add employees in the directory to initialize salary records.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {/* Monthly Expense */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-onboarding)'
              }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Monthly Payroll Expense</span>
                <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  ${Math.round(totalMonthlyPayroll).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Annual Expense */}
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
                <DollarSign size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Annual Commitment</span>
                <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  ${totalAnnualPayroll.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Avg Salary */}
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
                <Users size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Average Salary</span>
                <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  ${Math.round(averageSalary).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Payroll Split Screen */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Employees List Table */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Staff Payroll List</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {employees.map((emp) => (
                  <div 
                    key={emp.id} 
                    className="glass-panel" 
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      backgroundColor: selectedEmployee?.id === emp.id ? 'rgba(255,255,255,0.05)' : 'rgba(9, 13, 26, 0.1)',
                      borderColor: selectedEmployee?.id === emp.id ? 'var(--primary)' : 'var(--border-mute)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'border-color 0.2s'
                    }}
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    <div>
                      <strong style={{ fontSize: '0.875rem', display: 'block', color: 'var(--text-primary)' }}>{emp.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {emp.role} · {emp.department}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>
                          ${Math.round(emp.salary / 12).toLocaleString()} / mo
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Gross: ${emp.salary.toLocaleString()}
                        </span>
                      </div>
                      <ArrowRight size={16} style={{ color: selectedEmployee?.id === emp.id ? 'var(--primary)' : 'var(--text-muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payslip Generator */}
            {selectedEmployee && slip && (
              <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--border-glow)' }}>
                {/* Header */}
                <div style={{ borderBottom: '1px solid var(--border-mute)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>PAY SLIP RECEIPT</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Period: {payPeriod}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-completed)', fontSize: '0.75rem', fontWeight: '700' }}>
                    <ShieldCheck size={16} />
                    <span>VERIFIED</span>
                  </div>
                </div>

                {/* Company Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>
                    <strong>AURA Corp ERP Ltd</strong><br />
                    <span>Treasury Operations Div.</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span>Employee ID: <strong>{selectedEmployee.id.slice(0, 8)}</strong></span><br />
                    <span>Run Date: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Employee info */}
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-mute)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Payee:</span> <strong style={{ color: 'var(--text-primary)' }}>{selectedEmployee.name}</strong></div>
                  <div style={{ marginTop: '4px' }}><span style={{ color: 'var(--text-muted)' }}>Title:</span> <span>{selectedEmployee.role} ({selectedEmployee.department})</span></div>
                </div>

                {/* Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  {/* Gross */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-mute)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Gross Monthly Salary</span>
                    <strong style={{ color: 'var(--text-primary)' }}>${slip.gross.toLocaleString()}</strong>
                  </div>

                  {/* Deductions header */}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginTop: '6px' }}>Deductions</span>

                  {/* Tax */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Income Tax (Flat 20%)</span>
                    <span style={{ color: 'var(--color-rejected)' }}>-${slip.tax.toLocaleString()}</span>
                  </div>

                  {/* Pension */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Pension Contribution (5%)</span>
                    <span style={{ color: 'var(--color-rejected)' }}>-${slip.pension.toLocaleString()}</span>
                  </div>

                  {/* Health */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Corporate Health Premium</span>
                    <span style={{ color: 'var(--color-rejected)' }}>-${slip.healthInsurance.toLocaleString()}</span>
                  </div>

                  {/* Net pay */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    borderTop: '1px solid var(--border-mute)', 
                    paddingTop: '14px', 
                    marginTop: '12px',
                    fontSize: '1.05rem' 
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>NET PAYABLE</strong>
                    <strong style={{ color: 'var(--color-completed)' }}>${slip.net.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Action button */}
                <button 
                  onClick={handleExportPDF}
                  className="btn btn-secondary" 
                  style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}
                >
                  <Download size={14} />
                  Export Pay Slip PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
