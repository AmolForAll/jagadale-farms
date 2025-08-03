import React, { useState, useEffect } from 'react';

const EditUserForm = ({ isOpen, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    status: 'Active',
    changePassword: false,
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status || 'Active',
        changePassword: false,
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.changePassword) {
      if (!formData.newPassword || formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const { changePassword, confirmPassword, ...submitData } = formData;
      
      // Only include password if changing it
      if (changePassword && formData.newPassword) {
        submitData.password = formData.newPassword;
      } else {
        delete submitData.newPassword;
      }
      
      delete submitData.newPassword;
      
      await onSubmit(user._id, submitData);
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2e7d32' }}>✏️ Edit User</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Username *
            </label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.username ? '2px solid #f44336' : '2px solid #ddd', 
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
              required
              disabled={loading}
            />
            {errors.username && <small style={{ color: '#f44336' }}>{errors.username}</small>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email Address *
            </label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.email ? '2px solid #f44336' : '2px solid #ddd', 
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
              required
              disabled={loading}
            />
            {errors.email && <small style={{ color: '#f44336' }}>{errors.email}</small>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Phone Number *
            </label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: errors.phone ? '2px solid #f44336' : '2px solid #ddd', 
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
              required
              disabled={loading}
            />
            {errors.phone && <small style={{ color: '#f44336' }}>{errors.phone}</small>}
          </div>

          <div style={{ marginBottom: '20px' }}>
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
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Password Change Section */}
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: 'bold' }}>
              <input
                type="checkbox"
                checked={formData.changePassword}
                onChange={(e) => handleChange('changePassword', e.target.checked)}
                style={{ marginRight: '8px' }}
                disabled={loading}
              />
              Change Password
            </label>
            
            {formData.changePassword && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'normal' }}>
                    New Password *
                  </label>
                  <input 
                    type="password" 
                    value={formData.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: errors.newPassword ? '2px solid #f44336' : '2px solid #ddd', 
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter new password (min 6 characters)"
                    disabled={loading}
                  />
                  {errors.newPassword && <small style={{ color: '#f44336' }}>{errors.newPassword}</small>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'normal' }}>
                    Confirm New Password *
                  </label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: errors.confirmPassword ? '2px solid #f44336' : '2px solid #ddd', 
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  {errors.confirmPassword && <small style={{ color: '#f44336' }}>{errors.confirmPassword}</small>}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
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
              {loading ? '⏳ Updating...' : '💾 Update User'}
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

export default EditUserForm;
