import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../services/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import styles from "../styles/SignupForm.module.css";

const SignupForm = () => {
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        role,
        university: role === "student" ? university : "",
        organization: role === "donor" ? organization : "",
      });

      alert("Signup Successful! Redirecting...");
      navigate(role === "student" ? "/student-dashboard" : "/donor-dashboard");
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupBox}>
        <h2 className={styles.title}>Join Fund4Edu</h2>
        <form className={styles.form} onSubmit={handleSignup}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Role</label>
            <select
              className={styles.select}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="donor">Donor</option>
            </select>
          </div>

          {role === "student" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>University Name</label>
              <input
                type="text"
                className={styles.input}
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
              />
            </div>
          )}

          {role === "donor" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Organization Name (Optional)
              </label>
              <input
                type="text"
                className={styles.input}
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <p className={styles.loginText}>
            Already a user?{" "}
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
