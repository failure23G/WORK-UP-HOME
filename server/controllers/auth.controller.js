const User = require("../models/User");
const Counter = require("../models/Counter");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ========================================
// CREATE JWT TOKEN
// ========================================

const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ========================================
// GENERATE USER ID
// 000001
// 000002
// 000003
// ========================================

const generateUserId = async () => {
  const counter =
    await Counter.findOneAndUpdate(
      {
        name: "userId",
      },
      {
        $inc: {
          seq: 1,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

  return String(counter.seq).padStart(
    6,
    "0"
  );
};

// ========================================
// REGISTER
// ========================================

const register = async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      password,
      phone,
    } = req.body;

    // ======================================
    // NAME
    // ======================================

    const finalName =
      name?.trim() ||
      fullName?.trim();

    if (
      !finalName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    // ======================================
    // PASSWORD
    // ======================================

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    // ======================================
    // EMAIL
    // ======================================

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists with this email",
      });
    }

    // ======================================
    // PHONE
    // ======================================

    const normalizedPhone =
      phone?.trim() || "";

    if (normalizedPhone) {
      const existingPhone =
        await User.findOne({
          phone: normalizedPhone,
        });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message:
            "User already exists with this phone number",
        });
      }
    }

    // ======================================
    // GENERATE USER ID
    // ======================================

    const userId =
      await generateUserId();

    // ======================================
    // CREATE USER
    //
    // IMPORTANT:
    // password is NOT hashed here.
    // User.js pre-save hook hashes it.
    // ======================================

    const user =
      await User.create({
        userId,

        fullName: finalName,

        email:
          normalizedEmail,

        password,

        phone:
          normalizedPhone,

        role: "user",

        earning: 0,

        deposit: 0,

        wallet: 0,

        profileImage: "",

        bio: "",

        isVerified: false,

        authProvider: "local",
      });

    // ======================================
    // TOKEN
    // ======================================

    const token =
      generateToken(user._id);

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(201).json({
      success: true,

      message:
        "Registration successful",

      token,

      user: {
        id: user._id,

        userId:
          user.userId,

        name:
          user.fullName,

        fullName:
          user.fullName,

        email:
          user.email,

        phone:
          user.phone,

        profileImage:
          user.profileImage,

        bio:
          user.bio,

        earning:
          user.earning || 0,

        deposit:
          user.deposit || 0,

        wallet:
          user.wallet || 0,

        role:
          user.role,

        isVerified:
          user.isVerified,
      },
    });
  } catch (error) {
    console.error(
      "Register Error:",
      error
    );

    // ======================================
    // MONGOOSE VALIDATION ERROR
    // ======================================

    if (
      error.name ===
      "ValidationError"
    ) {
      const validationMessages =
        Object.values(
          error.errors
        )
          .map(
            (item) =>
              item.message
          )
          .join(", ");

      return res.status(400).json({
        success: false,
        message:
          validationMessages ||
          "User validation failed",
      });
    }

    // ======================================
    // DUPLICATE KEY
    // ======================================

    if (
      error.code === 11000
    ) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return res.status(400).json({
        success: false,
        message:
          duplicateField
            ? `${duplicateField} already exists`
            : "Duplicate user information",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Server error during registration",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // password select:false
    // তাই +password দরকার

    const user =
      await User.findOne({
        email:
          email.toLowerCase().trim(),
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ======================================
    // PASSWORD CHECK
    // ======================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ======================================
    // TOKEN
    // ======================================

    const token =
      generateToken(user._id);

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      token,

      user: {
        id:
          user._id,

        userId:
          user.userId,

        name:
          user.fullName,

        fullName:
          user.fullName,

        email:
          user.email,

        phone:
          user.phone,

        profileImage:
          user.profileImage,

        bio:
          user.bio,

        earning:
          user.earning || 0,

        deposit:
          user.deposit || 0,

        wallet:
          user.wallet || 0,

        role:
          user.role,

        isVerified:
          user.isVerified,
      },
    });
  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error during login",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// ========================================
// GET CURRENT USER
// ========================================

const getMe = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      success: true,

      user: {
        id:
          user._id,

        userId:
          user.userId,

        name:
          user.fullName,

        fullName:
          user.fullName,

        email:
          user.email,

        phone:
          user.phone,

        profileImage:
          user.profileImage,

        bio:
          user.bio,

        earning:
          user.earning || 0,

        deposit:
          user.deposit || 0,

        wallet:
          user.wallet || 0,

        role:
          user.role,

        isVerified:
          user.isVerified,
      },
    });
  } catch (error) {
    console.error(
      "Get Me Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while getting user",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// ========================================
// UPDATE PROFILE
// ========================================

const updateProfile = async (
  req,
  res
) => {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      bio,
    } = req.body;

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // ======================================
    // UPDATE NAME
    // ======================================

    if (
      name !== undefined ||
      fullName !== undefined
    ) {
      const newName =
        name !== undefined
          ? name.trim()
          : fullName.trim();

      if (newName) {
        user.fullName =
          newName;
      }
    }

    // ======================================
    // UPDATE EMAIL
    // ======================================

    if (email !== undefined) {
      const newEmail =
        email
          .toLowerCase()
          .trim();

      if (
        newEmail !==
        user.email
      ) {
        const emailExists =
          await User.findOne({
            email:
              newEmail,

            _id: {
              $ne:
                user._id,
            },
          });

        if (emailExists) {
          return res.status(400).json({
            success: false,
            message:
              "This email is already in use",
          });
        }

        user.email =
          newEmail;
      }
    }

    // ======================================
    // UPDATE PHONE
    // ======================================

    if (phone !== undefined) {
      const newPhone =
        phone.trim();

      if (
        newPhone &&
        newPhone !==
          user.phone
      ) {
        const phoneExists =
          await User.findOne({
            phone:
              newPhone,

            _id: {
              $ne:
                user._id,
            },
          });

        if (phoneExists) {
          return res.status(400).json({
            success: false,
            message:
              "This phone number is already in use",
          });
        }
      }

      user.phone =
        newPhone;
    }

    // ======================================
    // UPDATE BIO
    // ======================================

    if (bio !== undefined) {
      user.bio =
        bio.trim();
    }

    // ======================================
    // SAVE
    // ======================================

    const updatedUser =
      await user.save();

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,

      message:
        "Profile updated successfully",

      user: {
        id:
          updatedUser._id,

        userId:
          updatedUser.userId,

        name:
          updatedUser.fullName,

        fullName:
          updatedUser.fullName,

        email:
          updatedUser.email,

        phone:
          updatedUser.phone,

        bio:
          updatedUser.bio,

        profileImage:
          updatedUser.profileImage,

        earning:
          updatedUser.earning || 0,

        deposit:
          updatedUser.deposit || 0,

        wallet:
          updatedUser.wallet || 0,
      },
    });
  } catch (error) {
    console.error(
      "Update Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while updating profile",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// ========================================
// UPLOAD PROFILE IMAGE
// ========================================

const uploadProfileImage =
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please select an image",
        });
      }

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const imageUrl =
        `/uploads/${req.file.filename}`;

      user.profileImage =
        imageUrl;

      const updatedUser =
        await user.save();

      return res.status(200).json({
        success: true,

        message:
          "Profile picture uploaded successfully",

        profileImage:
          updatedUser.profileImage,

        user: {
          id:
            updatedUser._id,

          userId:
            updatedUser.userId,

          name:
            updatedUser.fullName,

          fullName:
            updatedUser.fullName,

          email:
            updatedUser.email,

          phone:
            updatedUser.phone,

          bio:
            updatedUser.bio,

          profileImage:
            updatedUser.profileImage,

          earning:
            updatedUser.earning || 0,

          deposit:
            updatedUser.deposit || 0,

          wallet:
            updatedUser.wallet || 0,
        },
      });
    } catch (error) {
      console.error(
        "Upload Profile Image Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while uploading profile picture",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  };

// ========================================
// CHANGE PASSWORD
// ========================================

const changePassword =
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
        confirmPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Current password, new password and confirm password are required",
        });
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return res.status(400).json({
          success: false,

          message:
            "New passwords do not match",
        });
      }

      if (
        newPassword.length < 6
      ) {
        return res.status(400).json({
          success: false,

          message:
            "New password must be at least 6 characters long",
        });
      }

      const user =
        await User.findById(
          req.user.id
        ).select(
          "+password"
        );

      if (!user) {
        return res.status(404).json({
          success: false,

          message:
            "User not found",
        });
      }

      const currentPasswordMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (
        !currentPasswordMatch
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Current password is incorrect",
        });
      }

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.password
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,

          message:
            "New password must be different from current password",
        });
      }

      // IMPORTANT:
      // এখানে bcrypt.hash করা হবে না।
      // User.js pre-save hook hash করবে।

      user.password =
        newPassword;

      await user.save();

      return res.status(200).json({
        success: true,

        message:
          "Password changed successfully",
      });
    } catch (error) {
      console.error(
        "Change Password Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while changing password",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  };

// ========================================
// EXPORT
// ========================================

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfileImage,
  changePassword,
};