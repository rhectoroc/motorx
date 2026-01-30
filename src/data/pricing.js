// Planes de suscripción
export const pricingPlans = [
    {
        id: 'basic',
        name: 'Basic',
        price: 299,
        period: 'month',
        description: 'Perfect for getting started',
        features: [
            'Access to 50+ auctions',
            'Up to 10 bids per month',
            'Email support',
            'Basic reporting',
            '5% transaction fee'
        ],
        highlighted: false,
        cta: 'Get Started'
    },
    {
        id: 'pro',
        name: 'Professional',
        price: 599,
        period: 'month',
        description: 'Most popular for growing businesses',
        features: [
            'Access to 100+ auctions',
            'Unlimited bids',
            'Priority phone & email support',
            'Advanced reporting & analytics',
            '3% transaction fee',
            'Dedicated account manager',
            'API access'
        ],
        highlighted: true,
        cta: 'Start Free Trial'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        period: null,
        description: 'For large-scale operations',
        features: [
            'Access to all auctions',
            'Unlimited bids',
            '24/7 priority support',
            'Custom reporting',
            'Negotiable transaction fees',
            'Multiple user accounts',
            'API access',
            'Custom integrations',
            'White-label options'
        ],
        highlighted: false,
        cta: 'Contact Sales'
    }
];

// Comparación de características
export const featureComparison = [
    {
        feature: 'Auction Access',
        basic: '50+',
        pro: '100+',
        enterprise: 'All'
    },
    {
        feature: 'Monthly Bids',
        basic: '10',
        pro: 'Unlimited',
        enterprise: 'Unlimited'
    },
    {
        feature: 'Transaction Fee',
        basic: '5%',
        pro: '3%',
        enterprise: 'Custom'
    },
    {
        feature: 'Support',
        basic: 'Email',
        pro: 'Phone & Email',
        enterprise: '24/7 Priority'
    },
    {
        feature: 'Account Manager',
        basic: false,
        pro: true,
        enterprise: true
    },
    {
        feature: 'API Access',
        basic: false,
        pro: true,
        enterprise: true
    }
];
