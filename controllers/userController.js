const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel.js");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register User
// Đăng ký
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate user data
  // Xác thực dữ liệu người dùng
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }
  // Check if user exists
  // Kiểm tra xem người dùng có tồn tại không
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("email has already been registered");
  }
  // Create new user
  // Tạo người dùng mới
  const user = await User.create({
    name,
    email,
    password,
  });
  const token = generateToken(user._id);
  if (user) {
    const { _id, name, email, role } = user;
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      // secure: true,
      // sameSite: "none",
    });
    // Send user data
    // Gửi dữ liệu người dùng
    res.status(201).json({
      _id,
      name,
      email,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});
// Login User
// Đăng nhập
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  // Xác thực yêu cầu
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }
  // Check if user exists
  // Kiểm tra xem người dùng có tồn tại không
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User does not exist.");
  }
  // User exists, check if password is correct
  // Người dùng đã tồn tại, kiểm tra xem mật khẩu có đúng không
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  // Generate token
  // Tạo mã thông báo
  const token = generateToken(user._id);
  if (user && passwordIsCorrect) {
    const newUser = await User.findOne({ email }).select("-password");
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      // secure: true,
      // sameSite: "none",
    });
    // Send user data
    // Gửi dữ liệu người dùng
    res.status(201).json(newUser);
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});
// logout user
// Đăng xuất
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    message: "Successfully logged out",
  });
});
// Get user
// Lấy người dùng
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
// get login Status
// Lấy trạng thái đăng nhập
const getLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify token
  // Xác thực token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    res.json(true);
  } else {
    res.json(false);
  }
});
// update user
// Cập nhật người dùng
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { name, phone, address } = user;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.address = req.body.address || address;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
// Update photo
// Cập nhật hình ảnh
const updatePhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.photo = req.body.photo || user.photo;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  getLoginStatus,
  updateUser,
  updatePhoto,
};
