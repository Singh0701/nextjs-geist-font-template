import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  content: string;
  poster: mongoose.Types.ObjectId;
  type: 'hangout' | 'urgent' | 'help';
  connectionScope: 'first' | 'second' | 'third';
  location: {
    type: string;
    coordinates: number[];
    description: string;
  };
  expiresAt: Date;
  maxReplies: number;
  maxAccepts: number;
  replies: Array<{
    user: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  content: {
    type: String,
    required: true,
    trim: true
  },
  poster: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['hangout', 'urgent', 'help'],
    default: 'hangout'
  },
  connectionScope: {
    type: String,
    enum: ['first', 'second', 'third'],
    default: 'second'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    description: {
      type: String,
      required: true
    }
  },
  expiresAt: {
    type: Date,
    required: true
  },
  maxReplies: {
    type: Number,
    default: 3,
    max: 6
  },
  maxAccepts: {
    type: Number,
    default: 1,
    max: 6
  },
  replies: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

// Create indexes
postSchema.index({ location: '2dsphere' });
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Post = mongoose.model<IPost>('Post', postSchema);
