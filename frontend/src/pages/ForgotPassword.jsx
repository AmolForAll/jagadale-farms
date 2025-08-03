import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Email, Lock, Verified } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { authAPI } from '../utils/api';
import ThemeToggle from '../components/Common/ThemeToggle';
import { appConfig } from '../config/app.config';

const steps = ['Enter Email', 'Verify OTP', 'Reset Password'];

const ForgotPassword = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset
  } = useForm({ mode: 'onChange' });

  const watchedPassword = watch('password');

  const handleEmailSubmit = async (data) => {
    try {
      setLoading(true);
      await authAPI.forgotPassword(data.email);
      setEmail(data.email);
      setActiveStep(1);
      toast.success('OTP sent to your email');
      reset();
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (data) => {
    try {
      setLoading(true);
      await authAPI.verifyOTP({ email, otp: data.otp });
      setActiveStep(2);
      toast.success('OTP verified successfully');
      reset();
    } catch (error) {
      toast.error('Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (data) => {
    try {
      setLoading(true);
      await authAPI.resetPassword({ 
        email, 
        otp: data.otp, 
        password: data.password 
      });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <form onSubmit={handleSubmit(handleEmailSubmit)}>
            <Typography variant="h6" gutterBottom>
              Enter your email address
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We'll send you an OTP to reset your password
            </Typography>
            
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              autoFocus
              sx={{ mb: 3 }}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isValid || loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
          </form>
        );

      case 1:
        return (
          <form onSubmit={handleSubmit(handleOTPSubmit)}>
            <Typography variant="h6" gutterBottom>
              Enter the OTP
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We've sent a 6-digit code to {email}
            </Typography>
            
            <TextField
              fullWidth
              label="OTP"
              placeholder="000000"
              autoFocus
              sx={{ mb: 3 }}
              inputProps={{ 
                maxLength: 6,
                style: { 
                  textAlign: 'center', 
                  fontSize: '1.5rem',
                  letterSpacing: '0.5rem'
                }
              }}
              {...register('otp', {
                required: 'OTP is required',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'Enter a valid 6-digit OTP'
                }
              })}
              error={!!errors.otp}
              helperText={errors.otp?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isValid || loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleSubmit(handlePasswordSubmit)}>
            <Typography variant="h6" gutterBottom>
              Set new password
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create a strong password for your account
            </Typography>
            
            <TextField
              fullWidth
              type="password"
              label="New Password"
              autoFocus
              sx={{ mb: 2 }}
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

            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              sx={{ mb: 3 }}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value =>
                  value === watchedPassword || 'Passwords do not match'
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isValid || loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </form>
        );

      default:
        return null;
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

        <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 500 }}>
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
              Reset Password
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}

          <Box textAlign="center" mt={3}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button startIcon={<ArrowBack />} color="inherit">
                Back to Login
              </Button>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
