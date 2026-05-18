import { useEffect, useState } from "react";
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
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./adminprofile.module.css";
import "boxicons/css/boxicons.min.css";

export default function AdminProfile() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0;

  const [admin, setAdmin] = useState({
    full_name: "System Administrator",
    email: "Not set",
    username: "Admin",
    role: "Administrator",
    profile_image: "/images/temporary profile.jpg",
  });

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
  useEffect(() => {
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

        console.log(data.admin.profile_image);

      const imagePath = data.admin.profile_image
      ? data.admin.profile_image
      : "/images/temporary profile.jpg";

      setAdmin({
        full_name: data.admin.full_name || "System Administrator",
        email: data.admin.email || "Not set",
        username: data.admin.username || "Admin",
        role: data.admin.role || "Administrator",
        profile_image: imagePath,
      });
      } catch (err) {
        console.error("Failed to fetch admin:", err);
      }
    };

    fetchAdmin();
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#7b5cff",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/admin/login");
      }
    });
  };

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
        <form className={styles.searchBar} onSubmit={(e) => e.preventDefault()}>
          <Search size={19} />

          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

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
        <h1 className={styles.pageTitle}>Admin Profile</h1>

        <div className={styles.profileCard}>
          <div className={styles.idPhotoBox}>
            <div className={styles.idPhotoFrame}>
              <img
                  src={admin.profile_image}
                  alt="Admin Profile"
                  className={styles.idPhoto}
                  onError={(e) => {
                    console.log("IMAGE FAILED:", e.target.src);
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

              <div
                className={`${styles.profileField} ${styles.profileFieldWide}`}
              >
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
      </main>
    </div>
  );
}