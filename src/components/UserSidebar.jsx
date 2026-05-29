import { Link, NavLink, useLocation } from "react-router-dom";
import styles from "./UserSidebar.module.css";

export default function UserSidebar({
  isCollapsed,
  setIsCollapsed,
  myDecks = [],
  courses = [],
  openCourse,
  getDeckId,
}) {
  const location = useLocation();

  const shownDecks = myDecks.slice(0, 5);
  const shownCourses = courses.slice(0, 5);

  const truncateText = (text, limit = 30) => {
    if (!text) return "";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const isDeckActive = (deckId) => {
    return location.pathname === `/deck/${deckId}`;
  };

  const isCourseActive = (courseId) => {
    return (
      location.pathname === `/learning/${courseId}` ||
      location.pathname === `/lesson/${courseId}` ||
      location.pathname === `/introduction/${courseId}`
    );
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sidebarInner}>
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

        <nav className={styles.menu}>
          <ul className={styles.sidebarList}>
            <li className={styles.sidebarListItem}>
              <p className={styles.sectionTitle}>Menu</p>

              <NavLink
                to="/homepage"
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ""}`
                }
              >
                <i className="bx bx-home"></i>
                <span className={styles.menuText}>Home</span>
              </NavLink>
            </li>

            <li className={styles.sidebarListItem}>
              <NavLink
                to="/mydecks"
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ""}`
                }
              >
                <i className="bx bx-collection"></i>
                <span className={styles.menuText}>Decks</span>
              </NavLink>
            </li>

            <li className={styles.sidebarListItem}>
              <NavLink
                to="/mycourse"
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ""}`
                }
              >
                <i className="bx bx-book-open"></i>
                <span className={styles.menuText}>My Course</span>
              </NavLink>
            </li>

            <li className={styles.sidebarListItem}>
              <NavLink
                to="/public-decks"
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ""}`
                }
              >
                <i className="bx bx-world"></i>
                <span className={styles.menuText}>Public Decks</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className={styles.divider}></div>

        <div className={styles.myDecksNav}>
          <p className={styles.sectionTitle}>My Decks</p>

          <ul className={styles.sectionList}>
            {shownDecks.length > 0 ? (
              shownDecks.map((deck) => {
                const deckId = getDeckId
                  ? getDeckId(deck)
                  : deck.deck_id || deck.id || deck.DeckID;

                return (
                  <li key={deckId} className={styles.sidebarListItem}>
                    <Link
                      to={`/deck/${deckId}`}
                      title={deck.title}
                      className={`${styles.menuItem} ${
                        isDeckActive(deckId) ? styles.active : ""
                      }`}
                    >
                      <i className="bx bx-collection"></i>
                      <span className={styles.menuText}>
                        {truncateText(deck.title)}
                      </span>
                    </Link>
                  </li>
                );
              })
            ) : (
              <li className={styles.sidebarListItem}>
                <span className={styles.menuText1}>No decks yet</span>
              </li>
            )}

            {myDecks.length > 5 && (
              <li className={styles.sidebarListItem}>
                <Link
                  to="/mydecks"
                  className={`${styles.menuItem} ${styles.seeMoreLink}`}
                >
                  <i className="bx bx-dots-horizontal-rounded"></i>
                  <span className={styles.menuText}>See More</span>
                </Link>
              </li>
            )}
          </ul>

          <p className={styles.sectionTitle}>My Courses</p>

          <ul className={styles.sectionList}>
            {shownCourses.length > 0 ? (
              shownCourses.map((course) => (
                <li key={course.id} className={styles.sidebarListItem}>
                  <button
                    type="button"
                    title={course.title}
                    onClick={() => openCourse(course.id)}
                    className={`${styles.menuItem} ${
                      isCourseActive(course.id) ? styles.active : ""
                    }`}
                  >
                    <i className="bx bx-book-open"></i>
                    <span className={styles.menuText}>
                      {truncateText(course.title)}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className={styles.sidebarListItem}>
                <span className={styles.menuText1}>No courses yet</span>
              </li>
            )}

            {courses.length > 5 && (
              <li className={styles.sidebarListItem}>
                <Link
                  to="/mycourse"
                  className={`${styles.menuItem} ${styles.seeMoreLink}`}
                >
                  <i className="bx bx-dots-horizontal-rounded"></i>
                  <span className={styles.menuText}>See More</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </aside>
  );
}