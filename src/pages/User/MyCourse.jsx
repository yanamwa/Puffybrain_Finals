import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import styles from "./Mycourse.module.css";

export default function MyCourse() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
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
      console.log("COURSES:", data);

      if (data.success) {
        setCourses(data.courses || []);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
    }
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });

      const data = await res.json();
      console.log("MY DECKS:", data);

      if (data.success) {
        setMyDecks(data.decks || []);
      } else {
        setMyDecks([]);
      }
    } catch (err) {
      console.error("Deck fetch error:", err);
      setMyDecks([]);
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
          username: data.user?.username || data.username || "",
          year_level: data.user?.year_level || data.year_level || "",
        });
      }
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAddedCourses();
    fetchUserDecks();
    fetchUser();
  }, []);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [courses, search]);

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
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
                  to="/Mydecks"
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <i className="bx bx-book"></i>
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
                  <i className="bx bx-book"></i>
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
                  <i className="bx bx-folder"></i>
                  <span className={styles.menuText}>Public Decks</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className={styles.divider}></div>

          <div className={styles.myDecksNav}>
            <div className={styles.sectionBlock}>
              <p className={styles.sectionTitle}>My Decks</p>

              <ul className={styles.sectionList}>
                {myDecks.length === 0 ? (
                  <li className={styles.emptyText}>Don't have decks yet</li>
                ) : (
                  myDecks.slice(0, 3).map((deck) => (
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

            <div className={styles.sectionBlock}>
              <div className={styles.sectionDivider}></div>
              <p className={styles.sectionTitle}>My Courses</p>

              <ul className={styles.sectionList}>
                {courses.length === 0 ? (
                  <li className={styles.emptyText}>No courses added yet</li>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <li key={course.id} className={styles.sidebarListItem}>
                      <button
                        type="button"
                        onClick={() => openCourse(course.id)}
                        className={styles.menuItem}
                        style={{
                          background: "transparent",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <i className="bx bx-book"></i>
                        <span className={styles.menuText}>{course.title}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
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
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <div className={styles.profileWrapper}>
              <img
                src="/images/temporary profile.jpg"
                className={styles.profilePic}
                alt=""
              />
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
                {filteredCourses.length === 0 ? (
                  <p className={styles.emptyText}>
                    {search
                      ? "No courses match your search."
                      : "You haven't added any courses yet."}
                  </p>
                ) : (
                  filteredCourses.map((course, index) => {
                    const rawProgress = course.progress ?? course.completion;

                    const progress =
                      rawProgress !== undefined && rawProgress !== null
                        ? Number(rawProgress)
                        : 0;

                    const safeProgress = Math.max(0, Math.min(progress, 100));

                    const radius = 18;
                    const circumference = 2 * Math.PI * radius;
                    const dashOffset =
                      circumference - (safeProgress / 100) * circumference;

                    const colorClass =
                      index % 3 === 0
                        ? styles.blue
                        : index % 3 === 1
                        ? styles.pink
                        : styles.violet;

                    return (
                      <article
                        key={course.id}
                        className={`${styles.deckCard} ${colorClass}`}
                        onClick={() => openCourse(course.id)}
                      >
                        <div className={styles.deckTop}></div>

                        <div className={styles.deckBody}>
                          <p className={styles.courseLabel}>COURSE</p>
                          <h4>{course.title}</h4>

                          <div className={styles.progressWrap}>
                            <div className={styles.progressRing}>
                              <svg
                                viewBox="0 0 48 48"
                                className={styles.progressSvg}
                              >
                                <circle
                                  className={styles.progressBg}
                                  cx="24"
                                  cy="24"
                                  r={radius}
                                />
                                <circle
                                  className={styles.progressValue}
                                  cx="24"
                                  cy="24"
                                  r={radius}
                                  strokeDasharray={circumference}
                                  strokeDashoffset={dashOffset}
                                />
                              </svg>
                            </div>

                            <span className={styles.progressText}>
                              {safeProgress}% Complete
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}