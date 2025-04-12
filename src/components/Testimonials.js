import React from "react";
import styles from "../styles/Testimonials.module.css";

const testimonialsData = [
  {
    id: 1,
    feedback:
      "This platform helped me secure funding for my education. The process was smooth and transparent. Highly recommended!",
    name: "Aditi Sharma",
  },
  {
    id: 2,
    feedback:
      "A life-changing experience! I was able to continue my studies without worrying about financial hurdles. Thank you so much!",
    name: "Rahul Verma",
  },
  {
    id: 3,
    feedback:
      "Fund4Edu made it easy for me to receive support from donors. The verification process ensures genuine students get help.",
    name: "Priya Mehta",
  },
  {
    id: 4,
    feedback:
      "An incredible initiative! This platform bridges the gap between students in need and kind-hearted donors.",
    name: "Vikram Malhotra",
  },
  {
    id: 5,
    feedback:
      "Thanks to Fund4Edu, I could pay my tuition fees on time. The community support here is amazing!",
    name: "Sneha Kapoor",
  },
  {
    id: 6,
    feedback:
      "I was skeptical at first, but this platform truly works. The donation system is fair, and I got the help I needed.",
    name: "Aman Gupta",
  },
];

const Testimonials = () => {
  return (
    <div className={styles.testimonials}>
      <h2>What Our Students Say</h2>
      <div className={styles.testimonialGrid}>
        {testimonialsData.map((testimonial) => (
          <div key={testimonial.id} className={styles.testimonialCard}>
            <p className={styles.feedback}>"{testimonial.feedback}"</p>
            <p className={styles.name}>- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
