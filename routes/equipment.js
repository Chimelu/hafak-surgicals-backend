const express = require('express');
const Equipment = require('../models/Equipment');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary, handleUploadError } = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// @desc    Get all public equipment for website
// @route   GET /api/equipment/public
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const category = req.query.category || '';

    // Build query for public equipment only
    let query = { isActive: true, isPublic: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      // Find category by name and get its ID
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      }
    }

    // Execute query with pagination
    const equipment = await Equipment.find(query)
      .populate('categoryId', 'name')
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Equipment.countDocuments(query);

    res.json({
      success: true,
      count: equipment.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: equipment
    });
  } catch (error) {
    console.error('Get public equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get featured equipment for homepage
// @route   GET /api/equipment/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const featuredEquipment = await Equipment.find({
      isActive: true,
      isPublic: true,
      isFeatured: true
    })
    .populate('categoryId', 'name')
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      data: featuredEquipment
    });
  } catch (error) {
    console.error('Get featured equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single public equipment by ID
// @route   GET /api/equipment/public/:id
// @access  Public
router.get('/public/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      isActive: true,
      isPublic: true
    }).populate('categoryId', 'name description');

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Get public equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Search public equipment
// @route   GET /api/equipment/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchResults = await Equipment.find({
      isActive: true,
      isPublic: true,
      $text: { $search: query }
    })
    .populate('categoryId', 'name')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);

    res.json({
      success: true,
      data: searchResults
    });
  } catch (error) {
    console.error('Search equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get equipment categories for public use
// @route   GET /api/equipment/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    // Get categories that have public equipment
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'equipment',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'equipment'
        }
      },
      {
        $match: {
          'equipment.isPublic': true,
          'equipment.isActive': true
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          icon: 1,
          equipmentCount: { $size: '$equipment' }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// ADMIN ROUTES (Authentication required)
// ========================================

// @desc    Get all equipment with pagination and filtering
// @route   GET /api/equipment
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const categoryId = req.query.categoryId || '';
    const availability = req.query.availability || '';

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (availability) {
      query.availability = availability;
    }

    // Execute query with pagination
    const equipment = await Equipment.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Equipment.countDocuments(query);

    res.json({
      success: true,
      count: equipment.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: equipment
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('categoryId', 'name description');

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Public (no auth required)
router.post('/', upload.any(), async (req, res) => {
  try {
    console.log('Create equipment request received');
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);
    
    const equipmentData = { ...req.body };
    let imageUrl = null;

    // Handle image upload if present
    if (req.files && req.files.length > 0) {
      try {
        // Find the first image file
        const imageFile = req.files.find(file => file.mimetype.startsWith('image/'));
        
        if (imageFile) {
          console.log('Processing image upload...');
          console.log('File details:', {
            fieldname: imageFile.fieldname,
            originalname: imageFile.originalname,
            mimetype: imageFile.mimetype,
            size: imageFile.size,
            buffer: imageFile.buffer ? imageFile.buffer.length : 'no buffer'
          });

          // Upload to Cloudinary using the buffer
          const result = await cloudinary.uploader.upload(`data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`, {
            folder: 'hafak-surgicals',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          });

          imageUrl = result.secure_url;
          console.log('Image uploaded to Cloudinary:', imageUrl);
        }
      } catch (error) {
        console.error('Image upload error:', error);
        // Continue without image if upload fails
      }
    }

    // Handle case where image URL is provided in JSON body
    if (!imageUrl && equipmentData.image && equipmentData.image.startsWith('http')) {
      console.log('Using provided image URL:', equipmentData.image);
      imageUrl = equipmentData.image;
    }

    // Create equipment
    await createEquipment();

    async function createEquipment() {
      try {
        // Handle FormData arrays properly
        if (equipmentData.specifications) {
          if (typeof equipmentData.specifications === 'string') {
            equipmentData.specifications = [equipmentData.specifications];
          } else if (Array.isArray(equipmentData.specifications)) {
            equipmentData.specifications = equipmentData.specifications;
          }
        }

        if (equipmentData.features) {
          if (typeof equipmentData.features === 'string') {
            equipmentData.features = [equipmentData.features];
          } else if (Array.isArray(equipmentData.features)) {
            equipmentData.features = equipmentData.features;
          }
        }

        // Convert numeric fields
        if (equipmentData.price) {
          equipmentData.price = parseFloat(equipmentData.price);
        }
        if (equipmentData.stockQuantity) {
          equipmentData.stockQuantity = parseInt(equipmentData.stockQuantity);
        }
        if (equipmentData.minStockLevel) {
          equipmentData.minStockLevel = parseInt(equipmentData.minStockLevel);
        }

        // Add image URL if uploaded or provided
        if (imageUrl) {
          equipmentData.image = imageUrl;
        }

        console.log('Processed equipment data:', equipmentData);

        // Validate category exists
        if (equipmentData.categoryId) {
          const category = await Category.findById(equipmentData.categoryId);
          if (!category) {
            return res.status(400).json({ 
              success: false,
              message: 'Invalid category',
              errors: { categoryId: 'Selected category does not exist' }
            });
          }
        }

        const equipment = await Equipment.create(equipmentData);

        // Populate category name
        await equipment.populate('categoryId', 'name');

        res.status(201).json({
          success: true,
          data: equipment
        });
      } catch (error) {
        console.error('Create equipment error:', error);
        
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
            message: 'Equipment with this name already exists',
            errors: { name: 'Equipment name must be unique' }
          });
        }
        
        res.status(500).json({ 
          success: false,
          message: 'Server error' 
        });
      }
    }

  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({
      success: false,
      message: 'Request failed',
      error: error.message
    });
  }
});

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private
router.put('/:id', protect, authorize('admin', 'super_admin'), upload.single('image'), uploadToCloudinary, handleUploadError, async (req, res) => {
  try {
    const equipmentData = req.body;

    // Validate category exists if updating
    if (equipmentData.categoryId) {
      const category = await Category.findById(equipmentData.categoryId);
      if (!category) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid category',
          errors: { categoryId: 'Selected category does not exist' }
        });
      }
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      equipmentData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    if (!equipment) {
      return res.status(404).json({ 
        success: false,
        message: 'Equipment not found' 
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    
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
        message: 'Equipment with this name already exists',
        errors: { name: 'Equipment name must be unique' }
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});   

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private
router.delete('/:id', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get equipment statistics
// @route   GET /api/equipment/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalEquipment = await Equipment.countDocuments({ isActive: true });
    const inStock = await Equipment.countDocuments({ isActive: true, availability: 'In Stock' });
    const outOfStock = await Equipment.countDocuments({ isActive: true, availability: 'Out of Stock' });
    const lowStock = await Equipment.countDocuments({ isActive: true, availability: 'Low Stock' });

    // Get category distribution
    const categoryStats = await Equipment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $project: {
          categoryName: { $arrayElemAt: ['$category.name', 0] },
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalEquipment,
        inStock,
        outOfStock,
        lowStock,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Test image upload to Cloudinary
// @route   POST /api/equipment/test-upload
// @access  Public
router.post('/test-upload', upload.any(), async (req, res) => {
  try {
    console.log('Test upload request received');
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Get the first file (assuming it's an image)
    const file = req.files[0];
    
    console.log('File details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? file.buffer.length : 'no buffer'
    });

    // Check if it's an image
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'File must be an image'
      });
    }

    // Upload to Cloudinary using the buffer
    const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
      folder: 'hafak-surgicals',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });

  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({
      success: false,
      message: 'Request failed',
      error: error.message
    });
  }
});

module.exports = router;
