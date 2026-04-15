import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar/Navbar';
import Footer from '../common/Footer/Footer';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <>
    <meta name="robots" content="noindex, nofollow" />

    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
    </>
  );
};

export default MainLayout;