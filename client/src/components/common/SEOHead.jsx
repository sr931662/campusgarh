import { Helmet } from 'react-helmet-async';
const SEOHead = ({ title, description, canonical, image, schema }) => (
  <Helmet>
    <title>{title} | CampusGarh</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical || window.location.href} />
    <meta property="og:title" content={`${title} | CampusGarh`} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image || 'https://campusgarh.com/og-default.jpg'} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
  </Helmet>
);
export default SEOHead;
