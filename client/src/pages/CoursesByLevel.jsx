import React from 'react';
import { useLocation } from 'react-router-dom';
import CourseList from '../components/courses/CourseList';
import NotFound from './NotFound';
import { COURSE_SLUGS } from '../utils/seoSlugs';

const CoursesByLevel = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace('/', ''); // e.g. "ug-courses"
  const config = COURSE_SLUGS[slug];
  if (!config) return <NotFound />;
  return <CourseList defaultCategory={config.category} pageTitle={config.title} pageH1={config.h1} />;
};

export default CoursesByLevel;
