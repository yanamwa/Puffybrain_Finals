import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "./decksM.module.css";
import "boxicons/css/boxicons.min.css";
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
  Database,
} from "lucide-react";

export default function DeckManagement() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [bellNotifications, setBellNotifications] = useState([]);

  const [selectedDeck, setSelectedDeck] = useState(null);
  const [selectedDeckCards, setSelectedDeckCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsToShow, setRowsToShow] = useState(10);

  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [admin, setAdmin] = useState({
    username: "Admin",
    full_name: "",
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

  const formatDeckId = (deck) => {
    return `DECK${String(deck.deck_id).padStart(4, "0")}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "No date";

    return new Date(dateValue).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const fetchAdmin = async () => {
    try {
      const res = await fetch(`${API_BASE}/getAdminProfile.php`, {
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
      const storedAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
      const adminId = storedAdmin.id || localStorage.getItem("admin_id");

      const res = await fetch(
        `${API_BASE}/getAdminNotifications.php?admin_id=${adminId || ""}`,
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

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();

    const storedAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
    const adminId = storedAdmin.id || localStorage.getItem("admin_id");

    if (!adminId) {
      alert("Admin ID not found. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/markAdminNotificationsRead.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_id: adminId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchBellNotifications();
        setNotificationOpen(true);
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  const fetchDecks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/getDecks.php`, {
        credentials: "include",
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON from getDecks.php:", text);
        setError("Server returned invalid JSON. Check getDecks.php.");
        return;
      }

      if (data.success) {
        setDecks(data.decks || []);
      } else {
        setError(data.message || "Failed to fetch decks.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Check getDecks.php.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeck = async (deck) => {
    setSelectedDeck(deck);
    setSelectedDeckCards([]);
    setCardsLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/getCardsByDeckId.php?deck_id=${deck.deck_id}`,
        { credentials: "include" }
      );

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON from getCardsByDeckId.php:", text);
        alert("Server returned invalid JSON.");
        setSelectedDeckCards([]);
        return;
      }

      if (data.success) {
        setSelectedDeckCards(data.cards || []);
      } else {
        alert(data.message || "Failed to fetch cards");
        setSelectedDeckCards([]);
      }
    } catch (err) {
      console.error("Cards fetch error:", err);
      setSelectedDeckCards([]);
    } finally {
      setCardsLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, rowsToShow]);

  const filteredDecks = decks.filter((deck) => {
    const q = searchQuery.trim().toLowerCase();

    return (
      String(deck.deck_id || "").toLowerCase().includes(q) ||
      String(deck.title || "").toLowerCase().includes(q) ||
      String(deck.username || "").toLowerCase().includes(q) ||
      String(deck.visibility || "").toLowerCase().includes(q) ||
      String(deck.status || "").toLowerCase().includes(q)
    );
  });

  const sortedDecks = [...filteredDecks].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }

    if (sortBy === "oldest") {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    }

    if (sortBy === "user") {
      return String(a.username || "").localeCompare(String(b.username || ""));
    }

    if (sortBy === "title") {
      return String(a.title || "").localeCompare(String(b.title || ""));
    }

    if (sortBy === "status") {
      return String(a.status || "").localeCompare(String(b.status || ""));
    }

    return 0;
  });

  const isDeckArchived = (deck) => {
    const archived = String(deck.archived ?? "").toLowerCase();
    const isArchived = String(deck.is_archived ?? "").toLowerCase();
    const status = String(deck.status ?? "").toLowerCase();

    return (
      archived === "1" ||
      archived === "true" ||
      archived === "archived" ||
      isArchived === "1" ||
      isArchived === "true" ||
      isArchived === "archived" ||
      status === "archived"
    );
  };

  const totalPages = Math.ceil(sortedDecks.length / rowsToShow);

  const currentDecks = sortedDecks.slice(
    (currentPage - 1) * rowsToShow,
    currentPage * rowsToShow
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
            placeholder="Search decks..."
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
        <div className={styles.pageTop}>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>Decks Management</h1>
            <p>Tracks decks that were made by users.</p>
          </div>

          <div className={styles.sortBox}>
            <label>Sort by:</label>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest Deck</option>
              <option value="oldest">Oldest Deck</option>
              <option value="user">User A-Z</option>
              <option value="title">Title A-Z</option>
              <option value="status">Status A-Z</option>
            </select>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>Deck ID</div>
            <div>User Made</div>
            <div>Title</div>
            <div>Date Created</div>
            <div>Visibility</div>
            <div>Status</div>
            <div>View</div>
          </div>

          <div className={styles.tableContent}>
            {loading && <div className={styles.message}>Loading decks...</div>}

            {!loading && error && (
              <div className={styles.errorMessage}>{error}</div>
            )}

            {!loading && !error && currentDecks.length === 0 && (
              <div className={styles.message}>No decks found.</div>
            )}

            {!loading &&
              !error &&
              currentDecks.map((deck) => (
                <div className={styles.row} key={deck.deck_id}>
                  <div className={styles.userId}>{formatDeckId(deck)}</div>
                  <div>@{deck.username || "Unknown"}</div>
                  <div>{deck.title || "No title"}</div>
                  <div>{formatDate(deck.created_at)}</div>

                  <div>
                    <span
                      className={`${styles.badge} ${
                        String(deck.visibility || "").toLowerCase() === "private"
                          ? styles.privateBadge
                          : styles.publicBadge
                      }`}
                    >
                      {deck.visibility || "Public"}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`${styles.badge} ${
                        isDeckArchived(deck)
                          ? styles.archivedBadge
                          : styles.activeBadge
                      }`}
                    >
                      {isDeckArchived(deck) ? "Archived" : "Active"}
                    </span>
                  </div>

                  <button
                    className={styles.viewBtn}
                    type="button"
                    onClick={() => handleViewDeck(deck)}
                  >
                    View
                  </button>
                </div>
              ))}
          </div>

          <div className={styles.paginationWrapper}>
            <div className={styles.paginationCenter}>
              <button
                className={styles.navBtn}
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                {"<"}
              </button>

              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    className={`${styles.pageBtn} ${
                      currentPage === page ? styles.pageActive : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className={styles.navBtn}
                type="button"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
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

      {selectedDeck && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDeck(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              Deck Details

              <span className={styles.close} onClick={() => setSelectedDeck(null)}>
                ×
              </span>
            </div>

            <div className={styles.modalBody}>
              <p>
                <strong>Deck ID:</strong> {formatDeckId(selectedDeck)}
              </p>

              <p>
                <strong>User Made:</strong> @{selectedDeck.username || "Unknown"}
              </p>

              <p>
                <strong>Title:</strong> {selectedDeck.title || "No title"}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {selectedDeck.description || "No description"}
              </p>

              <p>
                <strong>Date Created:</strong> {formatDate(selectedDeck.created_at)}
              </p>

              <p>
                <strong>Visibility:</strong> {selectedDeck.visibility || "Public"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {isDeckArchived(selectedDeck) ? "Archived" : "Active"}
              </p>

              <div className={styles.cardsSection}>
                <h3>Cards Made</h3>

                {cardsLoading ? (
                  <p>Loading cards...</p>
                ) : selectedDeckCards.length === 0 ? (
                  <p>No cards found in this deck.</p>
                ) : (
                  <div className={styles.cardsList}>
                    {selectedDeckCards.map((card, index) => (
                      <div
                        className={styles.cardItem}
                        key={card.cardId || card.id || index}
                      >
                        <p>
                          <strong>Question:</strong>{" "}
                          {card.question || "No question"}
                        </p>

                        <p>
                          <strong>Answer:</strong>{" "}
                          {card.answer || "No answer"}
                        </p>
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