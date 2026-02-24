import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AnalyticsTracker from './components/AnalyticsTracker';
import ScrollToTop from './components/ScrollToTop';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Lazy load components that are not immediately visible
const Footer = lazy(() => import('./components/Footer'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Security = lazy(() => import('./pages/Security'));

// Loading fallback component
function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-pulse text-motorx-gray-300">Cargando...</div>
        </div>
    );
}

function App() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey="6Lf9wXUsAAAAAPzy0hBlIEsz5sYp16yKjLynYDNf">
            <Router>
                <ScrollToTop />
                <AnalyticsTracker />
                <div className="min-h-screen flex flex-col">
                    <header>
                        <Navbar />
                    </header>
                    <main className="flex-grow">
                        <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/services" element={<Services />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/privacy" element={<Privacy />} />
                                <Route path="/security" element={<Security />} />
                            </Routes>
                        </Suspense>
                    </main>
                    <Suspense fallback={null}>
                        <Footer />
                    </Suspense>
                </div>
            </Router>
        </GoogleReCaptchaProvider>
    );
}

export default App;
