import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";

import styles from "./Mydecks.module.css";

export default function Mydecks() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [deckTitle, setDeckTitle] = useState("");
  const [deckDesc, setDeckDesc] = useState("");
  const [visibility, setVisibility] = useState(""); // public | private
  const [deckColor, setDeckColor] = useState("");

  const [selectedFilter, setSelectedFilter] = useState(""); // private | shared | ""

  const [decks, setDecks] = useState([
    { id: 1, title: "Lesson 1 to 3 Networking", cards: 37, type: "private", colorClass: "blue" },
    { id: 2, title: "Methods of research lesson 2", cards: 30, type: "shared", colorClass: "pink" },
    { id: 3, title: "Methods of research lesson 3", cards: 15, type: "shared", colorClass: "violet" },
    { id: 4, title: "Business Analysis Lesson 1", cards: 0, type: "private", colorClass: "red" },
  ]);

  // close dropdown when clicking outside
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
    navigate(`/deckpage?id=${deckId}`);
  };

  const resetAddForm = () => {
    setDeckTitle("");
    setDeckDesc("");
    setVisibility("");
    setDeckColor("");
  };

  const handleAddDeck = () => {
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

    if (deckTitle.trim()) {
      setDecks((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: deckTitle.trim(),
          cards: 0,
          type: visibility === "private" ? "private" : "shared",
          colorClass: deckColor ? "custom" : "blue",
          hex: deckColor || "",
          desc: deckDesc || "",
        },
      ]);
    }

    resetAddForm();
  };

  return (
    <div className={styles.container}>
      <div className={styles.gridContainer}>
        {/* HEADER */}
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
              <p>@meiko</p>
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

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div>
            <div className={styles.logo}>
              <img src="/images/logo.png" alt="Logo" />
            </div>

            <p className={styles.sectionTitle}>Menu</p>

            <nav>
              <ul className={styles.sidebarList}>
                <li className={styles.sidebarListItem}>
                  <NavLink to="/homepage" className={styles.menuItem}>
                    <i className="bx bx-home" />
                    <span>Home</span>
                  </NavLink>
                </li>

                <li className={styles.sidebarListItem}>
                  <NavLink to="/mydecks" className={styles.menuItemActive}>
                    <i className="bx bx-book" />
                    <span>Decks</span>
                  </NavLink>
                </li>

                <li className={styles.sidebarListItem}>
                  <NavLink to="/public-decks" className={styles.menuItem}>
                    <i className="bx bx-folder" />
                    <span>Public Decks</span>
                  </NavLink>
                </li>
              </ul>
            </nav>

            <p className={styles.sectionTitle}>My Decks</p>
            <ul className={styles.sidebarList}>
              {decks.slice(0, 3).map((d) => (
                <li className={styles.sidebarListItem} key={d.id}>
                  <button type="button" onClick={() => openDeck(d.id)} className={styles.deckLinkBtn}>
                    <i className="bx bx-book" />
                    <span>{d.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <NavLink to="/login" className={styles.logoutBtn}>
              <i className="bx bx-log-out" />
              <span>Logout</span>
            </NavLink>
          </div>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          {/* HEADER PANEL */}
          <div className={styles.panel}>
            <div className={styles.purpleStrip} />
            <div className={styles.panelHeader}>
              <h1>My Decks</h1>
              <button className={styles.addBtn} type="button" onClick={() => setAddPopupOpen(true)}>
                Add New Decks
              </button>
            </div>
          </div>

          {/* CONTENT PANEL */}
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

        {/* ADD POPUP */}
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

        {/* FILTER POPUP */}
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
      </div>
    </div>
  );
}