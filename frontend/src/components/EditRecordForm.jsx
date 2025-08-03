import React, { useState, useEffect } from 'react';

const EditRecordForm = ({ isOpen, onClose, onSubmit, record }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    rateOfInterest: '',
    startDate: '',
    renewalDate: '',
    status: 'Active',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (record) {
      setFormData({
        name: record.name || '',
        amount: record.amount || '',
        rateOfInterest: record.rateOfInterest || '',
        startDate: record.startDate ? new Date(record.startDate).toISOString().split('T')[0] : '',
        renewalDate: record.renewalDate ? new Date(record.renewalDate).toISOString().split('T')[0] : '',
        status: record.status || 'Active',
        notes: record.notes || ''
      });
    }
  }, [record]);

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
      await onSubmit(record._id, formData);
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
        <h3 style={{ margin: '0 0 20px 0', color: '#2e7d32' }}>✏️ Edit Lending Record</h3>
        
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

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Status *
              </label>
              <select 
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px solid #ddd', 
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
                required
                disabled={loading}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
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
              <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>📊 Updated Calculation</h4>
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
                backgroundColor: loading ? '#ccc' : '#2196F3', 
                color: 'white', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '6px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? '⏳ Updating...' : '💾 Update Record'}
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

export default EditRecordForm;
