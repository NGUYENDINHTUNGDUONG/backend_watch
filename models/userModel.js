const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please add a name"],
  },
  email: {
    type: String,
    required: [true, "please add an email"],
    unique: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "please enter a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "please add a password"],
    minlength: [6, "password must be at least 6 characters"],
  },
  role: {
    type: String,
    required: true,
    default: "customer",
    enum: ["customer", "admin"],
  },
  photo: {
    type: String,
    required: [true, "please add a photo"],
    default:
      "https://bathanh.com.vn/wp-content/uploads/2017/08/default_avatar.png",
  },
  phone: {
    type: String,
    default: "+84",
  },
  address: {
    type: Object,
  },
});
// Encrypt password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
