import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  room: String,                     // e.g. "univ:<id>"
  sender: { type: Schema.Types.ObjectId, ref: "User" },
  text: String
}, { timestamps: true });

export const Message = model("Message", messageSchema);
