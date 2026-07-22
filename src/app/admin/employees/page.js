'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Phone, DollarSign, Calendar, X, PlusCircle } from 'lucide-react';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Engineering',
    salary: '',
    joinDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add employee');
      }

      // Reset
      setShowAddForm(false);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: 'Engineering',
        salary: '',
        joinDate: ''
      });
      await loadEmployees();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error adding employee.');
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
            <Users size={32} style={{ color: 'var(--primary)' }} />
            Active Employee Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Browse active organization staff records, roles, salaries, and system configurations.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          <UserPlus size={16} />
          Add Employee
        </button>
      </div>

      {/* Employees grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          <span>Loading corporate index...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Users size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
          <h3>No employee records found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Click 'Add Employee' to populate your first team record.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {employees.map((emp) => (
            <div key={emp.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', relative: 'true' }}>
              
              {/* Upper Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '1.1rem'
                  }}>
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem' }}>{emp.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.role} · <strong>{emp.department}</strong></span>
                  </div>
                </div>
                
                <span className="status-badge badge-completed" style={{ fontSize: '0.65rem' }}>
                  {emp.status}
                </span>
              </div>

              {/* Contact / Salary Details */}
              <div style={{
                borderTop: '1px solid var(--border-mute)',
                paddingTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} style={{ color: 'var(--primary)' }} />
                  <span>{emp.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} style={{ color: 'var(--primary)' }} />
                  <span>{emp.phone}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px dashed var(--border-mute)', paddingTop: '8px', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    Hired: {new Date(emp.joinDate).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    <DollarSign size={12} style={{ color: 'var(--color-onboarding)' }} />
                    {emp.salary?.toLocaleString()} / year
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
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
              maxWidth: '560px',
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
                <h2 style={{ fontSize: '1.5rem' }}>Create Employee Record</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Manually register a new staff member in the system database.
                </p>
              </div>

              <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={newEmployee.name}
                    onChange={handleInputChange}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={newEmployee.email}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Phone Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={newEmployee.phone}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Role Title</label>
                    <input 
                      type="text" 
                      name="role"
                      required
                      placeholder="e.g. Lead Designer"
                      value={newEmployee.role}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Department</label>
                    <select 
                      name="department"
                      value={newEmployee.department}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Human Resources">Human Resources</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Annual Salary ($)</label>
                    <input 
                      type="number" 
                      name="salary"
                      required
                      placeholder="e.g. 85000"
                      value={newEmployee.salary}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>Hire Date</label>
                    <input 
                      type="date" 
                      name="joinDate"
                      required
                      value={newEmployee.joinDate}
                      onChange={handleInputChange}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-mute)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                    {submitting ? 'Registering...' : 'Register Employee'}
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
