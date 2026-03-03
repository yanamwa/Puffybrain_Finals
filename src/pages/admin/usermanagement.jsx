import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styles from "./user.module.css";
import "boxicons/css/boxicons.min.css";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  LogOut,
  Search,
  User,
  ChevronDown,
  Settings,
} from "lucide-react";

export default function UserManagement() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);

  /* SIDEBAR MENU */
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
      icon: <Users size={20} />,
    },
    {
      label: "Decks Management",
      path: "/admin/decks",
      icon: <BookOpen size={20} />,
    },
  ];

  /* FETCH USERS */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost/puffybrain/getUsers.php"
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
        } else {
          setError("Failed to fetch users.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Server error.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /* SEARCH FILTER */
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email &&
      user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={styles.gridContainer}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/images/logo1.png" alt="Logo" />
        </div>

        <div className={styles.menuLabel}>Menu</div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ""}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* HEADER */}
      <header className={styles.headerContainer}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users"
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
            className={styles.dropdownBtn}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className={`${styles.dropdownContent} ${styles.show}`}>
              <button className={styles.dropdownItem}>
                <Settings size={16} /> Settings
              </button>
              <button className={styles.dropdownItem}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>User Management</h1>

        {/* TABLE HEADER */}
        <div className={styles.tableHeader}>
          <div>User ID</div>
          <div>Username</div>
          <div>Email</div>
          <div>Action</div>
        </div>

        {/* TABLE BODY */}
        <div className={styles.tableContent}>
          {loading && (
            <p style={{ textAlign: "center", padding: "20px" }}>
              Loading users...
            </p>
          )}

          {error && (
            <p
              style={{
                textAlign: "center",
                padding: "20px",
                color: "red",
              }}
            >
              {error}
            </p>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <p style={{ textAlign: "center", padding: "20px" }}>
              No users found.
            </p>
          )}

          {!loading &&
            !error &&
            filteredUsers.map((user) => (
              <div className={styles.row} key={user.id}>
                <div>{user.id}</div>
                <div>{user.username}</div>
                <div>{user.email}</div>
                <button
                  className={styles.viewBtn}
                  onClick={() => setSelectedUser(user)}
                >
                  View
                </button>
              </div>
            ))}
        </div>

        {/* PAGINATION (UI ONLY) */}
        <div className={styles.pagination}>
          <div className={`${styles.pageBox} ${styles.active}`}>1</div>
          <div className={styles.pageBox}>2</div>
          <div className={styles.pageBox}>3</div>
          <span className={styles.dots}>...</span>
          <div className={styles.pageBox}>10</div>
        </div>
      </main>

      {/* MODAL */}
      {selectedUser && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              User Profile
              <span
                className={styles.close}
                onClick={() => setSelectedUser(null)}
              >
                ×
              </span>
            </div>

            <div className={styles.modalBody}>
              <p>
                <strong>ID:</strong> {selectedUser.id}
              </p>
              <p>
                <strong>Username:</strong> {selectedUser.username}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}