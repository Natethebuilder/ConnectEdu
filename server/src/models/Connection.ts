import mongoose, { Schema, Document } from "mongoose";

export interface IConnection extends Document {
  userId: string;     // the student or mentor
  otherId: string;    // the other participant
  lastMessage: string;
  lastTimestamp: Date;
  unread: number;      // how many unread messages for THIS user
}

const connectionSchema = new Schema<IConnection>({
  userId: { type: String, required: true, index: true },
  otherId: { type: String, required: true, index: true },
  lastMessage: { type: String, default: "" },
  lastTimestamp: { type: Date, default: Date.now },
  unread: { type: Number, default: 0 },
});

connectionSchema.index({ userId: 1, lastTimestamp: -1 });

export const Connection = mongoose.model<IConnection>(
  "Connection",
  connectionSchema
);
