import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  BookOpen,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import styles from "./dashboard.module.css";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function numberWithCommas(x) {
  return Number(x || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function useAnimatedCount(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = null;
    let raf;

    function step(ts) {
      if (!start) start = ts;

      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(Number(target || 0) * easeOutCubic(progress)));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    }

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return numberWithCommas(value);
}

function StatCard({ icon, iconClass, label, count, change }) {
  const display = useAnimatedCount(count);

  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${iconClass}`}>{icon}</div>

      <div className={styles.statBottom}>
        <div className={styles.statTextGroup}>
          <div className={styles.statLabel}>{label}</div>
          <div className={styles.statChange}>{change}</div>
        </div>

        <div className={styles.statValue}>{display}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [decks, setDecks] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDecks, setTotalDecks] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [bellNotifications, setBellNotifications] = useState([]);
    const navigate = useNavigate();
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

  const getStoredAdminId = () => {
    try {
      const storedAdmin = JSON.parse(localStorage.getItem("admin") || "{}");

      return (
        storedAdmin.id ||
        storedAdmin.AdminID ||
        localStorage.getItem("admin_id") ||
        ""
      );
    } catch {
      return localStorage.getItem("admin_id") || "";
    }
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

      const adminData = data.admin || {};

      setAdmin({
        id: adminData.id || adminData.AdminID || getStoredAdminId(),
        username: adminData.username || adminData.Username || "Admin",
        full_name: adminData.full_name || adminData.FullName || "",
        email: adminData.email || adminData.Email || "",
        role: adminData.role || adminData.Role || "Administrator",
        profile_image:
          adminData.profile_image || "/images/temporary profile.jpg",
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
  const fetchDashboardData = async () => {
    try {
      const [usersRes, decksRes, userCountRes, deckCountRes] =
        await Promise.all([
          fetch(`${API_BASE}/getUsers.php`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${API_BASE}/getRecentDecks.php`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${API_BASE}/userCount.php`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${API_BASE}/deckCount.php`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

      const usersData = await usersRes.json();
      const decksData = await decksRes.json();
      const userCountData = await userCountRes.json();
      const deckCountData = await deckCountRes.json();

      if (usersData.success) setUsers(usersData.users || []);
      if (decksData.success) setDecks(decksData.decks || []);
      if (userCountData.success) setTotalUsers(userCountData.total || 0);
      if (deckCountData.success) setTotalDecks(deckCountData.total || 0);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to fetch dashboard data.");
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

  useEffect(() => {
    if (fetchedOnce.current) return;

    fetchedOnce.current = true;

    fetchAdmin();
    fetchDashboardData();
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

  const unreadNotifications = bellNotifications.filter(
    (notif) => notif.status === "unread"
  );

  const notificationCount = unreadNotifications.length;

  const q = searchQuery.trim().toLowerCase();

  const filteredUsers = users.filter((u) =>
    !q
      ? true
      : String(u.username || u.Username || "")
          .toLowerCase()
          .includes(q)
  );

  const filteredDecks = decks.filter((d) =>
    !q
      ? true
      : `${d.username || ""} ${d.title || ""}`.toLowerCase().includes(q)
  );

  return (
    <div className={styles.gridContainer}>
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
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

          <div className={styles.adminHeaderProfile}>
         <img
            src={adminImage}
            alt="Admin"
            className={styles.adminHeaderImg}
            onError={(e) => {
              e.target.src = "/images/temporary profile.jpg";
            }}
          />

            <span className={styles.adminHeaderName}>
              {admin.username || "Admin"}
            </span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Dashboard</h1>

        <div className={styles.statsRow}>
          <StatCard
            icon={<Users size={30} />}
            iconClass={styles.statIcon1}
            label="Total Users"
            count={totalUsers}
            change="Live"
          />

          <StatCard
            icon={<BookOpen size={30} />}
            iconClass={styles.statIcon2}
            label="Total Decks"
            count={totalDecks}
            change="Live"
          />

          <StatCard
            icon={<BookOpen size={30} />}
            iconClass={styles.statIcon3}
            label="Recent Decks"
            count={decks.length}
            change="Latest"
          />
        </div>

        <div className={styles.tablesRow}>
          <section className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <span className={styles.tableTitle}>Recent Created Decks</span>
              <NavLink to="/admin/decks" className={styles.showAll}>
                Show all
              </NavLink>
            </div>

            {filteredDecks.length > 0 ? (
              filteredDecks.map((d) => (
                <div className={styles.listItem} key={d.deck_id}>
                  <div className={styles.listAvatar}>
                    <BookOpen size={18} />
                  </div>

                  <div className={styles.listInfo}>
                    <div className={styles.listName}>
                      {d.title || "Untitled Deck"}
                    </div>
                    <div className={styles.listSub}>
                      Created by @{d.username || "Unknown"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <BookOpen size={46} />
                </div>
                <p>No decks created yet.</p>
                <span>Decks will appear here once added.</span>
              </div>
            )}
          </section>

          <section className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <span className={styles.tableTitle}>Recent Users</span>
              <NavLink to="/admin/users" className={styles.showAll}>
                Show all
              </NavLink>
            </div>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <div className={styles.listItem} key={u.id || u.user_id}>
                  <div className={styles.listAvatar}>
                    <User size={18} />
                  </div>

                  <div className={styles.listInfo}>
                    <div className={styles.listName}>
                      @{u.username || u.Username || "Unknown"}
                    </div>
                    <div className={styles.listSub}>Recent user</div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <User size={46} />
                </div>
                <p>No users found.</p>
                <span>Users will appear here once added.</span>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}