import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { lendingAPI } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

const LendingRecordForm = ({ open, onClose, onSuccess, record }) => {
  const isEditing = Boolean(record);
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      amount: '',
      rateOfInterest: '',
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  });

  useEffect(() => {
    if (record) {
      reset({
        name: record.name,
        amount: record.amount,
        rateOfInterest: record.rateOfInterest,
        startDate: new Date(record.startDate),
        renewalDate: new Date(record.renewalDate)
      });
    } else {
      reset({
        name: '',
        amount: '',
        rateOfInterest: '',
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
    }
  }, [record, reset]);

  const watchedValues = watch();
  
  // Calculate preview values
  const calculatePreview = () => {
    const { amount, rateOfInterest, startDate, renewalDate } = watchedValues;
    
    if (!amount || !rateOfInterest || !startDate || !renewalDate) {
      return { interest: 0, total: 0, days: 0 };
    }

    const days = Math.ceil((new Date(renewalDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const years = days / 365;
    const interest = (amount * rateOfInterest * years) / 100;
    const total = parseFloat(amount) + interest;

    return { interest, total, days };
  };

  const preview = calculatePreview();

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await lendingAPI.updateRecord(record.id, data);
        toast.success('Record updated successfully');
      } else {
        await lendingAPI.createRecord(data);
        toast.success('Record created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update record' : 'Failed to create record');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            {isEditing ? 'Edit Lending Record' : 'Add New Lending Record'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditing ? 'Update the lending record details' : 'Enter the details for the new lending record'}
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Borrower Name"
                  placeholder="Enter borrower's full name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    maxLength: { value: 100, message: 'Name must be less than 100 characters' }
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Principal Amount"
                  placeholder="0"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                  }}
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 1, message: 'Amount must be greater than 0' },
                    max: { value: 10000000, message: 'Amount must be less than 1 crore' }
                  })}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Rate of Interest"
                  placeholder="0"
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>% per annum</Typography>
                  }}
                  {...register('rateOfInterest', {
                    required: 'Rate of interest is required',
                    min: { value: 0, message: 'Rate must be 0 or greater' },
                    max: { value: 100, message: 'Rate must be 100 or less' }
                  })}
                  error={!!errors.rateOfInterest}
                  helperText={errors.rateOfInterest?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      label="Start Date"
                      value={field.value}
                      onChange={field.onChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.startDate}
                          helperText={errors.startDate?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="renewalDate"
                  control={control}
                  rules={{ 
                    required: 'Renewal date is required',
                    validate: (value) => {
                      const startDate = watchedValues.startDate;
                      if (startDate && value <= startDate) {
                        return 'Renewal date must be after start date';
                      }
                      return true;
                    }
                  }}
                  render={({ field }) => (
                    <DatePicker
                      label="Renewal Date"
                      value={field.value}
                      onChange={field.onChange}
                      minDate={watchedValues.startDate}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.renewalDate}
                          helperText={errors.renewalDate?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Preview Section */}
              {watchedValues.amount && watchedValues.rateOfInterest && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Calculation Preview
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'background.default', 
                    p: 3, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {preview.days} days
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Principal
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {formatCurrency(watchedValues.amount || 0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Interest
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">
                          {formatCurrency(preview.interest)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="primary.main">
                          {formatCurrency(preview.total)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isValid || isSubmitting}
              sx={{ minWidth: 120 }}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default LendingRecordForm;
