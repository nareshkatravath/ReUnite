import { PersonReport } from '../types';

export const INITIAL_REPORTS: PersonReport[] = [
  {
    id: 'rep-58210',
    trackingCode: 'TRK-58210',
    nameOrAlias: 'Unknown Male',
    approxAge: 45,
    gender: 'Male',
    documentId: '',
    marksAndClothing: 'Deep scar on left cheek, wearing torn black hoodie, dark trousers',
    languagesSpoken: 'Speaks broken Telugu, points to hands for food',
    cityDistrict: 'Hyderabad',
    exactSpot: 'Near platform 1 tea stall, Secunderabad Station',
    latitude: 17.4399,
    longitude: 78.4983,
    gpsAccuracy: 4,
    reporterPhone: '+91 98480 22319',
    reporterName: 'Sunil Rao (Station Vendor)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&auto=format&fit=crop&q=80',
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'UNRESOLVED',
    notes: [
      {
        id: 'n1',
        text: 'Given water and biscuits. Still sitting near the platform 1 waiting hall.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        reporter: 'Sunil Rao'
      }
    ]
  },
  {
    id: 'rep-10943',
    trackingCode: 'TRK-10943',
    nameOrAlias: 'Elderly Woman',
    approxAge: 65,
    gender: 'Female',
    documentId: 'Old ration card photocopy (torn)',
    marksAndClothing: 'Yellow cotton saree with green border, silver toe rings, memory loss',
    languagesSpoken: 'Speaks Telugu fluently, mentions "Nalgonda"',
    cityDistrict: 'Hyderabad',
    exactSpot: 'Near Hanuman Temple entrance, Ameerpet',
    latitude: 17.4375,
    longitude: 78.4482,
    gpsAccuracy: 6,
    reporterPhone: '+91 94401 88921',
    reporterName: 'Kavitha Devi (Temple volunteer)',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=700&auto=format&fit=crop&q=80',
    reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    status: 'UNRESOLVED',
    notes: [
      {
        id: 'n2',
        text: 'Resting on the temple veranda. Temple priest is aware.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        reporter: 'Kavitha Devi'
      }
    ]
  },
  {
    id: 'rep-92811',
    trackingCode: 'TRK-92811',
    nameOrAlias: 'Ramu (Identified by badge)',
    approxAge: 30,
    gender: 'Male',
    documentId: 'Hospital Token #KGH-W3-089',
    marksAndClothing: 'Red holy thread on right wrist, blue hospital patient gown, mild confusion',
    languagesSpoken: 'Telugu & Kannada words',
    cityDistrict: 'Hyderabad',
    exactSpot: 'Kacheguda General Hospital Ward 3 waiting benches',
    latitude: 17.3912,
    longitude: 78.4988,
    gpsAccuracy: 5,
    reporterPhone: '+91 99890 55412',
    reporterName: 'Nurse Radhika',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&auto=format&fit=crop&q=80',
    reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    status: 'UNRESOLVED'
  },
  {
    id: 'rep-31029',
    trackingCode: 'TRK-31029',
    nameOrAlias: 'Unknown Male',
    approxAge: 50,
    gender: 'Male',
    documentId: '9812-XXXX-XXXX (Partial Aadhaar xerox in pocket)',
    marksAndClothing: 'Limping on right leg, faded brown checked shirt, wooden walking cane',
    languagesSpoken: 'Hindi, Telugu keywords',
    cityDistrict: 'Hyderabad',
    exactSpot: 'Begumpet Bus Stop, near petrol pump',
    latitude: 17.4443,
    longitude: 78.4658,
    gpsAccuracy: 8,
    reporterPhone: '+91 97003 44102',
    reporterName: 'Mohammed Arif',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=700&auto=format&fit=crop&q=80',
    reportedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    status: 'UNRESOLVED'
  },
  {
    id: 'rep-74192',
    trackingCode: 'TRK-74192',
    nameOrAlias: 'Chintu (Responds to name)',
    approxAge: 8,
    gender: 'Male',
    documentId: 'School ID without address',
    marksAndClothing: 'Blue superhero t-shirt, grey shorts, small birthmark near right ear',
    languagesSpoken: 'Hindi and Urdu, crying for mother',
    cityDistrict: 'Hyderabad',
    exactSpot: 'West Gate police post, Charminar historical monument',
    latitude: 17.3616,
    longitude: 78.4747,
    gpsAccuracy: 3,
    reporterPhone: '+91 91212 33499',
    reporterName: 'Traffic Constable P. Naidu',
    photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=700&auto=format&fit=crop&q=80',
    reportedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    status: 'REUNITED',
    notes: [
      {
        id: 'n3',
        text: 'Successfully reunited with parents via Charminar local station.',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        reporter: 'P. Naidu'
      }
    ]
  }
];
