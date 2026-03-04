import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "./publicDeck.module.css";

function PublicDecks() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [publicDecks, setPublicDecks] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [user, setUser] = useState({
    username: "",
    year_level: "",
  });

  // ---------------- FETCH LESSONS ----------------
  useEffect(() => {
    fetch("http://localhost/puffybrain/getLessons.php")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLessons(data);
      })
      .catch(err => console.error("Lessons error:", err));
  }, []);

  // ---------------- FETCH PUBLIC DECKS ----------------
  useEffect(() => {
    fetch("http://localhost/puffybrain/getPublicDecks.php")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPublicDecks(data);
        } else if (data?.decks && Array.isArray(data.decks)) {
          setPublicDecks(data.decks);
        } else {
          setPublicDecks([]);
        }
      })
      .catch(err => console.error("Public decks error:", err));
  }, []);

  // ---------------- FETCH USER ----------------
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUser(data.user);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  const openDeck = (id) => {
    navigate(`/deck/${id}`);
  };

  return (
    <div className={`${styles.container} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>

      {/* ================= SIDEBAR ================= */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div>

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
                <NavLink to="/mydecks" className={styles.menuItem}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>Decks</span>
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

          {/* My Decks Preview */}
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
                myDecks.slice(0, 3).map((deck) => (
                  <li key={deck.id} className={styles.sidebarListItem}>
                    <button
                      type="button"
                      onClick={() => openDeck(deck.id)}
                      className={styles.menuItem}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                    >
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

      {/* ================= MAIN AREA ================= */}
      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>

          {/* Header */}
          <div className={styles.headerContainer}>
            <form
              className={styles.searchBar}
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="text" placeholder="Search your decks" />
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
                <p>{user.username}</p>
              </div>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen((prev) => !prev);
                  }}
                >
                  <i className="bx bx-chevron-down" />
                </button>

                <div
                  className={`${styles.dropdownContent} ${
                    isDropdownOpen ? styles.show : ""
                  }`}
                >
                  <NavLink to="/user-profile">
                    <i className="bx bx-cog" />
                    <span>Settings</span>
                  </NavLink>

                  <NavLink to="/how-it-works">
                    <i className="bx bx-help-circle" />
                    <span>FAQs</span>
                  </NavLink>

                  <button onClick={handleLogout}>
                    <i className="bx bx-log-out" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <main className={styles.mainContent}>

            {/* Courses */}
            <div className={styles.courses}>
              <div className={styles.courseHead}></div>

              <div className={styles.innercourse}>
                <div className={styles.innerhead}>
                  <h1>All Courses</h1>
                </div>

                <div className={styles.lessons}>
                  {lessons.map((lesson) => (
                    <div className={styles.lessonContent} key={lesson.id}>
                      <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                      <p className={styles.lessonDescription}>
                        {lesson.description}
                      </p>

                      <Link to={`/learning/${lesson.id}`}>
                        <button className={styles.lessonBtn}>
                          Start Learning
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Public Decks */}
            <div className={styles.courses}>
              <div className={styles.courseHead}></div>

              <div className={styles.innercourse}>
                <div className={styles.innerhead}>
                  <h1>Public Decks</h1>
                </div>

                <div className={styles.deckGrid}>
                  {publicDecks.length === 0 ? (
                    <p style={{ opacity: 0.6 }}>
                      No public decks available.
                    </p>
                  ) : (
                    publicDecks.map((deck, index) => {
                      const colors = [
                        "#EFAAAA",
                        "#C8BBD0",
                        "#FFE0B5",
                        "#E0BBD4",
                        "#EBD3FA",
                        "#B6F4BA",
                        "#C3C7F3",
                      ];

                      const headColor = colors[index % colors.length];

                      return (
                        <div
                          className={styles.deckBox}
                          key={deck.id}
                          onClick={() => navigate(`/deck/${deck.id}`)}
                        >
                          <div
                            className={styles.deckHead}
                            style={{ backgroundColor: headColor }}
                          ></div>

                          <div className={styles.deckContent}>
                            <h3 className={styles.deckTitle}>
                              {deck.title}
                            </h3>
                            <p className={styles.deckCount}>
                              {deck.description || "No description"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

export default PublicDecks;