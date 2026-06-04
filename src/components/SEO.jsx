import { Helmet } from "react-helmet-async";

function SEO({ title, description, image, url }) {
  const siteName = "Syndra - Digital Marketplace";
  const fullTitle = title ? `${title} | Syndra` : siteName;
  const fullDescription = description || "Digital marketplace for creators, promoters, and buyers. Sell worksheets, ebooks, digital art and earn commissions.";
  const fullImage = image || "https://syndrahub.com/og-image.png";
  const fullUrl = url || "https://syndrahub.com";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}

export default SEO;