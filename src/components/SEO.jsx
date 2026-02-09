import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ title, description, keywords, image, url }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    // Fallback values
    const siteTitle = "MotorX";
    const defaultDescription = "International vehicle shipping, auction access, and logistics solutions.";
    const defaultImage = "https://www.motorxcars.com/logo.png"; // Absolute URL for OG tags
    const siteUrl = "https://www.motorxcars.com";

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDescription = description || defaultDescription;
    const metaImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;
    const metaUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url}`) : siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <link rel="canonical" href={metaUrl} />
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={keywords || "car shipping, auto transport, vehicle logistics, auction access, copart, iaai"} />
            <html lang={currentLang} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={metaUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
