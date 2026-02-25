import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
    },

    district: {
      type: String,
      required: true,
      enum: [
        "Colombo","Gampaha","Kalutara","Kandy","Matale",
        "Nuwara Eliya","Galle","Matara","Hambantota",
        "Jaffna","Kilinochchi","Mannar","Vavuniya",
        "Mullaitivu","Batticaloa","Ampara","Trincomalee",
        "Kurunegala","Puttalam","Anuradhapura",
        "Polonnaruwa","Badulla","Monaragala",
        "Ratnapura","Kegalle"
      ]
    },

    role: {
      type: String,
      enum: ["citizen", "admin", "auditor"],
      default: "citizen"
    
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    }
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);