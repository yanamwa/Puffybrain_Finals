import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styles from "./user.module.css";
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
  Settings,
} from "lucide-react";

export default function UserManagement() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usersPerPage = 5;

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
  ];

  const handleLogout = (e) => {
    e.preventDefault();

    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "/admin/login";
  };

  const formatUserId = (user) => {
    const date = user.STDDateCreated
      ? new Date(user.STDDateCreated)
      : new Date();

    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const dd = String(date.getDate()).padStart(2, "0");

    const encrypted = (Number(user.id) * 92837)
      .toString(16)
      .toUpperCase()
      .substring(0, 4);

    return `STD${mm}${yyyy}${dd}${encrypted}`;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost/puffybrain/getUsers.php");

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data.success) {
          setUsers(data.users || []);
        } else {
          setError(data.message || "Failed to fetch users.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Server error. Check getUsers.php.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.trim().toLowerCase();

    return (
      String(user.id || "").includes(q) ||
      String(user.username || "").toLowerCase().includes(q) ||
      String(user.email || "").toLowerCase().includes(q)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "newest") return Number(b.id) - Number(a.id);
    if (sortBy === "oldest") return Number(a.id) - Number(b.id);

    if (sortBy === "username") {
      return String(a.username || "").localeCompare(String(b.username || ""));
    }

    if (sortBy === "email") {
      return String(a.email || "").localeCompare(String(b.email || ""));
    }

    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = sortedUsers.slice(startIndex, startIndex + usersPerPage);

  return (
    <div className={styles.gridContainer}>
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
        <div className={styles.sidebarTop}>
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

          <div className={styles.divider}></div>

          <p className={styles.menuLabel}>Others</p>

          <nav className={styles.menu}>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.menuIcon}>
                <User size={20} />
              </span>
              <span className={styles.menuText}>Profile</span>
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.menuIcon}>
                <Settings size={20} />
              </span>
              <span className={styles.menuText}>Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.divider}></div>

          <NavLink to="/" onClick={handleLogout} className={styles.menuItem}>
            <span className={styles.menuIcon}>
              <LogOut size={20} />
            </span>
            <span className={styles.menuText}>Logout</span>
          </NavLink>
        </div>
      </aside>

      <header className={styles.headerContainer}>
        <div className={styles.searchBar}>
          <Search size={19} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.notificationWrapper}>
          <button
            type="button"
            className={styles.notificationBtn}
            onClick={(e) => {
              e.stopPropagation();
              setNotificationOpen((prev) => !prev);
            }}
          >
            <i className="bx bx-bell"></i>

            {notificationCount > 0 && (
              <span className={styles.notificationBadge}>
                {notificationCount}
              </span>
            )}
          </button>

          <div
            className={`${styles.notificationDropdown} ${
              notificationOpen ? styles.show : ""
            }`}
          >
            <h4>Notifications</h4>

            <div className={styles.emptyNotification}>
              <p>You don’t have any new notifications</p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageTop}>
          <h1 className={styles.pageTitle}>User Management</h1>

          <div className={styles.sortBox}>
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest User</option>
              <option value="oldest">Oldest User</option>
              <option value="username">Username A-Z</option>
              <option value="email">Email A-Z</option>
            </select>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>User ID</div>
            <div>Username</div>
            <div>Email</div>
            <div>Action</div>
          </div>

          <div className={styles.tableContent}>
            {loading && <div className={styles.message}>Loading users...</div>}

            {!loading && error && (
              <div className={styles.errorMessage}>{error}</div>
            )}

            {!loading && !error && currentUsers.length === 0 && (
              <div className={styles.message}>No users found.</div>
            )}

            {!loading &&
              !error &&
              currentUsers.map((user) => (
                <div className={styles.row} key={user.id}>
                  <div className={styles.userId}>{formatUserId(user)}</div>
                  <div>{user.username || "No username"}</div>
                  <div>{user.email || "No email found"}</div>

                  <button
                    type="button"
                    className={styles.viewBtn}
                    onClick={() => setSelectedUser(user)}
                  >
                    View
                  </button>
                </div>
              ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBox}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={`${styles.pageBox} ${
                  currentPage === page ? styles.activePage : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className={styles.pageBox}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {selectedUser && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedUser(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
                <strong>ID:</strong> {formatUserId(selectedUser)}
              </p>
              <p>
                <strong>Username:</strong>{" "}
                {selectedUser.username || "No username"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {selectedUser.email || "No email found"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}