import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import styles from "./Learning_Module.module.css";
import "../../index.css";
import QuizModesModal from "../../components/QuizModesModal";

function LearningModule() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");
  const [openModes, setOpenModes] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const notificationCount = 0;

  const [user, setUser] = useState({
    id: null,
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const [progress, setProgress] = useState({
    total_cards: 0,
    studied_cards: 0,
    progress_percent: 0,
    last_viewed_card: 0,
  });

  const currentCourse = useMemo(() => {
  return courses.find((course) => {
    const courseId =
      course.id ||
      course.lesson_id ||
      course.course_id ||
      course.module_id;

    return Number(courseId) === Number(lessonId);
  });
}, [courses, lessonId]);

  const isCourseAdded = useMemo(() => {
    return courses.some((course) => {
      const courseId =
        course.id ||
        course.lesson_id ||
        course.course_id ||
        course.module_id;

      return Number(courseId) === Number(lessonId);
    });
  }, [courses, lessonId]);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser({
          id: data.user?.id || data.user?.user_id || null,
          username: data.user?.username || "",
          year_level: data.user?.year_level || "",
          profile_image:
            data.user?.profile_image || "/images/temporary profile.jpg",
        });
      }
    } catch (err) {
      console.error("fetchUser error:", err);
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
      console.error("fetchUserDecks error:", err);
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
      console.error("fetchCourses error:", err);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchUserDecks();
    fetchCourses();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}, .${styles.searchBar}`
      );

      if (!insideDropdown) {
        setProfileDropdownOpen(false);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const getTotalSlides = (lessonData) => {
    const lessonSlides = lessonData?.lesson_content
      ? lessonData.lesson_content
          .split("---")
          .map((slide) => slide.trim())
          .filter((slide) => slide.length > 0)
      : [];

    let quizSlides = [];

    if (lessonData?.quiz_contents) {
      try {
        const parsed = JSON.parse(lessonData.quiz_contents);
        quizSlides = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Invalid quiz JSON:", error);
        quizSlides = [];
      }
    }

    return lessonSlides.length + quizSlides.length;
  };

useEffect(() => {
  const loadLessonAndProgress = async () => {
    setLoading(true);

    try {
      const lessonRes = await fetch(
        `http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`
      );

      const lessonData = await lessonRes.json();

      const finalLesson =
        lessonData.lesson ||
        lessonData.data ||
        lessonData;

      setLesson(finalLesson);

      const totalSlides = getTotalSlides(finalLesson);

      // ===== GET HOMEPAGE PROGRESS FIRST =====

      const homepagePercentRaw =
        currentCourse?.progress_percent ??
        currentCourse?.progress ??
        currentCourse?.study_progress ??
        currentCourse?.percentage ??
        currentCourse?.completion_percent ??
        null;

      const homepageStudied =
        Number(currentCourse?.studied_cards) ||
        Number(currentCourse?.completed_cards) ||
        Number(currentCourse?.progress_count) ||
        0;

      const homepageTotal =
        Number(currentCourse?.total_cards) ||
        totalSlides;

      // ===== USE HOMEPAGE PERCENT IF AVAILABLE =====

      if (
        homepagePercentRaw !== null &&
        homepagePercentRaw !== undefined
      ) {
        const cleanPercent = Number(
          String(homepagePercentRaw).replace("%", "")
        );

        setProgress({
          total_cards: homepageTotal,
          studied_cards:
            homepageStudied || homepageTotal,
          progress_percent: Math.min(
            cleanPercent || 0,
            100
          ),
          last_viewed_card: 0,
        });

        return;
      }

      // ===== COMPUTE FROM HOMEPAGE COUNTS =====

      if (homepageStudied > 0 && homepageTotal > 0) {
        const homepagePercent =
          (homepageStudied / homepageTotal) * 100;

        setProgress({
          total_cards: homepageTotal,
          studied_cards: homepageStudied,
          progress_percent: Math.min(
            homepagePercent,
            100
          ),
          last_viewed_card: 0,
        });

        return;
      }

      // ===== FALLBACK =====

      if (!user.id) {
        setProgress({
          total_cards: totalSlides,
          studied_cards: 0,
          progress_percent: 0,
          last_viewed_card: 0,
        });

        setLoading(false);
        return;
      }

      // ===== LOAD DATABASE PROGRESS =====

      const progressRes = await fetch(
        `http://localhost/puffybrain/getLessonProgress.php?user_id=${user.id}&lesson_id=${lessonId}`,
        {
          credentials: "include",
        }
      );

      const progressData = await progressRes.json();

      const realProgress =
        progressData?.progress || progressData;

      const studiedCards =
        Number(realProgress?.studied_cards) || 0;

      const lastViewedCard =
        Number(realProgress?.last_viewed_card) || 0;

      const safeStudiedCards = Math.min(
        studiedCards,
        totalSlides
      );

      const computedPercent =
        totalSlides > 0
          ? (safeStudiedCards / totalSlides) * 100
          : 0;

      setProgress({
        total_cards: totalSlides,
        studied_cards: safeStudiedCards,
        progress_percent: Math.min(
          computedPercent,
          100
        ),
        last_viewed_card: lastViewedCard,
      });

    } catch (err) {
      console.error(
        "Error loading lesson/progress:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  loadLessonAndProgress();

}, [lessonId, user.id, currentCourse]);

  const quizzes = useMemo(() => {
    if (!lesson?.quiz_contents) return [];

    try {
      const parsed = JSON.parse(lesson.quiz_contents);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Invalid quiz JSON", e);
      return [];
    }
  }, [lesson]);

  const addCourseIfNeeded = async () => {
    if (isCourseAdded) return true;

    try {
      const res = await fetch("http://localhost/puffybrain/addCourse.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson_id: lessonId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        Swal.fire({
          title: "Could not add course",
          text: data.message || "Something went wrong.",
          imageUrl: "/images/error.png",
          imageWidth: 170,
          imageHeight: 170,
          confirmButtonText: "Okay",
        });

        return false;
      }

      await fetchCourses();
      return true;
    } catch (err) {
      console.error("addCourseIfNeeded error:", err);

      Swal.fire({
        title: "Server error",
        text: "Could not add this course.",
        imageUrl: "/images/error.png",
        imageWidth: 170,
        imageHeight: 170,
        confirmButtonText: "Okay",
      });

      return false;
    }
  };

  const handleStudy = () => {
    if (isCourseAdded) {
      navigate(`/introduction/${lessonId}`);
      return;
    }

    Swal.fire({
      customClass: {
        popup: styles.swalPopup,
        title: styles.swalTitle,
        htmlContainer: styles.swalText,
        confirmButton: styles.swalConfirmBtn,
        cancelButton: styles.swalCancelBtn,
        image: styles.swalImage,
        actions: styles.swalActions,
      },
      buttonsStyling: false,
      title: "Add this course?",
      text: "You need to add this course to My Courses before studying.",
      imageUrl: "/images/asking.png",
      imageWidth: 180,
      imageHeight: 180,
      showCancelButton: true,
      confirmButtonText: "Add Course",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const added = await addCourseIfNeeded();

      if (added) {
        navigate(`/introduction/${lessonId}`);
      }
    });
  };

  const handlePractice = () => {
    if (isCourseAdded) {
      setOpenModes(true);
      return;
    }

    Swal.fire({
      customClass: {
        popup: styles.swalPopup,
        title: styles.swalTitle,
        htmlContainer: styles.swalText,
        confirmButton: styles.swalConfirmBtn,
        cancelButton: styles.swalCancelBtn,
        image: styles.swalImage,
        actions: styles.swalActions,
      },
      buttonsStyling: false,
      title: "Add this course?",
      text: "You need to add this course to My Courses before practicing.",
      imageUrl: "/images/asking.png",
      imageWidth: 180,
      imageHeight: 180,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: "Add & Practice",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const added = await addCourseIfNeeded();

      if (added) {
        Swal.fire({
          title: "Course Added!",
          text: "Added to My Courses successfully.",
          imageUrl: "/images/success.png",
          imageWidth: 170,
          imageHeight: 170,
          timer: 1200,
          showConfirmButton: false,
        });

        setOpenModes(true);
      }
    });
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
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  const handleShare = async () => {
    const lessonLink = `${window.location.origin}/learning/${lessonId}`;

    try {
      await navigator.clipboard.writeText(lessonLink);

      Swal.fire({
        icon: "success",
        title: "Link copied!",
        text: "Lesson link copied to clipboard.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to copy link:", error);

      Swal.fire({
        icon: "error",
        title: "Copy failed",
        text: "Unable to copy the link.",
      });
    }
  };

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const savedQuizResults =
    JSON.parse(localStorage.getItem("lessonQuizResults")) || null;

  const correctQuestions =
    savedQuizResults?.lessonId === Number(lessonId)
      ? savedQuizResults.answers.filter((item) => item.isCorrect)
      : [];

  const filteredQuizzes = useMemo(() => {
    const q = search.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const searchableText = [
        quiz.question,
        quiz.answer,
        quiz.correct_answer,
        quiz.explanation,
        ...(Array.isArray(quiz.options) ? quiz.options : []),
      ]
        .join(" ")
        .toLowerCase();

      return !q || searchableText.includes(q);
    });
  }, [quizzes, search]);

  const memorizedCards = useMemo(() => {
    const q = search.trim().toLowerCase();

    return correctQuestions.filter((item) => {
      const searchableText = [
        item.question,
        item.answer,
        item.correctAnswer,
        item.correct_answer,
      ]
        .join(" ")
        .toLowerCase();

      return !q || searchableText.includes(q);
    });
  }, [correctQuestions, search]);

  const notMemorizedCards = useMemo(() => {
    return filteredQuizzes.filter(
      (quiz) => !correctQuestions.some((item) => item.question === quiz.question)
    );
  }, [filteredQuizzes, correctQuestions]);

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading lesson...</div>;
  }

  if (!lesson) {
    return <div style={{ padding: "40px" }}>Lesson not found.</div>;
  }

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
                  <li className={styles.sidebarEmptyText}>
                    Don't have decks yet
                  </li>
                ) : (
                  myDecks.slice(0, 3).map((deck) => (
                    <li
                      key={deck.id || deck.deck_id}
                      className={styles.sidebarListItem}
                    >
                      <Link
                        to={`/deck/${deck.id || deck.deck_id}`}
                        className={styles.menuItem}
                      >
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
                  <li className={styles.sidebarEmptyText}>
                    No courses added yet
                  </li>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <li
                      key={course.id || course.lesson_id}
                      className={styles.sidebarListItem}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openCourse(course.id || course.lesson_id)
                        }
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
            <form
              className={styles.searchBar}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="Search cards"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i className="bx bx-x"></i>
                </button>
              ) : (
                <i className="bx bx-search" />
              )}
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
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationOpen(false);
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
            <div className={styles.cardsContainer}>
              <div className={styles.leftcont}>
                <div className={styles.courses}>
                  <div className={styles.courseHead}></div>

                  <div className={styles.innercourse}>
                    <div className={styles.innerhead}>
                      <div className={styles.titleRow}>
                        <h1 className={styles.lessonTitle}>{lesson.title}</h1>

                        <button
                          type="button"
                          className={styles.shareBtn}
                          onClick={handleShare}
                          title="Copy lesson link"
                        >
                          <i className="bx bx-share-alt"></i>
                        </button>
                      </div>

                      <div className={styles.cardCount}>
                        {quizzes.length} Cards
                      </div>
                    </div>

                    <div className={styles.description}>
                      <h3>Description</h3>
                      <p>{lesson.description}</p>
                    </div>

                    <div className={styles.innerfoot}>
                      <h3>
                        Created by Puffybrain
                        <span
                          className={`${styles.statusDot} ${styles.public}`}
                          title="Public"
                        />
                        <span className={styles.statusText}>Public</span>
                      </h3>
                    </div>
                  </div>
                </div>

                <div className={styles.studyProgress}>
                  <div className={styles.ProgressHead}></div>

                  <div className={styles.innerProgress}>
                    <h1>Study Progress</h1>

                    <div className={styles.progressBarContainer}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${progress.progress_percent}%` }}
                      />
                    </div>

                    <div className={styles.progressPercent}>
                      {Math.round(progress.progress_percent)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.rightcol}>
                <div className={styles.cards}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardButtons}>
                      <button
                        className={`${styles.btn} ${styles.studyBtn}`}
                        onClick={handleStudy}
                      >
                        Study
                      </button>

                      <button
                        className={`${styles.btn} ${styles.practiceBtn}`}
                        onClick={handlePractice}
                      >
                        Practice
                      </button>
                    </div>
                  </div>

                  {openModes && (
                    <QuizModesModal
                      source="lesson"
                      lessonId={lessonId}
                      quizzes={quizzes}
                      onClose={() => setOpenModes(false)}
                    />
                  )}

                  <div className={styles.innercardHead}>
                    <button
                      className={`${styles.tabBtn} ${
                        activeTab === "tab1" ? styles.activeTab : ""
                      }`}
                      onClick={() => setActiveTab("tab1")}
                    >
                      All Cards
                    </button>

                    <button
                      className={`${styles.tabBtn} ${
                        activeTab === "tab2" ? styles.activeTab : ""
                      }`}
                      onClick={() => setActiveTab("tab2")}
                    >
                      Not Memorized
                    </button>

                    <button
                      className={`${styles.tabBtn} ${
                        activeTab === "tab3" ? styles.activeTab : ""
                      }`}
                      onClick={() => setActiveTab("tab3")}
                    >
                      Memorized
                    </button>
                  </div>

                  <div className={styles.cardContent}>
                    {activeTab === "tab1" && (
                      <div className={styles.tabBoxes}>
                        {filteredQuizzes.length === 0 ? (
                          <div className={styles.emptyState}>
                            <img
                              src="/images/cute1.png"
                              alt="No cards"
                              className={styles.emptyImage}
                            />
                            <p>
                              {search.trim()
                                ? `No cards found for “${search}”.`
                                : "No cards available yet."}
                            </p>
                          </div>
                        ) : (
                          filteredQuizzes.map((quiz, index) => (
                            <div key={index} className={styles.box}>
                              <p className={styles.question}>
                                {quiz.question}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === "tab2" && (
                      <div className={styles.tabBoxes}>
                        {filteredQuizzes.length === 0 ? (
                          <div className={styles.emptyState}>
                            <img
                              src="/images/cute1.png"
                              alt="No cards"
                              className={styles.emptyImage}
                            />
                            <p>
                              {search.trim()
                                ? `No not memorized cards found for “${search}”.`
                                : "No cards to memorize yet."}
                            </p>
                          </div>
                        ) : notMemorizedCards.length === 0 ? (
                          <div className={styles.emptyState}>
                            <img
                              src="/images/celeb.png"
                              alt="All memorized"
                              className={styles.emptyImage}
                            />
                            <p>Congratulation! You memorized all cards 🎉</p>
                          </div>
                        ) : (
                          notMemorizedCards.map((quiz, index) => (
                            <div key={index} className={styles.box}>
                              <p className={styles.question}>
                                {quiz.question}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === "tab3" && (
                      <div className={styles.tabBoxes}>
                        {memorizedCards.length === 0 ? (
                          <div className={styles.emptyState}>
                            <img
                              src="/images/cute1.png"
                              alt="No memorized cards"
                              className={styles.emptyImage}
                            />
                            <p>
                              {search.trim()
                                ? `No memorized cards found for “${search}”.`
                                : "No memorized cards yet."}
                            </p>
                          </div>
                        ) : (
                          memorizedCards.map((quiz, index) => (
                            <div key={index} className={styles.box}>
                              <p className={styles.question}>
                                {quiz.question}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default LearningModule;