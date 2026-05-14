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
  const [selectedUserDecks, setSelectedUserDecks] = useState([]);
  const [selectedUserCourses, setSelectedUserCourses] = useState([]);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsToShow, setRowsToShow] = useState(10);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <LibraryBig size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <Gamepad2 size={20} /> },
    { label: "Notification Management", path: "/admin/notifications", icon: <i className="bx bx-bell"></i> },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/admin/login";
  };

  const formatUserId = (user) => {
    const date = user.STDDateCreated ? new Date(user.STDDateCreated) : new Date();

    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const dd = String(date.getDate()).padStart(2, "0");

    const encrypted = (Number(user.id) * 92837)
      .toString(16)
      .toUpperCase()
      .substring(0, 4);

    return `STD${mm}${yyyy}${dd}${encrypted}`;
  };

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

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setSelectedUserDecks([]);
    setSelectedUserCourses([]);
    setUserDetailsLoading(true);

    try {
      const res = await fetch(
        `http://localhost/puffybrain/getUserDetailsAdmin.php?user_id=${user.id}`
      );

      const data = await res.json();

      if (data.success) {
        setSelectedUserDecks(data.decks || []);
        setSelectedUserCourses(data.courses || []);
      } else {
        setSelectedUserDecks([]);
        setSelectedUserCourses([]);
        alert(data.message || "Failed to fetch user details");
      }
    } catch (err) {
      console.error(err);
      setSelectedUserDecks([]);
      setSelectedUserCourses([]);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, rowsToShow]);

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.trim().toLowerCase();

    return (
      String(user.id || "").toLowerCase().includes(q) ||
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

  const totalPages = Math.ceil(sortedUsers.length / rowsToShow);

  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * rowsToShow,
    currentPage * rowsToShow
  );

  return (
    <div className={styles.gridContainer}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarTop}>
          <div
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img className={styles.logoExpanded} src="/images/logo1.png" alt="Logo" />
            <img className={styles.logoCollapsed} src="/images/logo_solo.png" alt="Logo" />
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
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
              <span className={styles.notificationBadge}>{notificationCount}</span>
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
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>User Management</h1>
            <p>Tracks the users of PuffyBrain.</p>
          </div>

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

            {!loading && error && <div className={styles.errorMessage}>{error}</div>}

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
                    onClick={() => handleViewUser(user)}
                  >
                    View
                  </button>
                </div>
              ))}
          </div>

          <div className={styles.paginationWrapper}>
            <div className={styles.paginationCenter}>
              <button
                type="button"
                className={styles.navBtn}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                {"<"}
              </button>

              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`${styles.pageBtn} ${
                    currentPage === page ? styles.pageActive : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className={styles.navBtn}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                {">"}
              </button>
            </div>

            <div className={styles.rowsControl}>
              <span>Show</span>

              <select
                value={rowsToShow}
                onChange={(e) => {
                  setRowsToShow(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span>Row</span>
            </div>
          </div>
        </div>
      </main>

      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              User Profile

              <span className={styles.close} onClick={() => setSelectedUser(null)}>
                ×
              </span>
            </div>

            <div className={styles.modalBody}>
              <p>
                <strong>ID:</strong> {formatUserId(selectedUser)}
              </p>

              <p>
                <strong>Username:</strong> {selectedUser.username || "No username"}
              </p>

              <p>
                <strong>Email:</strong> {selectedUser.email || "No email found"}
              </p>

              <div className={styles.userInfoSection}>
                <h3>Decks Made</h3>

                {userDetailsLoading ? (
                  <p>Loading decks...</p>
                ) : selectedUserDecks.length === 0 ? (
                  <p>No decks made by this user.</p>
                ) : (
                  <div className={styles.infoList}>
                    {selectedUserDecks.map((deck) => (
                      <div className={styles.infoItem} key={deck.deck_id}>
                        <p>
                          <strong>{deck.title || "No title"}</strong>
                        </p>
                        <p>{deck.description || "No description"}</p>
                        <p>Visibility: {deck.visibility || "Public"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.userInfoSection}>
                <h3>Courses Added</h3>

                {userDetailsLoading ? (
                  <p>Loading courses...</p>
                ) : selectedUserCourses.length === 0 ? (
                  <p>No courses added by this user.</p>
                ) : (
                  <div className={styles.infoList}>
                    {selectedUserCourses.map((course) => (
                      <div
                        className={styles.infoItem}
                        key={course.id || course.lesson_id}
                      >
                        <p>
                          <strong>{course.title || "No title"}</strong>
                        </p>
                        <p>{course.subject || "No subject"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
