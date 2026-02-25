import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

function OTPVerify() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    // Get email from localStorage or redirect
    const storedEmail = localStorage.getItem("otpEmail");
    if (!storedEmail) {
      navigate("/otp-request");
      return;
    }
    setEmail(storedEmail);

    // Timer for OTP expiry
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Allow only single character
    if (!/^[0-9]*$/.test(value)) return; // Allow only numbers

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setErrors("Please enter all 6 digits of OTP");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/users/verify-otp", {
        email,
        otp: otpCode,
      });

      // Use AuthContext to store user
      login(data.user || data, data.token);
      localStorage.removeItem("otpEmail");

      alert("OTP verified successfully! Logging in...");
      navigate("/dashboard");
    } catch (error) {
      setErrors(error.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await API.post("/users/send-otp", { email });
      setOTP(["", "", "", "", "", ""]);
      setTimeLeft(600);
      setErrors("");
      alert("OTP resent to your email");
    } catch (error) {
      setErrors(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-5">
      {/* Animated Blob Background */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-800 backdrop-blur-xl bg-opacity-80 rounded-2xl shadow-2xl p-10 border border-gray-700 animate-slideUp">
          <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
          <p className="text-gray-400 mb-2 text-sm">Enter the 6-digit code sent to your email</p>
          <p className="text-gray-500 text-xs mb-6">
            Email: <span className="text-indigo-400 font-semibold">{email}</span>
          </p>

          {errors && (
            <div className="bg-red-900 bg-opacity-30 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm animate-fadeIn">
              {errors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Fields */}
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-gray-800 text-center text-2xl font-semibold transition-all duration-300"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Time remaining: <span className={`font-semibold ${timeLeft < 60 ? 'text-red-400' : 'text-indigo-400'}`}>{formatTime(timeLeft)}</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          {/* Resend OTP Link */}
          <p className="text-center mt-6 text-gray-400 text-sm">
            Didn't receive OTP?{" "}
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors bg-none border-none cursor-pointer disabled:opacity-50"
            >
              Resend
            </button>
          </p>

          <p className="text-center mt-4 text-gray-400 text-sm">
            <button
              onClick={() => navigate("/otp-request")}
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors bg-none border-none cursor-pointer"
            >
              Use different email
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OTPVerify;
