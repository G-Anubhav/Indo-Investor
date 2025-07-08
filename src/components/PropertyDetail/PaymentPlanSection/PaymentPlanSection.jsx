'use client';

import React from 'react';
import styles from './PaymentPlanSection.module.css';
import { motion } from 'framer-motion';
import { FaDownload } from 'react-icons/fa';

const PaymentPlanSection = ({ paymentPlan, planUrl }) => {
  if (!paymentPlan || paymentPlan.length === 0) return null;

  return (
    <section id="payment-plan" className={styles.paymentPlanSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.headingRow}>
            <h2 className={styles.heading}>Payment Plan</h2>

            {planUrl && (
              <a
                href={planUrl}
                className={styles.downloadBtn}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaDownload /> Download PDF
              </a>
            )}
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.planTable}>
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {paymentPlan.map((item, index) => (
                  <tr key={index}>
                    <td>{item.milestone}</td>
                    <td>{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentPlanSection;
