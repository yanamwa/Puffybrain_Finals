import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers,
  LibraryBig,
  Gamepad2,
  Database,
  LogOut,
  Search,
  User,
  Settings,
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./AdminSettings.module.css";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [activitySortOpen, setActivitySortOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [bellNotifications, setBellNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");
  const fetchedOnce = useRef(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [activitySort, setActivitySort] = useState("recent");
  const [activityPage, setActivityPage] = useState(1);
  const actionsPerPage = 5;
  const [admin, setAdmin] = useState({
    full_name: "",
    username: "",
    email: "",
    signature: "",
    role: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    email: "",
    signature: "",
    role: "",
    profile_image: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [adminActivity, setAdminActivity] = useState({
    last_login: "Loading...",
    modules_created: 0,
    recent_actions: [],
  });

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <LibraryBig size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <Gamepad2 size={20} /> },
    { label: "Notification Management", path: "/admin/notifications", icon: <i className="bx bx-bell"></i> },
    { label: "Backup & Restore", path: "/admin/backup-restore", icon: <Database size={20} /> },

  ];

  const showFeedback = (type, title, text) => {
    Swal.fire({
      imageUrl: type === "success" ? "/images/success.png" : "/images/error.png",
      imageWidth: 170,
      imageHeight: 170,
      title,
      text,
    });
  };

  const fetchBellNotifications = async () => {
    try {
      const adminData = JSON.parse(localStorage.getItem("admin") || "{}");

      const res = await fetch(
        `${API_BASE}/getAdminNotifications.php?admin_id=${adminData.id}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.success) {
        setBellNotifications(data.notifications || []);
      } else {
        setBellNotifications([]);
      }
    } catch (err) {
      console.error("Bell notification fetch error:", err);
      setBellNotifications([]);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();

    const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
    const adminId = adminData.id;

    if (!adminId) {
      Swal.fire("Error", "No admin ID found. Please log in again.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/markAdminNotificationsRead.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin_id: adminId }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchBellNotifications();
        setNotificationOpen(true);
      } else {
        Swal.fire("Error", data.message || "Failed to mark as read.", "error");
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
      Swal.fire("Server Error", "Failed to mark as read.", "error");
    }
  };

  const fetchAdmin = async () => {
    try {
      const res = await fetch(`${API_BASE}/getAdminProfile.php`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        console.error(data.message || "Admin not found");
        return;
      }

      setAdmin({
        full_name: data.admin?.full_name || "",
        username: data.admin?.username || "",
        email: data.admin?.email || "",
        signature: data.admin?.signature || "",
        role: data.admin?.role || "Admin",
        profile_image:
          data.admin?.profile_image || "/images/temporary profile.jpg",
      });
    } catch (err) {
      console.error("Fetch admin error:", err);
    }
  };

  const fetchAdminActivity = async () => {
    try {
      const res = await fetch(`${API_BASE}/getAdminActivity.php`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setAdminActivity({
          last_login: data.activity?.last_login || "Not recorded yet",
          modules_created: data.activity?.modules_created || 0,
          recent_actions: data.activity?.recent_actions || [],
        });
      }
    } catch (err) {
      console.error("Fetch admin activity error:", err);
    }
  };

  useEffect(() => {
    if (fetchedOnce.current) return;

    fetchedOnce.current = true;

    fetchAdmin();
    fetchBellNotifications();
    fetchAdminActivity();

    const handler = (e) => {
      const insideDropdown = e.target.closest(`.${styles.notificationWrapper}`);

      if (!insideDropdown) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  }, []);

  const sortedActions = [...adminActivity.recent_actions].sort((a, b) => {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();

  if (activitySort === "recent") {
    return dateB - dateA;
  }

  return dateA - dateB;
});

const totalActivityPages = Math.ceil(sortedActions.length / actionsPerPage);

const paginatedActions = sortedActions.slice(
  (activityPage - 1) * actionsPerPage,
  activityPage * actionsPerPage
);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

const handleLogout = async (e) => {
  e.preventDefault();

  const result = await Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#7b5cff",
  });

  if (!result.isConfirmed) return;

  try {
    await fetch(`${API_BASE}/adminLogout.php`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout API error:", err);
  }

  localStorage.removeItem("admin");
  localStorage.removeItem("admin_id");
  localStorage.removeItem("admin_username");
  localStorage.removeItem("admin_email");
  sessionStorage.clear();

  navigate("/pb-admin-access", { replace: true });
};

  const openEditModal = () => {
    setEditForm({
      full_name: admin.full_name || "",
      username: admin.username || "",
      email: admin.email || "",
      signature: admin.signature || "",
      role: admin.role || "Admin",
      profile_image: admin.profile_image || "",
    });

    setSelectedImageFile(null);
    setImagePreview("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedImageFile(null);
    setImagePreview("");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImageFile(file);
    setImagePreview(previewUrl);
  };

  const sendEmailOtp = async (emailToVerify) => {
    try {
      const res = await fetch(
        `${API_BASE}/send-admin-email-otp.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailToVerify,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setOtpEmail(emailToVerify);
        setOtpCode(["", "", "", ""]);
        setShowOtpModal(true);
      } else {
        showFeedback(
          "error",
          "OTP Failed",
          data.message || "Failed to send OTP."
        );
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      showFeedback("error", "Server Error", "Server error while sending OTP.");
    }
  };

  const saveAdminProfile = async () => {
    const formData = new FormData();

    formData.append("full_name", editForm.full_name);
    formData.append("username", editForm.username);
    formData.append("email", editForm.email);
    formData.append("signature", editForm.signature);
    formData.append("role", editForm.role);

    if (selectedImageFile) {
      formData.append("profile_image", selectedImageFile);
    }

    try {
      const res = await fetch(`${API_BASE}/updateAdmin.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        await fetchAdmin();
        closeEditModal();
        setShowOtpModal(false);

        showFeedback(
          "success",
          "Success",
          "Admin profile updated successfully!"
        );
      } else {
        showFeedback(
          "error",
          "Failed",
          data.message || "Failed to update admin profile."
        );
      }
    } catch (err) {
      console.error("Update admin error:", err);

      showFeedback(
        "error",
        "Server Error",
        "Server error while updating admin profile."
      );
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const emailChanged =
      editForm.email.trim() !== "" && editForm.email.trim() !== admin.email;

    if (emailChanged) {
      await sendEmailOtp(editForm.email.trim());
      return;
    }

    await saveAdminProfile();
  };

  const handleOtpChange = (value, index) => {
    const cleanValue = value.replace(/[^0-9]/g, "");

    const updatedOtp = [...otpCode];
    updatedOtp[index] = cleanValue;

    setOtpCode(updatedOtp);

    if (cleanValue && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerifyEmailOtp = async () => {
    const otp = otpCode.join("");

    if (otp.length !== 4) {
      showFeedback("error", "Invalid OTP", "Please enter the 4-digit OTP.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/verify-admin-email-otp.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: otpEmail,
            otp,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        await saveAdminProfile();
      } else {
        showFeedback("error", "Invalid OTP", data.message || "Invalid OTP.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      showFeedback("error", "Server Error", "Server error while verifying OTP.");
    }
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
      showFeedback(
        "error",
        "Missing Fields",
        "Please fill in all password fields."
      );
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

    if (!passwordsMatch) {
      showFeedback("error", "Mismatch", "Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/changeAdminPassword.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

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

      showFeedback(
        "error",
        "Server Error",
        "Server error while changing password."
      );
    }
  };
  const unreadNotifications = bellNotifications.filter(
    (notif) => notif.status === "unread"
  );

  const notificationCount = unreadNotifications.length;

  const formatActivityDate = (dateValue) => {
    if (!dateValue || dateValue === "Not recorded yet") {
      return "Not recorded yet";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString();
  };

  return (
    <div className={styles.gridContainer}>
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
        <div className={styles.sidebarTop}>
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

          <p className={styles.menuLabel}>Menu</p>

          <nav className={styles.menu}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ""}`
                }
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuText}>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.divider}></div>

          <p className={styles.menuLabel}>Others</p>

          <nav className={styles.menu}>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.menuIcon}>
                <User size={20} />
              </span>
              <span className={styles.menuText}>Profile</span>
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.menuIcon}>
                <Settings size={20} />
              </span>
              <span className={styles.menuText}>Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.divider}></div>

        <button type="button" onClick={handleLogout} className={styles.menuItem}>
  <span className={styles.menuIcon}>
    <LogOut size={20} />
  </span>
  <span className={styles.menuText}>Logout</span>
