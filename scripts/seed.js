const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Equipment = require('../models/Equipment');

// Sample data
const sampleCategories = [
  {
    name: 'Surgical Instruments',
    description: 'Professional surgical instruments for medical procedures',
    icon: '🔪',
    sortOrder: 1
  },
  {
    name: 'Diagnostic Equipment',
    description: 'Advanced diagnostic tools for medical examinations',
    icon: '🔍',
    sortOrder: 2
  },
  {
    name: 'Patient Monitoring',
    description: 'Equipment for monitoring patient vital signs',
    icon: '📊',
    sortOrder: 3
  },
  {
    name: 'Emergency Equipment',
    description: 'Critical equipment for emergency medical situations',
    icon: '🚨',
    sortOrder: 4
  },
  {
    name: 'Laboratory Equipment',
    description: 'Tools and equipment for medical laboratory work',
    icon: '🧪',
    sortOrder: 5
  }
];

const sampleEquipment = [
  {
    name: 'Surgical Scalpel Set',
    description: 'Professional surgical scalpel set with multiple blade sizes',
    categoryId: null, // Will be set after categories are created
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    price: 299.99,
    availability: 'In Stock',
    specifications: ['Stainless steel blades', 'Ergonomic handles', 'Sterilizable'],
    features: ['Professional grade', 'Multiple blade sizes', 'Easy to use'],
    brand: 'MediPro',
    model: 'SS-2000',
    condition: 'New',
    warranty: '2 years',
    stockQuantity: 50,
    minStockLevel: 10
  },
  {
    name: 'Digital Stethoscope',
    description: 'Advanced digital stethoscope with noise reduction',
    categoryId: null,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
    price: 199.99,
    availability: 'In Stock',
    specifications: ['Digital amplification', 'Noise reduction', 'Bluetooth connectivity'],
    features: ['Clear sound', 'Recording capability', 'Mobile app integration'],
    brand: 'CardioTech',
    model: 'DS-500',
    condition: 'New',
    warranty: '3 years',
    stockQuantity: 25,
    minStockLevel: 5
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-equipment');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'owner' });
    if (existingAdmin) {
      console.log('Owner user already exists');
      return existingAdmin;
    }

    // Create owner user with professional credentials
    const ownerUser = await User.create({
      username: 'owner',
      email: 'owner@hafaksurgicals.com',
      password: 'HafakSurgicals2024!',
      role: 'super_admin'
    });

    console.log('Owner user created successfully!');
    console.log('Username: owner');
    console.log('Password: HafakSurgicals2024!');
    console.log('Email: owner@hafaksurgicals.com');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    return ownerUser;
  } catch (error) {
    console.error('Error creating owner user:', error);
    throw error;
  }
};

// Create categories
const createCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    
    // Create categories one by one to ensure proper slug generation
    const categories = [];
    for (const categoryData of sampleCategories) {
      const category = await Category.create(categoryData);
      categories.push(category);
      console.log(`Created category: ${category.name} (slug: ${category.slug})`);
    }
    
    console.log(`${categories.length} categories created successfully`);
    return categories;
  } catch (error) {
    console.error('Error creating categories:', error);
    throw error;
  }
};

// Create equipment
const createEquipment = async (categories) => {
  try {
    // Clear existing equipment
    await Equipment.deleteMany({});
    
    // Set category IDs
    const diagnosticCategory = categories.find(cat => cat.name === 'Diagnostic Equipment');
    const surgicalCategory = categories.find(cat => cat.name === 'Surgical Instruments');
    
    if (diagnosticCategory && surgicalCategory) {
      sampleEquipment[0].categoryId = surgicalCategory._id;
      sampleEquipment[1].categoryId = diagnosticCategory._id;
    }
    
    // Create equipment
    const equipment = await Equipment.insertMany(sampleEquipment);
    console.log(`${equipment.length} equipment items created`);
    
    return equipment;
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    // Create owner user
    const ownerUser = await createAdminUser();
    
    // Create categories
    const categories = await createCategories();
    
    // Create equipment
    const equipment = await createEquipment(categories);
    
    console.log('Database seeding completed successfully!');
    console.log(`Owner user: ${ownerUser.username}`);
    console.log(`Categories created: ${categories.length}`);
    console.log(`Equipment created: ${equipment.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
