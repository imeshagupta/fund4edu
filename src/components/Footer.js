import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Footer.module.css";
import img from "../assets/fund4edu.png";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyRight}>© 2025 Fund4Edu. All rights reserved.</p>

      <Link to="/" className={styles.logo}>
        <img src={img} alt="Fund4Edu Logo" />
      </Link>

      <ul className={styles.navLinks}>
        <li>
          <Link to="/" className={styles.link}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" className={styles.link}>
            About
          </Link>
        </li>
        <li>
          <Link to="/testimonials" className={styles.link}>
            Testimonials
          </Link>
        </li>
        <li>
          <Link to="/faqs" className={styles.link}>
            FAQs
          </Link>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
