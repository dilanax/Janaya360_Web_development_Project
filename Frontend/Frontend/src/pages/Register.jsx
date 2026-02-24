import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    district: "",
    role: "citizen",
  });
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  const districts = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale",
    "Nuwara Eliya", "Galle", "Matara", "Hambantota",
    "Jaffna", "Kilinochchi", "Mannar", "Vavuniya",
    "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
    "Kurunegala", "Puttalam", "Anuradhapura",
    "Polonnaruwa", "Badulla", "Monaragala",
    "Ratnapura", "Kegalle"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors("");
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters";
    if (!form.phone || form.phone.length !== 10 || !/^[0-9]{10}$/.test(form.phone)) {
      return "Phone number must be exactly 10 digits";
    }
    if (!form.district) return "Please select a district";
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
      const { data } = await API.post("/users/register", form);
      alert("Registered Successfully!");
      navigate("/login");
      console.log(data);
    } catch (error) {
      setErrors(error.response?.data?.message || "Registration failed. Try again.");
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
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-8 text-sm">Join Justice Link Community</p>

          {errors && (
            <div className="bg-red-900 bg-opacity-30 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm animate-fadeIn">
              {errors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Full Name *
              </label>
              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

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

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Phone Number *
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="10-digit phone number"
                value={form.phone}
                onChange={handleChange}
                maxLength="10"
                className="form-input"
                required
              />
              <p className="text-xs text-gray-400 mt-1">10 digits only (e.g., 0701234567)</p>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                District *
              </label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select a district</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Password *
              </label>
              <input
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                required
              />
              <p className="text-xs text-gray-400 mt-1">At least 6 characters for security</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-8"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
