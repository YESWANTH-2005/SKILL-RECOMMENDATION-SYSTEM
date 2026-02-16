import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const TopBar = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Skill Recommendation System</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      <div className="topbar-actions">
        <span className="welcome">{user?.name || "User"}</span>
        <Link className="ghost-btn" to="/dashboard">Dashboard</Link>
        <button className="ghost-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};
