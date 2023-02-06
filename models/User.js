const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },

    pin: {
      type: String,
      required: true,
      minlength: 4,
      select: false,
    },

    amount: {
      required: true,
      type: Number,
    },
  },
  {
    timestamps: true, // mongoose creates time fields (createdAt & updatedAt) automatically
  }
);

// Encrypt pin using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("pin")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
});

// Match user entered pin to hashed pin in database
UserSchema.methods.matchPassword = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model("User", UserSchema);
