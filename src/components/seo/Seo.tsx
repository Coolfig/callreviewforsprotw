import { Helmet } from "react-helmet-async";

const SITE_URL = "https://undereview.com";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  /** Absolute https URL for the social preview image. */
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** Per-route head tags: title, description, canonical, og/twitter mirrors, optional JSON-LD. */
const Seo = ({ title, description, path, ogImage, jsonLd }: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default Seo;
