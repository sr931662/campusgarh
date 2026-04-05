import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../store/authStore';
import styles from './Navbar.module.css';
import CounsellingModal from '../CounsellingModal/CounsellingModal';
import { FiMenu, FiX, FiSearch, FiColumns, FiUser, FiPhone, FiMail, FiChevronDown, FiBookOpen } from 'react-icons/fi';
// import { FiMenu, FiX, FiSearch, FiGitCompare, FiUser, FiPhone, FiMail, FiChevronDown, FiBookOpen } from 'react-icons/fi';
import logo_on_light from '../../../assets/Campus png transparent-01.png';
import logo_on_dark  from '../../../assets/Campus white color logo png-01.png';

/* ─── Mega-menu data ─── */
const MEGA = {
  colleges: {
    sections: [
      { title: 'By Stream', links: [
        { label: 'Engineering',        to: '/colleges?type=Engineering+%26+Technology'    },
        { label: 'Medical & Health',   to: '/colleges?type=Medical+%26+Health+Sciences'  },
        { label: 'Management',         to: '/colleges?type=Management+%26+Business'       },
        { label: 'Law',                to: '/colleges?type=Law'                           },
        { label: 'Architecture',       to: '/colleges?type=Architecture+%26+Planning'     },
        { label: 'Arts & Science',     to: '/colleges?type=Arts+%26+Science'             },
        { label: 'Commerce & Finance', to: '/colleges?type=Commerce+%26+Finance'          },
        { label: 'Pharmacy',           to: '/colleges?type=Pharmacy'                      },
        { label: 'Agriculture',        to: '/colleges?type=Agriculture'                   },
        { label: 'Design & Fine Arts', to: '/colleges?type=Design+%26+Fine+Arts'         },
      ]},
      { title: 'By City', links: [
        { label: 'Delhi',     to: '/colleges?city=delhi'     },
        { label: 'Mumbai',    to: '/colleges?city=mumbai'    },
        { label: 'Bangalore', to: '/colleges?city=bangalore' },
        { label: 'Pune',      to: '/colleges?city=pune'      },
        { label: 'Chennai',   to: '/colleges?city=chennai'   },
        { label: 'Hyderabad', to: '/colleges?city=hyderabad' },
      ]},
      { title: 'Quick Links', links: [
        { label: 'All Colleges',     to: '/colleges'               },
        { label: 'Compare Colleges', to: '/compare'                },
        { label: 'Top Ranked',       to: '/colleges?sort=ranking'  },
        { label: 'Featured',         to: '/colleges?featured=true' },
      ]},
    ],
  },

  courses: {
    sections: [
      { title: 'By Level', links: [
        { label: 'Undergraduate (UG)',  to: '/courses?category=UG'          },
        { label: 'Postgraduate (PG)',   to: '/courses?category=PG'          },
        { label: 'Diploma',             to: '/courses?category=Diploma'     },
        { label: 'Doctorate / Ph.D',    to: '/courses?category=Doctorate'   },
        { label: 'Certificate',         to: '/courses?category=Certificate' },
      ]},
      { title: 'By Discipline', links: [
        { label: 'Engineering & Technology',  to: '/courses?discipline=Engineering+%26+Technology'  },
        { label: 'Medical & Health Sciences', to: '/courses?discipline=Medical+%26+Health+Sciences' },
        { label: 'Management & Business',     to: '/courses?discipline=Management+%26+Business'     },
        { label: 'Law',                       to: '/courses?discipline=Law'                         },
        { label: 'Commerce & Finance',        to: '/courses?discipline=Commerce+%26+Finance'        },
        { label: 'Design & Fine Arts',        to: '/courses?discipline=Design+%26+Fine+Arts'        },
        { label: 'Agriculture',               to: '/courses?discipline=Agriculture'                 },
      ]},
      { title: 'By Mode', links: [
        { label: 'Full-time', to: '/courses?mode=Full-time' },
        { label: 'Online',    to: '/courses?mode=Online'    },
        { label: 'Distance',  to: '/courses?mode=Distance'  },
        { label: 'Part-time', to: '/courses?mode=Part-time' },
        { label: 'All Courses', to: '/courses'              },
      ]},
    ],
  },

  exams: {
    sections: [
      { title: 'By Level', links: [
        { label: 'UG Entrance Exams',   to: '/exams?category=UG'      },
        { label: 'PG Entrance Exams',   to: '/exams?category=PG'      },
        { label: 'Ph.D Entrance Exams', to: '/exams?category=PhD'     },
        { label: 'Diploma Exams',       to: '/exams?category=Diploma' },
      ]},
      { title: 'By Reach', links: [
        { label: 'National Level',      to: '/exams?examLevel=National'          },
        { label: 'State Level',         to: '/exams?examLevel=State'             },
        { label: 'University Level',    to: '/exams?examLevel=University-Level'  },
      ]},
      { title: 'Popular Exams', links: [
        { label: 'JEE Main',   to: '/exams?search=jee+main'  },
        { label: 'NEET UG',    to: '/exams?search=neet'      },
        { label: 'CAT',        to: '/exams?search=cat'        },
        { label: 'GATE',       to: '/exams?search=gate'       },
        { label: 'CLAT',       to: '/exams?search=clat'       },
        { label: 'CUET',       to: '/exams?search=cuet'       },
        { label: 'All Exams',  to: '/exams'                   },
      ]},
    ],
  },

  tools: {
    sections: [
      { title: 'Explore', links: [
        { label: 'Compare Colleges', to: '/compare'  },
        { label: 'All Colleges',     to: '/colleges' },
        { label: 'All Courses',      to: '/courses'  },
        { label: 'All Exams',        to: '/exams'    },
      ]},
      { title: 'Resources', links: [
        { label: 'Blogs & Articles',   to: '/blogs'   },
        { label: 'Contact Counsellor', to: '/contact' },
      ]},
    ],
  },
};


