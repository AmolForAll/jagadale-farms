import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/Common/ThemeToggle';
import { appConfig } from '../config/app.config';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm({ mode: 'onChange' });

  const watchedFields = watch();
  const isFormValid = isValid && watchedFields.email && watchedFields.password;

//   const onSubmit = async (data) => {
//     clearError();
//     const result = await login(data);
    
//     if (result.success) {
//       toast.success('Login successful!');
//       navigate('/dashboard');
//     }
//   };

const onSubmit = async (data) => {
  try {
    clearError();
    console.log('Login form submitted with:', data); // Debug log
    
    // Test backend connectivity first
    try {
      await authAPI.createTestUser(); // This will create the user if needed
      console.log('Backend connectivity confirmed');
    } catch (err) {
      console.log('Backend connectivity issue:', err.message);
    }
    
    const result = await login(data);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      console.error('Login failed:', result.error);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
          <ThemeToggle />
        </Box>

        <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
          <Box textAlign="center" mb={3}>
            <img 
              src={appConfig.logo} 
              alt={appConfig.name}
              style={{ height: 60, marginBottom: 16 }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              {appConfig.name}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              id="email"
              label="Email or Phone"
              margin="normal"
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
              {...register('email', {
                required: 'Email or phone is required',
                pattern: {
                  value: /^([^\s@]+@[^\s@]+\.[^\s@]+|[6-9]\d{9})$/,
                  message: 'Enter a valid email or phone number'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              fullWidth
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={!isFormValid || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box textAlign="center">
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Forgot your password?
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
