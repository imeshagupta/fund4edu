import React, { useState } from "react";
import styles from "../styles/Faqs.module.css";

const faqsData = [
  {
    question: "What is this platform about?",
    answer:
      "This platform helps students who need financial assistance by connecting them with donors willing to support their education.",
  },
  {
    question: "How can I apply for funding?",
    answer:
      "You can apply for funding by filling out the application form and submitting the required documents for verification.",
  },
  {
    question: "Is the donation process secure?",
    answer:
      "Yes, we ensure secure transactions and verify all students before approving their funding requests.",
  },
  {
    question: "Can I donate anonymously?",
    answer:
      "Yes, donors have the option to donate anonymously or publicly as per their preference.",
  },
  {
    question: "How long does verification take?",
    answer:
      "Verification usually takes 3-5 business days, depending on the completeness of the submitted documents.",
  },
];

const Faqs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      <div className={styles.faq}>
        <h2 className={styles.heading}>Frequently Asked Questions</h2>
        <div className={styles.accordion}>
          {faqsData.map((faq, index) => (
            <div key={index} className={styles.accordionItem}>
              <div
                className={styles.accordionHeader}
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <span className={styles.icon}>
                  {openIndex === index ? "▲" : "▼"}
                </span>
              </div>
              {openIndex === index && (
                <div className={styles.accordionBody}>{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faqs;
