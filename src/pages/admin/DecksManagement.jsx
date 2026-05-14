import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styles from "./decksM.module.css";
import "boxicons/css/boxicons.min.css";

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

export default function DeckManagement() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0;

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

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <LibraryBig size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <Gamepad2 size={20} /> },
    { label: "Notification Management", path: "/admin/notifications", icon: <i className="bx bx-bell"></i> },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/admin/login";
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

  const fetchDecks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost/puffybrain/getDecks.php");
      const data = await response.json();

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
        `http://localhost/puffybrain/getCardsByDeckId.php?deck_id=${deck.deck_id}`
      );

      const text = await res.text();
      const data = JSON.parse(text);

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
    return (
      Number(deck.archived) === 1 ||
      String(deck.archived || "").toLowerCase() === "1" ||
      String(deck.status || "").toLowerCase() === "archived"
    );
  };

  const totalPages = Math.ceil(sortedDecks.length / rowsToShow);

  const currentDecks = sortedDecks.slice(
    (currentPage - 1) * rowsToShow,
    currentPage * rowsToShow
  );

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
            placeholder="Search decks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

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
            <h4>Notifications</h4>

            <div className={styles.emptyNotification}>
              <p>You don’t have any new notifications</p>
            </div>
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

            {!loading && error && <div className={styles.errorMessage}>{error}</div>}

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
                      {Number(deck.archived) === 1 ? "Archived" : "Active"}
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

              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
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
              ))}

              <button
                className={styles.navBtn}
                type="button"
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
