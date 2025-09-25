const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const WasteLog = require('../models/WasteLog');
const Tip = require('../models/Tip');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await WasteLog.deleteMany({});
    await Tip.deleteMany({});

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        reductionScore: 85
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        reductionScore: 72
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        reductionScore: 65
      }
    ]);

    // Create sample waste logs
    const today = new Date();
    const wasteLogs = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      for (const user of users) {
        wasteLogs.push({
          userId: user._id,
          date,
          plastic: Math.random() * 2,
          organic: Math.random() * 3,
          paper: Math.random() * 1.5,
          glass: Math.random() * 1
        });
      }
    }
    
    await WasteLog.create(wasteLogs);

    // Create tips
    const tips = [
      {
        category: 'plastic',
        threshold: 1.0,
        text: 'Use reusable shopping bags instead of plastic ones',
        priority: 1
      },
      {
        category: 'plastic',
        threshold: 2.0,
        text: 'Switch to a reusable water bottle',
        priority: 1
      },
      {
        category: 'organic',
        threshold: 2.0,
        text: 'Start composting your kitchen waste',
        priority: 1
      },
      {
        category: 'paper',
        threshold: 1.0,
        text: 'Use digital documents when possible',
        priority: 2
      },
      {
        category: 'glass',
        threshold: 0.5,
        text: 'Reuse glass jars for storage',
        priority: 2
      }
    ];
    
    await Tip.create(tips);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();