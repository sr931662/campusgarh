import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ size = 'md', fullScreen = false }) => {
  const loaderClass = [styles.loader, styles[size]].join(' ');

  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        <div className={loaderClass}></div>
      </div>
    );
  }

  return <div className={loaderClass}></div>;
};

export default Loader;