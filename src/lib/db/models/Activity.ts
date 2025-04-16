
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['view', 'download', 'like', 'comment', 'share', 'upload'],
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  details: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Add timestamps for better tracking
});

// Create static helper methods
activitySchema.statics.trackActivity = async function(data: {
  userId: string | mongoose.Types.ObjectId;
  resourceId: string | mongoose.Types.ObjectId;
  type: 'view' | 'download' | 'like' | 'comment' | 'share' | 'upload';
  details?: object;
}) {
  return this.create({
    user: data.userId,
    resource: data.resourceId,
    type: data.type,
    details: data.details || {},
    timestamp: new Date()
  });
};

activitySchema.statics.getUserActivity = async function(userId: string | mongoose.Types.ObjectId, limit = 20) {
  return this.find({ user: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('resource', 'title type')
    .lean();
};

activitySchema.statics.getRecentActivities = async function(limit = 20) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user', 'fullName email role')
    .populate('resource', 'title type')
    .lean();
};

activitySchema.statics.getActivityCounts = async function(startDate?: Date, endDate?: Date) {
  const query: any = {};
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  const results = await this.aggregate([
    { $match: query },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  
  return results;
};

activitySchema.statics.getDailyActivityCounts = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          type: '$type'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

// Apply safe model pattern to prevent model redefinition in development
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

// Export the model
export { Activity };
