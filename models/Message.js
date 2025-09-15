import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: function() {
      return this.type === 'text';
    },
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  attachment: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
MessageSchema.index({ room: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ isDeleted: 1 });

// Mark message as read by user
MessageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => 
    read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Add reaction to message
MessageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(reaction => 
    reaction.user.toString() === userId.toString() && reaction.emoji === emoji
  );
  
  if (!existingReaction) {
    this.reactions.push({
      user: userId,
      emoji: emoji,
      createdAt: new Date()
    });
  }
  
  return this.save();
};

// Remove reaction from message
MessageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(reaction => 
    !(reaction.user.toString() === userId.toString() && reaction.emoji === emoji)
  );
  return this.save();
};

// Soft delete message
MessageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = '[This message was deleted]';
  return this.save();
};

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);