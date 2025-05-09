import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";
import img from "../assets/fund4edu.png";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { currentUser, logout, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const profileRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <img src={img} alt="Fund4Edu" />
        </Link>
      </div>

      <button
        className={styles.menuToggle}
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        ☰
      </button>

      <nav className={`${styles.nav} ${isNavOpen ? styles.showNav : ""}`}>
        <ul onClick={() => setIsNavOpen(false)}>
          <li>
            <Link to="/" className={styles.navLink}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={styles.navLink}>
              About
            </Link>
          </li>
          <li>
            <Link to="/testimonials" className={styles.navLink}>
              Testimonials
            </Link>
          </li>
          <li>
            <Link to="/faqs" className={styles.navLink}>
              FAQs
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles.authButtons}>
        {currentUser ? (
          <div className={styles.profileMenuWrapper} ref={profileRef}>
            <FaUserCircle
              className={styles.profileIcon}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            />
            {isProfileOpen && (
              <div className={styles.dropdown}>
                <Link
                  to={
                    userData?.role === "student"
                      ? "/student-dashboard"
                      : "/donor-dashboard"
                  }
                  className={styles.dropdownItem}
                >
                  Dashboard
                </Link>

                {userData?.role === "donor" && (
                  <Link to="/donor-history" className={styles.dropdownItem}>
                    History
                  </Link>
                )}

                <button onClick={handleLogout} className={styles.dropdownItem}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button className={styles.loginBtn}>Login</button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
