import React, { useState } from "react";
import styles from "./faq.module.css";
import { FaChevronDown } from "react-icons/fa";
import LandingNavbar from "../../components/LandingNavbar";
import LandingFooter from "../../components/LandingFooter";

const FAQ = () => {
 const faqsData = [
  {
    question: "What is PuffyBrain?",
    answer:
      "PuffyBrain is a fun and easy quiz app that lets you test your knowledge on different topics.",
  },
  {
    question: "How do I take a quiz?",
    answer:
      "Go to the Quiz section, choose a category or topic, and tap Start Quiz. Answer each question and submit when finished.",
  },
  {
    question: "What are flashcards or decks?",
    answer:
      "Flashcards are small study cards that help you memorize concepts, terms, or questions. You can group them into decks based on a subject or topic.",
  },
  {
    question: "How do I create my own decks?",
    answer:
      "Go to the My Decks section, tap Create Deck, and give it a name. Then, start adding flashcards with a question or term on one side and an answer or definition on the other.",
  },
  {
    question: "How can I practice my flashcards?",
    answer:
      "After creating a deck, press the Practice button to start reviewing your flashcards. You can also choose any quiz type you prefer to practice your cards.",
  },
  {
    question: "Can I retake a quiz or review my answers?",
    answer:
      "Yes, you can retake quizzes to improve your score or view your past results in the Results section.",
  },
];

  const [faqs, setFaqs] = useState(
    faqsData.map((faq) => ({ ...faq, active: false }))
  );

  const toggleFAQ = (index) => {
    setFaqs(
      faqs.map((faq, i) =>
        i === index ? { ...faq, active: !faq.active } : faq
      )
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <div className={styles.headerOverlay}>
          <LandingNavbar />
        </div>
      </header>

      <section className={styles.faqSection}>
        <h1 className={styles.faqHeading}>
          FREQUENTLY ASKED QUESTIONS
        </h1>

        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`${styles.faqBox} ${
              faq.active ? styles.active : ""
            }`}
            onClick={() => toggleFAQ(index)}
          >
            <h2 className={styles.question}>
              {faq.question} <FaChevronDown />
            </h2>

            {faq.active && (
              <p className={styles.answer}>
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </section>

      <LandingFooter />
    </div>
  );
};

export default FAQ;