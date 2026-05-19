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
  Database,
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./backuprestore.module.css";
import "boxicons/css/boxicons.min.css";

export default function AdminBackupRestore() {
  const [restoreFile, setRestoreFile] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [bellNotifications, setBellNotifications] = useState([]);

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <LibraryBig size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <Gamepad2 size={20} /> },
    { label: "Notification Management", path: "/admin/notifications", icon: <i className="bx bx-bell"></i> },
    { label: "Backup & Restore", path: "/admin/backup-restore", icon: <Database size={20} /> },
  ];


  const [admin, setAdmin] = useState({
  username: "Admin",
  full_name: "",
  email: "",
  role: "",
  profile_image: "/images/temporary profile.jpg",
});

  const showBackupSwal = (config = {}) => {
    return Swal.fire({
      buttonsStyling: false,
      customClass: {
        popup: styles.swalPopup,
        image: styles.swalImage,
        actions: styles.swalActions,
        confirmButton: styles.restoreBtnSwal,
        cancelButton: styles.cancelBtnSwal,
        ...(config.customClass || {}),
      },
      ...config,
    });
  };

  const fetchAdmin = async () => {
  try {
    const res = await fetch(
      "http://localhost/puffybrain/getAdminProfile.php",
      {
        credentials: "include",
      }
    );

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
      profile_image:
        data.admin?.profile_image || "/images/temporary profile.jpg",
    });
  } catch (err) {
    console.error("Fetch admin error:", err);
  }
};

  const fetchBellNotifications = async () => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "{}");

      const res = await fetch(
        `http://localhost/puffybrain/getAdminNotifications.php?admin_id=${admin.id}`,
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

 useEffect(() => {
  fetchAdmin();
  fetchBellNotifications();

    const handler = (e) => {
      const insideDropdown = e.target.closest(`.${styles.notificationWrapper}`);

      if (!insideDropdown) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);

    return () => window.removeEventListener("click", handler);
  }, []);

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();

    const admin = JSON.parse(localStorage.getItem("admin") || "{}");
    const adminId = admin.id;

    if (!adminId) {
      showBackupSwal({
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
        "http://localhost/puffybrain/markAdminNotificationsRead.php",
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
        setNotificationOpen(true);
      } else {
        showBackupSwal({
          imageUrl: "/images/error.png",
          imageWidth: 190,
          imageHeight: 190,
          title: "Error",
          text: data.message || "Failed to mark as read.",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      showBackupSwal({
        imageUrl: "/images/error.png",
        imageWidth: 190,
        imageHeight: 190,
        title: "Server Error",
        text: "Failed to mark as read.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleBackup = () => {
    window.location.href = "http://localhost/puffybrain/backupDatabase.php";
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      await showBackupSwal({
        imageUrl: "/images/error.png",
        imageWidth: 190,
        imageHeight: 190,
        imageAlt: "Missing File",
        title: "Missing File",
        text: "Please choose a .sql backup file.",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await showBackupSwal({
      imageUrl: "/images/asking.png",
      imageWidth: 190,
      imageHeight: 190,
      imageAlt: "Restore Warning",
      title: "Restore Database?",
      text: "This will overwrite current database data.",
      showCancelButton: true,
      confirmButtonText: "Yes, restore",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const formData = new FormData();
    formData.append("backup_file", restoreFile);

    try {
      setIsRestoring(true);

      const res = await fetch("http://localhost/puffybrain/restoreDatabase.php", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        await showBackupSwal({
          imageUrl: "/images/success.png",
          imageWidth: 190,
          imageHeight: 190,
          imageAlt: "Success",
          title: "Success",
          text: data.message,
          confirmButtonText: "OK",
        });

        setRestoreFile(null);
      } else {
        await showBackupSwal({
          imageUrl: "/images/error.png",
          imageWidth: 190,
          imageHeight: 190,
          imageAlt: "Restore Failed",
          title: "Failed",
          text: data.message || "Restore failed.",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error(err);

      await showBackupSwal({
        imageUrl: "/images/error.png",
        imageWidth: 190,
        imageHeight: 190,
        imageAlt: "Server Error",
        title: "Server Error",
        text: "Could not restore database.",
        confirmButtonText: "OK",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/admin/login";
  };

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
          <h1>Backup & Restore</h1>
          <p>Manage database backups and restore your PuffyBrain system safely.</p>
        </div>

        <div className={styles.backupGrid}>
          <div className={styles.card}>
            <div className={styles.cardTop}></div>

            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <h2>Backup Database</h2>
              </div>

              <p className={styles.cardDescription}>
                Download a copy of the current database.
              </p>

              <button type="button" className={styles.backupBtn} onClick={handleBackup}>
                Download Backup
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTop}></div>

            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <h2>Restore Database</h2>
              </div>

              <p className={styles.cardDescription}>
                Upload a .sql file to restore the database.
              </p>

              <input
                type="file"
                accept=".sql"
                className={styles.fileInput}
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
              />

              <button
                type="button"
                className={styles.restoreBtn}
                onClick={handleRestore}
                disabled={isRestoring}
              >
                {isRestoring ? "Restoring..." : "Restore Database"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}