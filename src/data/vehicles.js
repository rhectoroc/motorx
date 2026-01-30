// Vehículos de ejemplo para Single Bid
export const vehicles = [
    {
        id: 1,
        year: 2023,
        make: 'Toyota',
        model: 'Camry',
        trim: 'SE',
        vin: '4T1B11HK5PU123456',
        auction: 'Copart',
        location: 'Dallas, TX',
        odometer: 15420,
        damage: 'Front End',
        estimatedValue: 18500,
        buyNowPrice: 16200,
        image: null,
        status: 'available'
    },
    {
        id: 2,
        year: 2022,
        make: 'Honda',
        model: 'Accord',
        trim: 'EX-L',
        vin: '1HGCV1F42NA123456',
        auction: 'IAA',
        location: 'Houston, TX',
        odometer: 22100,
        damage: 'Rear',
        estimatedValue: 22000,
        buyNowPrice: 19500,
        image: null,
        status: 'available'
    },
    {
        id: 3,
        year: 2023,
        make: 'Ford',
        model: 'F-150',
        trim: 'XLT',
        vin: '1FTFW1E50PFA12345',
        auction: 'Manheim',
        location: 'Atlanta, GA',
        odometer: 8500,
        damage: 'Minor Hail',
        estimatedValue: 35000,
        buyNowPrice: 31000,
        image: null,
        status: 'available'
    },
    {
        id: 4,
        year: 2021,
        make: 'Chevrolet',
        model: 'Silverado 1500',
        trim: 'LT',
        vin: '1GCUYEED3MZ123456',
        auction: 'ADESA',
        location: 'Phoenix, AZ',
        odometer: 35200,
        damage: 'Side',
        estimatedValue: 28000,
        buyNowPrice: 24500,
        image: null,
        status: 'sold'
    },
    {
        id: 5,
        year: 2023,
        make: 'Tesla',
        model: 'Model 3',
        trim: 'Long Range',
        vin: '5YJ3E1EA8PF123456',
        auction: 'Impact Auto',
        location: 'Los Angeles, CA',
        odometer: 5200,
        damage: 'Minor Scratch',
        estimatedValue: 42000,
        buyNowPrice: 38500,
        image: null,
        status: 'available'
    },
    {
        id: 6,
        year: 2022,
        make: 'BMW',
        model: '3 Series',
        trim: '330i',
        vin: 'WBA5R1C06NBP12345',
        auction: 'Copart',
        location: 'Miami, FL',
        odometer: 18900,
        damage: 'Front End',
        estimatedValue: 32000,
        buyNowPrice: 28000,
        image: null,
        status: 'available'
    }
];

// Filtros para búsqueda
export const vehicleFilters = {
    makes: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Tesla', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai'],
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
    auctions: ['Copart', 'IAA', 'Manheim', 'ADESA', 'Impact Auto', 'ACV', 'SALVATO'],
    damageTypes: ['Front End', 'Rear', 'Side', 'Minor Hail', 'Minor Scratch', 'Water', 'Fire', 'Mechanical'],
    priceRanges: [
        { label: 'Under $10,000', min: 0, max: 10000 },
        { label: '$10,000 - $20,000', min: 10000, max: 20000 },
        { label: '$20,000 - $30,000', min: 20000, max: 30000 },
        { label: '$30,000 - $50,000', min: 30000, max: 50000 },
        { label: 'Over $50,000', min: 50000, max: 999999 }
    ]
};
