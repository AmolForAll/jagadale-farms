export const appConfig = {
  name: 'Jagadale Farms',
  version: '1.0.0',
  description: 'Lending Management System',
  logo: '/logo.png',
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  },
  theme: {
    primary: '#2e7d32',
    secondary: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50'
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50]
  }
};
