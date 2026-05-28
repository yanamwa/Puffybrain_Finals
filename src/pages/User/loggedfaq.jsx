import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import styles from "./loggedfaq.module.css";
import { FaChevronDown } from "react-icons/fa";
import { API_BASE } from "../../config.js";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";

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

export default function LoggedFaq() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [faqs, setFaqs] = useState(
    faqsData.map((faq) => ({
      ...faq,
      active: false,
    }))
  );

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

  useEffect(() => {
    fetchAddedCourses();
    fetchUserDecks();
    fetchUser();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.dropdownBtn},
         .${styles.dropdownContent},
         .${styles.notificationWrapper},
         .${styles.searchBar}`
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

  const toggleFAQ = (index) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq, i) =>
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
      <UserSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        courses={courses}
        myDecks={myDecks}
        openCourse={openCourse}
      />

      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
          <UserHeader
            search={search}
            setSearch={setSearch}
            user={user}
            notifications={notifications}
            notificationCount={notificationCount}
            notificationOpen={notificationOpen}
            setNotificationOpen={setNotificationOpen}
            profileDropdownOpen={profileDropdownOpen}
            setProfileDropdownOpen={setProfileDropdownOpen}
            markNotificationsAsRead={markNotificationsAsRead}
            handleLogout={handleLogout}
          />

          <main className={styles.main}>
            <div className={styles.panel}>
              <div className={styles.purpleStrip}></div>
              <div className={styles.headerDivider}></div>

              <div className={styles.contentArea}>
                <section className={styles.faqSection}>
                  <h1 className={styles.faqHeading}>
                    FREQUENTLY ASKED QUESTIONS
                  </h1>

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
                        <p className={styles.answer}>
                          {faq.answer}
                        </p>
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