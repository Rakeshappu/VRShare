
import mongoose from 'mongoose';

const eligibleUSNSchema = new mongoose.Schema({
  usn: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Add index for faster queries
eligibleUSNSchema.index({ usn: 1 });
eligibleUSNSchema.index({ department: 1 });
eligibleUSNSchema.index({ semester: 1 });
eligibleUSNSchema.index({ isUsed: 1 });

// Safe export pattern for Next.js and Mongoose
let EligibleUSN: mongoose.Model<any>;

try {
  // Use existing model if it exists
  EligibleUSN = mongoose.model('EligibleUSN');
} catch (error) {
  // Otherwise, create a new model
  EligibleUSN = mongoose.model('EligibleUSN', eligibleUSNSchema);
}

export { EligibleUSN };
