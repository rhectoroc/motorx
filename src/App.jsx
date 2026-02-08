import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Dispatch from './pages/Dispatch';
import SingleBid from './pages/SingleBid';
import Subscription from './pages/Subscription';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AnalyticsTracker from './components/AnalyticsTracker';

function App() {
    return (
        <Router>
            <AnalyticsTracker />
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/dispatch" element={<Dispatch />} />
                        <Route path="/single-bid" element={<SingleBid />} />
                        <Route path="/subscription" element={<Subscription />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
