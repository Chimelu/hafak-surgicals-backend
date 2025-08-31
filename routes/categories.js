const express = require('express');
const Category = require('../models/Category');
const Equipment = require('../models/Equipment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
router.get('/',  async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
router.get('/:id',  async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
router.post('/',  async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
        errors: { name: 'Category name must be unique' }
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
        errors: { name: 'Category name must be unique' }
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Check if category has equipment
    const equipmentCount = await Equipment.countDocuments({ 
      categoryId: req.params.id, 
      isActive: true 
    });

    if (equipmentCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${equipmentCount} active equipment items.` 
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get category with equipment count
// @route   GET /api/categories/:id/equipment
// @access  Private
router.get('/:id/equipment', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const equipment = await Equipment.find({ 
      categoryId: req.params.id, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

    const total = await Equipment.countDocuments({ 
      categoryId: req.params.id, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        category,
        equipment: {
          count: equipment.length,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          items: equipment
        }
      }
    });
  } catch (error) {
    console.error('Get category equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get categories with equipment counts
// @route   GET /api/categories/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const categories = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'equipment',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'equipment'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          icon: 1,
          equipmentCount: { $size: '$equipment' },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { sortOrder: 1, name: 1 } }
    ]);

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get categories stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
