const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Equipment = require('./models/Equipment');

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-equipment');
    console.log('Connected to MongoDB');
    
    console.log('Clearing existing data...');
    
    // Clear all collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Equipment.deleteMany({});
    
    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearDatabase();
