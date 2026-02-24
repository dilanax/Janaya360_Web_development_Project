import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function OTPRequest() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setSuccess("");
    setGeneratedOTP("");

    if (!email.trim()) {
      setErrors("Email is required");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/users/send-otp", { email });
      setSuccess(data.message || "OTP sent to your email!");
      
      // For development/testing - show the OTP
      if (data.otp) {
        setGeneratedOTP(data.otp);
      }
      
      // Store email for OTP verification
      localStorage.setItem("otpEmail", email);
      
      // Redirect to OTP verification after 3 seconds
      setTimeout(() => {
        navigate("/verify-otp");
      }, 3000);
    } catch (error) {
      setErrors(error.response?.data?.message || "Failed to send OTP. Try again.");
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
          <h2 className="text-3xl font-bold text-white mb-2">Request OTP</h2>
          <p className="text-gray-400 mb-8 text-sm">Enter your email to receive a one-time password</p>

          {errors && (
            <div className="bg-red-900 bg-opacity-30 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm animate-fadeIn">
              {errors}
            </div>
          )}

          {success && (
            <div className="bg-green-900 bg-opacity-30 border-l-4 border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm animate-fadeIn">
              <p className="font-semibold">{success}</p>
              <p className="text-xs mt-2">Redirecting to OTP verification...</p>
              {generatedOTP && (
                <div className="mt-3 p-3 bg-green-800 bg-opacity-50 rounded border border-green-600">
                  <p className="text-xs text-green-200 mb-1">📌 Development Mode - OTP Code:</p>
                  <p className="text-lg font-bold text-green-300 tracking-widest">{generatedOTP}</p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors("");
                }}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-8"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an OTP?{" "}
            <button
              onClick={() => navigate("/verify-otp")}
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors bg-none border-none cursor-pointer"
            >
              Verify here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OTPRequest;
