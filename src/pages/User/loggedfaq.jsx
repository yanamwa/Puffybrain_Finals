import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import styles from "./loggedfaq.module.css";
import { FaChevronDown } from "react-icons/fa";
import { API_BASE } from "../../config.js";

export default function LoggedFaq() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [user, setUser] = useState({
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const notificationCount = notifications.filter(
    (notif) => notif.status === "unread"
  ).length;

  const fetchAddedCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/getMyCourses.php`, {
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
      const res = await fetch(`${API_BASE}/userDecks.php`, {
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
      const res = await fetch(
        `${API_BASE}/getUserNotifications.php`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();
      setNotifications(data.success ? data.notifications || [] : []);
    } catch (err) {
      console.error("Notification fetch error:", err);
      setNotifications([]);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/markNotificationsAsRead.php`,
        {
          method: "POST",
          credentials: "include",
        }
      );

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

  useEffect(() => {
    fetchAddedCourses();
    fetchUserDecks();
    fetchUser();
    fetchNotifications();
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

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
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

  const faqsData = [
  {
    question: "What is PuffyBrain?",
    answer:
      "PuffyBrain is a fun and easy quiz app that lets you test your knowledge on different topics.",
  },
  {
    question: "How do I take a quiz?",
    answer:
      "Go to the Quiz section, choose a category or topic, and tap Start Quiz.",
  },
  {
    question: "What are flashcards or decks?",
    answer:
      "Flashcards help you memorize concepts, terms, or questions. They can be grouped into decks.",
  },
  {
    question: "How do I create my own decks?",
    answer:
      "Go to My Decks, click Create Deck, and start adding flashcards.",
  },
  {
    question: "How can I practice my flashcards?",
    answer:
      "Open your deck and choose a quiz mode like flashcards, multiple choice, or matching type.",
  },
  {
    question: "Can I retake a quiz or review my answers?",
    answer:
      "Yes, you can retake quizzes and review results anytime.",
  },
];

const [faqs, setFaqs] = useState(
  faqsData.map((faq) => ({
    ...faq,
    active: false,
  }))
);

const toggleFAQ = (index) => {
  setFaqs(
    faqs.map((faq, i) =>
      i === index
        ? { ...faq, active: !faq.active }
        : faq
    )
  );
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
          <header className={styles.headerContainer}>
            <form
              className={styles.searchBar}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={styles.searchBtn}
                >
                  <i className="bx bx-x"></i>
                </button>
              ) : (
                <button type="submit" className={styles.searchBtn}>
                  <i className="bx bx-search"></i>
                </button>
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
                  <div className={styles.notificationHeader}>
                    <h4>Notifications</h4>

                    {notificationCount > 0 && (
                      <button
                        type="button"
                        className={styles.markReadBtn}
                        onClick={markNotificationsAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.notification_id}
                        className={styles.notificationItem}
                      >
                        <div className={styles.notificationTop}>
                          <h5>{notif.title}</h5>
                          <span className={styles.notificationRole}>
                            {notif.target_role || notif.recipient_type || "user"}
                          </span>
                        </div>

                        <p>{notif.message}</p>

                        <small className={styles.notificationDate}>
                          {new Date(notif.created_at).toLocaleString()}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyNotification}>
                      <img
                        src="/images/NoNotifcation.png"
                        alt="No notifications"
                        className={styles.emptyNotificationImg}
                      />

                      <p>You don’t have any new notifications</p>
                    </div>
                  )}
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
          </header>

          <main className={styles.main}>
            <div className={styles.panel}>
              <div className={styles.purpleStrip}></div>

              <div className={styles.headerDivider}></div>

              <div className={styles.contentArea}>
                <section className={styles.faqSection}>
                    <h1 className={styles.faqHeading}>FREQUENTLY ASKED QUESTIONS</h1>

                    {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className={`${styles.faqBox} ${
                        faq.active ? styles.active : ""
                        }`}
                        onClick={() => toggleFAQ(index)}
                    >
                        <h2 className={styles.question}>
                        {faq.question}
                        <FaChevronDown className={styles.arrow} />
                        </h2>

                        {faq.active && (
                        <p className={styles.answer}>{faq.answer}</p>
                        )}
                    </div>
                    ))}
                </section>
                </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}