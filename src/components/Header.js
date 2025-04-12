import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";
import img from "../assets/fund4edu.png";
import { useAuth } from "../context/AuthContext"; // 👈 import context

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth(); // 👈 get current user and logout function
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/"); // 👈 redirect to home after logout
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <img src={img} alt="Fund4Edu" />
        </Link>
      </div>

      <button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <nav className={`${styles.nav} ${isOpen ? styles.showNav : ""}`}>
        <ul onClick={() => setIsOpen(false)}>
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
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/signup">
            <button className={styles.signupBtn}>Sign Up</button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
