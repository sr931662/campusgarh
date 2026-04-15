import { Helmet } from 'react-helmet-async';

const DEFAULT_FAVICON = '/favicon.svg';
const DEFAULT_IMAGE = 'https://campusgarh.com/Campus%20png%20transparent-01.png';

const SEOHead = ({ title, description, keywords, canonical, image, favicon, schema, type = 'website' }) => {
  const fullTitle = title ? `${title} | CampusGarh` : "CampusGarh — India's Most Trusted Student Platform";
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://campusgarh.com');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <link rel="icon" href={favicon || DEFAULT_FAVICON} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || DEFAULT_IMAGE} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="CampusGarh" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || DEFAULT_IMAGE} />

      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  );
};

export default SEOHead;
