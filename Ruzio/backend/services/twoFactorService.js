const axios = require("axios");

const sendOTP = async (phone) => {
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN`
    );

    return response.data;
  } catch (error) {
    console.error("2Factor Error:", error.response?.data || error.message);
    throw error;
  }
};

const verifyOTP = async (sessionId, otp) => {
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    return response.data;
  } catch (error) {
    console.error("2Factor Verify Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendOTP, verifyOTP };
