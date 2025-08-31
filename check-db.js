const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Equipment = require('./models/Equipment');

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-equipment');
    console.log('Connected to MongoDB');
    
    const users = await User.find();
    const categories = await Category.find();
    const equipment = await Equipment.find();
    
    console.log('\n=== Database Status ===');
    console.log(`Users: ${users.length}`);
    console.log(`Categories: ${categories.length}`);
    console.log(`Equipment: ${equipment.length}`);
    
    if (users.length > 0) {
      console.log('\n=== Users ===');
      users.forEach(user => {
        console.log(`- ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    }
    
    if (categories.length > 0) {
      console.log('\n=== Categories ===');
      categories.forEach(cat => {
        console.log(`- ${cat.name} (slug: ${cat.slug})`);
      });
    }
    
    if (equipment.length > 0) {
      console.log('\n=== Equipment ===');
      equipment.forEach(eq => {
        console.log(`- ${eq.name} (${eq.categoryId ? 'Has category' : 'No category'})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDatabase();