</button>
        </div>
      </aside>
<header className={styles.headerContainer}>
  <div className={styles.searchBar}>
    <Search size={19} />
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  <div className={styles.headerRight}>
    
    {/* Notification */}
    <div className={styles.notificationWrapper}>
      <button
        type="button"
        className={styles.notificationBtn}
        onClick={(e) => {
          e.stopPropagation();
          setNotificationOpen((prev) => !prev);
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
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {bellNotifications.length > 0 ? (
          bellNotifications.slice(0, 5).map((item) => (
            <div
              key={item.notification_id || item.id}
              className={styles.notificationItem}
            >
              <div className={styles.notificationTop}>
                <h5>{item.title || "No title"}</h5>
                <span className={styles.notificationRole}>
                  {item.recipient_type || "all"}
                </span>
              </div>

              <p className={styles.notificationMessage}>
                {item.message || "No message"}
              </p>

              <p className={styles.notificationCreator}>
                Posted by {item.created_by || "Admin"}
              </p>

              <small className={styles.notificationDate}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : "No date"}
              </small>
            </div>
          ))
        ) : (
          <div className={styles.emptyNotification}>
            <p>You don’t have any new notifications</p>
          </div>
        )}
      </div>
    </div>

    {/* Admin Profile */}
    <div className={styles.adminHeaderProfile}>
      <img
        src={admin.profile_image || "/images/temporary profile.jpg"}
        alt="Admin"
        className={styles.adminHeaderImg}
      />

      <span className={styles.adminHeaderName}>
        {admin.username || "Admin"}
      </span>
    </div>
  </div>
</header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>Admin Profile</h1>
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
                        type="button"
                        className={styles.editBtn}
                        onClick={openEditModal}
                      >
                        Edit
                      </button>
                    </div>

                    <div className={styles.profileContent}>
                      <div className={styles.profileForm}>
                        <div className={styles.formGroup}>
                          <label>Full Name</label>
                          <input type="text" value={admin.full_name} readOnly />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Username</label>
                          <input type="text" value={admin.username} readOnly />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Email Address</label>
                          <input type="email" value={admin.email} readOnly />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Role</label>
                          <input type="text" value={admin.role} readOnly />
                        </div>
                      </div>

                      <div className={styles.profileImageSection}>
                        <img
                          src={
                            admin.profile_image ||
                            "/images/temporary profile.jpg"
                          }
                          alt="Admin"
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
                              onClick={() =>
                                setShowNewPassword((prev) => !prev)
                              }
                            >
                              <i
                                className={`bx ${
                                  showNewPassword
                                    ? "bx-hide"
                                    : "bx-show-alt"
                                }`}
                              ></i>
                            </button>
                          </div>

                          {passwordForm.newPassword.length > 0 && (
                            <div className={styles.passwordBox}>
                              <div className={styles.passwordChecklist}>
                                <p
                                  className={
                                    hasLength ? styles.valid : styles.invalid
                                  }
                                >
                                  {hasLength ? "✓" : "✗"} At least 12 characters
                                </p>

                                <p
                                  className={
                                    hasUpper ? styles.valid : styles.invalid
                                  }
                                >
                                  {hasUpper ? "✓" : "✗"} Has uppercase letter
                                </p>

                                <p
                                  className={
                                    hasLower ? styles.valid : styles.invalid
                                  }
                                >
                                  {hasLower ? "✓" : "✗"} Has lowercase letter
                                </p>

                                <p
                                  className={
                                    hasNumber ? styles.valid : styles.invalid
                                  }
                                >
                                  {hasNumber ? "✓" : "✗"} Has number
                                </p>

                                <p
                                  className={
                                    hasSymbol ? styles.valid : styles.invalid
                                  }
                                >
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
                  Edit Admin Profile
                </button>
              </div>

              <div className={styles.modalCard}>
                <h2 className={styles.modalTitle}>About admin</h2>

                <div className={styles.modalDivider}></div>

                <form
                  className={styles.modalContent}
                  onSubmit={handleSaveProfile}
                >
                  <div className={styles.modalForm}>
                    <div className={styles.modalFormGroup}>
                      <label>Full Name</label>

                      <input
                        type="text"
                        name="full_name"
                        value={editForm.full_name}
                        onChange={handleEditInputChange}
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className={styles.modalFormGroup}>
                      <label>Username</label>

                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleEditInputChange}
                        placeholder="Enter username"
                      />
                    </div>

                    <div className={styles.modalFormGroup}>
                      <label>Email Address</label>

                   <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    readOnly
                    className={styles.disabledInput}
                  />
                    </div>

                    <div className={styles.modalFormGroup}>
                      <label>Role</label>

                      <input
                        type="text"
                        name="role"
                        value={editForm.role}
                        readOnly
                        className={styles.disabledInput}
                      />
                    </div>

                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={closeEditModal}
                      >
                        Cancel
                      </button>

                      <button type="submit" className={styles.saveChangesBtn}>
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className={styles.modalPhotoSection}>
                    <label className={styles.uploadPhotoCircle}>
                      {imagePreview ? (
                        <img
                          src={imagePreview}
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
          <div className={styles.modalOverlay}>
            <div
              className={styles.editModal}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowOtpModal(false)}
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

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowOtpModal(false)}
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

                <button
                  type="button"
                  className={styles.resendBtn}
                  disabled={resendingOtp}
                  onClick={async () => {
                    setResendingOtp(true);
                    await sendEmailOtp(otpEmail);
                    setResendingOtp(false);
                  }}
                >
                  {resendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
