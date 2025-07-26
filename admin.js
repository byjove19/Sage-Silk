require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Database connection
mongoose.connect(process.env.DATABASE_URL)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Admin schema and model
const adminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'sage@admin@silk', 10);
      
      const admin = new Admin({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: hashedPassword
      });

      await admin.save();
      console.log('✅ Admin user created successfully');
      console.log(`Username: ${admin.username}`);
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();