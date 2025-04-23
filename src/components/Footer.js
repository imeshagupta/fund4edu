import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Footer.module.css";
import img from "../assets/fund4edu.png";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>
          <img src={img} alt="Fund4Edu Logo" />
        </Link>
      </div>
      <p className={styles.copyRight}>©Fund4Edu. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
