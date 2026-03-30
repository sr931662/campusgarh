import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {title ? (
          <div className={styles.header}>
            <h3 className={styles.headerTitle}>{title}</h3>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
          </div>
        ) : (
          <button className={styles.closeBtnFloat} onClick={onClose} aria-label="Close">×</button>
        )}
        <div className={title ? styles.content : styles.contentFlush}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
