// Todos los servicios de MotorX expandidos
export const allServices = [
    {
        id: 'subscription',
        title: 'Auction Subscription',
        subtitle: 'Your Own Bidder Account',
        description: 'Do you want control over your bids? Convenient! Cheaper! Get your own bidder account.',
        icon: 'Gavel',
        features: [
            'Your Own Bidder Account',
            'Access to 100+ Auctions',
            'Lower Transaction Fees',
            'Full Transparency',
            'Unlimited Bids',
            'Priority Support'
        ],
        benefits: [
            'Complete control',
            'Save on fees',
            'Direct auction access',
            'Dedicated account manager'
        ],
        pricing: 'Plans from $299/month',
        link: '/subscription'
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
            'Real-time Tracking',
            'Insured Shipments'
        ],
        benefits: [
            'Door-to-door service',
            'Flexible scheduling',
            'Professional drivers',
            'Multiple vehicle transport'
        ],
        pricing: 'Starting at $0.50/mile',
        link: '/dispatch'
    },
    {
        id: 'shipping',
        title: 'International Shipping',
        subtitle: 'Global Vehicle Export',
        description: 'Ship your vehicles anywhere in the world with our trusted international shipping partners.',
        icon: 'Ship',
        features: [
            'Worldwide Shipping',
            'Container & RoRo Options',
            'Customs Clearance Assistance',
            'Door-to-Port Service',
            'Competitive Rates',
            'Cargo Insurance'
        ],
        benefits: [
            'Export documentation',
            'Multiple shipping methods',
            'Experienced logistics team',
            'End-to-end tracking'
        ],
        pricing: 'Custom quotes available',
        link: '/services'
    },
    {
        id: 'titles',
        title: 'Title Services',
        subtitle: 'Document Processing',
        description: 'Complete title processing and documentation services for all your vehicle transactions.',
        icon: 'FileText',
        features: [
            'Title Processing',
            'Lien Releases',
            'Duplicate Titles',
            'Out-of-State Transfers',
            'Salvage Title Conversion',
            'Fast Turnaround'
        ],
        benefits: [
            'Expert handling',
            'Compliance guaranteed',
            'Time-saving service',
            'Nationwide coverage'
        ],
        pricing: 'Starting at $75',
        link: '/services'
    },
    {
        id: 'dismantling',
        title: 'Dismantling Services',
        subtitle: 'Parts & Salvage',
        description: 'Professional vehicle dismantling and parts salvage services for maximum value recovery.',
        icon: 'Wrench',
        features: [
            'Professional Dismantling',
            'Parts Inventory',
            'Quality Testing',
            'Eco-Friendly Disposal',
            'Parts Sales',
            'Scrap Metal Recycling'
        ],
        benefits: [
            'Maximize vehicle value',
            'Environmental compliance',
            'Quality parts guarantee',
            'Competitive pricing'
        ],
        pricing: 'Contact for quote',
        link: '/services'
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
            'Investment Analysis',
            'Market Insights',
            'Personalized Solutions'
        ],
        benefits: [
            'Professional guidance',
            'Flexible payment plans',
            'Competitive rates',
            'Fast approval process'
        ],
        pricing: 'Free consultation',
        link: '/services'
    }
];

// Servicios principales para Home (los 2 más importantes)
export const services = allServices.slice(0, 2);

// Resto de los datos se mantienen igual
export const stats = [
    {
        value: '12+',
        label: 'Years of Experience',
        icon: 'Award'
    },
    {
        value: '100+',
        label: 'Auctions Access',
        icon: 'Building2'
    },
    {
        value: '100K+',
        label: 'Vehicles Available',
        icon: 'Car'
    },
    {
        value: '24/7',
        label: 'Customer Support',
        icon: 'Headphones'
    }
];

export const registrationSteps = [
    {
        step: 1,
        title: 'Deposit',
        description: 'Make your initial deposit to activate your account',
        icon: 'DollarSign'
    },
    {
        step: 2,
        title: 'Valid ID or Passport',
        description: 'Provide a government-issued ID or passport',
        icon: 'IdCard'
    },
    {
        step: 3,
        title: 'Proof of Address',
        description: 'Submit a recent utility bill or bank statement',
        icon: 'MapPin'
    },
    {
        step: 4,
        title: 'Sign Terms',
        description: 'Review and sign our terms and conditions',
        icon: 'FileText'
    },
    {
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
