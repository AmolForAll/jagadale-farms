import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  Checkbox,
  Tooltip,
  Alert,
  Fab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add,
  Download,
  TrendingUp,
  AccountBalance,
  Schedule,
  Analytics
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { lendingAPI } from '../utils/api';
import LendingRecordForm from '../components/Forms/LendingRecordForm';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState([{ field: 'createdAt', sort: 'desc' }]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [selection, setSelection] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, record: null });
  const [chartData, setChartData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [recordsResponse, summaryResponse] = await Promise.all([
        lendingAPI.getRecords({
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          sortBy: sortModel[0]?.field || 'createdAt',
          sortOrder: sortModel[0]?.sort || 'desc',
          search: filterModel.items[0]?.value || ''
        }),
        lendingAPI.getSummary()
      ]);

      setRecords(recordsResponse.data.records);
      setTotalRecords(recordsResponse.data.total);
      setSummary(summaryResponse.data);

      // Generate chart data
      const chartRecords = recordsResponse.data.records.slice(0, 10);
      const data = chartRecords.map(record => ({
        name: record.name.substring(0, 10) + (record.name.length > 10 ? '...' : ''),
        amount: record.amount,
        interest: record.interest,
        total: record.total
      }));
      setChartData(data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [paginationModel, sortModel, filterModel]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleDelete = (record) => {
    setDeleteDialog({ open: true, record });
  };

  const confirmDelete = async () => {
    try {
      await lendingAPI.deleteRecord(deleteDialog.record.id);
      toast.success('Record deleted successfully');
      loadData();
      setDeleteDialog({ open: false, record: null });
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingRecord(null);
  };

  const handleFormSuccess = () => {
    loadData();
    handleFormClose();
  };

  const handleDownload = async (format = 'pdf') => {
    if (selection.length === 0) {
      toast.error('Please select records to download');
      return;
    }

    try {
      const response = await lendingAPI.downloadRecords(selection, format);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lending-records.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Records downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to download records');
    }
  };

  const columns = [
    {
      field: 'select',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Checkbox
          checked={selection.includes(params.row.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelection([...selection, params.row.id]);
            } else {
              setSelection(selection.filter(id => id !== params.row.id));
            }
          }}
        />
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {formatCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'rateOfInterest',
      headerName: 'Rate (%)',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={formatPercentage(params.value)}
          size="small"
          color="secondary"
          variant="outlined"
        />
      )
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      type: 'date',
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), 'MMM dd, yyyy')}
        </Typography>
      )
    },
    {
      field: 'renewalDate',
      headerName: 'Renewal Date',
      width: 130,
      type: 'date',
      renderCell: (params) => {
        const isNearRenewal = new Date(params.value) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <Typography 
            variant="body2"
            color={isNearRenewal ? 'error' : 'text.primary'}
            fontWeight={isNearRenewal ? 600 : 400}
          >
            {format(new Date(params.value), 'MMM dd, yyyy')}
          </Typography>
        );
      }
    },
    {
      field: 'interest',
      headerName: 'Interest',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" color="success.main" fontWeight={500}>
          {formatCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              color="primary"
            >
              <Analytics fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row)}
              color="error"
            >
              <Analytics fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const summaryCards = [
    {
      title: 'Total Amount Lended',
      value: formatCurrency(summary.totalAmountLended || 0),
      icon: <AccountBalance />,
      color: 'primary',
      trend: '+12.5%'
    },
    {
      title: 'Interest (Next Month)',
      value: formatCurrency(summary.interestNext1Month || 0),
      icon: <Schedule />,
      color: 'warning',
      trend: '+8.2%'
    },
    {
      title: 'Interest (Next 6 Months)',
      value: formatCurrency(summary.interestNext6Months || 0),
      icon: <TrendingUp />,
      color: 'info',
      trend: '+15.3%'
    },
    {
      title: 'Interest (Next Year)',
      value: formatCurrency(summary.interestNext1Year || 0),
      icon: <Analytics />,
      color: 'success',
      trend: '+22.1%'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Lending Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your lending records
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => handleDownload('csv')}
            disabled={selection.length === 0}
            size={isMobile ? 'small' : 'medium'}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => handleDownload('pdf')}
            disabled={selection.length === 0}
            size={isMobile ? 'small' : 'medium'}
          >
            PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            Add Record
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette[card.color].light}15, ${theme.palette[card.color].main}08)`,
                border: `1px solid ${theme.palette[card.color].light}40`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: `${theme.palette[card.color].main}20`,
                    color: card.color + '.main'
                  }}>
                    {card.icon}
                  </Box>
                  <Chip 
                    label={card.trend} 
                    size="small" 
                    color={card.trend.startsWith('+') ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 400 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Lending Overview
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill={theme.palette.primary.main} name="Principal" />
                  <Bar dataKey="interest" fill={theme.palette.success.main} name="Interest" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Interest Trends
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Line 
                    type="monotone" 
                    dataKey="interest" 
                    stroke={theme.palette.secondary.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Lending Records
              </Typography>
              {selection.length > 0 && (
                <Alert severity="info" sx={{ py: 0.5 }}>
                  {selection.length} record(s) selected
                </Alert>
              )}
            </Box>
          </Box>
          
          <DataGrid
            rows={records}
            columns={columns}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            rowCount={totalRecords}
            paginationMode="server"
            sortingMode="server"
            filterMode="server"
            disableColumnMenu
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.background.default,
                borderBottom: `2px solid ${theme.palette.divider}`,
              },
              minHeight: 400
            }}
          />
        </CardContent>
      </Card>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setFormOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Form Dialog */}
      <LendingRecordForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        record={editingRecord}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, record: null })}
        onConfirm={confirmDelete}
        title="Delete Record"
        message={`Are you sure you want to delete the record for "${deleteDialog.record?.name}"?`}
      />
    </Box>
  );
};

export default Dashboard;
