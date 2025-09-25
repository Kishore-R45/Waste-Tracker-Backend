const mongoose = require('mongoose');
const User = require('../models/User');
const { calculateUserScore } = require('../utils/scoring');
require('dotenv').config();

const updateScores = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      const score = await calculateUserScore(user._id);
      user.reductionScore = score;
      await user.save();
      console.log(`Updated ${user.name}: ${score} points`);
    }

    console.log('✅ All scores updated!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateScores();