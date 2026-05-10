import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import styles from "./publicDeck.module.css";

function PublicDecks() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [lessons, setLessons] = useState([]);
  const [publicDecks, setPublicDecks] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [courseSort, setCourseSort] = useState("");
  const [deckSort, setDeckSort] = useState("");
  const [deckYear, setDeckYear] = useState("");

  const [courseSortOpen, setCourseSortOpen] = useState(false);
  const [deckSortOpen, setDeckSortOpen] = useState(false);
  const [deckYearOpen, setDeckYearOpen] = useState(false);

  const notificationCount = 0;

  const [user, setUser] = useState({
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const closeAllFilterDropdowns = () => {
    setCourseSortOpen(false);
    setDeckSortOpen(false);
    setDeckYearOpen(false);
  };

  const normalizeYear = (value) => {
    const text = String(value || "").trim().toLowerCase();

    if (text.includes("1st") || text.includes("first")) return "first";
    if (text.includes("2nd") || text.includes("second")) return "second";
    if (text.includes("3rd") || text.includes("third")) return "third";
    if (text.includes("4th") || text.includes("fourth")) return "fourth";

    return text;
  };

  const limitWords = (text, limit = 15) => {
    if (!text) return "No description available.";

    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return text;

    return words.slice(0, limit).join(" ") + "...";
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#7b5cff",
    }).then((result) => {
      if (result.isConfirmed) navigate("/login");
    });
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser({
          username: data.user?.username || "",
          year_level: data.user?.year_level || "",
          profile_image:
            data.user?.profile_image || "/images/temporary profile.jpg",
        });
      }
    } catch (err) {
      console.error("Fetch user error:", err);
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
      console.error("Error fetching decks:", err);
      setMyDecks([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getMyCourses.php", {
        credentials: "include",
      });

      const data = await res.json();
      setCourses(data.success ? data.courses || [] : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getLessons.php", {
        credentials: "include",
      });

      const data = await res.json();
      setLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lessons fetch error:", err);
      setLessons([]);
    }
  };

  const fetchPublicDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getPublicDecks.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setPublicDecks(data);
      } else if (Array.isArray(data?.decks)) {
        setPublicDecks(data.decks);
      } else {
        setPublicDecks([]);
      }
    } catch (err) {
      console.error("Public decks error:", err);
      setPublicDecks([]);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchUserDecks();
    fetchCourses();
    fetchLessons();
    fetchPublicDecks();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}, .${styles.customDropdown}`
      );

      if (!insideDropdown) {
        setProfileDropdownOpen(false);
        setNotificationOpen(false);
        closeAllFilterDropdowns();
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const q = search.trim().toLowerCase();
    if (!q) return;

    const foundLesson = lessons.find((lesson) =>
      (lesson.title || "").toLowerCase().includes(q)
    );

    const foundDeck = publicDecks.find((deck) =>
      (deck.title || "").toLowerCase().includes(q)
    );

    if (foundLesson) {
      navigate(`/learning/${foundLesson.id}`);
      return;
    }

    if (foundDeck) {
      navigate(`/deck/${foundDeck.id}`);
      return;
    }

    Swal.fire({
      icon: "info",
      title: "No results found",
      text: "No course or public deck matches your search.",
      confirmButtonColor: "#7b5cff",
    });
  };

  const handleAddCourse = async (lesson) => {
    const result = await Swal.fire({
      title: "Add Course?",
      text: `Add "${lesson.title}" to My Courses?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, add it",
      confirmButtonColor: "#7b5cff",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("http://localhost/puffybrain/addDeck.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `lesson_id=${lesson.id}`,
      });

      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Course added successfully",
          timer: 2000,
          showConfirmButton: true,
          confirmButtonColor: "#7b5cff",
        });

        await fetchCourses();
        navigate("/mycourse");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Failed to add course",
        });
      }
    } catch (err) {
      console.error("Add course error:", err);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the course",
      });
    }
  };

  const filteredLessons = useMemo(() => {
  const q = search.trim().toLowerCase();

  let result = lessons.filter((lesson) => {
    if (!q) return true;

    const searchableText = [
      lesson.title,
      lesson.description,
      lesson.subject,
      lesson.category,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(q);
  });

  if (courseSort === "az") {
    result = [...result].sort((a, b) =>
      (a.title || "").localeCompare(b.title || "")
    );
  }

  if (courseSort === "recent") {
    result = [...result].sort((a, b) => Number(b.id) - Number(a.id));
  }

  if (courseSort === "oldest") {
    result = [...result].sort((a, b) => Number(a.id) - Number(b.id));
  }

  return result;
}, [lessons, search, courseSort]);

const filteredPublicDecks = useMemo(() => {
  const q = search.trim().toLowerCase();

  let result = publicDecks
    .filter((deck) => {
      if (!q) return true;

      const searchableText = [
        deck.title,
        deck.description,
        deck.username,
        deck.created_by,
        deck.creator,
        deck.creator_username,
        deck.uploader_username,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(q);
    })
    .filter((deck) => {
      const uploaderYear =
        deck.uploader_year_level ||
        deck.creator_year_level ||
        deck.year_level ||
        deck.level ||
        "";

      if (!deckYear) return true;

      return normalizeYear(uploaderYear) === normalizeYear(deckYear);
    });

  if (deckSort === "az") {
    result = [...result].sort((a, b) =>
      (a.title || "").localeCompare(b.title || "")
    );
  }

  if (deckSort === "recent") {
    result = [...result].sort((a, b) => Number(b.id) - Number(a.id));
  }

  if (deckSort === "oldest") {
    result = [...result].sort((a, b) => Number(a.id) - Number(b.id));
  }

  return result;
}, [publicDecks, search, deckSort, deckYear]);

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
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
            <div className={styles.sectionBlock}>
              <p className={styles.sectionTitle}>My Decks</p>

              <ul className={styles.sectionList}>
                {myDecks.length === 0 ? (
                  <li className={styles.sidebarEmptyText}>Don't have decks yet</li>
                ) : (
                  myDecks.slice(0, 3).map((deck) => (
                    <li key={deck.id} className={styles.sidebarListItem}>
                      <Link to={`/deck/${deck.id}`} className={styles.menuItem}>
                        <i className="bx bx-collection"></i>
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
                  <li className={styles.sidebarEmptyText}>No courses added yet</li>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <li key={course.id} className={styles.sidebarListItem}>
                      <button
                        type="button"
                        onClick={() => openCourse(course.id)}
                        className={styles.menuItem}
                      >
                        <i className="bx bx-book-open"></i>
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
            <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search courses or public decks"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button type="submit" className={styles.searchBtn}>
                <i className="bx bx-search" />
              </button>
            </form>

            <div className={styles.profileWrapper}>
              <div className={styles.notificationWrapper}>
                <button
                  type="button"
                  className={styles.notificationBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationOpen((prev) => !prev);
                    setProfileDropdownOpen(false);
                    closeAllFilterDropdowns();
                  }}
                >
                  <i className="bx bx-bell"></i>

                  {notificationCount > 0 && (
                    <span className={styles.notificationBadge}>
                      {notificationCount}
                    </span>
                  )}
                </button>

                <div
                  className={`${styles.notificationDropdown} ${
                    notificationOpen ? styles.show : ""
                  }`}
                >
                  <h4>Notifications</h4>

                  <div className={styles.emptyNotification}>
                    <p>You don’t have any new notifications</p>
                  </div>
                </div>
              </div>

              <Link to="/user-profile" className={styles.profileLink}>
                <div className={styles.dpContainer}>
                  <img
                    src={user.profile_image || "/images/temporary profile.jpg"}
                    alt="Profile"
                    className={styles.profilePic}
                  />
                </div>

                <div className={styles.userInfo}>
                  <p>{user.username}</p>
                </div>
              </Link>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen((prev) => !prev);
                    setNotificationOpen(false);
                    closeAllFilterDropdowns();
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

          <main className={styles.mainContent}>
            <section className={styles.courses}>
              <div className={styles.courseHead}></div>

              <div className={styles.innercourse}>
                <div className={styles.innerhead}>
                  <h1>All Courses</h1>

                  <div className={styles.filterGroup}>
                    <div className={styles.customDropdown}>
                      <button
                        type="button"
                        className={styles.customDropdownBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseSortOpen((prev) => !prev);
                          setDeckSortOpen(false);
                          setDeckYearOpen(false);
                        }}
                      >
                        <i className="bx bx-message-square-dots"></i>
                        <span>
                          {courseSort === "az"
                            ? "A-Z"
                            : courseSort === "recent"
                            ? "Recently"
                            : courseSort === "oldest"
                            ? "Oldest"
                            : "Sort by"}
                        </span>
                        <i className="bx bx-chevron-down"></i>
                      </button>

                      {courseSortOpen && (
                        <div className={styles.customDropdownMenu}>
                          <button
                            type="button"
                            onClick={() => {
                              setCourseSort("az");
                              setCourseSortOpen(false);
                            }}
                          >
                            A-Z
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCourseSort("recent");
                              setCourseSortOpen(false);
                            }}
                          >
                            Recently Added
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCourseSort("oldest");
                              setCourseSortOpen(false);
                            }}
                          >
                            Oldest
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.lessons}>
                  {filteredLessons.length === 0 ? (
                    <p className={styles.emptyMain}>
                      {search ? "No courses match your search." : "No courses available."}
                    </p>
                  ) : (
                    filteredLessons.map((lesson) => (
                      <div className={styles.lessonBox} key={lesson.id}>
                        <div className={styles.lessonTop}></div>
                        <div className={styles.lessonPreview}></div>

                        <div
                          className={styles.lessonContent}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/learning/${lesson.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") navigate(`/learning/${lesson.id}`);
                          }}
                        >
                          <div className={styles.lessonHeader}>
                            <h3 className={styles.lessonTitle}>{lesson.title}</h3>

                            <button
                              type="button"
                              className={styles.lessonAdd}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddCourse(lesson);
                              }}
                            >
                              <i className="bx bx-plus"></i>
                            </button>
                          </div>

                          <p className={styles.lessonDescription}>
                            {limitWords(lesson.description, 30)}
                          </p>

                          <button
                            type="button"
                            className={styles.lessonBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/learning/${lesson.id}`);
                            }}
                          >
                            Start Learning
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className={styles.courses}>
              <div className={styles.courseHead}></div>

              <div className={styles.innercourse}>
                <div className={styles.innerhead}>
                  <h1>Public Decks</h1>

                  <div className={styles.filterGroup}>
                    <div className={styles.customDropdown}>
                      <button
                        type="button"
                        className={styles.customDropdownBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeckSortOpen((prev) => !prev);
                          setDeckYearOpen(false);
                          setCourseSortOpen(false);
                        }}
                      >
                        <i className="bx bx-message-square-dots"></i>
                        <span>
                          {deckSort === "az"
                            ? "A-Z"
                            : deckSort === "recent"
                            ? "Recently"
                            : deckSort === "oldest"
                            ? "Oldest"
                            : "Sort by"}
                        </span>
                        <i className="bx bx-chevron-down"></i>
                      </button>

                      {deckSortOpen && (
                        <div className={styles.customDropdownMenu}>
                          <button
                            type="button"
                            onClick={() => {
                              setDeckSort("az");
                              setDeckSortOpen(false);
                            }}
                          >
                            A-Z
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeckSort("recent");
                              setDeckSortOpen(false);
                            }}
                          >
                            Recently Added
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeckSort("oldest");
                              setDeckSortOpen(false);
                            }}
                          >
                            Oldest
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={styles.customDropdown}>
                      <button
                        type="button"
                        className={styles.customDropdownBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeckYearOpen((prev) => !prev);
                          setDeckSortOpen(false);
                          setCourseSortOpen(false);
                        }}
                      >
                        <i className="bx bx-user"></i>
                        <span>{deckYear || "All Level"}</span>
                        <i className="bx bx-chevron-down"></i>
                      </button>

                      {deckYearOpen && (
                        <div className={styles.customDropdownMenu}>
                          <button
                            type="button"
                            onClick={() => {
                              setDeckYear("");
                              setDeckYearOpen(false);
                            }}
                          >
                            All Level
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeckYear("First Year");
                              setDeckYearOpen(false);
                            }}
                          >
                            First year
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeckYear("Second Year");
                              setDeckYearOpen(false);
                            }}
                          >
                            Second year
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeckYear("Third Year");
                              setDeckYearOpen(false);
                            }}
                          >
                            Third year
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeckYear("Fourth Year");
                              setDeckYearOpen(false);
                            }}
                          >
                            Fourth year
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.deckGrid}>
                  {filteredPublicDecks.length === 0 ? (
                    <p className={styles.emptyMain}>
                      {search || deckYear
                        ? "No public decks match your search or filter."
                        : "No public decks available."}
                    </p>
                  ) : (
                    filteredPublicDecks.map((deck, index) => (
                      <article
                        key={deck.id}
                        className={styles.deckCard}
                        onClick={() => navigate(`/deck/${deck.id}`)}
                      >
                        <div className={styles.deckCardInner}>
                          <div
                            className={styles.deckTop}
                            style={{
                              backgroundColor:
                                deck.deck_color ||
                                [
                                  "#D7C9F7",
                                  "#B8F2D9",
                                  "#FFB7A5",
                                  "#B5A9FF",
                                  "#9EE7DD",
                                  "#F4A7C1",
                                ][index % 6],
                            }}
                          ></div>

                          <div className={styles.deckBody}>
                            <h4>{deck.title}</h4>
                            <span>{deck.description || "No description"}</span>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default PublicDecks;