import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";
import styles from "./edit-profile.module.css";
import Swal from "sweetalert2";

function EditProfile() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [pendingSave, setPendingSave] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  const OTP_DURATION = 300;
  const [otpTimeLeft, setOtpTimeLeft] = useState(OTP_DURATION);

  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notificationCount = notifications.filter(
    (notif) => notif.status === "unread"
  ).length;

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isOtherSchool, setIsOtherSchool] = useState(false);

  const showFeedback = (type, title, text) => {
    Swal.fire({
      imageUrl: type === "success" ? "/images/success.png" : "/images/error.png",
      imageWidth: 170,
      imageHeight: 170,
      title,
      text,
    });
  };

  const [user, setUser] = useState({
    username: "",
    email: "",
    year_level: "",
    school: "",
    signature: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    year_level: "",
    school: "",
    profile_image: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/getUserNotifications.php`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications([]);
      }
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
      console.error("Failed to fetch user decks:", err);
      setMyDecks([]);
    }
  };

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

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/getUser.php`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        const loadedUser = {
          username: data.user?.username || data.username || "",
          email: data.user?.email || data.email || "",
          year_level: data.user?.year_level || data.year_level || "",
          school: data.user?.school || data.school || "",
          signature:
            data.user?.signature ||
            data.signature ||
            data.user?.username ||
            data.username ||
            "",
          profile_image:
            data.user?.profile_image ||
            data.profile_image ||
            "/images/temporary profile.jpg",
        };

        setUser(loadedUser);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  useEffect(() => {
    fetchUserDecks();
    fetchAddedCourses();
    fetchUser();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.deckMenu}, .${styles.deckMenuBtn}, .${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}`
      );

      if (!insideDropdown) {
        setDropdownOpen(false);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsEditModalOpen(false);
        setShowOtpModal(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (!showOtpModal) return;
    if (otpTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setOtpTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showOtpModal, otpTimeLeft]);

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
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const newPassword = passwordForm.newPassword;

  const hasLength = newPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);

  const isPasswordValid =
    hasLength && hasUpper && hasLower && hasNumber && hasSymbol;

  const passwordsMatch =
    passwordForm.newPassword === passwordForm.confirmPassword;

  const getPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return "weak";
    if (strength === 3 || strength === 4) return "medium";
    return "strong";
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showFeedback("error", "Missing Fields", "Please fill in all password fields.");
      return;
    }

    if (!isPasswordValid) {
      showFeedback(
        "error",
        "Invalid Password",
        "Password must meet all security requirements."
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback("error", "Mismatch", "Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/changePassword.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showFeedback("success", "Success", "Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showFeedback(
          "error",
          "Failed",
          data.message || "Failed to change password."
        );
      }
    } catch (err) {
      console.error("Change password error:", err);
      showFeedback("error", "Server Error", "Server error while changing password.");
    }
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      imageUrl: "/images/error.png",
      imageWidth: 170,
      imageHeight: 170,
      title: "Delete Account?",
      text: "This action is irreversible.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        showFeedback("success", "Deleted", "Account deletion logic goes here.");
      }
    });
  };

  const openEditModal = () => {
    setEditForm({
      username: user.username || "",
      email: user.email || "",
      year_level: user.year_level || "",
      school: user.school || "",
      profile_image: user.profile_image || "",
    });

    setSelectedImageFile(null);
    setIsOtherSchool(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "school") {
      if (value === "Others") {
        setIsOtherSchool(true);
        setEditForm((prev) => ({ ...prev, school: "" }));
        return;
      } else {
        setIsOtherSchool(false);
      }
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImageFile(file);

    const previewUrl = URL.createObjectURL(file);

    setEditForm((prev) => ({
      ...prev,
      profile_image: previewUrl,
    }));
  };

  const sendEmailOtp = async (emailToVerify, showSuccessAlert = false) => {
    try {
      const res = await fetch(`${API_BASE}/send-change-email-otp.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToVerify }),
      });

      const text = await res.text();
      console.log("OTP RAW RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        showFeedback("error", "Server Issue", "PHP did not return JSON.");
        return false;
      }

      if (data.success) {
        setOtpEmail(emailToVerify);
        setOtpCode(["", "", "", ""]);
        setOtpTimeLeft(OTP_DURATION);
        setShowOtpModal(true);

        if (showSuccessAlert) {
          showFeedback(
            "success",
            "OTP Sent",
            data.message || "A new verification code was sent to your email."
          );
        }

        return true;
      } else {
        showFeedback("error", "OTP Failed", data.message || "Failed to send OTP.");
        return false;
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      showFeedback("error", "Server Error", "Server error while sending OTP.");
      return false;
    }
  };

  const saveProfileAfterOtp = async () => {
    const formData = new FormData();
    formData.append("username", editForm.username);
    formData.append("email", editForm.email);
    formData.append("school", editForm.school);
    formData.append("year_level", editForm.year_level);

    if (selectedImageFile) {
      formData.append("profile_image", selectedImageFile);
    }

    try {
      const res = await fetch(`${API_BASE}/updateUser.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        await fetchUser();
        setSelectedImageFile(null);
        setIsEditModalOpen(false);
        setShowOtpModal(false);
        setPendingSave(false);
        showFeedback("success", "Success", "Profile updated successfully!");
      } else {
        showFeedback("error", "Failed", data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      showFeedback("error", "Server Error", "Server error while updating profile.");
    }
  };

  const handleVerifyEmailOtp = async () => {
    const otp = otpCode.join("");

    if (otp.length !== 4) {
      showFeedback("error", "Wrong OTP", "Make sure to input a correct code");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/verify-change-email-otp.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: otpEmail,
          otp,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await saveProfileAfterOtp();
      } else {
        showFeedback(
          "error",
          data.title || "Wrong OTP",
          data.message || "Make sure to input a correct code"
        );
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      showFeedback("error", "Server Error", "Server error while verifying OTP.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const emailChanged =
      editForm.email &&
      editForm.email.trim() !== "" &&
      editForm.email.trim() !== user.email;

    if (emailChanged && !pendingSave) {
      await sendEmailOtp(editForm.email.trim(), false);
      return;
    }

    const formData = new FormData();
    formData.append("username", editForm.username);
    formData.append("email", editForm.email);
    formData.append("school", editForm.school);
    formData.append("year_level", editForm.year_level);

    if (selectedImageFile) {
      formData.append("profile_image", selectedImageFile);
    }

    try {
      const res = await fetch(`${API_BASE}/updateUser.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        await fetchUser();
        setSelectedImageFile(null);
        setIsEditModalOpen(false);
        setShowOtpModal(false);
        setPendingSave(false);
        showFeedback("success", "Success", "Profile updated successfully!");
      } else {
        showFeedback("error", "Failed", data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      showFeedback("error", "Server Error", "Server error while updating profile.");
    }
  };

  const handleOtpChange = (value, index) => {
    const cleanValue = value.replace(/[^0-9]/g, "").slice(0, 1);

    const updatedOtp = [...otpCode];
    updatedOtp[index] = cleanValue;
    setOtpCode(updatedOtp);

    if (cleanValue && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const formatOtpTime = () => {
    const minutes = String(Math.floor(otpTimeLeft / 60)).padStart(2, "0");
    const seconds = String(otpTimeLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleResendEmailOtp = async () => {
    if (!otpEmail) {
      showFeedback("error", "Missing Email", "No email found for OTP resend.");
      return;
    }

    setResendingOtp(true);

    try {
      await sendEmailOtp(otpEmail, true);
    } finally {
      setResendingOtp(false);
    }
  };

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
            <form
              className={styles.searchBar}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="Search"
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
                    setDropdownOpen(false);
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
                            {notif.target_role}
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

              <div className={styles.dpContainer}>
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className={styles.profilePic}
                />
              </div>

              <div className={styles.userInfo}>
                <p>{user.username || "User"}</p>
              </div>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((prev) => !prev);
                  }}
                >
                  <i className="bx bx-chevron-down" />
                </button>

                <div
                  className={`${styles.dropdownContent} ${
                    dropdownOpen ? styles.show : ""
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
            <div className={styles.pageHeader}>
              <h1 className={styles.profileTitle}>Profile</h1>
            </div>

            <div className={styles.profilePage}>
              <div className={styles.profileOuter}>
                <div className={styles.profileInner}>
                  <div className={styles.profileCard}>
                    <div className={styles.profileTabs}>
                      <button
                        type="button"
                        className={`${styles.tabBtn} ${
                          activeTab === "personal" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("personal")}
                      >
                        Personal Information
                      </button>

                      <button
                        type="button"
                        className={`${styles.tabBtn} ${
                          activeTab === "settings" ? styles.activeTab : ""
                        }`}
                        onClick={() => setActiveTab("settings")}
                      >
                        Settings
                      </button>
                    </div>

                    {activeTab === "personal" ? (
                      <>
                        <div className={styles.editTop}>
                          <button
                            className={styles.editBtn}
                            type="button"
                            onClick={openEditModal}
                          >
                            Edit
                          </button>
                        </div>

                        <div className={styles.profileContent}>
                          <div className={styles.profileForm}>
                            <div className={styles.formGroup}>
                              <label>Username</label>
                              <input type="text" value={user.username} readOnly />
                            </div>

                            <div className={styles.formGroup}>
                              <label>Email Address</label>
                              <input type="email" value={user.email} readOnly />
                            </div>

                            <div className={styles.formGroup}>
                              <label>Name of School</label>
                              <input type="text" value={user.school} readOnly />
                            </div>

                            <div className={styles.formGroup}>
                              <label>Year Level</label>
                              <input type="text" value={user.year_level} readOnly />
                            </div>
                          </div>

                          <div className={styles.profileImageSection}>
                            <img
                              src={user.profile_image}
                              alt="Profile"
                              className={styles.largeProfilePic}
                            />
                            <p className={styles.imageHint}>
                              Recommend ratio 1:1
                              <br />
                              and file less than 5mb
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.settingsContent}>
                        <div className={styles.settingsCard}>
                          <h2 className={styles.settingsHeading}>
                            Change Password
                          </h2>

                          <div className={styles.settingsDivider}></div>

                          <form
                            className={styles.settingsBody}
                            onSubmit={handleChangePassword}
                          >
                            <div className={styles.passwordGroup}>
                              <label>Current Password</label>
                              <div className={styles.passwordInputWrap}>
                                <input
                                  type={showCurrentPassword ? "text" : "password"}
                                  name="currentPassword"
                                  placeholder="Enter current password"
                                  value={passwordForm.currentPassword}
                                  onChange={handlePasswordChange}
                                />
                                <button
                                  type="button"
                                  className={styles.eyeBtn}
                                  onClick={() =>
                                    setShowCurrentPassword((prev) => !prev)
                                  }
                                >
                                  <i
                                    className={`bx ${
                                      showCurrentPassword
                                        ? "bx-hide"
                                        : "bx-show-alt"
                                    }`}
                                  ></i>
                                </button>
                              </div>
                            </div>

                            <div className={styles.passwordGroup}>
                              <label>New Password</label>
                              <div className={styles.passwordInputWrap}>
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  name="newPassword"
                                  placeholder="Enter new password"
                                  value={passwordForm.newPassword}
                                  onChange={handlePasswordChange}
                                />
                                <button
                                  type="button"
                                  className={styles.eyeBtn}
                                  onClick={() => setShowNewPassword((prev) => !prev)}
                                >
                                  <i
                                    className={`bx ${
                                      showNewPassword ? "bx-hide" : "bx-show-alt"
                                    }`}
                                  ></i>
                                </button>
                              </div>

                              {passwordForm.newPassword.length > 0 && (
                                <div className={styles.passwordBox}>
                                  <div className={styles.passwordChecklist}>
                                    <p className={hasLength ? styles.valid : styles.invalid}>
                                      {hasLength ? "✓" : "✗"} At least 12 characters
                                    </p>

                                    <p className={hasUpper ? styles.valid : styles.invalid}>
                                      {hasUpper ? "✓" : "✗"} Has uppercase letter
                                    </p>

                                    <p className={hasLower ? styles.valid : styles.invalid}>
                                      {hasLower ? "✓" : "✗"} Has lowercase letter
                                    </p>

                                    <p className={hasNumber ? styles.valid : styles.invalid}>
                                      {hasNumber ? "✓" : "✗"} Has number
                                    </p>

                                    <p className={hasSymbol ? styles.valid : styles.invalid}>
                                      {hasSymbol ? "✓" : "✗"} Has special character
                                    </p>
                                  </div>

                                  <div
                                    className={`${styles.validationMessage} ${
                                      passwordStrength === "strong"
                                        ? styles.success
                                        : passwordStrength === "medium"
                                        ? styles.warning
                                        : styles.error
                                    }`}
                                  >
                                    {passwordStrength === "weak" && "Weak password"}
                                    {passwordStrength === "medium" &&
                                      "Medium strength password"}
                                    {passwordStrength === "strong" &&
                                      "✓ Strong password"}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className={styles.passwordGroup}>
                              <label>Confirm New Password</label>
                              <div className={styles.passwordInputWrap}>
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  name="confirmPassword"
                                  placeholder="Confirm new password"
                                  value={passwordForm.confirmPassword}
                                  onChange={handlePasswordChange}
                                />
                                <button
                                  type="button"
                                  className={styles.eyeBtn}
                                  onClick={() =>
                                    setShowConfirmPassword((prev) => !prev)
                                  }
                                >
                                  <i
                                    className={`bx ${
                                      showConfirmPassword
                                        ? "bx-hide"
                                        : "bx-show-alt"
                                    }`}
                                  ></i>
                                </button>
                              </div>

                              {passwordForm.confirmPassword.length > 0 && (
                                <div className={styles.confirmBox}>
                                  <div
                                    className={`${styles.validationMessage} ${
                                      passwordsMatch ? styles.success : styles.error
                                    }`}
                                  >
                                    {passwordsMatch
                                      ? "✓ Passwords match"
                                      : "Passwords do not match"}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              type="submit"
                              className={styles.changePasswordBtn}
                            >
                              Change password
                            </button>
                          </form>
                        </div>

                        <div className={styles.settingsCard}>
                          <h2
                            className={`${styles.settingsHeading} ${styles.deleteHeading}`}
                          >
                            Delete Account
                          </h2>

                          <div className={styles.settingsDivider}></div>

                          <div className={styles.deleteBody}>
                            <p className={styles.deleteText}>
                              Are you sure you want to delete your account? This
                              action is irreversible.
                            </p>

                            <button
                              type="button"
                              className={styles.deleteAccountBtn}
                              onClick={handleDeleteAccount}
                            >
                              Delete Account
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditModalOpen && (
              <div className={styles.modalOverlay} onClick={closeEditModal}>
                <div
                  className={styles.editModal}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.modalCloseBtn}
                    onClick={closeEditModal}
                  >
                    <i className="bx bx-x"></i>
                  </button>

                  <div className={styles.modalTabs}>
                    <button
                      type="button"
                      className={`${styles.modalTabBtn} ${styles.modalTabActive}`}
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className={styles.modalCard}>
                    <h2 className={styles.modalTitle}>About you</h2>
                    <div className={styles.modalDivider}></div>

                    <form
                      className={styles.modalContent}
                      onSubmit={handleSaveProfile}
                    >
                      <div className={styles.modalForm}>
                        <div className={styles.modalFormGroup}>
                          <label>Username</label>
                          <input
                            type="text"
                            name="username"
                            value={editForm.username || ""}
                            onChange={handleEditInputChange}
                            placeholder="Enter your username"
                          />
                        </div>

                        <div className={styles.modalFormGroup}>
                          <label>Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={editForm.email || ""}
                            onChange={handleEditInputChange}
                            placeholder="Enter your email address"
                          />
                        </div>

                        <div className={styles.modalFormGroup}>
                          <label>Name of School</label>

                          {!isOtherSchool ? (
                            <select
                              name="school"
                              value={editForm.school || ""}
                              onChange={handleEditInputChange}
                            >
                              <option value="">Rather not say</option>
                              <option>Cavite State University – Main Campus (Indang)</option>
                              <option>Cavite State University – Imus Campus</option>
                              <option>Cavite State University – Carmona Campus</option>
                              <option>Cavite State University – Bacoor City Campus</option>
                              <option>Cavite State University – Trece Martires City Campus</option>
                              <option>Cavite State University – Tanza Campus</option>
                              <option>Cavite State University – Silang Campus</option>
                              <option>Cavite State University – Naic Campus</option>
                              <option>Cavite State University – Rosario Campus</option>
                              <option>Cavite State University – General Trias City Campus</option>
                              <option>University of the Philippines System</option>
                              <option>Polytechnic University of the Philippines</option>
                              <option>De La Salle University</option>
                              <option>University of Santo Tomas</option>
                              <option value="Others">Others</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              name="school"
                              value={editForm.school || ""}
                              onChange={handleEditInputChange}
                              placeholder="Enter your school"
                              autoFocus
                            />
                          )}

                          {isOtherSchool && (
                            <button
                              type="button"
                              onClick={() => setIsOtherSchool(false)}
                              style={{
                                marginTop: "10px",
                                fontSize: "14px",
                                color: "#6f99e6",
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                textDecoration: "none",
                              }}
                            >
                              ← Back to list
                            </button>
                          )}
                        </div>

                        <div className={styles.modalFormGroup}>
                          <label>Year Level</label>
                          <select
                            name="year_level"
                            value={editForm.year_level || ""}
                            onChange={handleEditInputChange}
                          >
                            <option value="">Select year level</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>

                        <div className={styles.modalActions}>
                          <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={closeEditModal}
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            className={styles.saveChangesBtn}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>

                      <div className={styles.modalPhotoSection}>
                        <label className={styles.uploadPhotoCircle}>
                          {editForm.profile_image ? (
                            <img
                              src={editForm.profile_image}
                              alt="Preview"
                              className={styles.uploadedPreview}
                            />
                          ) : (
                            <>
                              <i className="bx bx-camera"></i>
                              <span>Upload Photo</span>
                            </>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            hidden
                          />
                        </label>

                        <p className={styles.uploadHint}>
                          Recommend ratio 1:1
                          <br />
                          and file less than 5mb
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {showOtpModal && (
              <div
                className={styles.modalOverlay}
                onClick={() => {
                  setShowOtpModal(false);
                  setPendingSave(false);
                }}
              >
                <div
                  className={styles.editModal}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.modalCloseBtn}
                    onClick={() => {
                      setShowOtpModal(false);
                      setPendingSave(false);
                    }}
                  >
                    <i className="bx bx-x"></i>
                  </button>

                  <div className={styles.modalCard}>
                    <h2 className={styles.modalTitle}>Email Verification</h2>
                    <div className={styles.modalDivider}></div>

                    <p className={styles.verifySubtext}>
                      Enter the 4-digit code sent to {otpEmail}
                    </p>

                    <div className={styles.otpWrapper}>
                      {[0, 1, 2, 3].map((_, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          className={styles.otpInput}
                          value={otpCode[index]}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                        />
                      ))}
                    </div>

                    <div className={styles.otpRow}>
                      <span className={styles.otpTimer}>
                        {otpTimeLeft > 0
                          ? `Code expires in ${formatOtpTime()}`
                          : "Code expired"}
                      </span>

                      <button
                        type="button"
                        className={styles.resendBtn}
                        disabled={otpTimeLeft > 0 || resendingOtp}
                        onClick={handleResendEmailOtp}
                      >
                        {resendingOtp ? "Sending..." : "Resend OTP"}
                      </button>
                    </div>

                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => {
                          setShowOtpModal(false);
                          setPendingSave(false);
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className={styles.verifyBtn}
                        onClick={handleVerifyEmailOtp}
                      >
                        Verify Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;