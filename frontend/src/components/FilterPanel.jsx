import React, { useState } from 'react';

const FilterPanel = ({ isOpen, onClose, onApplyFilters, currentFilters = {} }) => {
  const [filters, setFilters] = useState({
    status: currentFilters.status || '',
    startDateFrom: currentFilters.startDateFrom || '',
    startDateTo: currentFilters.startDateTo || '',
    amountFrom: currentFilters.amountFrom || '',
    amountTo: currentFilters.amountTo || '',
    rateFrom: currentFilters.rateFrom || '',
    rateTo: currentFilters.rateTo || ''
  });

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      status: '',
      startDateFrom: '',
      startDateTo: '',
      amountFrom: '',
      amountTo: '',
      rateFrom: '',
      rateTo: ''
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
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
        <h3 style={{ margin: '0 0 20px 0', color: '#2e7d32' }}>🔍 Filter Records</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {/* Status Filter */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>📊 Status</h4>
            <select 
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '2px solid #ddd', 
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>📅 Start Date Range</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="date" 
                value={filters.startDateFrom}
                onChange={(e) => handleChange('startDateFrom', e.target.value)}
                style={{ 
                  flex: 1,
                  padding: '8px', 
                  border: '2px solid #ddd', 
                  borderRadius: '4px'
                }}
                placeholder="From"
              />
              <span>to</span>
              <input 
                type="date" 
                value={filters.startDateTo}
                onChange={(e) => handleChange('startDateTo', e.target.value)}
                style={{ 
                  flex: 1,
                  padding: '8px', 
                  border: '2px solid #ddd', 
                  borderRadius: '4px'
                }}
                placeholder="To"
                min={filters.startDateFrom}
              />
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>💰 Amount Range (₹)</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="number" 
                value={filters.amountFrom}
                onChange={(e) => handleChange('amountFrom', e.target.value)}
                style={{ 
                  flex: 1,
                  padding: '8px', 
                  border: '2px solid #ddd', 
                  borderRadius: '4px'
                }}
                placeholder="From"
                min="0"
              />
              <span>to</span>
              <input 
                type="number" 
                value={filters.amountTo}
                onChange={(e) => handleChange('amountTo', e.target.value)}
                style={{ 
                  flex: 1,
                  padding: '8px', 
                  border: '2px solid #ddd', 
                  borderRadius: '4px'
                }}
                placeholder="To"
                min={filters.amountFrom || 0}
              />
            </div>
          </div>

          {/* Interest Rate Range */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>📈 Interest Rate Range (%)</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="number" 
                value={filters.rateFrom}
                onChange={(e) => handleChange('rateFrom', e.target.value)}
                style={{ 
                  flex: 1,
                  padding: '8px', 
                  border: '2px solid #ddd', 
                  borderRadius: '4px'
                }}
                placeholder="From"
                min="0"
                max="100"
                step="0.1"
              />
              <span>to</span>
              <input 
                type="number" 
                value={filters.rateTo}
                onChange={(e) => handleChange('rateTo', e.target.value)}
                style={{ 
                  flex: 1,
                  padding: '8px', 
                  border: '2px solid #ddd', 
                  borderRadius: '4px'
                }}
                placeholder="To"
                min={filters.rateFrom || 0}
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.values(filters).some(f => f) && (
          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🏷️ Active Filters:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {filters.status && (
                <span style={{ 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px' 
                }}>
                  Status: {filters.status}
                </span>
              )}
              {(filters.startDateFrom || filters.startDateTo) && (
                <span style={{ 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px' 
                }}>
                  Date: {filters.startDateFrom || '?'} - {filters.startDateTo || '?'}
                </span>
              )}
              {(filters.amountFrom || filters.amountTo) && (
                <span style={{ 
                  backgroundColor: '#ffc107', 
                  color: 'black', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px' 
                }}>
                  Amount: ₹{filters.amountFrom || '0'} - ₹{filters.amountTo || '∞'}
                </span>
              )}
              {(filters.rateFrom || filters.rateTo) && (
                <span style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px' 
                }}>
                  Rate: {filters.rateFrom || '0'}% - {filters.rateTo || '100'}%
                </span>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
          <button 
            onClick={handleApply}
            style={{ 
              flex: 1,
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✅ Apply Filters
          </button>
          <button 
            onClick={handleClear}
            style={{ 
              flex: 1,
              backgroundColor: '#ffc107', 
              color: 'black', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🧹 Clear All
          </button>
          <button 
            onClick={onClose}
            style={{ 
              flex: 1,
              backgroundColor: '#666', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
