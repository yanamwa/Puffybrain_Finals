import { Link, NavLink } from "react-router-dom";
import styles from "./UserSidebar.module.css";

export default function UserSidebar({
  isCollapsed,
  setIsCollapsed,
  myDecks = [],
  courses = [],
  openCourse,
  getDeckId,
}) {
  const shownDecks = myDecks.slice(0, 10);
  const shownCourses = courses.slice(0, 10);

  return (
    <aside
      className={`${styles.sidebar} ${
        isCollapsed ? styles.collapsed : ""
      }`}
    >
      <div className={styles.sidebarInner}>
        {/* TOGGLE */}
        <div
          className={styles.sidebarToggle}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className="bx bx-sidebar"></i>
        </div>

        {/* LOGO */}
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

        {/* MAIN MENU */}
        <nav className={styles.menu}>
          <ul className={styles.sidebarList}>
            <li className={styles.sidebarListItem}>
                      <p className={styles.sectionTitle}>Menu</p>
              <NavLink
                to="/homepage"
                className={({ isActive }) =>
                  `${styles.menuItem} ${
                    isActive ? styles.active : ""
                  }`
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
                  `${styles.menuItem} ${
                    isActive ? styles.active : ""
                  }`
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
                  `${styles.menuItem} ${
                    isActive ? styles.active : ""
                  }`
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
                  `${styles.menuItem} ${
                    isActive ? styles.active : ""
                  }`
                }
              >
                <i className="bx bx-world"></i>
                <span className={styles.menuText}>
                  Public Decks
                </span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className={styles.divider}></div>

        {/* MY DECKS */}
        <div className={styles.myDecksNav}>
          <p className={styles.sectionTitle}>My Decks</p>

          <ul className={styles.sectionList}>
            {shownDecks.length > 0 ? (
              shownDecks.map((deck) => {
                const deckId = getDeckId(deck);

                return (
                  <li
                    key={deckId}
                    className={styles.sidebarListItem}
                  >
                    <Link
                      to={`/deck/${deckId}`}
                      className={styles.menuItem}
                    >
                      <i className="bx bx-collection"></i>
                      <span className={styles.menuText}>
                        {deck.title}
                      </span>
                    </Link>
                  </li>
                );
              })
            ) : (
              <li className={styles.sidebarListItem}>
                <span className={styles.menuText}>
                  No decks yet
                </span>
              </li>
            )}

            {myDecks.length > 10 && (
              <li className={styles.sidebarListItem}>
                <Link
                  to="/mydecks"
                  className={`${styles.menuItem} ${styles.seeMoreLink}`}
                >
                  <i className="bx bx-dots-horizontal-rounded"></i>
                  <span className={styles.menuText}>
                    See More
                  </span>
                </Link>
              </li>
            )}
          </ul>

          {/* MY COURSES */}
          <p className={styles.sectionTitle}>My Courses</p>

          <ul className={styles.sectionList}>
            {shownCourses.length > 0 ? (
              shownCourses.map((course) => (
                <li
                  key={course.id}
                  className={styles.sidebarListItem}
                >
                  <button
                    type="button"
                    onClick={() => openCourse(course.id)}
                    className={styles.menuItem}
                  >
                    <i className="bx bx-book-open"></i>
                    <span className={styles.menuText}>
                      {course.title}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className={styles.sidebarListItem}>
                <span className={styles.menuText}>
                  No courses yet
                </span>
              </li>
            )}

            {courses.length > 10 && (
              <li className={styles.sidebarListItem}>
                <Link
                  to="/mycourse"
                  className={`${styles.menuItem} ${styles.seeMoreLink}`}
                >
                  <i className="bx bx-dots-horizontal-rounded"></i>
                  <span className={styles.menuText}>
                    See More
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </aside>
  );
}