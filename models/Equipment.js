const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [200, 'Equipment name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Equipment description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  image: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: null
  },
  availability: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Low Stock'],
    default: 'In Stock'
  },
  specifications: [{
    type: String,
    trim: true,
    maxlength: [200, 'Specification cannot exceed 200 characters']
  }],
  features: [{
    type: String,
    trim: true,
    maxlength: [200, 'Feature cannot exceed 200 characters']
  }],
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand cannot exceed 100 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  condition: {
    type: String,
    enum: ['New', 'Used', 'Refurbished'],
    default: 'New'
  },
  warranty: {
    type: String,
    trim: true,
    maxlength: [100, 'Warranty cannot exceed 100 characters']
  },
  stockQuantity: {
    type: Number,
    min: [0, 'Stock quantity cannot be negative'],
    default: 1
  },
  minStockLevel: {
    type: Number,
    min: [0, 'Minimum stock level cannot be negative'],
    default: 1
  },
  // Public-facing fields
  isPublic: {
    type: Boolean,
    default: true,
    description: 'Whether this equipment is visible on public website'
  },
  isFeatured: {
    type: Boolean,
    default: false,
    description: 'Whether this equipment is featured on homepage'
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: null
  },
  reviewCount: {
    type: Number,
    min: [0, 'Review count cannot be negative'],
    default: 0
  },
  sortOrder: {
    type: Number,
    default: 0,
    description: 'Order for display on public website'
  },
  // Admin fields
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  slug: {
    type: String,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Create slug from name before saving
equipmentSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Virtual for category name
equipmentSchema.virtual('categoryName', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
  select: 'name'
});

// Index for search
equipmentSchema.index({ name: 'text', description: 'text', brand: 'text', model: 'text' });

// Ensure virtual fields are serialized
equipmentSchema.set('toJSON', { virtuals: true });
equipmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
