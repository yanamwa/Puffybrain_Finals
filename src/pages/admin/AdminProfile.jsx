import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers,
  LibraryBig,
  Gamepad2,
  Database,
  LogOut,
  Search,
  User,
  Settings,
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./adminprofile.module.css";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";

export default function AdminProfile() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [bellNotifications, setBellNotifications] = useState([]);

  const [activitySortOpen, setActivitySortOpen] = useState(false);
  const [activitySort, setActivitySort] = useState("recent");
  const [activityPage, setActivityPage] = useState(1);
  const actionsPerPage = 5;

  const fetchedOnce = useRef(false);

  const [admin, setAdmin] = useState({
    full_name: "System Administrator",
    email: "Not set",
    username: "Admin",
    role: "Administrator",
    profile_image: "/images/temporary profile.jpg",
  });

  const [adminActivity, setAdminActivity] = useState({
    last_login: "Loading...",
    modules_created: 0,
    recent_actions: [],
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

  const fetchAdmin = async () => {
  try {
    const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
      const res = await fetch(`${API_BASE}/getAdminProfile.php`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        console.error(data.message || "Admin not found");
        return;
      }

      setAdmin({
        full_name: data.admin?.full_name || "System Administrator",
        email: data.admin?.email || "Not set",
        username: data.admin?.username || "Admin",
        role: data.admin?.role || "Administrator",
        profile_image: data.admin?.profile_image || "/images/temporary profile.jpg",
      });
    } catch (err) {
      console.error("Failed to fetch admin:", err);
    }
  };

const fetchAdminActivity = async () => {
  try {
    const adminData = JSON.parse(localStorage.getItem("admin") || "{}");

    if (!adminData.id) {
      console.warn("No admin ID found in localStorage");
      return;
    }

    const res = await fetch(`${API_BASE}/getAdminActivity.php?admin_id=${adminData.id}`, {
      credentials: "include",
    });

    const data = await res.json();

    if (data.success) {
      setAdminActivity({
        last_login: data.activity?.last_login || "Not recorded yet",
        modules_created: data.activity?.modules_created || 0,
        recent_actions: data.activity?.recent_actions || [],
      });
    }
  } catch (err) {
    console.error("Fetch admin activity error:", err);
  }
};
  const fetchBellNotifications = async () => {
    try {
   const adminData = JSON.parse(localStorage.getItem("admin") || "{}");

const res = await fetch(
  `${API_BASE}/getAdminProfile.php?admin_id=${adminData.id}`,
  {
    credentials: "include",
  }
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
    if (fetchedOnce.current) return;

    fetchedOnce.current = true;

    fetchAdmin();
    fetchAdminActivity();
    fetchBellNotifications();

    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.notificationWrapper}, .${styles.customSort}`
      );

      if (!insideDropdown) {
        setNotificationOpen(false);
        setActivitySortOpen(false);
      }
    };

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  }, []);

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();

    const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
    const adminId = adminData.id;

    if (!adminId) {
      Swal.fire("Error", "No admin ID found. Please log in again.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/markAdminNotificationsRead.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin_id: adminId }),
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

  const formatActivityDate = (dateValue) => {
    if (!dateValue || dateValue === "Not recorded yet") {
      return "Not recorded yet";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString();
  };

  const sortedActions = [...adminActivity.recent_actions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (activitySort === "recent") {
      return dateB - dateA;
    }

    return dateA - dateB;
  });

  const totalActivityPages = Math.ceil(sortedActions.length / actionsPerPage);

  const paginatedActions = sortedActions.slice(
    (activityPage - 1) * actionsPerPage,
    activityPage * actionsPerPage
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
        <h1 className={styles.pageTitle}>Admin Profile</h1>

        <div className={styles.profileCard}>
          <div className={styles.idPhotoBox}>
            <div className={styles.idPhotoFrame}>
              <img
                src={admin.profile_image}
                alt="Admin Profile"
                className={styles.idPhoto}
                onError={(e) => {
                  e.target.src = "/images/temporary profile.jpg";
                }}
              />
            </div>

            <div className={styles.idBarcode}></div>
          </div>

          <div className={styles.profileCardInner}>
            <div className={styles.profileCardTop}>
              <h1 className={styles.profileTitle}>Admin ID Card</h1>
            </div>

            <div className={styles.profileDivider}></div>

            <div className={styles.profileInfoGrid}>
              <div className={styles.profileField}>
                <span className={styles.profileLabel}>Full Name:</span>
                <span className={styles.profileValue}>{admin.full_name}</span>
              </div>

              <div className={styles.profileField}>
                <span className={styles.profileLabel}>Role:</span>
                <span className={styles.profileValue}>{admin.role}</span>
              </div>

              <div className={styles.profileField}>
                <span className={styles.profileLabel}>Username:</span>
                <span className={styles.profileValue}>{admin.username}</span>
              </div>

              <div className={`${styles.profileField} ${styles.profileFieldWide}`}>
                <span className={styles.profileLabel}>Email:</span>
                <span className={styles.profileValue}>{admin.email}</span>
              </div>

              <div className={styles.profileButtonWrap}>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => navigate("/admin/settings")}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.settingsCard}>
          <h2 className={styles.settingsHeading}>Admin Activity</h2>

          <div className={styles.settingsDivider}></div>

          <div className={styles.activityBody}>
            <div className={styles.activityItem}>
              <span>Last Login</span>
              <strong
                className={
                  adminActivity.last_login === "Not recorded yet"
                    ? styles.noLogin
                    : styles.loginDate
                }
              >
                {formatActivityDate(adminActivity.last_login)}
              </strong>
            </div>

            <div className={styles.activityItem}>
              <span>Modules Created</span>
              <strong>{adminActivity.modules_created}</strong>
            </div>

            <div className={styles.activityList}>
              <div className={styles.activityListHeader}>
                <h3>Recent Admin Actions</h3>

                <div className={styles.customSort}>
                  <button
                    type="button"
                    className={styles.customSortBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivitySortOpen((prev) => !prev);
                    }}
                  >
                    <i className="bx bx-sort-alt-2"></i>
                    <span>Sort by</span>
                    <i className="bx bx-chevron-down"></i>
                  </button>

                  {activitySortOpen && (
                    <div className={styles.customSortMenu}>
                      <button
                        type="button"
                        onClick={() => {
                          setActivitySort("recent");
                          setActivityPage(1);
                          setActivitySortOpen(false);
                        }}
                      >
                        Recently Added
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActivitySort("oldest");
                          setActivityPage(1);
                          setActivitySortOpen(false);
                        }}
                      >
                        Oldest
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {paginatedActions.length > 0 ? (
                paginatedActions.map((action, index) => (
                  <div key={index} className={styles.activityAction}>
                    <p>{action.text}</p>
                    <small>{formatActivityDate(action.date)}</small>
                  </div>
                ))
              ) : (
                <p className={styles.noActivity}>No recent admin actions yet.</p>
              )}

              {totalActivityPages > 1 && (
                <div className={styles.activityPagination}>
                  <button
                    type="button"
                    disabled={activityPage === 1}
                    onClick={() => setActivityPage((prev) => prev - 1)}
                  >
                    Prev
                  </button>

                  <span>
                    Page {activityPage} of {totalActivityPages}
                  </span>

                  <button
                    type="button"
                    disabled={activityPage === totalActivityPages}
                    onClick={() => setActivityPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}