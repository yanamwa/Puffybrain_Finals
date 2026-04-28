import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
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

  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const notificationCount = 0;

  const [user, setUser] = useState({
    username: "",
    year_level: "",
  });

  const [progress, setProgress] = useState({
    total_cards: 0,
    studied_cards: 0,
    progress_percent: 0,
    last_viewed_card: 0,
  });

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
      console.error("fetchUser error:", err);
    }
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setMyDecks(data.decks || []);
      } else {
        setMyDecks([]);
      }
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

      if (data.success) {
        setCourses(data.courses || []);
      } else {
        setCourses([]);
      }
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
        `.${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}`
      );

      if (!insideDropdown) {
        setProfileDropdownOpen(false);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    fetch(`http://localhost/puffybrain/getLessonsById.php?id=${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        setLesson(data);

        let parsedQuizzes = [];
        try {
          parsedQuizzes = JSON.parse(data.quiz_contents || "[]");
        } catch (e) {
          console.error("Invalid quiz JSON", e);
          parsedQuizzes = [];
        }

        fetch(
          `http://localhost/puffybrain/getLessonProgress.php?user_id=1&lesson_id=${lessonId}`
        )
          .then((res) => res.json())
          .then((progressData) => {
            if (progressData.success) {
              setProgress({
                ...progressData.progress,
                total_cards: parsedQuizzes.length,
                studied_cards:
                  Number(progressData.progress.studied_cards) || 0,
                progress_percent:
                  Number(progressData.progress.progress_percent) || 0,
                last_viewed_card:
                  Number(progressData.progress.last_viewed_card) || 0,
              });
            } else {
              setProgress({
                total_cards: parsedQuizzes.length,
                studied_cards: 0,
                progress_percent: 0,
                last_viewed_card: 0,
              });
            }
          })
          .catch((err) => {
            console.error("Error loading progress:", err);
            setProgress({
              total_cards: parsedQuizzes.length,
              studied_cards: 0,
              progress_percent: 0,
              last_viewed_card: 0,
            });
          });
      })
      .catch((err) => console.error("Error loading lesson:", err));
  }, [lessonId]);

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

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  let quizzes = [];

  if (lesson?.quiz_contents) {
    try {
      quizzes = JSON.parse(lesson.quiz_contents);
    } catch (e) {
      console.error("Invalid quiz JSON", e);
      quizzes = [];
    }
  }

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.question?.toLowerCase().includes(search.toLowerCase())
  );

  const memorizedCards = filteredQuizzes.slice(0, progress.studied_cards);
  const notMemorizedCards = filteredQuizzes.slice(progress.studied_cards);

  const handleStudy = async () => {
    const totalCards = quizzes.length;

    const nextStudiedCards =
      progress.studied_cards + 1 > totalCards
        ? totalCards
        : progress.studied_cards + 1;

    const nextLastViewedCard = nextStudiedCards;

    try {
      const res = await fetch(
        "http://localhost/puffybrain/saveLessonProgress.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: 1,
            lesson_id: Number(lessonId),
            total_cards: totalCards,
            studied_cards: nextStudiedCards,
            last_viewed_card: nextLastViewedCard,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        const newPercent =
          totalCards > 0 ? (nextStudiedCards / totalCards) * 100 : 0;

        setProgress({
          total_cards: totalCards,
          studied_cards: nextStudiedCards,
          progress_percent: newPercent,
          last_viewed_card: nextLastViewedCard,
        });

        navigate(`/introduction/${lessonId}`);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  if (!lesson) {
    return <div style={{ padding: "40px" }}>Loading lesson...</div>;
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
                placeholder="Search your cards"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="bx bx-search" />
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
                      <h1>
                        {lesson.title}
                        <i className="bx bx-share-alt" />
                      </h1>

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
                        onClick={() => setOpenModes(true)}
                      >
                        Practice
                      </button>
                    </div>
                  </div>

                  {openModes && (
                    <QuizModesModal
                      lessonId={lessonId}
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
                          <p>No quizzes available.</p>
                        ) : (
                          filteredQuizzes.map((quiz, index) => (
                            <div key={index} className={styles.box}>
                              <p className={styles.question}>{quiz.question}</p>
                              <hr className={styles.separator} />
                              <p className={styles.answer}>{quiz.answer}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === "tab2" && (
                      <div className={styles.tabBoxes}>
                        {notMemorizedCards.length === 0 ? (
                          <p>All cards memorized 🎉</p>
                        ) : (
                          notMemorizedCards.map((quiz, index) => (
                            <div key={index} className={styles.box}>
                              <p className={styles.question}>{quiz.question}</p>
                              <hr className={styles.separator} />
                              <p className={styles.answer}>{quiz.answer}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === "tab3" && (
                      <div className={styles.tabBoxes}>
                        {memorizedCards.length === 0 ? (
                          <p>No memorized cards yet.</p>
                        ) : (
                          memorizedCards.map((quiz, index) => (
                            <div key={index} className={styles.box}>
                              <p className={styles.question}>{quiz.question}</p>
                              <hr className={styles.separator} />
                              <p className={styles.answer}>{quiz.answer}</p>
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