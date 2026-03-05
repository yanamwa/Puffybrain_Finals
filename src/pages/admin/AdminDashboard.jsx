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

/* helpers */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function useAnimatedCount(target, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = null;
    let raf;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(target * easeOutCubic(progress)));
      if (progress < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return numberWithCommas(value);
}

/* stat card */
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

  /* FETCH DATA */
  useEffect(() => {
    fetch("http://localhost/puffybrain/api/getUsers.php")
      .then(res => res.json())
      .then(data => data.success && setUsers(data.users));

    fetch("http://localhost/puffybrain/api/getRecentDecks.php")
      .then(res => res.json())
      .then(data => data.success && setDecks(data.decks));

    fetch("http://localhost/puffybrain/api/userCount.php")
      .then(res => res.json())
      .then(data => data.success && setTotalUsers(data.total));

    fetch("http://localhost/puffybrain/api/deckCount.php")
      .then(res => res.json())
      .then(data => data.success && setTotalDecks(data.total));
  }, []);

  const q = searchQuery.trim().toLowerCase();

  const filteredUsers = users.filter(
    u => !q || u.username.toLowerCase().includes(q)
  );

  const filteredDecks = decks.filter(
    d => !q || `${d.username} ${d.title}`.toLowerCase().includes(q)
  );

  const handleShowAll = useCallback(() => {
    toast("Showing all (demo)");
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

  /* SIDEBAR MENU */
  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Users size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <BookOpen size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <BookOpen size={20} /> },

  ];

  return (
    <div className={styles.gridContainer}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/images/logo.png" alt="Logo" />
        </div>

        <div className={styles.menuLabel}>Menu</div>

        {menuItems.map(item => (
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

      {/* HEADER */}
      <header className={styles.headerContainer}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.profileWrapper} ref={dropdownRef}>
          <div className={styles.dpContainer}>
            <User size={22} />
          </div>

          <span className={styles.profileName}>@admin</span>

          <button
            className={styles.dropdownBtn}
            onClick={() => setDropdownOpen(p => !p)}
          >
            <ChevronDown size={16} />
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

      {/* MAIN */}
      <main className={styles.main}>
        <div className={styles.pageTitle}>Dashboard</div>
        <div className={styles.statsRow}>
          <StatCard icon={<Users size={20} />} iconClass={styles.statIcon1} label="Total Users" count={totalUsers} change="Live" />
          <StatCard icon={<BookOpen size={20} />} iconClass={styles.statIcon2} label="Total Decks" count={totalDecks} change="Live" />
          <StatCard icon={<BookOpen size={20} />} iconClass={styles.statIcon3} label="Recent Decks" count={decks.length} change="Latest" />
        </div>

        <div className={styles.tablesRow}>
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <span className={styles.tableTitle}>Recent Created Decks</span>
              <button className={styles.showAll} onClick={handleShowAll}>show all</button>
            </div>

            {filteredDecks.map(d => (
              <div className={styles.listItem} key={d.deck_id}>
                <div className={styles.listInfo}>
                  <div className={styles.listName}>@{d.username}</div>
                  <div className={styles.listSub}>{d.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <span className={styles.tableTitle}>Recent Users</span>
              <button className={styles.showAll} onClick={handleShowAll}>show all</button>
            </div>

            {filteredUsers.map(u => (
              <div className={styles.listItem} key={u.id}>
                <div className={styles.listName}>@{u.username}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
