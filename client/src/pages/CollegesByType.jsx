import React from 'react';
import { useParams } from 'react-router-dom';
import CollegeList from '../components/colleges/CollegeList';
import NotFound from './NotFound';
import { COLLEGE_SLUGS } from '../utils/seoSlugs';

const CollegesByType = () => {
  const { slug } = useParams();
  const config = COLLEGE_SLUGS[slug];
  if (!config) return <NotFound />;
  return <CollegeList defaultType={config.type} pageTitle={config.title} pageH1={config.h1} />;
};

export default CollegesByType;