const BOTTOM_NAV = [
  { key: 'colleges', label: 'Colleges', mega: true },
  { key: 'courses',  label: 'Courses',  mega: true },
  { key: 'exams',    label: 'Exams',    mega: true },
  { key: 'tools',    label: 'Tools',    mega: true },
  { key: 'blog',     label: 'Blog',     mega: false, to: '/blogs'   },
  { key: 'compare',  label: 'Compare',  mega: false, to: '/compare' },
];

const getDashboardPath = (role) => ({
  admin:           '/dashboard/admin',
  counsellor:      '/dashboard/counsellor',
  moderator:       '/dashboard/moderator',
  institution_rep: '/dashboard/institution-rep',
}[role] || '/dashboard/student');




/* ─────────────────────────────── */

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showCounselling, setShowCounselling] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const navRef    = useRef(null);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled,   setIsScrolled]   = useState(false);
  const [activeMenu,   setActiveMenu]   = useState(null);  // key or null
  const [searchQuery,  setSearchQuery]  = useState('');
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isHome   = location.pathname === '/';
  const isOpaque = !isHome || isScrolled;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveMenu(null);
    setMobileExpanded(null);
  }, [location.pathname]);


  const isPathActive = (key) => {
    if (key === 'colleges') return location.pathname.startsWith('/colleges');
    if (key === 'courses')  return location.pathname.startsWith('/courses');
    if (key === 'exams')    return location.pathname.startsWith('/exams');
    if (key === 'blog')     return location.pathname.startsWith('/blogs');
    if (key === 'compare')  return location.pathname === '/compare';
    return false;
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);
  
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setActiveMenu(null); setIsMobileOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav
      ref={navRef}
      className={`${styles.navbar} ${isOpaque ? styles.opaque : styles.transparent}`}
    >
      {/* ── TOP STRIP ── */}
      <div className={styles.topStrip}>
        <div className={styles.topStripInner}>
          <div className={styles.topStripLeft}>
            <a href="tel:18001234567" className={styles.topStripLink}>
              <FiPhone size={11} /> 1800-123-4567
            </a>
            <a href="mailto:support@campusgarh.com" className={styles.topStripLink}>
              <FiMail size={11} /> support@campusgarh.com
            </a>
          </div>
          <div className={styles.topStripRight}>
            <Link to="/blogs" className={styles.topStripLink}>
              <FiBookOpen size={11} /> Articles &amp; News
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN BAR ── */}
      <div className={styles.mainBar}>
        <div className={styles.mainBarInner}>
          <Link to="/" className={styles.logo}>
            <img
              src={isOpaque ? logo_on_light : logo_on_dark}
              alt="CampusGarh"
              className={styles.logoImg}
            />
          </Link>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <FiSearch className={styles.searchIcon} size={16} />
            <input
              type="search"
              placeholder="Search colleges, courses, exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </form>

          <div className={styles.mainActions}>
            <Link to="/compare" className={styles.actionBtn} title="Compare">
              <FiColumns size={18} />
              <span className={styles.actionLabel}>Compare</span>
            </Link>

            {isAuthenticated ? (
              <div
                className={styles.userMenu}
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button className={`${styles.actionBtn} ${styles.userMenuTrigger}`}>
                  <FiUser size={18} />
                  <span className={styles.actionLabel}>{user?.name?.split(' ')[0] || 'Me'}</span>
                  <FiChevronDown size={12} className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <Link to="/profile" className={styles.userDropdownLink} onClick={() => setUserMenuOpen(false)}>
                      Profile
                    </Link>
                    <Link to={getDashboardPath(user?.role)} className={styles.userDropdownLink} onClick={() => setUserMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={() => { handleLogout(); setUserMenuOpen(false); }} className={styles.userDropdownLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className={styles.actionBtn}>
                <FiUser size={18} />
                <span className={styles.actionLabel}>Login</span>
              </Link>
            )}

            <button className={styles.ctaBtn} onClick={() => setShowCounselling(true)}>Free Counselling</button>

            <button
              className={styles.hamburger}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV (desktop only) ── */}
      <div className={styles.bottomNav}>
        <div className={styles.bottomNavInner}>
          {BOTTOM_NAV.map((item) =>
            item.mega ? (
              <div
                key={item.key}
                className={`${styles.bottomNavItem} ${activeMenu === item.key ? styles.bottomNavItemActive : ''}`}
                onMouseEnter={() => setActiveMenu(item.key)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className={`${styles.bottomNavBtn} ${isPathActive(item.key) ? styles.bottomNavLinkActive : ''}`}>
                  {item.label}
                  <FiChevronDown
                    size={13}
                    className={`${styles.chevron} ${activeMenu === item.key ? styles.chevronOpen : ''}`}
                  />
                </button>

                {activeMenu === item.key && (
                  <div className={styles.megaMenu}>
                    <div className={`${styles.megaMenuInner} ${styles[`megaCols${MEGA[item.key].sections.length}`]}`}>
                      {MEGA[item.key].sections.map((sec, i) => (
                        <div key={i} className={styles.megaSection}>
                          <h4 className={styles.megaSectionTitle}>{sec.title}</h4>
                          <ul className={styles.megaLinks}>
                            {sec.links.map((lnk, j) => (
                              <li key={j}>
                                <Link
                                  to={lnk.to}
                                  className={styles.megaLink}
                                  onClick={() => setActiveMenu(null)}
                                >
                                  {lnk.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.bottomNavLink} ${isActive ? styles.bottomNavLinkActive : ''}`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <div className={`${styles.mobileDrawer} ${isMobileOpen ? styles.mobileDrawerOpen : ''}`}>
        <form onSubmit={handleSearch} className={styles.mobileSearch}>
          <FiSearch size={16} color="#94a3b8" />
          <input
            type="search"
            placeholder="Search colleges, courses, exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.mobileSearchInput}
          />
        </form>

        {BOTTOM_NAV.map((item) =>
          item.mega ? (
            <div key={item.key} className={styles.mobileSection}>
              <button
                className={styles.mobileSectionToggle}
                onClick={() => setMobileExpanded(mobileExpanded === item.key ? null : item.key)}
              >
                {item.label}
                <FiChevronDown
                  size={16}
                  className={`${styles.chevron} ${mobileExpanded === item.key ? styles.chevronOpen : ''}`}
                />
              </button>
              {mobileExpanded === item.key && (
                <div className={styles.mobileMegaContent}>
                  {MEGA[item.key].sections.map((sec, i) => (
                    <div key={i}>
                      <p className={styles.mobileSectionLabel}>{sec.title}</p>
                      {sec.links.map((lnk, j) => (
                        <Link
                          key={j}
                          to={lnk.to}
                          className={styles.mobileLink}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {lnk.label}
                        </Link>
                      ))}
                      <Link to="/profile" style={{ fontSize: '0.85rem', color: '#C9A84C', textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}>
                        Edit Profile Settings →
                      </Link>

                    </div>
                    
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.key}
              to={item.to}
              className={`${styles.mobileLink} ${styles.mobileLinkBold}`}
              onClick={() => setIsMobileOpen(false)}
            >
              {item.label}
            </Link>
          )
        )}

        <div className={styles.mobileAuth}>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath(user?.role)}
                className={styles.mobileLink}
                onClick={() => setIsMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { handleLogout(); setIsMobileOpen(false); }}
                className={styles.mobileLogoutBtn}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className={styles.mobileLink}   onClick={() => setIsMobileOpen(false)}>Login</Link>
              <Link to="/register" className={styles.mobileCtaBtn} onClick={() => setIsMobileOpen(false)}>Register</Link>
            </>
          )}
          <Link to="/contact" className={styles.mobileCtaBtn} onClick={() => setIsMobileOpen(false)}>
            Free Counselling
          </Link>
        </div>
      </div>
      {showCounselling && <CounsellingModal onClose={() => setShowCounselling(false)} />}
    </nav>
  );
};

export default Navbar;
