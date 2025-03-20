import { PollingStation } from '../types/pollingStation';

const samplePollingStations: PollingStation[] = [
  {
    id: 'PS001',
    name: 'Central Community Center',
    address: 'Block A, Connaught Place, New Delhi',
    boothNumber: 'NDP-001',
    district: 'New Delhi',
    state: 'Delhi',
    location: {
      latitude: 28.6315,
      longitude: 77.2167
    },
    totalVoters: 3245,
    status: 'operational',
    verificationStats: {
      total: 3245,
      successful: 3102,
      failed: 143
    },
    staff: [
      {
        id: 'STF001',
        name: 'Rajesh Kumar',
        role: 'Station Officer',
        contact: '+91 98765 43210'
      },
      {
        id: 'STF002',
        name: 'Priya Sharma',
        role: 'Verification Officer',
        contact: '+91 87654 32109'
      }
    ],
    lastUpdated: new Date()
  },
  {
    id: 'PS002',
    name: 'North District School',
    address: 'Civil Lines, North Delhi',
    boothNumber: 'NDP-002',
    district: 'North Delhi',
    state: 'Delhi',
    location: {
      latitude: 28.6812,
      longitude: 77.2247
    },
    totalVoters: 2890,
    status: 'operational',
    verificationStats: {
      total: 2890,
      successful: 2712,
      failed: 178
    },
    staff: [
      {
        id: 'STF003',
        name: 'Amit Singh',
        role: 'Station Officer',
        contact: '+91 98765 43211'
      }
    ],
    lastUpdated: new Date()
  },
  {
    id: 'PS003',
    name: 'South Library',
    address: 'Vasant Kunj, South Delhi',
    boothNumber: 'SDP-001',
    district: 'South Delhi',
    state: 'Delhi',
    location: {
      latitude: 28.5298,
      longitude: 77.1593
    },
    totalVoters: 3125,
    status: 'operational',
    verificationStats: {
      total: 3125,
      successful: 2987,
      failed: 138
    },
    staff: [
      {
        id: 'STF004',
        name: 'Neha Gupta',
        role: 'Station Officer',
        contact: '+91 98765 43212'
      }
    ],
    lastUpdated: new Date()
  },
  {
    id: 'PS004',
    name: 'East City Hall',
    address: 'Laxmi Nagar, East Delhi',
    boothNumber: 'EDP-001',
    district: 'East Delhi',
    state: 'Delhi',
    location: {
      latitude: 28.6315,
      longitude: 77.2873
    },
    totalVoters: 3323,
    status: 'operational',
    verificationStats: {
      total: 3323,
      successful: 3044,
      failed: 279
    },
    staff: [
      {
        id: 'STF005',
        name: 'Rahul Verma',
        role: 'Station Officer',
        contact: '+91 98765 43213'
      }
    ],
    lastUpdated: new Date()
  }
];

export default samplePollingStations; 