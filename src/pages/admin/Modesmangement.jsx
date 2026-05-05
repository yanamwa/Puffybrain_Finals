import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./mode.module.css";
import "boxicons/css/boxicons.min.css";

import {
  LayoutDashboard,
  Users,
  Layers,
  LibraryBig,
  Gamepad2,
  LogOut,
  Search,
  User,
  ChevronDown,
  Settings,
} from "lucide-react";

import Swal from "sweetalert2";

export default function ModeManagement() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modes, setModes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <LibraryBig size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <Gamepad2 size={20} /> },
  ];

  useEffect(() => {
    fetchModes();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeJsonParse = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: text };
    }
  };

  const fetchModes = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getModes.php");
      const text = await res.text();
      const data = safeJsonParse(text);

      if (data.success) {
        setModes(data.modes || []);
      }
    } catch {
      Swal.fire("Error", "Failed to load modes", "error");
    }
  };

  const deleteMode = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Mode?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    const form = new FormData();
    form.append("id", id);

    await fetch("http://localhost/puffybrain/deleteMode.php", {
      method: "POST",
      body: form,
    });

    fetchModes();
  };

  const filteredModes = modes.filter((mode) => {
    const q = searchQuery.toLowerCase();

    return (
      String(mode.id || "").includes(q) ||
      String(mode.title || "").toLowerCase().includes(q) ||
      String(mode.description || "").toLowerCase().includes(q) ||
      String(mode.route || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.gridContainer}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div>
          <div
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </div>

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
                  `${styles.menuItem} ${isActive ? styles.active : ""}`
                }
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuText}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <header className={styles.headerContainer}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search modes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.profileWrapper} ref={dropdownRef}>
          <div className={styles.dpContainer}>
            <User size={22} />
          </div>

          <span className={styles.profileName}>@admin</span>

          <button
            type="button"
            className={styles.dropdownBtn}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownContent}>
              <button className={styles.dropdownItem} type="button">
                <Settings size={16} />
                Settings
              </button>
              <button className={styles.dropdownItem} type="button">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageTop}>
          <h1 className={styles.pageTitle}>Mode Management</h1>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>ID</div>
            <div>Title</div>
            <div>Description</div>
            <div>Route</div>
            <div>Action</div>
          </div>

          <div className={styles.tableContent}>
            {filteredModes.length === 0 ? (
              <div className={styles.message}>No modes found.</div>
            ) : (
              filteredModes.map((mode) => (
                <div className={styles.row} key={mode.id}>
                  <div className={styles.modeId}>{mode.id}</div>
                  <div>{mode.title}</div>
                  <div className={styles.descCell}>{mode.description}</div>
                  <div>{mode.route}</div>

                  <div className={styles.actionButtons}>
                    <button className={styles.viewBtn} type="button">
                      View
                    </button>

                    <button className={styles.editBtn} type="button">
                      Edit
                    </button>

                    <button
                      className={styles.deleteBtn}
                      type="button"
                      onClick={() => deleteMode(mode.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}