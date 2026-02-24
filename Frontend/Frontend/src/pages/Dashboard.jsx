import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [navigate, currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/users");
      setUsers(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users. Access denied or not authorized.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="gradient-bg min-h-screen">
      {/* Animated Background Blobs */}
      <div className="fixed top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-white mb-8">Users Directory</h1>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-6 py-4 rounded-lg mb-6 animate-fadeIn">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="text-gray-300 mt-4">Loading users...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No users found</p>
          </div>
        ) : (
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden shadow-2xl animate-slideUp">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-8">Registered Users</h2>

              {/* Desktop View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-900 bg-opacity-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">District</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wide">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                        <td className="px-6 py-4 text-gray-100">{user.name}</td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-gray-300">{user.phone}</td>
                        <td className="px-6 py-4 text-gray-300">{user.district}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-red-900 bg-opacity-50 text-red-300 border border-red-700' :
                            user.role === 'auditor' ? 'bg-purple-900 bg-opacity-50 text-purple-300 border border-purple-700' :
                            'bg-blue-900 bg-opacity-50 text-blue-300 border border-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="bg-gray-700 bg-opacity-30 border border-gray-600 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-red-900 bg-opacity-50 text-red-300' :
                        user.role === 'auditor' ? 'bg-purple-900 bg-opacity-50 text-purple-300' :
                        'bg-blue-900 bg-opacity-50 text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="font-semibold text-gray-200">Email:</span> {user.email}</p>
                      <p><span className="font-semibold text-gray-200">Phone:</span> {user.phone}</p>
                      <p><span className="font-semibold text-gray-200">District:</span> {user.district}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
