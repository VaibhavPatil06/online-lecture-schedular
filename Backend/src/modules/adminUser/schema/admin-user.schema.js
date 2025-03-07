import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

// Common schema for both admin and instructor
const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cookie: { type: String, required: false, default: "" },
    role: {
      type: String,
      enum: ["admin", "instructor"], // Roles can be either admin or instructor
      default: "instructor", // Default role is instructor
    },
    lastLoggedOut: { type: Date, required: false },
    lastLoggedIn: { type: Date, required: false },
    assignedLectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture", // Reference to the Lecture schema
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Create the model
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
