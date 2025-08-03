import React, { useState, useEffect } from 'react';
import AddUserForm from './AddUserForm.jsx';
import EditUserForm from './EditUserForm.jsx';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      queryParams.append('limit', '50');
      
      const response = await fetch(`http://localhost:5000/api/users?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        // Fallback mock data
        setUsers([
          {
            _id: '1',
            username: 'admin',
            email: 'admin@jagadalefarms.com',
            phone: '9876543210',
            status: 'Active',
            isAdmin: true,
            createdAt: '2025-01-01T00:00:00.000Z'
          },
          {
            _id: '2',
            username: 'user1',
            email: 'user1@jagadalefarms.com',
            phone: '9876543211',
            status: 'Active',
            isAdmin: false,
            createdAt: '2025-01-02T00:00:00.000Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      await loadUsers();
      setLoading(false);
    };

    fetchUsers();
  }, [searchTerm]);

  const handleAddUser = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ User created successfully!');
        await loadUsers();
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.message);
      }
    } catch (error) {
      alert('❌ Network error: ' + error.message);
    }
  };

  const handleEditUser = async (userId, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ User updated successfully!');
        await loadUsers();
        setShowEditForm(false);
        setEditingUser(null);
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.message);
      }
    } catch (error) {
      alert('❌ Network error: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ User deleted successfully!');
        await loadUsers();
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.message);
      }
    } catch (error) {
      alert('❌ Network error: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filterStatus && user.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ 
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h3 style={{ color: '#2e7d32' }}>Loading Users...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
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
          gap: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#2e7d32' }}>👥 User Management</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search users..."
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
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
              ➕ Add User
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px',
          marginTop: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
              {users.length}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Users</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {users.filter(u => u.status === 'Active').length}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Active Users</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              {users.filter(u => u.status === 'Inactive').length}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Inactive Users</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {users.filter(u => u.isAdmin).length}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Admin Users</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {filteredUsers.length === 0 ? (
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>👤</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>
              {searchTerm ? 'No matching users found' : 'No users found'}
            </h3>
            <p style={{ margin: 0 }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Add some users to get started'}
            </p>
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>
                    User
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>
                    Contact
                  </th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>
                    Status
                  </th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>
                    Role
                  </th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>
                    Created
                  </th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.username}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontSize: '14px' }}>{user.phone}</div>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: user.status === 'Active' ? '#e8f5e8' : '#ffebee',
                        color: user.status === 'Active' ? '#2e7d32' : '#c62828',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: user.isAdmin ? '#e3f2fd' : '#f3e5f5',
                        color: user.isAdmin ? '#1976d2' : '#7b1fa2',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setEditingUser(user);
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
                          onClick={() => handleDeleteUser(user._id, user.username)}
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
                          🗑️ Delete
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

      {/* Add Form Modal */}
      <AddUserForm 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddUser}
      />

      {/* Edit Form Modal */}
      <EditUserForm 
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingUser(null);
        }}
        onSubmit={handleEditUser}
        user={editingUser}
      />
    </div>
  );
};

export default UserManagement;
