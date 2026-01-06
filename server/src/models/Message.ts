import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: string;     // Supabase user id of sender
  recipientId: string;  // Supabase user id of recipient (mentor or student)
  text: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // TTL field – messages auto-delete after 14 days
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 14, // 14 days
    },
  },
  { timestamps: false }
);

// Helpful compound index for conversation queries
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
