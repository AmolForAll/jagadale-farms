import React, { useState, useEffect } from 'react';
import EditRecordForm from './components/EditRecordForm.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import Analytics from './components/Analytics.jsx';
import UserManagement from './components/UserManagement.jsx';

// Enhanced Login Component with better error handling
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);

  const createTestUsers = async () => {
    try {
      setLoading(true);
      console.log('Creating test users...');
      
      const response = await fetch('/api/auth/create-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      console.log('Test user creation response:', data);
      
      if (response.ok) {
        alert('✅ Test users created successfully!\n\nYou can now login with:\n\n1. admin@jagadalefarms.com / admin123\n2. amoljagadale474@gmail.com / Amol@123');
        setShowCreateUser(false);
      } else {
        alert('❌ Error creating users: ' + data.message);
      }
    } catch (error) {
      console.error('Test user creation error:', error);
      alert('❌ Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Attempting login with:', { email: email.trim() });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: password 
        })
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('✅ Login successful! Welcome ' + data.user.username);
        window.location.reload();
      } else {
        alert('❌ Login failed: ' + (data.message || 'Unknown error'));
        console.error('Login error details:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('🔌 Connection error. Please check if your backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f4f0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🌾</div>
          <h1 style={{ 
            color: '#2e7d32', 
            margin: 0, 
            fontSize: '28px',
            fontWeight: '600'
          }}>
            Jagadale Farms
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '16px' }}>
            Lending Management System
          </p>
        </div>
        
        {/* Create Users Section */}
        {showCreateUser ? (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '25px',
            textAlign: 'center',
            border: '1px solid #c8e6c9'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>🛠️ Setup Required</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2e7d32' }}>
              Click below to create test users for login
            </p>
            <button 
              onClick={createTestUsers}
              disabled={loading}
              style={{ 
                backgroundColor: loading ? '#ccc' : '#4CAF50', 
                color: 'white', 
                padding: '12px 24px', 
                border: 'none', 
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                marginRight: '10px'
              }}
            >
              {loading ? '⏳ Creating...' : '👤 Create Users'}
            </button>
            <button 
              onClick={() => setShowCreateUser(false)}
              disabled={loading}
              style={{ 
                backgroundColor: '#666', 
                color: 'white', 
                padding: '12px 24px', 
                border: 'none', 
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#495057' }}>
              No account? Create test users first
            </p>
            <button 
              onClick={() => setShowCreateUser(true)}
              style={{ 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                padding: '8px 16px', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              🛠️ Setup Users
            </button>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333',
              fontSize: '14px'
            }}>
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333',
              fontSize: '14px'
            }}>
              🔒 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              backgroundColor: loading ? '#ccc' : '#2196F3', 
              color: 'white', 
              padding: '14px 24px', 
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {loading ? '⏳ Signing In...' : '🚀 Sign In'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: '#f3f9ff',
          borderRadius: '8px',
          border: '1px solid #bbdefb',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1565c0' }}>
            📋 Test Credentials:
          </h4>
          <div style={{ fontSize: '12px', color: '#1565c0', lineHeight: '1.4' }}>
            <div><strong>Admin:</strong> admin@jagadalefarms.com / admin123</div>
            <div><strong>Custom:</strong> amoljagadale474@gmail.com / Amol@123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Record Form Component
const AddRecordForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    rateOfInterest: '',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (formData.amount && formData.rateOfInterest && formData.startDate && formData.renewalDate) {
      const amount = parseFloat(formData.amount);
      const rate = parseFloat(formData.rateOfInterest);
      const start = new Date(formData.startDate);
      const renewal = new Date(formData.renewalDate);
      
      if (amount > 0 && rate >= 0 && renewal > start) {
        const days = Math.ceil((renewal - start) / (1000 * 60 * 60 * 24));
        const years = days / 365;
        const interest = Math.round((amount * rate * years) / 100);
        const total = amount + interest;
        
        setPreviewData({ days, interest, total });
      }
    } else {
      setPreviewData(null);
    }
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        amount: '',
        rateOfInterest: '',
        startDate: new Date().toISOString().split('T')[0],
        renewalDate: '',
        notes: ''
      });
      setPreviewData(null);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2e7d32' }}>📝 Add New Lending Record</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Borrower Name *
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px solid #ddd', 
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter borrower's name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Principal Amount (₹) *
              </label>
              <input 
                type="number" 
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px solid #ddd', 
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter amount"
                min="1"
                max="10000000"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Rate of Interest (% per annum) *
              </label>
              <input 
                type="number" 
                value={formData.rateOfInterest}
                onChange={(e) => handleChange('rateOfInterest', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px solid #ddd', 
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter interest rate"
                min="0"
                max="100"
                step="0.1"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Start Date *
              </label>
              <input 
                type="date" 
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px solid #ddd', 
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Renewal Date *
              </label>
              <input 
                type="date" 
                value={formData.renewalDate}
                onChange={(e) => handleChange('renewalDate', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px solid #ddd', 
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
                min={formData.startDate}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Notes (Optional)
            </label>
            <textarea 
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '2px solid #ddd', 
                borderRadius: '6px',
                boxSizing: 'border-box',
                minHeight: '60px',
                resize: 'vertical'
              }}
              placeholder="Add any additional notes..."
              maxLength="500"
              disabled={loading}
            />
          </div>

          {previewData && (
            <div style={{ 
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
              border: '1px solid #cce7ff'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>📊 Calculation Preview</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                <div>
                  <small style={{ color: '#666' }}>Duration</small>
                  <div style={{ fontWeight: 'bold' }}>{previewData.days} days</div>
                </div>
                <div>
                  <small style={{ color: '#666' }}>Interest</small>
                  <div style={{ fontWeight: 'bold', color: '#ff9800' }}>₹{previewData.interest.toLocaleString()}</div>
                </div>
                <div>
                  <small style={{ color: '#666' }}>Total Amount</small>
                  <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>₹{previewData.total.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: 1,
                backgroundColor: loading ? '#ccc' : '#4CAF50', 
                color: 'white', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '6px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? '⏳ Saving...' : '💾 Save Record'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              style={{ 
                flex: 1,
                backgroundColor: '#666', 
                color: 'white', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '6px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced Dashboard Component with all features
const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRecords, setSelectedRecords] = useState([]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Load dashboard data with filters
  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (activeFilters.status) queryParams.append('status', activeFilters.status);
      if (activeFilters.startDateFrom) queryParams.append('startDate', activeFilters.startDateFrom);
      if (activeFilters.startDateTo) queryParams.append('endDate', activeFilters.startDateTo);
      queryParams.append('sortBy', sortField);
      queryParams.append('sortOrder', sortOrder);
      queryParams.append('limit', '50');
      
      const [summaryResponse, recordsResponse] = await Promise.all([
        fetch('/api/lending/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/lending?${queryParams.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (summaryResponse.ok && recordsResponse.ok) {
        const summaryData = await summaryResponse.json();
        const recordsData = await recordsResponse.json();
        
        setSummary(summaryData);
        setRecords(recordsData.records || []);
      } else {
        // Fallback to mock data
        setSummary({
          totalAmountLended: 225000,
          interestNext1Month: 2250,
          interestNext6Months: 13500,
          interestNext1Year: 27000,
          activeRecords: 3,
          completedRecords: 1,
          overdueRecords: 0,
          totalRecords: 4
        });
        
        setRecords([
          { 
            _id: '1', 
            name: 'Rajesh Kumar', 
            amount: 50000, 
            rateOfInterest: 12, 
            startDate: '2025-01-15', 
            renewalDate: '2026-01-15',
            interest: 6000,
            total: 56000,
            status: 'Active'
          },
          { 
            _id: '2', 
            name: 'Priya Sharma', 
            amount: 75000, 
            rateOfInterest: 10, 
            startDate: '2025-02-01', 
            renewalDate: '2026-02-01',
            interest: 7500,
            total: 82500,
            status: 'Active'
          },
          { 
            _id: '3', 
            name: 'Amit Patel', 
            amount: 100000, 
            rateOfInterest: 15, 
            startDate: '2024-12-01', 
            renewalDate: '2025-11-30',
            interest: 15000,
            total: 115000,
            status: 'Active'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (currentView === 'dashboard' || currentView === 'analytics') {
        setLoading(true);
        await loadDashboardData();
        setLoading(false);
      }
    };

    loadData();
  }, [currentView, searchTerm, activeFilters, sortField, sortOrder]);

  const handleAddRecord = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lending', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ Record added successfully!');
        await loadDashboardData();
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.message);
      }
    } catch (error) {
      alert('❌ Network error: ' + error.message);
    }
  };

  const handleEditRecord = async (recordId, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lending/${recordId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ Record updated successfully!');
        await loadDashboardData();
        setShowEditForm(false);
        setEditingRecord(null);
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.message);
      }
    } catch (error) {
      alert('❌ Network error: ' + error.message);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lending/${recordId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ Record deleted successfully!');
        await loadDashboardData();
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.message);
      }
    } catch (error) {
      alert('❌ Network error: ' + error.message);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleRecordSelection = (recordId, selected) => {
    if (selected) {
      setSelectedRecords([...selectedRecords, recordId]);
    } else {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    }
  };

  const handleBulkExport = async (format = 'csv') => {
    if (selectedRecords.length === 0) {
      alert('Please select records to export');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lending/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          recordIds: selectedRecords,
          format 
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lending-records.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert(`✅ Records exported as ${format.toUpperCase()}`);
      } else {
        alert('❌ Export failed');
      }
    } catch (error) {
      alert('❌ Export error: ' + error.message);
    }
  };

  const filteredRecords = records.filter(record => {
    let matches = true;
    
    // Text search
    if (searchTerm) {
      matches = matches && record.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Amount filter
    if (activeFilters.amountFrom) {
      matches = matches && record.amount >= parseFloat(activeFilters.amountFrom);
    }
    if (activeFilters.amountTo) {
      matches = matches && record.amount <= parseFloat(activeFilters.amountTo);
    }
    
    // Rate filter
    if (activeFilters.rateFrom) {
      matches = matches && record.rateOfInterest >= parseFloat(activeFilters.rateFrom);
    }
    if (activeFilters.rateTo) {
      matches = matches && record.rateOfInterest <= parseFloat(activeFilters.rateTo);
    }
    
    return matches;
  });

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f0f4f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#2e7d32' }}>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f0' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px 25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ color: '#2e7d32', margin: 0, fontSize: '24px' }}>
            🌾 Jagadale Farms
          </h1>
          <nav style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setCurrentView('dashboard')}
              style={{ 
                background: currentView === 'dashboard' ? '#2e7d32' : 'transparent',
                color: currentView === 'dashboard' ? 'white' : '#2e7d32',
                border: '1px solid #2e7d32',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('analytics')}
              style={{ 
                background: currentView === 'analytics' ? '#2e7d32' : 'transparent',
                color: currentView === 'analytics' ? 'white' : '#2e7d32',
                border: '1px solid #2e7d32',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📈 Analytics
            </button>
            <button 
              onClick={() => setCurrentView('users')}
              style={{ 
                background: currentView === 'users' ? '#2e7d32' : 'transparent',
                color: currentView === 'users' ? 'white' : '#2e7d32',
                border: '1px solid #2e7d32',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              👥 Users
            </button>
          </nav>
        </div>
        <button 
          onClick={logout}
          style={{ 
            backgroundColor: '#f44336', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🚪 Logout
        </button>
      </div>
      
      {/* Content */}
      <div>
        {currentView === 'dashboard' && (
          <div style={{ padding: '20px' }}>
            {/* Summary Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #4caf50'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32', fontSize: '16px' }}>
                  💰 Total Amount Lended
                </h3>
                <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#2e7d32' }}>
                  ₹{summary.totalAmountLended?.toLocaleString() || '0'}
                </p>
                <small style={{ color: '#666' }}>{summary.activeRecords || 0} active records</small>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #ff9800'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#e65100', fontSize: '16px' }}>
                  📅 Interest (Next Month)
                </h3>
                <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#e65100' }}>
                  ₹{summary.interestNext1Month?.toLocaleString() || '0'}
                </p>
                <small style={{ color: '#666' }}>Expected earnings</small>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #2196f3'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1976d2', fontSize: '16px' }}>
                  📈 Interest (6 Months)
                </h3>
                <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1976d2' }}>
                  ₹{summary.interestNext6Months?.toLocaleString() || '0'}
                </p>
                <small style={{ color: '#666' }}>Medium term outlook</small>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #9c27b0'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#7b1fa2', fontSize: '16px' }}>
                  🎯 Interest (1 Year)
                </h3>
                <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#7b1fa2' }}>
                  ₹{summary.interestNext1Year?.toLocaleString() || '0'}
                </p>
                <small style={{ color: '#666' }}>Annual projection</small>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, color: '#2e7d32' }}>📋 Lending Records</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minWidth: '200px'
                    }}
                  />
                  <button
                    onClick={() => setShowFilters(true)}
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🔍 Filters {Object.values(activeFilters).filter(Boolean).length > 0 && `(${Object.values(activeFilters).filter(Boolean).length})`}
                  </button>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    style={{ 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      border: 'none', 
                      padding: '10px 20px', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ➕ Add Record
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedRecords.length > 0 && (
                <div style={{ 
                  padding: '10px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#1976d2' }}>
                    {selectedRecords.length} record(s) selected
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleBulkExport('csv')}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      📊 Export CSV
                    </button>
                    <button
                      onClick={() => setSelectedRecords([])}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ❌ Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Records Table */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {filteredRecords.length === 0 ? (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>
                    {searchTerm || Object.values(activeFilters).some(Boolean) ? 'No matching records found' : 'No lending records yet'}
                  </h3>
                  <p style={{ margin: 0 }}>
                    {searchTerm || Object.values(activeFilters).some(Boolean) ? 'Try adjusting your search or filters' : 'Add some lending records to get started'}
                  </p>
                </div>
              ) : (
                <div style={{ overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRecords(filteredRecords.map(r => r._id));
                              } else {
                                setSelectedRecords([]);
                              }
                            }}
                            checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                          />
                        </th>
                        <th 
                          style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600', cursor: 'pointer' }}
                          onClick={() => handleSort('name')}
                        >
                          Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #e0e0e0', fontWeight: '600', cursor: 'pointer' }}
                          onClick={() => handleSort('amount')}
                        >
                          Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Rate (%)</th>
                        <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Start Date</th>
                        <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Renewal Date</th>
                        <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Interest</th>
                        <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Total</th>
                        <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record, index) => (
                        <tr key={record._id || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(record._id)}
                              onChange={(e) => handleRecordSelection(record._id, e.target.checked)}
                            />
                          </td>
                          <td style={{ padding: '15px', fontWeight: '500' }}>{record.name}</td>
                          <td style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: '#2e7d32' }}>
                            ₹{record.amount?.toLocaleString()}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <span style={{ 
                              backgroundColor: '#e3f2fd', 
                              color: '#1976d2', 
                              padding: '4px 8px', 
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {record.rateOfInterest}%
                            </span>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                            {new Date(record.startDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                            {new Date(record.renewalDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: '#ff9800' }}>
                            ₹{record.interest?.toLocaleString()}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'right', fontWeight: '700', color: '#2e7d32' }}>
                            ₹{record.total?.toLocaleString()}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <span style={{
                              backgroundColor: record.status === 'Active' ? '#e8f5e8' : record.status === 'Completed' ? '#f3e5f5' : '#ffebee',
                              color: record.status === 'Active' ? '#2e7d32' : record.status === 'Completed' ? '#7b1fa2' : '#c62828',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {record.status || 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  setEditingRecord(record);
                                  setShowEditForm(true);
                                }}
                                style={{
                                  backgroundColor: '#17a2b8',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record._id)}
                                style={{
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <Analytics records={filteredRecords} summary={summary} />
        )}

        {currentView === 'users' && (
          <UserManagement />
        )}
      </div>

      {/* Add Form Modal */}
      <AddRecordForm 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddRecord}
      />

      {/* Edit Form Modal */}
      <EditRecordForm 
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingRecord(null);
        }}
        onSubmit={handleEditRecord}
        record={editingRecord}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={setActiveFilters}
        currentFilters={activeFilters}
      />
    </div>
  );
};

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return isLoggedIn ? <Dashboard /> : <Login />;
}

export default App;
