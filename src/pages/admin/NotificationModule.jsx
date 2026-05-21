import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
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
  Database,
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./notification.module.css";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";

export default function NotificationManagement() {
  const [bellNotifications, setBellNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);

  const notificationsPerPage = 3;
  const fetchedOnce = useRef(false);

  const [admin, setAdmin] = useState({
    full_name: "",
    username: "",
    email: "",
    role: "",
    profile_image: "/images/temporary profile.jpg",
  });


  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <LibraryBig size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <Gamepad2 size={20} /> },
    { label: "Notification Management", path: "/admin/notifications", icon: <i className="bx bx-bell"></i> },
    { label: "Backup & Restore", path: "/admin/backup-restore", icon: <Database size={20} /> },
  ];

  const showNotifSwal = (config = {}) => {
    return Swal.fire({
      buttonsStyling: false,
      customClass: {
        popup: styles.swalPopup,
        image: styles.swalImage,
        actions: styles.swalActions,
        confirmButton: styles.confirmBtnSwal,
        cancelButton: styles.cancelBtnSwal,
        ...(config.customClass || {}),
      },
      ...config,
    });
  };

const fetchAdmin = async () => {
  try {
    const res = await fetch(`${API_BASE}/getAdminProfile.php`, {
      credentials: "include",
    });

    const data = await res.json();

    if (data.success) {
      setAdmin({
        username: data.admin?.username || "Admin",
        profile_image:
          data.admin?.profile_image || "/images/temporary profile.jpg",
      });
    }
  } catch (err) {
    console.error("Fetch admin error:", err);
  }
};

  const fetchBellNotifications = async () => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "{}");

      const res = await fetch(
        `${API_BASE}/getAdminNotifications.php?admin_id=${admin.id}`,
        { credentials: "include" }
      );

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

  const fetchHistoryNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/getAllNotifications.php`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setHistoryNotifications(data.notifications || []);
      } else {
        setHistoryNotifications([]);
      }
    } catch (err) {
      console.error("History notification fetch error:", err);
      setHistoryNotifications([]);
    }
  };

useEffect(() => {
  if (fetchedOnce.current) return;

  fetchedOnce.current = true;

  fetchAdmin();
  fetchBellNotifications();
  fetchHistoryNotifications();

  const handler = (e) => {
    const insideDropdown = e.target.closest(
      `.${styles.notificationWrapper}, .${styles.customSort}`
    );

    if (!insideDropdown) {
      setNotificationOpen(false);
      setSortOpen(false);
    }
  };

  window.addEventListener("click", handler);

  return () => {
    window.removeEventListener("click", handler);
  };
}, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  const handleAddNotification = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      await showNotifSwal({
        imageUrl: "/images/error.png",
        imageWidth: 190,
        imageHeight: 190,
        title: "Missing Fields",
        text: "Please enter both title and message.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/addNotification.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          recipient_type: targetRole,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await showNotifSwal({
          imageUrl: "/images/success.png",
          imageWidth: 190,
          imageHeight: 190,
          title: "Notification Added",
          text: "Your notification has been posted.",
          confirmButtonText: "OK",
        });

        setTitle("");
        setMessage("");
        setTargetRole("all");

        fetchBellNotifications();
        fetchHistoryNotifications();
      } else {
        await showNotifSwal({
          imageUrl: "/images/error.png",
          imageWidth: 190,
          imageHeight: 190,
          title: "Error",
          text: data.message || "Failed to add notification.",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Add notification error:", err);

      await showNotifSwal({
        imageUrl: "/images/error.png",
        imageWidth: 190,
        imageHeight: 190,
        title: "Server Error",
        text: "Failed to add notification.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDelete = async (notificationId) => {
    const result = await showNotifSwal({
      imageUrl: "/images/asking.png",
      imageWidth: 190,
      imageHeight: 190,
      title: "Delete notification?",
      text: "This cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/deleteNotification.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_id: notificationId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await showNotifSwal({
          imageUrl: "/images/success.png",
          imageWidth: 190,
          imageHeight: 190,
          title: "Deleted",
          text: "Notification removed successfully.",
          confirmButtonText: "OK",
        });

        fetchBellNotifications();
        fetchHistoryNotifications();
      } else {
        await showNotifSwal({
          imageUrl: "/images/error.png",
          imageWidth: 190,
          imageHeight: 190,
          title: "Error",
          text: data.message || "Failed to delete notification.",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Delete notification error:", err);

      await showNotifSwal({
        imageUrl: "/images/error.png",
        imageWidth: 190,
        imageHeight: 190,
        title: "Server Error",
        text: "Failed to delete notification.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();

    const admin = JSON.parse(localStorage.getItem("admin") || "{}");
    const adminId = admin.id;

    if (!adminId) {
      await showNotifSwal({
        imageUrl: "/images/error.png",
        imageWidth: 190,
        imageHeight: 190,
        title: "Error",
        text: "Admin ID not found. Please log in again.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/markAdminNotificationsRead.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_id: adminId,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        await fetchBellNotifications();
        await fetchHistoryNotifications();
        setNotificationOpen(true);
      } else {
        await showNotifSwal({
          imageUrl: "/images/error.png",
          imageWidth: 190,
          imageHeight: 190,
          title: "Error",
          text: data.message || "Failed to mark as read.",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Mark all as read error:", err);

      await showNotifSwal({
        imageUrl: "/images/error.png",
        imageWidth: 190,
        imageHeight: 190,
        title: "Server Error",
        text: "Failed to mark as read.",
        confirmButtonText: "OK",
      });
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

  const filteredNotifications = historyNotifications
    .filter((item) => {
      const q = search.toLowerCase();

      return (
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.message || "").toLowerCase().includes(q) ||
        String(item.recipient_type || "").toLowerCase().includes(q) ||
        String(item.created_by || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "az") return String(a.title || "").localeCompare(String(b.title || ""));
      if (sortBy === "za") return String(b.title || "").localeCompare(String(a.title || ""));
      return 0;
    });

  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);

  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  const unreadNotifications = bellNotifications.filter(
    (notif) => notif.status === "unread"
  );

  const notificationCount = unreadNotifications.length;

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
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  <div className={styles.headerRight}>
    
    {/* Notification */}
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

    {/* Admin Profile */}
    <div className={styles.adminHeaderProfile}>
      <img
        src={admin.profile_image || "/images/temporary profile.jpg"}
        alt="Admin"
        className={styles.adminHeaderImg}
      />

      <span className={styles.adminHeaderName}>
        {admin.username || "Admin"}
      </span>
    </div>
  </div>
</header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>Notification Management</h1>
          <p>Create and manage announcements for PuffyBrain users.</p>
        </div>

        <div className={styles.notificationGrid}>
          <form className={styles.formCard} onSubmit={handleAddNotification}>
            <div className={styles.formContent}>
              <div className={styles.formHeader}>
                <h2>Create Notification</h2>
              </div>

              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Enter notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Message</label>
                <textarea
                  placeholder="Write your notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Send To</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              <button className={styles.postBtn} type="submit">
                Post Notification
              </button>
            </div>
          </form>

          <div className={styles.listCard}>
            <div className={styles.listTop}>
              <h2>Posted Notifications</h2>

              <div className={styles.customSort}>
                <button
                  type="button"
                  className={styles.customSortBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortOpen((prev) => !prev);
                  }}
                >
                  <i className="bx bx-sort-alt-2"></i>
                  <span>Sort by</span>
                  <i className="bx bx-chevron-down"></i>
                </button>

                {sortOpen && (
                  <div className={styles.customSortMenu}>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy("newest");
                        setSortOpen(false);
                      }}
                    >
                      Recently Added
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSortBy("oldest");
                        setSortOpen(false);
                      }}
                    >
                      Oldest
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSortBy("az");
                        setSortOpen(false);
                      }}
                    >
                      A-Z
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSortBy("za");
                        setSortOpen(false);
                      }}
                    >
                      Z-A
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.notificationsList}>
              {filteredNotifications.length > 0 ? (
                paginatedNotifications.map((item) => (
                  <div className={styles.notificationCard} key={item.notification_id}>
                    <div className={styles.notificationCardTop}>
                      <h3>{item.title}</h3>

                      <span className={styles.notificationRole}>
                        {item.recipient_type}
                      </span>
                    </div>

                    <p className={styles.notificationMessage}>{item.message}</p>

                    <small className={styles.notificationDate}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "No date"}
                    </small>

                    <br />

                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(item.notification_id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.noNotifications}>
                  <p>No notifications found.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Prev
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}