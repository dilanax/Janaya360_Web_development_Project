import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors("");
  };

  const validateForm = () => {
    if (!form.email.trim()) return "Email is required";
    if (!form.password) return "Password is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrors(validationError);
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/users/login", form);
      login(data.user || data, data.token);
      alert("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      setErrors(error.response?.data?.message || "Login failed. Check your credentials.");
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
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-8 text-sm">Sign in to Justice Link</p>

          {errors && (
            <div className="bg-red-900 bg-opacity-30 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm animate-fadeIn">
              {errors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Password *
              </label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-8"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* OTP Login Link */}
          <div className="border-t border-gray-600 my-6"></div>
          <p className="text-center text-gray-400 text-sm mb-4">
            Or login with OTP
          </p>
          <Link
            to="/otp-request"
            className="block w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 text-center"
          >
            Request OTP
          </Link>

          {/* Register Link */}
          <p className="text-center mt-6 text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
