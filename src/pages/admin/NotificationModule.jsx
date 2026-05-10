import { useEffect, useState } from "react";
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
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./notification.module.css";
import "boxicons/css/boxicons.min.css";

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [search, setSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
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
  ];

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getAdminNotifications.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAddNotification = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      Swal.fire({
        imageUrl: "/images/error.png",
        imageWidth: 150,
        imageHeight: 150,
        title: "Missing Fields",
        text: "Please enter both title and message.",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost/puffybrain/addNotification.php", {
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
        Swal.fire({
          imageUrl: "/images/success.png",
          imageWidth: 150,
          imageHeight: 150,
          title: "Notification Added",
          text: "Your notification has been posted.",
        });

        setTitle("");
        setMessage("");
        setTargetRole("all");
        fetchNotifications();
      } else {
        Swal.fire("Error", data.message || "Failed to add notification.", "error");
      }
    } catch (err) {
      Swal.fire("Server Error", "Failed to add notification.", "error");
    }
  };

  const handleDelete = async (notificationId) => {
    const result = await Swal.fire({
      imageUrl: "/images/question.png",
      imageWidth: 150,
      imageHeight: 150,
      title: "Delete notification?",
      text: "This cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("http://localhost/puffybrain/deleteNotification.php", {
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
        Swal.fire({
          imageUrl: "/images/success.png",
          imageWidth: 150,
          imageHeight: 150,
          title: "Deleted",
          text: "Notification removed successfully.",
        });

        fetchNotifications();
      } else {
        Swal.fire("Error", data.message || "Failed to delete notification.", "error");
      }
    } catch (err) {
      Swal.fire("Server Error", "Failed to delete notification.", "error");
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();

    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "/admin/login";
  };

  const filteredNotifications = notifications.filter((item) => {
    const q = search.toLowerCase();

    return (
      String(item.title || "").toLowerCase().includes(q) ||
      String(item.message || "").toLowerCase().includes(q) ||
      String(item.recipient_type || "").toLowerCase().includes(q)
    );
  });

  const notificationCount = notifications.length;

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
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearch(e.target.value);
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
            onClick={() => setNotifications([])}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        notifications.slice(0, 5).map((item) => (
          <div
            className={styles.notificationItem}
            key={item.notification_id}
          >
            <div className={styles.notificationTop}>
              <h5>{item.title}</h5>

              <span className={styles.notificationRole}>
              {item.recipient_type}
              </span>
            </div>

            <p className={styles.notificationMessage}>
              {item.message}
            </p>

            <small className={styles.notificationDate}>
              {new Date(item.created_at).toLocaleString()}
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
</div>

      </header>

      <main className={styles.main}>
          <div className={styles.pageHeader}>
          <h1>Notification Management</h1>
          <p>Create and manage announcements for PuffyBrain users.</p>
        </div>

        <div className={styles.notificationGrid}>
          <form className={styles.formCard} onSubmit={handleAddNotification}>
            <h2>Create Notification</h2>

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
          </form>

          <div className={styles.listCard}>
            <div className={styles.listTop}>
              <h2>Posted Notifications</h2>

              <input
                type="text"
                placeholder="Search notification..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.notificationsList}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((item) => (
                  <div
                    className={styles.notificationCard}
                    key={item.notification_id}
                  >
                    <div className={styles.notificationCardTop}>
                      <h3>{item.title}</h3>

                      <span className={styles.notificationRole}>
                        {item.recipient_type}
                      </span>
                    </div>

                    <p className={styles.notificationMessage}>
                      {item.message}
                    </p>

                    <small className={styles.notificationDate}>
                      {new Date(item.created_at).toLocaleString()}
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
          </div>
        </div>
      </main>
    </div>
  );
}