import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import styles from "./user.module.css";
import "boxicons/css/boxicons.min.css";
import Swal from "sweetalert2";
import { API_BASE } from "../../config.js";

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
  const [bellNotifications, setBellNotifications] = useState([]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchedOnce = useRef(false);
const [admin, setAdmin] = useState({
  id: "",
  username: "Admin",
  full_name: "",
  email: "",
  role: "",
  profile_image: "/images/temporary profile.jpg",
});

const adminImage =
  admin.profile_image &&
  !admin.profile_image.includes("temporary profile.jpg")
    ? admin.profile_image.startsWith("http")
      ? admin.profile_image
      : `${API_BASE}/${admin.profile_image.replace(/^\/+/, "")}`
    : "/images/temporary profile.jpg";


  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <LibraryBig size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <Gamepad2 size={20} /> },
    {
      label: "Notification Management",
      path: "/admin/notifications",
      icon: <i className="bx bx-bell"></i>,
    },
  ];

  const formatDate = (dateValue) => {
    if (!dateValue) return "No date";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "No date";
    }

    return date.toLocaleString();
  };

  const formatVerified = (value) => {
    return Number(value) === 1 ? "True" : "False";
  };

  const fetchAdmin = async () => {
    try {
      const res = await fetch(`${API_BASE}/getAdminProfile.php`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        console.error(data.message || "Admin not found");
        return;
      }

      setAdmin({
        username: data.admin?.username || "Admin",
        full_name: data.admin?.full_name || "",
        email: data.admin?.email || "",
        role: data.admin?.role || "Administrator",
        profile_image: data.admin?.profile_image || "/images/temporary profile.jpg",
      });
    } catch (err) {
      console.error("Fetch admin error:", err);
    }
  };

  const fetchBellNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/getAdminNotifications.php`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setBellNotifications(data.notifications || []);
      } else {
        setBellNotifications([]);
      }
    } catch (err) {
      console.error("Bell notification fetch error:", err);
      setBellNotifications([]);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();

    try {
      const res = await fetch(`${API_BASE}/markAdminNotificationsRead.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        await fetchBellNotifications();
        setNotificationOpen(true);
      } else {
        Swal.fire("Error", data.message || "Failed to mark as read.", "error");
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
      Swal.fire("Server Error", "Failed to mark as read.", "error");
    }
  };

const handleLogout = async (e) => {
  e.preventDefault();

  const result = await Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#7b5cff",
  });

  if (!result.isConfirmed) return;

  try {
    await fetch(`${API_BASE}/adminLogout.php`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout API error:", err);
  }

  localStorage.removeItem("admin");
  localStorage.removeItem("admin_id");
  localStorage.removeItem("admin_username");
  localStorage.removeItem("admin_email");
  sessionStorage.clear();

  navigate("/pb-admin-access", { replace: true });
};

  const formatUserId = (user) => {
    const date = user.created_at ? new Date(user.created_at) : new Date();

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

      const response = await fetch(`${API_BASE}/getUsers.php`, {
        method: "GET",
        credentials: "include",
      });

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
        `${API_BASE}/getUserDetailsAdmin.php?user_id=${encodeURIComponent(user.id)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        setSelectedUser((prev) => ({
          ...prev,
          ...(data.user || {}),
        }));

        setSelectedUserDecks(data.decks || []);
        setSelectedUserCourses(data.courses || []);
      } else {
        setSelectedUserDecks([]);
        setSelectedUserCourses([]);
        Swal.fire("Error", data.message || "Failed to fetch user details", "error");
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
    if (fetchedOnce.current) return;

    fetchedOnce.current = true;

    fetchAdmin();
    fetchUsers();
    fetchBellNotifications();

    const handler = (e) => {
      const insideDropdown = e.target.closest(`.${styles.notificationWrapper}`);

      if (!insideDropdown) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, rowsToShow]);

  const unreadNotifications = bellNotifications.filter(
    (notif) => notif.status === "unread"
  );

  const notificationCount = unreadNotifications.length;

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.trim().toLowerCase();

    return (
      String(user.id || "").toLowerCase().includes(q) ||
      String(user.username || "").toLowerCase().includes(q) ||
      String(user.email || "").toLowerCase().includes(q) ||
      String(user.year_level || "").toLowerCase().includes(q) ||
      String(user.school || "").toLowerCase().includes(q)
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
          <button
            type="button"
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </button>

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

         <button type="button" onClick={handleLogout} className={styles.menuItem}>
  <span className={styles.menuIcon}>
    <LogOut size={20} />
  </span>
  <span className={styles.menuText}>Logout</span>
</button>
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

        <div className={styles.headerRight}>
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
              <div className={styles.notificationHeader}>
                <h4>Notifications</h4>

                {notificationCount > 0 && (
                  <button
                    type="button"
                    className={styles.markReadBtn}
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {bellNotifications.length > 0 ? (
                bellNotifications.slice(0, 5).map((item) => (
                  <div
                    key={item.notification_id || item.id}
                    className={styles.notificationItem}
                  >
                    <div className={styles.notificationTop}>
                      <h5>{item.title || "No title"}</h5>
                      <span className={styles.notificationRole}>
                        {item.recipient_type || "all"}
                      </span>
                    </div>

                    <p className={styles.notificationMessage}>
                      {item.message || "No message"}
                    </p>

                    <p className={styles.notificationCreator}>
                      Posted by {item.created_by || "Admin"}
                    </p>

                    <small className={styles.notificationDate}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "No date"}
                    </small>
                  </div>
                ))
              ) : (
                <div className={styles.emptyNotification}>
                  <p>You don’t have any new notifications</p>
                </div>
              )}
            </div>
          </div>

      <div className={styles.adminHeaderProfile}>
  <img
    src={adminImage}
    alt="Admin"
    className={styles.adminHeaderImg}
    onError={(e) => {
      e.currentTarget.src = "/images/temporary profile.jpg";
    }}
  />

  <span className={styles.adminHeaderName}>
    {admin.username || "Admin"}
  </span>
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

              <p>
                <strong>Year Level:</strong>{" "}
                {selectedUser.year_level || "No year level"}
              </p>

              <p>
                <strong>School:</strong> {selectedUser.school || "No school"}
              </p>

              <p>
                <strong>Created At:</strong> {formatDate(selectedUser.created_at)}
              </p>

              <p>
                <strong>Is Verified:</strong>{" "}
                {formatVerified(selectedUser.is_verified)}
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