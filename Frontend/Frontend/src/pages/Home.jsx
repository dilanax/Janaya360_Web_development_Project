import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>JusticeLink Platform</h1>
      <p>Tracking political promises for transparency.</p>

      <button onClick={() => navigate("/news")}>
        View Political News
      </button>
    </div>
  );
}