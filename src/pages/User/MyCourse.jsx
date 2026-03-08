import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import styles from "./Mydecks.module.css";

export default function MyCourse() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const [decks, setDecks] = useState([]);
  const [user, setUser] = useState({
    username: "",
    year_level: "",
  });

  const fetchAddedCourses = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getMyCourses.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setDecks(
          data.courses.map(course => ({
            id: course.id,
            title: course.title,
            cards: course.card_count ?? 0
          }))
        );
      }
    } catch (err) {
      console.error("Added decks error:", err);
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
      console.error("User fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAddedCourses();
    fetchUser();
  }, []);

  const filteredDecks = useMemo(() => {
    const q = search.trim().toLowerCase();

    return decks.filter(d =>
      d.title.toLowerCase().includes(q)
    );
  }, [decks, search]);

  const openDeck = (deckId) => {
    navigate(`/deck/${deckId}`);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/login");
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
                <NavLink to="/mydecks" className={styles.menuItem}>
                  <i className="bx bx-book"></i>
                  <span className={styles.menuText}>Decks</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink to="/mycourse" className={`${styles.menuItem} ${styles.active}`}>
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
            <p className={styles.myDecks}>My Courses</p>

            <ul className={styles.sidebarList}>
              {decks.length === 0 ? (
                <li className={styles.sidebarListItem}>
                  <span className={styles.menuText} style={{ opacity: 0.6 }}>
                    No courses added yet
                  </span>
                </li>
              ) : (
                decks.slice(0,3).map((deck) => (
                  <li key={deck.id} className={styles.sidebarListItem}>
                    <button
                      type="button"
                      onClick={() => openDeck(deck.id)}
                      className={styles.menuItem}
                      style={{background:"transparent",border:"none",cursor:"pointer",width:"100%",textAlign:"left"}}
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

      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
          <div className={styles.headerContainer}>
            <form className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search your courses"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
              />
            </form>

            <div className={styles.profileWrapper}>
              <img src="/images/temporary profile.jpg" className={styles.profilePic} alt=""/>
              <p>{user.username}</p>
            </div>
          </div>

          <main className={styles.main}>
            <div className={styles.panel}>
              <div className={styles.purpleStrip}></div>

              <div className={styles.panelHeader}>
                <h1>My Courses</h1>
              </div>

              <div className={styles.deckArea}>
                {filteredDecks.length === 0 ? (
                  <p className={styles.emptyText}>
                    You haven't added any courses yet.
                  </p>
                ) : (
                  filteredDecks.map((course) => (
                    <article
                      key={course.id}
                      className={styles.deckCard}
                      onClick={()=>openDeck(course.id)}
                    >
                      <div className={styles.deckTop}></div>

                      <div className={styles.deckBody}>
                        <h4>{course.title}</h4>
                        <span>{course.cards} cards</span>
                      </div>
                    </article>
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