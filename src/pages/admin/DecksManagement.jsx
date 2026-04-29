import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styles from "./decksM.module.css";

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

export default function DeckManagement() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);
  const decksPerPage = 5;

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

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Users size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <BookOpen size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <BookOpen size={20} /> },
  ];

  useEffect(() => {
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

    fetchDecks();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const filteredDecks = decks.filter((deck) => {
    const q = searchQuery.toLowerCase();

    return (
      String(deck.deck_id || "").includes(q) ||
      String(deck.title || "").toLowerCase().includes(q) ||
      String(deck.username || "").toLowerCase().includes(q) ||
      String(deck.visibility || "").toLowerCase().includes(q) ||
      String(deck.status || "").toLowerCase().includes(q)
    );
  });

  const sortedDecks = [...filteredDecks].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === "user") return String(a.username || "").localeCompare(String(b.username || ""));
    if (sortBy === "title") return String(a.title || "").localeCompare(String(b.title || ""));
    if (sortBy === "status") return String(a.status || "").localeCompare(String(b.status || ""));
    return 0;
  });

  const totalPages = Math.ceil(sortedDecks.length / decksPerPage);
  const startIndex = (currentPage - 1) * decksPerPage;
  const currentDecks = sortedDecks.slice(startIndex, startIndex + decksPerPage);

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
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <header className={styles.headerContainer}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search decks"
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
            type="button"
            className={styles.dropdownBtn}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className={`${styles.dropdownContent} ${styles.show}`}>
              <button className={styles.dropdownItem}>
                <Settings size={16} />
                Settings
              </button>
              <button className={styles.dropdownItem}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageTop}>
          <h1 className={styles.pageTitle}>Decks Management</h1>

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
                        String(deck.visibility).toLowerCase() === "private"
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
                        deck.status === "Archived"
                          ? styles.archivedBadge
                          : styles.activeBadge
                      }`}
                    >
                      {deck.status || "Active"}
                    </span>
                  </div>

                  <button
                    className={styles.viewBtn}
                    onClick={() => setSelectedDeck(deck)}
                  >
                    View
                  </button>
                </div>
              ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBox}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBox} ${
                  currentPage === page ? styles.activePage : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className={styles.pageBox}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {selectedDeck && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedDeck(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              Deck Details
              <span
                className={styles.close}
                onClick={() => setSelectedDeck(null)}
              >
                ×
              </span>
            </div>

            <div className={styles.modalBody}>
              <p><strong>Deck ID:</strong> {formatDeckId(selectedDeck)}</p>
              <p><strong>User Made:</strong> @{selectedDeck.username || "Unknown"}</p>
              <p><strong>Title:</strong> {selectedDeck.title || "No title"}</p>
              <p><strong>Description:</strong> {selectedDeck.description || "No description"}</p>
              <p><strong>Date Created:</strong> {formatDate(selectedDeck.created_at)}</p>
              <p><strong>Visibility:</strong> {selectedDeck.visibility || "Public"}</p>
              <p><strong>Status:</strong> {selectedDeck.status || "Active"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}