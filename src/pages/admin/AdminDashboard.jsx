import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink } from "react-router-dom";
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
import { toast } from "sonner";
import styles from "./dashboard.module.css";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function numberWithCommas(x) {
  return Number(x || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{display}</div>
      <div className={styles.statChange}>{change}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [decks, setDecks] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDecks, setTotalDecks] = useState(0);

  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [usersRes, decksRes, userCountRes, deckCountRes] =
          await Promise.all([
            fetch("http://localhost/puffybrain/getUsers.php"),
            fetch("http://localhost/puffybrain/getRecentDecks.php"),
            fetch("http://localhost/puffybrain/userCount.php"),
            fetch("http://localhost/puffybrain/deckCount.php"),
          ]);

        const usersData = await usersRes.json();
        const decksData = await decksRes.json();
        const userCountData = await userCountRes.json();
        const deckCountData = await deckCountRes.json();

        if (usersData.success) {
          setUsers(usersData.users || []);
        }

        if (decksData.success) {
          setDecks(decksData.decks || []);
        }

        if (userCountData.success) {
          setTotalUsers(userCountData.total || 0);
        }

        if (deckCountData.success) {
          setTotalDecks(deckCountData.total || 0);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Failed to fetch dashboard data.");
      }
    }

    fetchDashboardData();
  }, []);

  const q = searchQuery.trim().toLowerCase();

  const filteredUsers = users.filter((u) =>
    !q ? true : String(u.username || "").toLowerCase().includes(q)
  );

  const filteredDecks = decks.filter((d) =>
    !q
      ? true
      : `${d.username || ""} ${d.title || ""}`.toLowerCase().includes(q)
  );

  const handleShowAll = useCallback(() => {
    toast("Showing all");
  }, []);

  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    {
      label: "Modes Management",
      path: "/admin/modes",
      icon: <BookOpen size={20} />,
    },
  ];

  return (
    <div className={styles.gridContainer}>
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

        <div className={styles.profileWrapper} ref={dropdownRef}>
          <div className={styles.dpContainer}>
            <User size={23} />
          </div>

          <span className={styles.profileName}>@admin</span>

          <button
            type="button"
            className={styles.dropdownBtn}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <ChevronDown size={17} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownContent}>
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
              <button className={styles.showAll} onClick={handleShowAll}>
                Show all
              </button>
            </div>

            {filteredDecks.length > 0 ? (
              filteredDecks.map((d) => (
                <div className={styles.listItem} key={d.deck_id}>
                  <div className={styles.listAvatar}>
                    <BookOpen size={18} />
                  </div>

                  <div className={styles.listInfo}>
                    <div className={styles.listName}>{d.title}</div>
                    <div className={styles.listSub}>Created by @{d.username}</div>
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
              <button className={styles.showAll} onClick={handleShowAll}>
                Show all
              </button>
            </div>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <div className={styles.listItem} key={u.id}>
                  <div className={styles.listAvatar}>
                    <User size={18} />
                  </div>

                  <div className={styles.listInfo}>
                    <div className={styles.listName}>@{u.username}</div>
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