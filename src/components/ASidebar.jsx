import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers,
  LibraryBig,
  Gamepad2,
  LogOut,
  User,
  Settings,
  Database,
} from "lucide-react";

import styles from "./AHeaderSidebar.module.css";

export default function ASidebar({
  isCollapsed,
  setIsCollapsed,
  handleLogout,
}) {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      label: "Module Management",
      path: "/admin/modules",
      icon: <Layers size={20} />,
    },
    {
      label: "Decks Management",
      path: "/admin/decks",
      icon: <LibraryBig size={20} />,
    },
    {
      label: "Modes Management",
      path: "/admin/modes",
      icon: <Gamepad2 size={20} />,
    },
    {
      label: "Notification Management",
      path: "/admin/notifications",
      icon: <i className="bx bx-bell"></i>,
    },
    {
      label: "Backup & Restore",
      path: "/admin/backup-restore",
      icon: <Database size={20} />,
    },
  ];

  return (
    <aside
      className={`${styles.sidebar} ${
        isCollapsed ? styles.collapsed : ""
      }`}
    >
      <div className={styles.sidebarTop}>
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className="bx bx-sidebar"></i>
        </button>

        <div className={styles.logo}>
          <img
            className={styles.logoExpanded}
            src="/images/logo1.png"
            alt="Logo"
          />

          <img
            className={styles.logoCollapsed}
            src="/images/logo_solo.png"
            alt="Logo"
          />
        </div>

        <div className={styles.divider}></div>

        <p className={styles.menuLabel}>Menu</p>

        <nav className={styles.menu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.menuItem} ${
                  isActive ? styles.active : ""
                }`
              }
            >
              <span className={styles.menuIcon}>
                {item.icon}
              </span>

              <span className={styles.menuText}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.divider}></div>

        <p className={styles.menuLabel}>Others</p>

        <nav className={styles.menu}>
          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              `${styles.menuItem} ${
                isActive ? styles.active : ""
              }`
            }
          >
            <span className={styles.menuIcon}>
              <User size={20} />
            </span>

            <span className={styles.menuText}>
              Profile
            </span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `${styles.menuItem} ${
                isActive ? styles.active : ""
              }`
            }
          >
            <span className={styles.menuIcon}>
              <Settings size={20} />
            </span>

            <span className={styles.menuText}>
              Settings
            </span>
          </NavLink>
        </nav>
      </div>

      <div className={styles.sidebarBottom}>
        <div className={styles.divider}></div>

        <button
          type="button"
          onClick={handleLogout}
          className={styles.menuItem}
        >
          <span className={styles.menuIcon}>
            <LogOut size={20} />
          </span>

          <span className={styles.menuText}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}