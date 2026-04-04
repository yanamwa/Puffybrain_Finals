import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import styles from "./UserProfile.module.css";

function UserProfile() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [myDecks, setMyDecks] = useState([]);
  const [user, setUser] = useState({
    username: "",
    year_level: "",
    school: "",
    signature: "",
  });

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setMyDecks(data.decks);
      }
    } catch (err) {
      console.error("Failed to fetch user decks:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setUser({
          username: data.user.username || "",
          year_level: data.user.year_level || "",
          school: data.user.school || "Cavite State University Imus Campus",
          signature: data.user.signature || data.user.username || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
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

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      {/* ================= LEFT SIDEBAR ================= */}
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
        <div>
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

          <p className={styles.myDecksTitle}>Menu</p>

          <nav className={styles.menu}>
            <ul className={styles.sidebarList}>
              <li className={styles.sidebarListItem}>
                <Link to="/homepage" className={styles.menuItem}>
                  <i className="bx bx-home"></i>
                  <span className={styles.menuText}>Home</span>
                </Link>
              </li>

              <li className={styles.sidebarListItem}>
                <Link to="/Mydecks" className={styles.menuItem}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>Decks</span>
                </Link>
              </li>

              <li className={styles.sidebarListItem}>
                <Link to="/mycourse" className={styles.menuItem}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>My Course</span>
                </Link>
              </li>

              <li className={styles.sidebarListItem}>
                <Link to="/public-decks" className={styles.menuItem}>
                  <i className="bx bx-folder"></i>
                  <span className={styles.menuText}>Public Decks</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.divider}></div>

          <div className={styles.myDecksNav}>
            <p className={styles.myDecks}>My Decks</p>

            <ul className={styles.sidebarList}>
              {myDecks.length === 0 ? (
                <li className={styles.sidebarListItem}>
                  <span className={styles.menuText} style={{ opacity: 0.6 }}>
                    Don't have decks yet
                  </span>
                </li>
              ) : (
                myDecks.map((deck) => (
                  <li key={deck.id} className={styles.sidebarListItem}>
                    <Link to={`/deck/${deck.id}`} className={styles.menuItem}>
                      <i className="bx bx-book"></i>
                      <span className={styles.menuText}>{deck.title}</span>
                    </Link>
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

      {/* ================= RIGHT SIDE ================= */}
      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
          <div className={styles.headerContainer}>
            <form
              className={styles.searchBar}
              onSubmit={(e) => e.preventDefault()}
            >
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
                <img
                  src="/images/temporary profile.jpg"
                  alt="Profile"
                  className={styles.profilePic}
                />
              </div>

              <div className={styles.userInfo}>
                <p>{user.username || "User"}</p>
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

                <div
                  className={`${styles.dropdownContent} ${
                    dropdownOpen ? styles.show : ""
                  }`}
                >
                  <Link to="/setting-profile/setting-profilee">
                    <i className="bx bx-cog" />
                    <span>Settings</span>
                  </Link>

                  <Link to="/how-it-works">
                    <i className="bx bx-help-circle" />
                    <span>FAQs</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={styles.dropdownLogout}
                  >
                    <i className="bx bx-log-out" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <main className={styles.main}>
            <div className={styles.profileCard}>
                <div className={styles.idPhotoBox}>
                  <div className={styles.idPhotoFrame}>
                    <img
                      src="/images/temporary profile.jpg"
                      alt="Profile"
                      className={styles.idPhoto}
                    />
                  </div>
                  <div className={styles.idBarcode}></div>
                </div>

                <div className={styles.profileCardInner}>
                  <div className={styles.profileCardTop}>
                    <h1 className={styles.profileTitle}>Student ID Card</h1>

                    <button className={styles.shareBtn} type="button">
                      <i className="bx bx-share-alt"></i>
                    </button>
                  </div>

                  <div className={styles.profileDivider}></div>

                  <div className={styles.profileInfoGrid}>
                    <div className={styles.profileField}>
                      <span className={styles.profileLabel}>Username:</span>
                      <span className={styles.profileValue}>{user.username || "meiko"}</span>
                    </div>

                    <div className={styles.profileField}>
                      <span className={styles.profileLabel}>Year:</span>
                      <span className={styles.profileValue}>{user.year_level || "2nd Year"}</span>
                    </div>

                    <div className={`${styles.profileField} ${styles.profileFieldWide}`}>
                      <span className={styles.profileLabel}>School:</span>
                      <span className={styles.profileValue}>
                        {user.school || "Cavite State University Imus Campus"}
                      </span>
                    </div>

                    <div className={styles.profileField}>
                      <span className={styles.profileLabel}>Signature:</span>
                      <span className={styles.signatureText}>
                        {user.signature || user.username || "Meiko"}
                      </span>
                    </div>

                    <div className={styles.profileButtonWrap}>
                      <button
                        className={styles.editBtn}
                        onClick={() => navigate("/edit-profile")}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            <div className={styles.decksSection}>
              <h2>My Decks</h2>

              <div className={styles.decksGrid}>
                {myDecks.length === 0 ? (
                  <p className={styles.emptyText}>Don’t have decks yet</p>
                ) : (
                  myDecks.map((deck, index) => (
                    <Link
                      key={deck.id}
                      to={`/deck/${deck.id}`}
                      className={styles.deckBox}
                    >
                      <div
                        className={`${styles.deckPreview} ${
                          index % 4 === 0
                            ? styles.previewBlue
                            : index % 4 === 1
                            ? styles.previewPink
                            : index % 4 === 2
                            ? styles.previewViolet
                            : styles.previewRed
                        }`}
                      ></div>

                      <div className={styles.deckText}>
                        <strong>{deck.title}</strong>
                        <p>{deck.card_count ?? 0} cards</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;