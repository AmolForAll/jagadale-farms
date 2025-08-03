const express = require('express');
const { body, validationResult } = require('express-validator');
const LendingRecord = require('../models/LendingRecord');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all lending records
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      status = '',
      startDate,
      endDate 
    } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const records = await LendingRecord.find(query)
      .populate('createdBy', 'username')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LendingRecord.countDocuments(query);

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard summary
router.get('/summary', auth, async (req, res) => {
  try {
    const totalAmount = await LendingRecord.aggregate([
      { $match: { status: { $ne: 'Completed' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalInterest = await LendingRecord.aggregate([
      { $match: { status: { $ne: 'Completed' } } },
      { $group: { _id: null, total: { $sum: '$interest' } } }
    ]);

    const now = new Date();
    const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    const oneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const interestNext1Month = await LendingRecord.aggregate([
      { 
        $match: { 
          renewalDate: { $gte: now, $lte: oneMonth },
          status: { $ne: 'Completed' }
        } 
      },
      { $group: { _id: null, total: { $sum: '$interest' } } }
    ]);

    const interestNext6Months = await LendingRecord.aggregate([
      { 
        $match: { 
          renewalDate: { $gte: now, $lte: sixMonths },
          status: { $ne: 'Completed' }
        } 
      },
      { $group: { _id: null, total: { $sum: '$interest' } } }
    ]);

    const interestNext1Year = await LendingRecord.aggregate([
      { 
        $match: { 
          renewalDate: { $gte: now, $lte: oneYear },
          status: { $ne: 'Completed' }
        } 
      },
      { $group: { _id: null, total: { $sum: '$interest' } } }
    ]);

    // Count records by status
    const statusCounts = await LendingRecord.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      totalAmountLended: totalAmount[0]?.total || 0,
      totalInterestExpected: totalInterest[0]?.total || 0,
      interestNext1Month: interestNext1Month[0]?.total || 0,
      interestNext6Months: interestNext6Months[0]?.total || 0,
      interestNext1Year: interestNext1Year[0]?.total || 0,
      activeRecords: statusMap.Active || 0,
      completedRecords: statusMap.Completed || 0,
      overdueRecords: statusMap.Overdue || 0,
      totalRecords: statusCounts.reduce((sum, item) => sum + item.count, 0)
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create lending record
router.post('/', [
  auth,
  body('name').isLength({ min: 1, max: 100 }).trim().withMessage('Name is required and must be less than 100 characters'),
  body('amount').isNumeric().custom(value => {
    if (value <= 0) throw new Error('Amount must be greater than 0');
    if (value > 10000000) throw new Error('Amount cannot exceed 1 crore');
    return true;
  }),
  body('rateOfInterest').isNumeric().custom(value => {
    if (value < 0) throw new Error('Interest rate cannot be negative');
    if (value > 100) throw new Error('Interest rate cannot exceed 100%');
    return true;
  }),
  body('startDate').isISO8601().withMessage('Please provide a valid start date'),
  body('renewalDate').isISO8601().withMessage('Please provide a valid renewal date'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, amount, rateOfInterest, startDate, renewalDate, notes } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const renewal = new Date(renewalDate);
    const now = new Date();

    if (start >= renewal) {
      return res.status(400).json({ message: 'Renewal date must be after start date' });
    }

    if (start < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    const record = new LendingRecord({
      name,
      amount: parseFloat(amount),
      rateOfInterest: parseFloat(rateOfInterest),
      startDate: start,
      renewalDate: renewal,
      notes: notes || '',
      createdBy: req.user.userId
    });

    await record.save();
    await record.populate('createdBy', 'username');

    res.status(201).json({
      message: 'Lending record created successfully',
      record
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ message: 'Server error while creating record' });
  }
});

// Update lending record
router.put('/:id', [
  auth,
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('amount').optional().isNumeric().custom(value => value > 0),
  body('rateOfInterest').optional().isNumeric().custom(value => value >= 0 && value <= 100),
  body('startDate').optional().isISO8601(),
  body('renewalDate').optional().isISO8601(),
  body('status').optional().isIn(['Active', 'Completed', 'Overdue']),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, amount, rateOfInterest, startDate, renewalDate, status, notes } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (amount) updateData.amount = parseFloat(amount);
    if (rateOfInterest !== undefined) updateData.rateOfInterest = parseFloat(rateOfInterest);
    if (startDate) updateData.startDate = new Date(startDate);
    if (renewalDate) updateData.renewalDate = new Date(renewalDate);
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Validate dates if both are provided
    if (updateData.startDate && updateData.renewalDate) {
      if (updateData.renewalDate <= updateData.startDate) {
        return res.status(400).json({ message: 'Renewal date must be after start date' });
      }
    }

    const record = await LendingRecord.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({
      message: 'Record updated successfully',
      record
    });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ message: 'Server error while updating record' });
  }
});

// Delete lending record
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await LendingRecord.findByIdAndDelete(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ message: 'Server error while deleting record' });
  }
});

// Get single record
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await LendingRecord.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download selected records
router.post('/download', auth, async (req, res) => {
  try {
    const { recordIds, format = 'json' } = req.body;
    
    if (!recordIds || recordIds.length === 0) {
      return res.status(400).json({ message: 'No records selected for download' });
    }

    const records = await LendingRecord.find({
      _id: { $in: recordIds }
    }).populate('createdBy', 'username');

    if (format === 'csv') {
      const csv = [
        ['Name', 'Amount', 'Rate (%)', 'Start Date', 'Renewal Date', 'Interest', 'Total', 'Status', 'Notes'],
        ...records.map(record => [
          record.name,
          record.amount,
          record.rateOfInterest,
          record.startDate.toISOString().split('T')[0],
          record.renewalDate.toISOString().split('T')[0],
          record.interest,
          record.total,
          record.status,
          record.notes || ''
        ])
      ].map(row => row.join(',')).join('\n');

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="lending-records.csv"'
      });
      
      res.send(csv);
    } else {
      res.json({
        message: 'Records retrieved successfully',
        records
      });
    }
  } catch (error) {
    console.error('Error downloading records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
