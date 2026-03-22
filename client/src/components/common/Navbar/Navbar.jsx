import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../store/authStore';
import Button from '../Button/Button';
import styles from './Navbar.module.css';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Only the home page gets the transparent-on-top treatment
  const isHome = location.pathname === '/';
  const isOpaque = !isHome || isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    // Sync on route change too
    setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/colleges', label: 'Colleges' },
    { to: '/courses', label: 'Courses' },
    { to: '/exams', label: 'Exams' },
    { to: '/blogs', label: 'Blog' },
  ];

  return (
    <nav className={`${styles.navbar} ${isOpaque ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          Campus<em>Garh</em>
        </Link>

        {/* Hamburger */}
        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        {/* Nav links */}
        <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.activeLink : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className={styles.authSection}>
            {isAuthenticated ? (
              <>
                <Link
                  to={
                    user?.role === 'admin'           ? '/dashboard/admin'
                    : user?.role === 'counsellor'    ? '/dashboard/counsellor'
                    : user?.role === 'moderator'     ? '/dashboard/moderator'
                    : user?.role === 'institution_rep' ? '/dashboard/institution-rep'
                    : '/dashboard/student'
                  }
                  className={styles.dashboardLink}
                >
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className={styles.navAuthBtn}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginLink}>
                  Login
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
