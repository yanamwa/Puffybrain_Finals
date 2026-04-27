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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
      setCourses(data.success ? data.courses || [] : []);
    } catch (err) {
      console.error("Fetch courses error:", err);
      setCourses([]);
    }
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });

      const data = await res.json();
      setMyDecks(data.success ? data.decks || [] : []);
    } catch (err) {
      console.error("Fetch decks error:", err);
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
      console.error("Fetch user error:", err);
    }
  };

  useEffect(() => {
    fetchAddedCourses();
    fetchUserDecks();
    fetchUser();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.dropdownBtn}, .${styles.dropdownContent}`
      );

      if (!insideDropdown) {
        setProfileDropdownOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();

    return courses.filter((course) =>
      (course.title || "").toLowerCase().includes(q)
    );
  }, [courses, search]);

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) navigate("/login");
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
                  <li className={styles.sidebarEmptyText}>
                    Don't have decks yet
                  </li>
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
                  <li className={styles.sidebarEmptyText}>
                    No courses added yet
                  </li>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <li key={course.id} className={styles.sidebarListItem}>
                      <button
                        type="button"
                        onClick={() => openCourse(course.id)}
                        className={styles.menuItem}
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
      </aside>

      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
          <div className={styles.headerContainer}>
            <form
              className={styles.searchBar}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="Search your courses"
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
                <p>{user.username}</p>
              </div>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                >
                  <i className="bx bx-chevron-down" />
                </button>

                <div
                  className={`${styles.dropdownContent} ${
                    profileDropdownOpen ? styles.show : ""
                  }`}
                >
                  <NavLink to="/edit-profile">
                    <i className="bx bx-cog" />
                    <span>Settings</span>
                  </NavLink>

                  <NavLink to="/faq">
                    <i className="bx bx-help-circle" />
                    <span>FAQs</span>
                  </NavLink>

                  <button type="button" onClick={handleLogout}>
                    <i className="bx bx-log-out" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
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
                  <div className={styles.emptyState}>
                    <img
                      src="/images/cute1.png"
                      alt="No courses"
                      className={styles.emptyImg}
                    />

                    <p className={styles.emptyText}>
                      {search
                        ? "No courses match your search."
                        : "You haven't added any courses yet."}
                    </p>
                  </div>
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
                          <h4>{course.title || "Untitled Course"}</h4>

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