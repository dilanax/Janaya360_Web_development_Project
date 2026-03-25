import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const passwordValidator = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      match: [
        passwordValidator,
        "Password must be at least 8 characters and include letters and numbers"
      ],
      select: false // ??? password default eken return wenne na
    },

    phone: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"]
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
      enum: ["citizen", "admin"],
      default: "citizen"
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    },

    otp: {
      type: String,
      default: null
    },

    otpExpiry: {
      type: Date,
      default: null
    },

    otpVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);



// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



// 🔑 Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



// ❌ Remove sensitive fields when returning JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};



export default mongoose.model("User", userSchema);