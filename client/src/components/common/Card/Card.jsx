import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, className = '', hover = false, padding = 'md' }) => {
  const cardClasses = [
    styles.card,
    styles[`padding-${padding}`],
    hover && styles.hover,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={cardClasses}>{children}</div>;
};

export default Card;