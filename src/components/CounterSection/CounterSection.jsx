"use client";

import styles from "./CounterSection.module.css";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSmile,
  faDrawPolygon,
  faUsersGear,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";

const counters = [
  { icon: faSmile, count: 25500, label: "Happy Customers", suffix: "+" },
  { icon: faDrawPolygon, count: 45, label: "Area Sold", suffix: " million sq.ft." },
  { icon: faUsersGear, count: 500, label: "Skilled Professionals", suffix: "+" },
  { icon: faPeopleGroup, count: 750, label: "Channel Associates", suffix: "+" },
];

const CounterSection = () => {
  const [counts, setCounts] = useState(counters.map(() => 0));

  useEffect(() => {
    const intervals = counters.map((counter, index) => {
      return setInterval(() => {
        setCounts((prev) => {
          const newCounts = [...prev];
          if (counter.count > newCounts[index]) {
            newCounts[index] += Math.ceil(counter.count / 100);
            if (newCounts[index] > counter.count) newCounts[index] = counter.count;
          }
          return newCounts;
        });
      }, 50);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <section className={styles.counterSection}>
      <div className="container">
        <div className={styles.counterGrid}>
          {counters.map((item, i) => (
            <div className={styles.counterItem} key={i}>
              <FontAwesomeIcon icon={item.icon} className={styles.icon} />
              <h4 className={styles.count}>
                {item.count === 45 ? `${item.count} million sq.ft.` : `${counts[i]}${item.suffix}`}
              </h4>
              <p className={styles.label}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CounterSection;
