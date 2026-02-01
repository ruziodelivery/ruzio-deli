const OTP = require("../models/otp");

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove old OTPs for this phone
    await OTP.deleteMany({ phone });

    // Save new OTP
    await OTP.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // DEV MODE: return OTP in response
    if (process.env.OTP_DEV_MODE === "true") {
      console.log("🔐 DEV OTP:", otp);
      return res.json({
        success: true,
        message: "OTP generated (DEV MODE)",
        otp,
      });
    }

    // PROD MODE (later): Fast2SMS will go here

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

    const record = await OTP.findOne({ phone, otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteMany({ phone });
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP is valid → remove it
    await OTP.deleteMany({ phone });

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
