import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Truck, AlertCircle, Info, Search, Map } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEO from '../components/SEO';
import heroBackground1 from '../assets/hero-background.jpg';
import OptimizedImage from '../components/OptimizedImage';
import {
    DESTINATION_NAMES,
    DESTINATIONS,
    TERMINAL_COORDS,
    ADDRESS_SERVICE_FEE,
    ESTIMATE_PARAMS,
    AUCTION_PRICES,
    DISTANCE_RATES
} from '../data/calculatorData';

gsap.registerPlugin(ScrollTrigger);

export default function Calculator() {
    const { t } = useTranslation();
    const [mode, setMode] = useState('auction'); // 'auction' or 'address'
    
    // Auction State
    const [auctionZip, setAuctionZip] = useState('');
    const [auctionMultiplier, setAuctionMultiplier] = useState(1);
    
    // Address State
    const [addressZip, setAddressZip] = useState('');
    const [terminal, setTerminal] = useState('');
    const [addressMultiplier, setAddressMultiplier] = useState(1);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [addressLookupState, setAddressLookupState] = useState('idle'); // idle, loading, ok, error
    
    // Refs for animations
    const heroRef = useRef(null);
    const titleRef = useRef(null);

    // Debounce zip lookup
    useEffect(() => {
        if (addressZip.length < 5) {
            setAddressLookupState('idle');
            setPickupLocation(null);
            return;
        }
        
        setAddressLookupState('loading');
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`https://api.zippopotam.us/us/${addressZip}`);
                if (!res.ok) throw new Error('ZIP not found');
                const data = await res.json();
                const place = data.places[0];
                setPickupLocation({
                    lat: Number(place.latitude),
                    lng: Number(place.longitude),
                    city: place['place name'],
                    state: place['state abbreviation']
                });
                setAddressLookupState('ok');
            } catch (err) {
                setPickupLocation(null);
                setAddressLookupState('error');
            }
        }, 450);
        return () => clearTimeout(timer);
    }, [addressZip]);

    // Hero GSAP animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-word-left', {
                opacity: 0, x: -100, duration: 0.8, ease: 'power3.out'
            });
            gsap.from('.hero-word-right', {
                opacity: 0, x: 100, duration: 0.8, ease: 'power3.out'
            });
            gsap.from('.hero-subtitle', {
                opacity: 0, y: 20, duration: 0.5, delay: 0.4, ease: 'power2.out'
            });
        }, heroRef);
        return () => ctx.revert();
    }, []);

    // Helper functions
    const money = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
    const numberText = (num) => new Intl.NumberFormat('en-US').format(num);

    const milesBetween = (lat1, lng1, lat2, lng2) => {
        const radius = 3959;
        const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180;
        const dp = (lat2 - lat1) * Math.PI / 180, dl = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
        return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const estimateBase = (miles, term) => {
        for (const band of DISTANCE_RATES) {
            if (miles >= band.min && miles < band.max) {
                return Math.max(ESTIMATE_PARAMS[term].min, Math.round(miles * band.rate / 5) * 5);
            }
        }
        const { min, hr, dk, br } = ESTIMATE_PARAMS[term];
        return Math.max(min, Math.round(((hr / dk) * (1 - Math.exp(-dk * miles)) + br * miles) / 5) * 5);
    };

    // Calculate Auction Results
    const auctionResults = useMemo(() => {
        if (mode !== 'auction') return null;
        if (auctionZip.length < 5) return { status: 'waiting' };
        
        const prices = AUCTION_PRICES[auctionZip];
        if (!prices) return { status: 'no_rate' };

        const routes = DESTINATIONS.filter(d => prices[d]).map(d => ({
            term: d,
            name: DESTINATION_NAMES[d],
            rawRate: prices[d],
            adjustedRate: Math.round(prices[d] * auctionMultiplier / 5) * 5
        })).sort((a, b) => a.adjustedRate - b.adjustedRate);
        
        return { status: 'ok', routes };
    }, [mode, auctionZip, auctionMultiplier]);

    // Calculate Address Results
    const addressResults = useMemo(() => {
        if (mode !== 'address') return null;
        if (addressZip.length < 5 || !terminal) return { status: 'waiting' };
        if (addressLookupState === 'loading') return { status: 'loading' };
        if (addressLookupState === 'error' || !pickupLocation) return { status: 'error' };

        const [lat, lng] = TERMINAL_COORDS[terminal];
        const miles = milesBetween(pickupLocation.lat, pickupLocation.lng, lat, lng);
        const base = estimateBase(miles, terminal);
        const adjustedBase = base * addressMultiplier;
        const total = Math.round((base + ADDRESS_SERVICE_FEE) * addressMultiplier / 5) * 5;
        const adjustedFee = Math.round(ADDRESS_SERVICE_FEE * addressMultiplier / 5) * 5;

        return { status: 'ok', miles, adjustedBase, total, adjustedFee, terminalName: DESTINATION_NAMES[terminal] };
    }, [mode, addressZip, terminal, addressMultiplier, pickupLocation, addressLookupState]);

    const vehicleClasses = [
        { mult: 1, id: 'standard', title: t('calculator.standard'), desc: t('calculator.standardDesc') },
        { mult: 0.8, id: 'powersport', title: t('calculator.powersport'), desc: t('calculator.powersportDesc') },
        { mult: 1.5, id: 'large', title: t('calculator.large'), desc: t('calculator.largeDesc') },
        { mult: 2, id: 'oversized', title: t('calculator.oversized'), desc: t('calculator.oversizedDesc') }
    ];

    return (
        <div className="bg-motorx-gray-900 min-h-screen text-motorx-white">
            <SEO
                title={t('calculator.documentTitle') || 'MotorX — Transportation Rate Center'}
                description={t('calculator.metaDescription')}
            />

            {/* Hero Section */}
            <section ref={heroRef} className="relative pt-32 pb-24 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <OptimizedImage
                        src={heroBackground1}
                        alt="Background"
                        className="w-full h-full object-cover"
                        loading="eager"
                        fetchpriority="high"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-motorx-black via-motorx-black/60 to-motorx-gray-900 pointer-events-none"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
                    <h1 ref={titleRef} className="text-4xl md:text-6xl font-bold mb-4 leading-tight" dir="ltr">
                        <span className="hero-word-left inline-block">{t('hero.title.logistics')}</span>
                        <span className="text-motorx-red hero-word-right inline-block ml-3">{t('hero.title.cloud')}</span>
                    </h1>
                    <p className="hero-subtitle text-xl md:text-2xl text-motorx-gray-300">
                        {t('calculator.heroTitle')}
                    </p>
                </div>
            </section>

            {/* Calculator Workspace */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* LEFT PANEL - CONTROLS */}
                    <aside className="w-full lg:w-1/3 space-y-6">
                        {/* Mode Selector */}
                        <div className="flex bg-motorx-black rounded-lg p-1 shadow-lg border border-motorx-gray-800">
                            <button
                                className={`flex-1 py-3 text-sm font-semibold rounded-md transition-all ${mode === 'auction' ? 'bg-motorx-red text-white shadow-md' : 'text-motorx-gray-400 hover:text-white'}`}
                                onClick={() => setMode('auction')}
                            >
                                {t('calculator.auctionRates')}
                            </button>
                            <button
                                className={`flex-1 py-3 text-sm font-semibold rounded-md transition-all ${mode === 'address' ? 'bg-motorx-red text-white shadow-md' : 'text-motorx-gray-400 hover:text-white'}`}
                                onClick={() => setMode('address')}
                            >
                                {t('calculator.addressEstimate')}
                            </button>
                        </div>

                        {/* Auction Controls */}
                        {mode === 'auction' && (
                            <div className="bg-motorx-black p-6 rounded-xl border border-motorx-gray-800 shadow-xl space-y-6">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-motorx-red font-bold mb-1">{t('calculator.publishedRateSearch')}</div>
                                    <h2 className="text-2xl font-bold text-white">{t('calculator.auctionPickup')}</h2>
                                    <p className="text-motorx-gray-400 text-sm mt-2">{t('calculator.auctionInstructions')}</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-motorx-gray-300">{t('calculator.auctionZip')}</label>
                                    <input 
                                        type="text" 
                                        inputMode="numeric" 
                                        maxLength="5" 
                                        placeholder={t('calculator.auctionZipPlaceholder')}
                                        value={auctionZip}
                                        onChange={(e) => setAuctionZip(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-motorx-gray-900 border border-motorx-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-motorx-red focus:ring-1 focus:ring-motorx-red transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-motorx-gray-300">{t('calculator.vehicleClass')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {vehicleClasses.map(vc => (
                                            <button 
                                                key={vc.id}
                                                onClick={() => setAuctionMultiplier(vc.mult)}
                                                className={`p-3 rounded-lg border text-left transition-all ${auctionMultiplier === vc.mult ? 'border-motorx-red bg-motorx-red/10' : 'border-motorx-gray-700 hover:border-motorx-gray-500 bg-motorx-gray-900'}`}
                                            >
                                                <div className={`font-semibold ${auctionMultiplier === vc.mult ? 'text-motorx-red' : 'text-white'}`}>{vc.title}</div>
                                                <div className="text-xs text-motorx-gray-400 mt-1">{vc.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => { setAuctionZip(''); setAuctionMultiplier(1); }}
                                    className="w-full py-3 text-sm text-motorx-gray-400 hover:text-white hover:bg-motorx-gray-800 rounded-lg transition-colors"
                                >
                                    {t('calculator.clearAuction')}
                                </button>
                            </div>
                        )}

                        {/* Address Controls */}
                        {mode === 'address' && (
                            <div className="bg-motorx-black p-6 rounded-xl border border-motorx-gray-800 shadow-xl space-y-6">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-motorx-red font-bold mb-1">{t('calculator.planningEstimate')}</div>
                                    <h2 className="text-2xl font-bold text-white">{t('calculator.dealerPrivatePickup')}</h2>
                                    <p className="text-motorx-gray-400 text-sm mt-2">{t('calculator.addressInstructions')}</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-motorx-gray-300">{t('calculator.pickupZip')}</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            inputMode="numeric" 
                                            maxLength="5" 
                                            placeholder={t('calculator.addressZipPlaceholder')}
                                            value={addressZip}
                                            onChange={(e) => setAddressZip(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-motorx-gray-900 border border-motorx-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-motorx-red focus:ring-1 focus:ring-motorx-red transition-colors"
                                        />
                                        {addressLookupState === 'loading' && <div className="absolute right-3 top-3 w-5 h-5 border-2 border-motorx-red border-t-transparent rounded-full animate-spin"></div>}
                                        {addressLookupState === 'ok' && <div className="absolute right-3 top-3 text-green-500"><MapPin size={20} /></div>}
                                        {addressLookupState === 'error' && <div className="absolute right-3 top-3 text-red-500"><AlertCircle size={20} /></div>}
                                    </div>
                                    {pickupLocation && <div className="text-xs text-green-400 mt-1">{pickupLocation.city}, {pickupLocation.state}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-motorx-gray-300">{t('calculator.destinationTerminal')}</label>
                                    <select 
                                        value={terminal}
                                        onChange={(e) => setTerminal(e.target.value)}
                                        className="w-full bg-motorx-gray-900 border border-motorx-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-motorx-red focus:ring-1 focus:ring-motorx-red transition-colors appearance-none"
                                    >
                                        <option value="">{t('calculator.selectTerminal')}</option>
                                        {DESTINATIONS.map(d => (
                                            <option key={d} value={d}>{DESTINATION_NAMES[d]}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-motorx-gray-300">{t('calculator.vehicleClass')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {vehicleClasses.map(vc => (
                                            <button 
                                                key={vc.id}
                                                onClick={() => setAddressMultiplier(vc.mult)}
                                                className={`p-3 rounded-lg border text-left transition-all ${addressMultiplier === vc.mult ? 'border-motorx-red bg-motorx-red/10' : 'border-motorx-gray-700 hover:border-motorx-gray-500 bg-motorx-gray-900'}`}
                                            >
                                                <div className={`font-semibold ${addressMultiplier === vc.mult ? 'text-motorx-red' : 'text-white'}`}>{vc.title}</div>
                                                <div className="text-xs text-motorx-gray-400 mt-1">{vc.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => { setAddressZip(''); setTerminal(''); setAddressMultiplier(1); }}
                                    className="w-full py-3 text-sm text-motorx-gray-400 hover:text-white hover:bg-motorx-gray-800 rounded-lg transition-colors"
                                >
                                    {t('calculator.clearAddress')}
                                </button>
                            </div>
                        )}
                    </aside>

                    {/* RIGHT PANEL - RESULTS */}
                    <div className="w-full lg:w-2/3 bg-motorx-black rounded-xl border border-motorx-gray-800 shadow-xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-motorx-gray-800 flex justify-between items-start bg-motorx-gray-900/50">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-motorx-gray-400 font-bold mb-1">
                                    {mode === 'auction' ? t('calculator.auctionRouting') : t('calculator.transportationEstimate')}
                                </div>
                                <h2 className="text-2xl font-bold text-white">{mode === 'auction' ? t('calculator.rateComparison') : t('calculator.planningEstimate')}</h2>
                                <p className="text-motorx-gray-400 text-sm mt-1">
                                    {mode === 'auction' ? t('calculator.auctionResultSubtitle') : t('calculator.addressResultSubtitle')}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${mode === 'auction' ? 'bg-motorx-red text-white' : 'bg-motorx-gray-700 text-motorx-gray-300'}`}>
                                {mode === 'auction' ? t('calculator.exactRate') : t('calculator.estimate')}
                            </div>
                        </div>

                        <div className="flex-grow p-6">
                            {/* AUCTION RESULTS */}
                            {mode === 'auction' && auctionResults?.status === 'waiting' && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-motorx-gray-400">
                                    <Search size={48} className="mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-white mb-2">{t('calculator.startAuctionTitle')}</h3>
                                    <p className="max-w-md">{t('calculator.startAuctionText')}</p>
                                </div>
                            )}
                            
                            {mode === 'auction' && auctionResults?.status === 'no_rate' && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-motorx-gray-400">
                                    <AlertCircle size={48} className="mb-4 text-motorx-red opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">{t('calculator.noRateFound')}</h3>
                                    <p className="max-w-md">{t('calculator.noRateText')}</p>
                                </div>
                            )}

                            {mode === 'auction' && auctionResults?.status === 'ok' && (
                                <div className="space-y-6">
                                    <div className="bg-motorx-gray-900 p-4 rounded-lg flex justify-between items-center border border-motorx-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-motorx-red/20 text-motorx-red flex items-center justify-center"><MapPin size={20} /></div>
                                            <div>
                                                <div className="text-sm text-motorx-gray-400">{t('calculator.auctionZipResult')}</div>
                                                <div className="font-bold text-xl">{auctionZip}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-motorx-gray-400">{t('calculator.routesAvailable', { count: auctionResults.routes.length })}</div>
                                            <div className="text-green-400 font-semibold">{t('calculator.auctionMatched')}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {auctionResults.routes.map((route, i) => (
                                            <div key={route.term} className={`flex items-center justify-between p-4 rounded-xl border ${i === 0 ? 'border-motorx-red bg-motorx-red/5' : 'border-motorx-gray-800 bg-motorx-gray-900'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="font-bold text-xl text-motorx-gray-500 w-8">{i + 1}</div>
                                                    <div>
                                                        <div className="font-bold text-white text-lg">{route.name}</div>
                                                        <div className="text-sm text-motorx-gray-400 flex items-center gap-2">
                                                            <Truck size={14} /> Motor X Terminal
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-2xl text-white">{money(route.adjustedRate)}</div>
                                                    {i === 0 && <div className="text-xs font-bold text-motorx-red uppercase tracking-wide">{t('calculator.lowest')}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-xs text-motorx-gray-500 flex gap-2">
                                        <Info size={14} className="shrink-0" />
                                        <span>{t('calculator.vehicleAdjustment', { vehicle: vehicleClasses.find(v => v.mult === auctionMultiplier)?.title, multiplier: auctionMultiplier })}</span>
                                    </div>
                                </div>
                            )}

                            {/* ADDRESS RESULTS */}
                            {mode === 'address' && addressResults?.status === 'waiting' && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-motorx-gray-400">
                                    <Map size={48} className="mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-white mb-2">{t('calculator.enterPickupTitle')}</h3>
                                    <p className="max-w-md">{t('calculator.enterPickupText')}</p>
                                </div>
                            )}
                            
                            {mode === 'address' && addressResults?.status === 'error' && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-motorx-gray-400">
                                    <AlertCircle size={48} className="mb-4 text-motorx-red opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">{t('calculator.zipLookupFailed')}</h3>
                                </div>
                            )}

                            {mode === 'address' && addressResults?.status === 'ok' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-motorx-red/10 border border-motorx-red rounded-xl p-5">
                                            <div className="text-motorx-red text-sm font-semibold mb-1">{t('calculator.estimatedTransportation')}</div>
                                            <div className="text-4xl font-bold text-white mb-1">{money(addressResults.total)}</div>
                                            <div className="text-xs text-motorx-red/80">{t('calculator.planningFinalVary')}</div>
                                        </div>
                                        <div className="bg-motorx-gray-900 border border-motorx-gray-800 rounded-xl p-5">
                                            <div className="text-motorx-gray-400 text-sm font-semibold mb-1">{t('calculator.approxDistance')}</div>
                                            <div className="text-4xl font-bold text-white mb-1">{t('calculator.miles', { miles: numberText(Math.round(addressResults.miles)) })}</div>
                                            <div className="text-xs text-motorx-gray-500">{t('calculator.straightLineDistance')}</div>
                                        </div>
                                    </div>

                                    <div className="bg-motorx-gray-900 rounded-xl border border-motorx-gray-800 divide-y divide-motorx-gray-800">
                                        <div className="p-4 flex justify-between">
                                            <span className="text-motorx-gray-400">{t('calculator.pickup')}</span>
                                            <span className="font-semibold text-white text-right">{pickupLocation.city}, {pickupLocation.state} {addressZip}</span>
                                        </div>
                                        <div className="p-4 flex justify-between">
                                            <span className="text-motorx-gray-400">{t('calculator.destination')}</span>
                                            <span className="font-semibold text-white text-right">{addressResults.terminalName}</span>
                                        </div>
                                        <div className="p-4 flex justify-between">
                                            <span className="text-motorx-gray-400">{t('calculator.vehicleClass')}</span>
                                            <span className="font-semibold text-white text-right">
                                                {vehicleClasses.find(v => v.mult === addressMultiplier)?.title} × {addressMultiplier}
                                            </span>
                                        </div>
                                        <div className="p-4 flex justify-between">
                                            <span className="text-motorx-gray-400">{t('calculator.calculatedBase')}</span>
                                            <span className="text-white text-right">{money(addressResults.adjustedBase)}</span>
                                        </div>
                                        <div className="p-4 flex justify-between">
                                            <span className="text-motorx-gray-400">{t('calculator.addressServiceAdjustment')}</span>
                                            <span className="text-white text-right">{money(addressResults.adjustedFee)}</span>
                                        </div>
                                        <div className="p-4 flex justify-between items-center bg-motorx-black rounded-b-xl">
                                            <span className="font-bold text-white">{t('calculator.estimatedTotal')}</span>
                                            <span className="font-bold text-2xl text-motorx-red">{money(addressResults.total)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-xs text-motorx-gray-500 flex gap-2">
                                        <Info size={14} className="shrink-0 mt-0.5" />
                                        <span>{t('calculator.addressDisclaimer')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Notices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="bg-motorx-gray-900 p-6 rounded-xl border border-motorx-gray-800">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <AlertCircle size={18} className="text-motorx-gray-400" />
                            {t('calculator.auctionNotesTitle')}
                        </h3>
                        <ul className="text-sm text-motorx-gray-400 space-y-2 list-disc pl-5 marker:text-motorx-gray-600">
                            <li>{t('calculator.auctionNote1')}</li>
                            <li>{t('calculator.auctionNote2')}</li>
                            <li>{t('calculator.auctionNote3')}</li>
                        </ul>
                    </div>
                    <div className="bg-motorx-gray-900 p-6 rounded-xl border border-motorx-gray-800">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <AlertCircle size={18} className="text-motorx-red" />
                            {t('calculator.importantTitle')}
                        </h3>
                        <p className="text-sm text-motorx-gray-400">
                            {t('calculator.importantText')}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
