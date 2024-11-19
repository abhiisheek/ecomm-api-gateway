import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  gender: {
    type: String,
    required: true,
    enum: ["MALE", "FEMALE", "OTHERS"],
  },
  dob: { type: String, required: true },
  avatarURL: { type: String },
  wishlist: [{ type: String }],
});

export default mongoose.model("Users", userSchema);
