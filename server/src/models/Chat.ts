import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  content: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  conversationType: 'direct' | 'group';
  conversationName?: string;
  messages: IMessage[];
  lastMessage?: IMessage;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  conversationType: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  conversationName: {
    type: String,
    trim: true
  },
  messages: [messageSchema],
  lastMessage: messageSchema
}, {
  timestamps: true
});

// Indexes for better query performance
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

// Middleware to update lastMessage
chatSchema.pre('save', function(next) {
  if (this.messages.length > 0) {
    this.lastMessage = this.messages[this.messages.length - 1];
  }
  next();
});

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
