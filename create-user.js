const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model only
const User = require('./models/User');

const createOwnerUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-equipment');
    console.log('Connected to MongoDB');
    
    // Check if owner user already exists
    const existingOwner = await User.findOne({ username: 'owner' });
    if (existingOwner) {
      console.log('Owner user already exists!');
      console.log(`Username: ${existingOwner.username}`);
      console.log(`Email: ${existingOwner.email}`);
      console.log(`Role: ${existingOwner.role}`);
      process.exit(0);  
    }

    // Create owner user
    const ownerUser = await User.create({
      username: 'owner',
      email: 'owner@hafaksurgicals.com',
      password: 'HafakSurgicals2024!',
      role: 'super_admin'
    });

    console.log('✅ Owner user created successfully!');
    console.log('=====================================');
    console.log('Username: owner');
    console.log('Password: HafakSurgicals2024!');
    console.log('Email: owner@hafaksurgicals.com');
    console.log('Role: super_admin');
    console.log('=====================================');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating owner user:', error.message);
    process.exit(1);
  }
};

createOwnerUser();
