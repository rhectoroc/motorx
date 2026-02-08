import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const TRACKING_ID = "G-73CRZVGJN9";

// Initialize GA4
ReactGA.initialize(TRACKING_ID);

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Send pageview with valid location
        ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }, [location]);

    return null;
};

export default AnalyticsTracker;
