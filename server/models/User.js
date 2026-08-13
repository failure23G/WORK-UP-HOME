const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER ID
    // 000001, 000002, 000003...
    // ==========================================

    userId: {
      type: String,
      unique: true,
      index: true,
    },

    // ==========================================
    // BASIC INFORMATION
    // ==========================================

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ==========================================
    // PASSWORD
    // ==========================================

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    // ==========================================
    // PROFILE
    // ==========================================

    profileImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // ROLE
    // ==========================================

    role: {
      type: String,
      enum: [
        "user",
        "freelancer",
        "client",
        "admin",
      ],
      default: "user",
    },

    // ==========================================
    // VERIFICATION
    // ==========================================

    isVerified: {
      type: Boolean,
      default: false,
    },

    authProvider: {
      type: String,
      enum: [
        "local",
        "google",
        "facebook",
        "phone",
      ],
      default: "local",
    },

    // ==========================================
    // MONEY
    // ==========================================

    wallet: {
      type: Number,
      default: 0,
    },

    earning: {
      type: Number,
      default: 0,
    },

    deposit: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// PASSWORD HASHING
// ==========================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

// ==========================================
// PASSWORD CHECK
// ==========================================

userSchema.methods.matchPassword =
  async function (enteredPassword) {
    return await bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

module.exports =
  mongoose.model("User", userSchema);