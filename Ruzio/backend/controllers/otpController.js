const OTP = require("../models/otp");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // 🔴 DUMMY MODE: do NOTHING, just respond OK
    if (process.env.OTP_DEV_MODE === "true") {
      return res.json({
        success: true,
        message: "Dummy OTP enabled. Use 123456",
      });
    }

    // ===== REAL OTP LOGIC (for later) =====
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ phone });

    await OTP.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // 🔴 DUMMY OTP LOGIN (THIS IS WHAT YOU WANT)
    if (process.env.OTP_DEV_MODE === "true" && otp === "123456") {
      let user = await User.findOne({ phone });

      if (!user) {
        user = await User.create({
          phone,
          name: "User",
          otp: { verified: true },
        });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        token,
        user,
      });
    }

    // ===== REAL OTP VERIFY (for later) =====
    const record = await OTP.findOne({ phone, otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteMany({ phone });
      return res.status(400).json({ message: "OTP expired" });
    }

    await OTP.deleteMany({ phone });

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        name: "User",
        otp: { verified: true },
      });
    } else {
      user.otp.verified = true;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
