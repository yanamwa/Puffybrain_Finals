import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";
import styles from "./publicDeck.module.css";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";

function PublicDecks() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [lessons, setLessons] = useState([]);
  const [publicDecks, setPublicDecks] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [courseSort, setCourseSort] = useState("");
  const [deckSort, setDeckSort] = useState("");
  const [deckYear, setDeckYear] = useState("");
  const [deckCategory, setDeckCategory] = useState("");

  const [courseSortOpen, setCourseSortOpen] = useState(false);
  const [deckSortOpen, setDeckSortOpen] = useState(false);
  const [deckYearOpen, setDeckYearOpen] = useState(false);
  const [deckCategoryOpen, setDeckCategoryOpen] = useState(false);

  const [user, setUser] = useState({
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const categories = [
    "Reviewer",
    "Mathematics",
    "Science",
    "English",
    "Programming",
    "History",
    "Research",
    "Networking",
    "Database",
    "Web Development",
    "Cybersecurity",
    "Business",
    "Others",
  ];

  const notificationCount = notifications.filter(
    (notif) => notif.status === "unread"
  ).length;

  const swalClasses = {
    popup: styles.swalPopup,
    title: styles.swalTitle,
    htmlContainer: styles.swalText,
    confirmButton: styles.swalConfirmBtn,
    cancelButton: styles.swalCancelBtn,
    actions: styles.swalActions,
  };

  const closeAllFilterDropdowns = () => {
    setCourseSortOpen(false);
    setDeckSortOpen(false);
    setDeckYearOpen(false);
    setDeckCategoryOpen(false);
  };

  const getDeckId = (deck) => deck?.deck_id || deck?.id || deck?.DeckID || "";

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
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

  const getDeckCategory = (deck) => {
    return deck.category || deck.deck_category || deck.subject || "Reviewer";
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8d6cab",
      cancelButtonColor: "#b0b0b0",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: styles.logoutPopup,
        title: styles.logoutTitle,
        htmlContainer: styles.logoutText,
        confirmButton: styles.logoutConfirm,
        cancelButton: styles.logoutCancel,
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await fetch(`${API_BASE}/logout.php`, {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout API error:", err);
      }

      localStorage.removeItem("username");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_id");
      localStorage.removeItem("profile_image");
      sessionStorage.clear();

      navigate("/login", { replace: true });
    });
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/getUser.php`, {
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

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/getUserNotifications.php`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      setNotifications(data.success ? data.notifications || [] : []);
    } catch (err) {
      console.error("Notification fetch error:", err);
      setNotifications([]);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/markNotificationsAsRead.php`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            status: "read",
          }))
        );
      }
    } catch (err) {
      console.error("Mark notifications as read error:", err);
    }
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/userDecks.php`, {
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
      const res = await fetch(`${API_BASE}/getMyCourses.php`, {
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
      const res = await fetch(`${API_BASE}/getLessons.php`, {
        credentials: "include",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setLessons(data);
      } else if (Array.isArray(data.lessons)) {
        setLessons(data.lessons);
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error("Lessons fetch error:", err);
      setLessons([]);
    }
  };

  const fetchPublicDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/getPublicDecks.php`, {
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
    fetchNotifications();
    fetchUserDecks();
    fetchCourses();
    fetchLessons();
    fetchPublicDecks();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.customDropdown}, .${styles.searchBar}`
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

  const isCourseAdded = (lessonId) => {
    return courses.some((course) => {
      return (
        String(course.lesson_id) === String(lessonId) ||
        String(course.id) === String(lessonId)
      );
    });
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
      navigate(`/deck/${foundDeck.deck_id || foundDeck.id}`);
      return;
    }

    Swal.fire({
      icon: "info",
      title: "No results found",
      text: "No course or public deck matches your search.",
      confirmButtonText: "Okay",
      buttonsStyling: false,
      customClass: swalClasses,
    });
  };

  const handleAddCourse = async (lesson) => {
    if (isCourseAdded(lesson.id)) {
      await Swal.fire({
        title: "Already Added",
        text: "This course has already been added to My Courses.",
        icon: "info",
        confirmButtonText: "Okay",
        buttonsStyling: false,
        customClass: swalClasses,
      });

      return;
    }

    const result = await Swal.fire({
      title: "Add Course?",
      text: `Add "${lesson.title}" to My Courses?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, add it",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: swalClasses,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/addCourse.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          lesson_id: lesson.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Course added successfully",
          timer: 2000,
          showConfirmButton: true,
          confirmButtonText: "Okay",
          buttonsStyling: false,
          customClass: swalClasses,
        });

        await fetchCourses();
        navigate("/mycourse");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Failed to add course",
          confirmButtonText: "Okay",
          buttonsStyling: false,
          customClass: swalClasses,
        });
      }
    } catch (err) {
      console.error("Add course error:", err);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the course",
        confirmButtonText: "Okay",
        buttonsStyling: false,
        customClass: swalClasses,
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
          getDeckCategory(deck),
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
      })
      .filter((deck) => {
        if (!deckCategory) return true;

        return (
          getDeckCategory(deck).toLowerCase() === deckCategory.toLowerCase()
        );
      });

    if (deckSort === "az") {
      result = [...result].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    }

    if (deckSort === "recent") {
      result = [...result].sort(
        (a, b) => Number(b.deck_id || b.id) - Number(a.deck_id || a.id)
      );
    }

    if (deckSort === "oldest") {
      result = [...result].sort(
        (a, b) => Number(a.deck_id || a.id) - Number(b.deck_id || b.id)
      );
    }

    return result;
  }, [publicDecks, search, deckSort, deckYear, deckCategory]);

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      <UserSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        myDecks={myDecks}
        courses={courses}
        openCourse={openCourse}
        getDeckId={getDeckId}
      />

      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
          <UserHeader
            isCollapsed={isCollapsed}
            searchQuery={search}
            setSearchQuery={setSearch}
            handleSearchSubmit={handleSearchSubmit}
            notificationOpen={notificationOpen}
            setNotificationOpen={setNotificationOpen}
            setDropdownOpen={closeAllFilterDropdowns}
            notificationCount={notificationCount}
            notifications={notifications}
            markNotificationsAsRead={markNotificationsAsRead}
            user={user}
            profileDropdownOpen={profileDropdownOpen}
            setProfileDropdownOpen={setProfileDropdownOpen}
            handleLogout={handleLogout}
          />

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
                          setDeckCategoryOpen(false);
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
                      {search
                        ? "No courses match your search."
                        : "No courses available."}
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
                            if (e.key === "Enter") {
                              navigate(`/learning/${lesson.id}`);
                            }
                          }}
                        >
                          <div className={styles.lessonHeader}>
                            <h3 className={styles.lessonTitle}>
                              {lesson.title}
                            </h3>

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
                          setDeckCategoryOpen(false);
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
                          setDeckCategoryOpen(false);
                          setCourseSortOpen(false);
                        }}
                      >
                        <i className="bx bx-user"></i>
                        <span>{deckYear || "All Level"}</span>
                        <i className="bx bx-chevron-down"></i>
                      </button>

                      {deckYearOpen && (
                        <div className={styles.customDropdownMenu}>
                          {[
                            "",
                            "First Year",
                            "Second Year",
                            "Third Year",
                            "Fourth Year",
                          ].map((year) => (
                            <button
                              key={year || "all"}
                              type="button"
                              onClick={() => {
                                setDeckYear(year);
                                setDeckYearOpen(false);
                              }}
                            >
                              {year || "All Level"}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.customDropdown}>
                      <button
                        type="button"
                        className={styles.customDropdownBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeckCategoryOpen((prev) => !prev);
                          setDeckSortOpen(false);
                          setDeckYearOpen(false);
                          setCourseSortOpen(false);
                        }}
                      >
                        <i className="bx bx-book"></i>
                        <span>{deckCategory || "Categories"}</span>
                        <i className="bx bx-chevron-down"></i>
                      </button>

                      {deckCategoryOpen && (
                        <div className={styles.customDropdownMenu}>
                          <button
                            type="button"
                            onClick={() => {
                              setDeckCategory("");
                              setDeckCategoryOpen(false);
                            }}
                          >
                            All Categories
                          </button>

                          {categories
                            .filter((cat) => cat !== "Others")
                            .map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setDeckCategory(cat);
                                  setDeckCategoryOpen(false);
                                }}
                              >
                                {cat}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.deckGrid}>
                  {filteredPublicDecks.length === 0 ? (
                    <div className={styles.emptyDeckState}>
                      <img
                        src="/images/cute1.png"
                        alt="No public decks"
                        className={styles.emptyDeckImg}
                      />

                      <p className={styles.emptyDeckText}>
                        {search || deckYear || deckCategory
                          ? `No decks found for "${
                              search || deckYear || deckCategory
                            }".`
                          : "No public decks available."}
                      </p>
                    </div>
                  ) : (
                    filteredPublicDecks.map((deck, index) => (
                      <article
                        key={deck.deck_id || deck.id}
                        className={styles.deckCard}
                        onClick={() => navigate(`/deck/${deck.deck_id || deck.id}`)}
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

                            <p className={styles.deckCategoryText}>
                              <i className="bx bxs-book"></i>
                              <span>{getDeckCategory(deck)}</span>
                            </p>

                            <span>{Number(deck.card_count ?? 0)} cards</span>
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