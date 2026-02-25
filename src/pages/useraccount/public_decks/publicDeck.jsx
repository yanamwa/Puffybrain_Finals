import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import "./publicDeck.css";


function PublicDeck() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
  setIsCollapsed(!isCollapsed);
};

const [isDropdownOpen, setIsDropdownOpen] = useState(false);

const toggleDropdown = () => {
  setIsDropdownOpen(!isDropdownOpen);
};

const [sortOpen, setSortOpen] = useState(false);
const [levelOpen, setLevelOpen] = useState(false);

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


  return (
    <div className={`container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* ================= Sidebar ================= */}
      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="bx bx-sidebar"></i>
        </div>

        {/* Logo */}
        <div className="logo">
          <img src="/images/logo1.png" className="logo-expanded" alt="Full Logo" />
          <img src="/images/logo_solo.png" className="logo-collapsed" alt="Icon Logo" />
        </div>

        <div className="divider"></div>

        {/* Main Menu */}
        <p className="my-decks">Menu</p>
        <nav className="menu">
          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <Link to="/homepage" className="menu-item">
                <i className="bx bx-home"></i>
                <span className="menu-text">Home</span>
              </Link>
            </li>
            <li className="sidebar-list-item">
              <Link to="/decks" className="menu-item">
                <i className="bx bx-book"></i>
                <span className="menu-text">Decks</span>
              </Link>
            </li>
            <li className="sidebar-list-item">
              <Link to="/public-decks" className="menu-item active">
                <i className="bx bx-folder"></i>
                <span className="menu-text">Public Decks</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="divider"></div>

        {/* My Decks */}
        <nav className="mydecks">
          <p className="my-decks">My Decks</p>
          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <Link to="/lesson-networking">
                <i className="bx bx-book"></i>
                <span className="menu-text">Lesson 1 to 3 Networking</span>
              </Link>
            </li>
            <li className="sidebar-list-item">
              <Link to="/research-lesson-2">
                <i className="bx bx-book"></i>
                <span className="menu-text">Method of Research Lesson 2</span>
              </Link>
            </li>
            <li className="sidebar-list-item">
              <Link to="/research-lesson-3">
                <i className="bx bx-book"></i>
                <span className="menu-text">Method of Research Lesson 3</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <nav className="logout">
          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <Link to="/login" className="logout-link" onClick={handleLogout}>
                <i className="bx bx-log-out"></i>
                <span className="menu-text">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* ================= Main Area ================= */}
      <div className="main-area">
        {/* Header */}
            <header className="publicdeck-header">

              <form className="search-bar">
                <input type="text" placeholder="Search your deck title" />
                <i className="bx bx-search"></i>
              </form>

              <div className="header-right">

                <button className="notification-btn">
                  <i className="bx bx-bell"></i>
                </button>

                <div className="profile-wrapper">

                  <div className="dp-container">
                    <img 
                      src="/images/temporary profile.jpg" 
                      alt="Profile Picture" 
                      className="profile-pic" 
                    />
                  </div>

                  <div className="user-info">
                    <p style={{ fontSize: "20px", fontWeight: "normal" }}>
                      @meiko
                    </p>
                  </div>

                  <div className="dropdown">
                    <button 
                      type="button" 
                      className="dropdown-btn" 
                      onClick={toggleDropdown}
                    >
                      <i className="bx bx-chevron-down"></i>
                    </button>

                    {isDropdownOpen && (
                      <div className="dropdown-content">

                          <Link to="/profile">
                            <i className="bx bx-user"></i>
                            <span>Profile</span>
                          </Link>


                        <Link to="/settings">
                          <i className="bx bx-cog"></i>
                          <span>Settings</span>
                        </Link>

                        <Link to="/faq">
                          <i className="bx bx-help-circle"></i>
                          <span>FAQs</span>
                        </Link>

                        <button onClick={handleLogout} className="logout-btn">
                          <i className="bx bx-log-out"></i>
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </header>

        {/* Main Content */}
        <main className="main-content">


          <div className="courses">

            <div className="course-head"></div>

            <div className="innercourse">

              <div className="innerhead">
                <h1>All Courses</h1>

                <div className="filter-controls">
                  <button 
                    className="sort-btn"
                    onClick={() => setSortOpen(!sortOpen)}
                  >
                    <i className='bx bx-message'></i>
                    Sort By
                    <i className={`bx bx-chevron-down arrow ${sortOpen ? "rotate" : ""}`}></i>
                  </button>

                  <button 
                    className="level-btn"
                    onClick={() => setLevelOpen(!levelOpen)}
                  >
                    <i className='bx bx-user'></i>
                    Level
                    <i className={`bx bx-chevron-down arrow ${levelOpen ? "rotate" : ""}`}></i>
                  </button>
                </div>
              </div>

                  <div className="lessons">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="lesson-box">
                        
                        <div className="lesson-preview">
                        </div>
                        
                      <div className="lesson-content">
                        <div className="lesson-header">
                          <h3 className="lesson-title">Lesson {index + 1}</h3>
                          <button className="lesson-add">+</button>
                        </div>

                        <p className="lesson-description">
                          This is a short description of Lesson {index + 1}. It can be a few lines to summarize the content.
                        </p>

                        <button className="lesson-btn">Start Learning</button>
                      </div>
                                                  
                      </div>
                    ))}
                  </div>

            </div>
            

         </div>

          <div className="courses">

            <div className="course-head"></div>

            <div className="innercourse">

              <div className="innerhead">
                <h1>Public Decks</h1>

                <div className="filter-controls">
                  <button 
                    className="sort-btn"
                    onClick={() => setSortOpen(!sortOpen)}
                  >
                    <i className='bx bx-message'></i>
                    Category
                    <i className={`bx bx-chevron-down arrow ${sortOpen ? "rotate" : ""}`}></i>
                  </button>

                  <button 
                    className="level-btn"
                    onClick={() => setLevelOpen(!levelOpen)}
                  >
                    <i className='bx bx-user'></i>
                    Level
                    <i className={`bx bx-chevron-down arrow ${levelOpen ? "rotate" : ""}`}></i>
                  </button>
                </div>
              </div>


            </div>

            <div className="decks">
                <div className="deck-grid">
                  {Array.from({ length: 12 }).map((_, index) => {
                    // Generate a random color for the head
                    const colors = ["#EFAAAA", "#C8BBD0", "#FFE0B5", "#E0BBD4", "#EBD3FA","#B6F4BA","#C3C7F3"];
                    const headColor = colors[index % colors.length]; // cycle through colors
                    return (
                      <div className="deck-box" key={index}>
                        <div className="deck-head" style={{ backgroundColor: headColor }}></div> 
                        <div className="deck-content">
                          <h3 className="deck-title">Deck {index + 1}</h3>
                          <p className="deck-count">{Math.floor(Math.random() * 20) + 1} cards</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


         </div>

          

        </main>



      </div>
    </div>
  );
}

export default PublicDeck;
