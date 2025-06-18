import User from './models/userSchema.js';

const adminInit = async () => {
  try {
    // Check if the admin user already exists
    const admin = new User({
      username: 'Admin',
      password: 'Admin123',
      role: 'admin'
    });
    const existingAdmin = await User.findOne({ username: admin.username });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }
    await admin.save();
    console.log('Admin user created successfully.');
    } catch (error) {
    console.error('Error creating admin user:', error);
    }
};

export default adminInit;