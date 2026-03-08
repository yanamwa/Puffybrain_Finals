import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";

import styles from "./Mydecks.module.css";

export default function Mydecks() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [deckTitle, setDeckTitle] = useState("");
  const [deckDesc, setDeckDesc] = useState("");
  const [visibility, setVisibility] = useState("");
  const [deckColor, setDeckColor] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("");

  const [decks, setDecks] = useState([]);
  const [user, setUser] = useState({
    username: "",
    year_level: "",
  });

  const fetchUserDecks = async () => {
  const res = await fetch("http://localhost/puffybrain/userDecks.php", {
    credentials: "include",
  });
  const data = await res.json();

  if (data.success) {
    setDecks(data.decks.map(deck => ({
      id: deck.id,
      title: deck.title,
      cards: deck.card_count ?? 0,
      type: deck.visibility === "public" ? "shared" : "private",
      colorClass: "blue"
    })));
  }
};

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) navigate("/login");
  };

  useEffect(() => {
    fetchUserDecks();
    fetchUser();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest?.(`.${styles.dropdown}`);
      if (!insideDropdown) setDropdownOpen(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const filteredDecks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return decks
      .filter((d) => (!q ? true : d.title.toLowerCase().includes(q)))
      .filter((d) => (!selectedFilter ? true : d.type === selectedFilter));
  }, [decks, search, selectedFilter]);

    const openDeck = (deckId) => {
      navigate(`/deck/${deckId}`);
    };

  const resetAddForm = () => {
    setDeckTitle("");
    setDeckDesc("");
    setVisibility("");
    setDeckColor("");
  };

  const handleAddDeck = async () => {
    if (!deckTitle.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing title",
        text: "Please enter a deck title.",
        confirmButtonColor: "#7b5cff",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", deckTitle);
      formData.append("description", deckDesc);
      formData.append("visibility", visibility === "private" ? "private" : "public");

      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setAddPopupOpen(false);

        Swal.fire({
          title: "Deck Added!",
          text: "Your new deck has been successfully added.",
          imageUrl: "/images/success.png",
          imageWidth: 170,
          imageHeight: 170,
          timer: 1100,
          showConfirmButton: false,
        });

        resetAddForm();
        fetchUserDecks();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Failed to create deck.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong.",
      });
    }
  };

  return (
    <div className={`${styles.container} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div>
          <div className={styles.sidebarToggle} onClick={() => setIsCollapsed(!isCollapsed)}>
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img className={styles.logoExpanded} src="/images/logo1.png" alt="Logo" />
            <img className={styles.logoCollapsed} src="/images/logo_solo.png" alt="Logo" />
          </div>

          <div className={styles.divider}></div>

          <p className={styles.myDecksTitle}>Menu</p>

          <nav className={styles.menu}>
            <ul className={styles.sidebarList}>
              <li className={styles.sidebarListItem}>
                <NavLink to="/homepage" className={styles.menuItem}>
                  <i className="bx bx-home"></i>
                  <span className={styles.menuText}>Home</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink to="/mydecks" className={`${styles.menuItem} ${styles.active}`}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>Decks</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink to="/mycourse" className={styles.menuItem}>
                  <i className="bx bx-folder"></i>
                  <span className={styles.menuText}>My Course</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink to="/public-decks" className={styles.menuItem}>
                  <i className="bx bx-folder"></i>
                  <span className={styles.menuText}>Public Decks</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className={styles.divider}></div>

          <div className={styles.myDecksNav}>
            <p className={styles.myDecks}>My Decks</p>
            <ul className={styles.sidebarList}>
              {decks.length === 0 ? (
                <li className={styles.sidebarListItem}>
                  <span className={styles.menuText} style={{ opacity: 0.6 }}>
                    Don't have decks yet
                  </span>
                </li>
              ) : (
                decks.slice(0, 3).map((deck) => (
                  <li key={deck.id} className={styles.sidebarListItem}>
                    <button type="button" onClick={() => openDeck(deck.id)} className={styles.menuItem} style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                      <i className="bx bx-book"></i>
                      <span className={styles.menuText}>{deck.title}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className={styles.logout}>
          <button className={styles.logoutLink} onClick={handleLogout}>
            <i className="bx bx-log-out"></i>
            <span className={styles.menuText}>Logout</span>
          </button>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
        <div className={styles.headerContainer}>
          <form className={styles.searchBar} onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Search your decks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <i className="bx bx-search" />
          </form>

          <div className={styles.profileWrapper}>
            <div className={styles.dpContainer}>
              <img src="/images/temporary profile.jpg" alt="Profile" className={styles.profilePic} />
            </div>

            <div className={styles.userInfo}>
              <p>{user.username}</p>
            </div>

            <div className={styles.dropdown}>
              <button
                type="button"
                className={styles.dropdownBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((v) => !v);
                }}
              >
                <i className="bx bx-chevron-down" />
              </button>

              <div className={`${styles.dropdownContent} ${dropdownOpen ? styles.show : ""}`}>
                <NavLink to="/user-profile">
                  <i className="bx bx-cog" />
                  <span>Settings</span>
                </NavLink>

                <NavLink to="/how-it-works">
                  <i className="bx bx-help-circle" />
                  <span>FAQs</span>
                </NavLink>

                <NavLink to="/login">
                  <i className="bx bx-log-out" />
                  <span>Logout</span>
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        <main className={styles.main}>

          <div className={styles.panel}>
            <div className={styles.purpleStrip} />
            <div className={styles.panelHeader}>
              <h1>My Decks</h1>
              <button className={styles.addBtn} type="button" onClick={() => setAddPopupOpen(true)}>
                Add New Decks
              </button>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.purpleStrip} />

            <div className={styles.filterRow}>
              <button type="button" className={styles.filterPill} onClick={() => setFilterOpen(true)}>
                Filter
              </button>
            </div>

            <div className={styles.deckArea}>
              {filteredDecks.map((d) => (
                <article
                  key={d.id}
                  className={`${styles.deckCard} ${styles[d.colorClass] || ""}`}
                  onClick={() => openDeck(d.id)}
                >
                  <div className={styles.deckTop} />
                  <div className={styles.deckBody}>
                    <h4>{d.title}</h4>
                    <span>{d.cards} cards</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>

        {addPopupOpen && (
          <div className={styles.overlay} onClick={() => setAddPopupOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Add Decks</h2>

              <label className={styles.label}>Deck Title</label>
              <input
                className={styles.input}
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="Enter your deck name"
              />

              <label className={styles.label}>Description</label>
              <input
                className={styles.input}
                value={deckDesc}
                onChange={(e) => setDeckDesc(e.target.value)}
                placeholder="Optional"
              />

              <label className={styles.label}>Visibility</label>
              <div className={styles.radioRow}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === "public"}
                    onChange={() => setVisibility("public")}
                  />
                  Public
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === "private"}
                    onChange={() => setVisibility("private")}
                  />
                  Private
                </label>
              </div>

              <label className={styles.label}>Choose Deck Color</label>
              <div className={styles.colorRow}>
                {["#C8BBD0", "#33FF57", "#FF5733", "#6C5CE7", "#00B894", "#D63031"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={styles.colorDot}
                    style={{ background: c, outline: deckColor === c ? "3px solid #111" : "none" }}
                    onClick={() => setDeckColor(c)}
                  />
                ))}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setAddPopupOpen(false);
                    resetAddForm();
                  }}
                >
                  Cancel
                </button>
                <button type="button" className={styles.confirmBtn} onClick={handleAddDeck}>
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {filterOpen && (
          <div className={styles.overlay} onClick={() => setFilterOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Filter</h2>

              <div className={styles.radioCol}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="deckType"
                    value="private"
                    checked={selectedFilter === "private"}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  />
                  Private
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="deckType"
                    value="shared"
                    checked={selectedFilter === "shared"}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  />
                  Shared
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setSelectedFilter("");
                    setFilterOpen(false);
                  }}
                >
                  Reset
                </button>
                <button type="button" className={styles.confirmBtn} onClick={() => setFilterOpen(false)}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      <div className={styles.panel}>

  <div className={styles.purpleStrip}></div>

  <div className={styles.panelHeader}>
    <h1>Decks From Other Users</h1>
  </div>

  <div className={styles.deckArea}>
    {filteredDecks.filter((d) => d.type === "added").length === 0 ? (
      <p className={styles.emptyText}>
        No decks added from other users yet.
      </p>
    ) : (
      filteredDecks
        .filter((d) => d.type === "added")
        .map((d) => (
          <article
            key={d.id}
            className={styles.deckCard}
            onClick={() => openDeck(d.id)}
          >
            <div className={styles.deckTop}></div>

            <div className={styles.deckBody}>
              <h4>{d.title}</h4>
              <span>{d.cards} cards</span>
            </div>
          </article>
        ))
    )}
  </div>

</div>
</div>

</div>
      </div>
  );
}
