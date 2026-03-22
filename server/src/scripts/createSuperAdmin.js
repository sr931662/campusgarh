const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

// Load environment variables
require('dotenv').config({
  path: '../../.env'
});

const createSuperAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
    if (existingAdmin) {
      console.log('Superadmin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create superadmin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin@campusgarh.com',
      password: 'Admin@123', // Change this to a strong password
      role: ROLES.ADMIN,
      isActive: true,
      emailVerified: true,
    });

    // Hash password (automatically done by pre-save hook)
    await superAdmin.save();

    console.log('Superadmin created successfully!');
    console.log(`Email: ${superAdmin.email}`);
    console.log('Password: Admin@123');
    console.log('Please change the password after first login.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
};

createSuperAdmin();