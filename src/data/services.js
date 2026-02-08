// Todos los servicios de MotorX expandidos
export const allServices = [
    {
        id: 'subscription',
        title: 'Auction Subscription',
        subtitle: 'Your Own Bidder Account',
        description: 'Do you want control over your bids? Convenient! Cheaper! Get your own bidder account.',
        icon: 'Gavel',
        features: [
            'Wisconsin Bid Card',
            'Michigan Bid Card',
            'Alabama Bid Card',
            'Lowest Auction Fees',
            'Affordable Broker Fees',
            'Unlimited Bids'
        ],
        benefits: [
            'No hidden fees',
            'Cancel anytime',
            '100% transparent'
        ],
        pricing: 'Plans from $299/month',
        link: 'https://wa.link/xd8j23'
    },
    {
        id: 'dispatch',
        title: 'Dispatch',
        subtitle: 'Vehicle Transportation Services',
        description: 'We will transport your vehicles from any Auction or Dealer to the Shipper of your preference, fast, cheap, and safe.',
        icon: 'Truck',
        features: [
            'Nationwide Coverage',
            'Fast & Reliable Service',
            'Competitive Pricing',
            'Safe Transportation',
            '3-days Pick up window',
            'Experienced Dispatchers'
        ],
        benefits: [
            'Trusted Drivers',
            'Common Routes',
            'Avoid Storages'
        ],
        pricing: 'Starting at $0.50/mile',
        link: 'https://wa.link/xd8j23'
    },
    {
        id: 'shipping',
        title: 'International Shipping',
        subtitle: 'Global Vehicle Export',
        description: 'Ship your vehicles anywhere in the world with our trusted international shipping service.',
        icon: 'Ship',
        features: [
            'Secure Container Loading',
            'Export Documentation Support',
            'Safe & Reliable Loading',
            'Worldwide Shipping',
            'Customs Clearance Assistance',
            'Competitive Rates'
        ],
        benefits: [
            'Experienced logistics team',
            'End-to-end tracking',
            'All-In-One Service'
        ],
        pricing: 'Custom quotes available',
        link: 'https://wa.link/xd8j23'
    },
    {
        id: 'titles',
        title: 'Title Services',
        subtitle: 'Document Processing',
        description: 'Fix title and document issues so your vehicles can be exported without delays.',
        icon: 'FileText',
        features: [
            'Bill of Sale Only',
            'Junk Bill of sale',
            'Lien Releases',
            'Duplicate Titles',
            'Open Liens',
            'Lost titles'
        ],
        benefits: [
            'Expert documentation team',
            'Compliance guaranteed',
            'Multiple solutions'
        ],
        pricing: 'Starting at $75',
        link: 'https://wa.link/xd8j23'
    },
    {
        id: 'dismantling',
        title: 'Dismantling Services',
        subtitle: 'Parts & Salvage',
        description: 'Professionally dismantle vehicles and cut units per your request and prepare them for safely and efficiently shipping.',
        icon: 'Wrench',
        features: [
            'Cost-Efficient Solutions',
            'Half-Cut vehicles',
            'Parts Sales',
            'Junk vehicles',
            'Palletized'
        ],
        benefits: [
            'Maximize container space',
            'Competitive pricing',
            'Professional Dismantling'
        ],
        pricing: 'Contact for quote',
        link: 'https://wa.link/xd8j23'
    },
    {
        id: 'consultation',
        title: 'Consultation and Financial Services',
        subtitle: 'Expert Guidance & Financing',
        description: 'Get expert consultation on vehicle purchases and access flexible financing options tailored to your needs.',
        icon: 'BadgeDollarSign',
        features: [
            'Expert Vehicle Consultation',
            'Financing Options',
            'Credit Assistance',
            'Market Insights',
            'Personalized Solutions'
        ],
        benefits: [
            'Professional guidance',
            'Payment Solutions',
            'Avoid Late Fee and Storages'
        ],
        pricing: 'Free consultation',
        link: 'https://wa.link/xd8j23'
    },
    {
        id: 'airFreight',
        title: 'Air Freight',
        subtitle: 'SHIP YOUR PACKAGES',
        description: 'Fast and reliable air freight for urgent vehicle parts and packages, delivered safely to your destination.',
        icon: 'Plane',
        features: [
            'Express Air Shipping',
            'Commercial & Personal Cargo',
            'Worldwide Delivery'
        ],
        benefits: [
            'Fast service',
            'Low prices'
        ],
        pricing: 'Custom quotes available',
        link: 'https://wa.link/xd8j23'
    },
    {
        id: 'roro',
        title: 'RO-RO Shipping',
        subtitle: 'ROLL ON - ROLL OFF',
        description: 'Ship oversized or non-containerized vehicles! Safe and efficient service to transport trucks, heavy equipment, and large units worldwide.',
        icon: 'Tractor',
        features: [
            'For Oversized Vehicle',
            'Heavy Equipment',
            'Heavy Machinery'
        ],
        benefits: [
            'Port-to-Port Service',
            'No container needed'
        ],
        pricing: 'Quotes per Volume',
        link: 'https://wa.link/xd8j23'
    }
];

// Servicios principales para Home (los 2 más importantes)
export const services = allServices.slice(0, 8);

// Resto de los datos se mantienen igual
export const stats = [
    {
        id: 'experience',
        value: '12+',
        label: 'Years of Experience',
        icon: 'Award'
    },
    {
        id: 'auctions',
        value: '1,000+',
        label: 'Auctions Access',
        icon: 'Building2'
    },
    {
        id: 'vehicles',
        value: '100K+',
        label: 'Vehicles Available',
        icon: 'Car'
    },
    {
        id: 'support',
        value: '24/7',
        label: 'Customer Support',
        icon: 'Headphones'
    }
];

export const registrationSteps = [
    {
        id: 'deposit',
        step: 1,
        title: 'Deposit',
        description: 'Make your initial deposit to activate your account',
        icon: 'DollarSign'
    },
    {
        id: 'id',
        step: 2,
        title: 'Valid ID or Passport',
        description: 'Provide a government-issued ID or passport',
        icon: 'IdCard'
    },
    {
        id: 'address',
        step: 3,
        title: 'Proof of Address',
        description: 'Submit a recent utility bill or bank statement',
        icon: 'MapPin'
    },
    {
        id: 'terms',
        step: 4,
        title: 'Sign Terms',
        description: 'Review and sign our terms and conditions',
        icon: 'FileText'
    },
    {
        id: 'bidding',
        step: 5,
        title: 'Start Bidding',
        description: 'Access hundreds of auctions and start bidding!',
        icon: 'Zap'
    }
];

export const auctions = [
    'IAA',
    'Copart',
    'Manheim',
    'ADESA',
    'Impact Auto',
    'ACV',
    'Edge Pipeline',
    'SALVATO'
];
