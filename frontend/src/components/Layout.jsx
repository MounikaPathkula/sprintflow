import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          Sprint<em>Flow</em>
        </div>
        <nav className="sidebar__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            Sprints
          </NavLink>
        </nav>
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user?.name}</span>
            <span className="sidebar__user-role">{user?.role}</span>
          </div>
          <button
            className="sidebar__logout"
            onClick={handleLogout}
            title="Log out"
          >
            ⏻
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
