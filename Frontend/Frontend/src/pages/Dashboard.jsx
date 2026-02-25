import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data);
    } catch (error) {
      alert("Access Denied or Not Admin");
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {users.map((user) => (
        <div key={user._id}>
          <p>{user.name} - {user.role}</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
