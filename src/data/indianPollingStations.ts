export interface PollingStation {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  boothNumber: string;
  status: 'operational' | 'issue' | 'closed';
  totalVerifications?: number;
  successfulVerifications?: number;
  failedVerifications?: number;
  verificationRate?: number;
  staff?: {
    id: string;
    name: string;
    role: string;
    status: string;
  }[];
}

// Indian Election Polling Stations
const indianPollingStations: Record<string, PollingStation> = {
  'ps1': {
    id: 'ps1',
    name: 'Vigyan Bhawan',
    address: 'Maulana Azad Road, New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    boothNumber: 'DL001',
    totalVerifications: 3245,
    successfulVerifications: 3102,
    failedVerifications: 143,
    verificationRate: 95.6,
    status: 'operational',
    staff: [
      { id: 'staff1', name: 'Amit Sharma', role: 'Station Manager', status: 'active' },
      { id: 'staff2', name: 'Priya Patel', role: 'Verification Officer', status: 'active' },
      { id: 'staff3', name: 'Rajesh Kumar', role: 'Verification Officer', status: 'break' }
    ]
  },
  'ps2': {
    id: 'ps2',
    name: 'Government Boys Senior Secondary School',
    address: 'Raj Niwas Marg, Civil Lines, Delhi',
    district: 'North Delhi',
    state: 'Delhi',
    boothNumber: 'DL021',
    totalVerifications: 2890,
    successfulVerifications: 2712,
    failedVerifications: 178,
    verificationRate: 93.8,
    status: 'operational',
    staff: [
      { id: 'staff4', name: 'Sanjay Verma', role: 'Station Manager', status: 'active' },
      { id: 'staff5', name: 'Meera Singh', role: 'Verification Officer', status: 'active' },
      { id: 'staff6', name: 'Vikram Reddy', role: 'Verification Officer', status: 'active' }
    ]
  },
  'ps3': {
    id: 'ps3',
    name: 'Kendriya Vidyalaya',
    address: 'Andrews Ganj, New Delhi',
    district: 'South Delhi',
    state: 'Delhi',
    boothNumber: 'DL045',
    totalVerifications: 3125,
    successfulVerifications: 2987,
    failedVerifications: 138,
    verificationRate: 95.6,
    status: 'operational',
    staff: [
      { id: 'staff7', name: 'Neha Gupta', role: 'Station Manager', status: 'active' },
      { id: 'staff8', name: 'Arjun Nair', role: 'Verification Officer', status: 'active' },
      { id: 'staff9', name: 'Sunita Rao', role: 'Verification Officer', status: 'active' }
    ]
  },
  'ps4': {
    id: 'ps4',
    name: 'Municipal Corporation School',
    address: 'Dwarka Sector 12, New Delhi',
    district: 'West Delhi',
    state: 'Delhi',
    boothNumber: 'DL078',
    totalVerifications: 3323,
    successfulVerifications: 3044,
    failedVerifications: 279,
    verificationRate: 91.6,
    status: 'issue',
    staff: [
      { id: 'staff10', name: 'Rahul Mehta', role: 'Station Manager', status: 'active' },
      { id: 'staff11', name: 'Kavita Joshi', role: 'Verification Officer', status: 'active' },
      { id: 'staff12', name: 'Deepak Sharma', role: 'Verification Officer', status: 'inactive' }
    ]
  },
  'ps5': {
    id: 'ps5',
    name: 'Government Girls School',
    address: 'Chandni Chowk, Delhi',
    district: 'Central Delhi',
    state: 'Delhi',
    boothNumber: 'DL015',
    totalVerifications: 2845,
    successfulVerifications: 2712,
    failedVerifications: 133,
    verificationRate: 95.3,
    status: 'operational',
    staff: [
      { id: 'staff13', name: 'Prakash Malhotra', role: 'Station Manager', status: 'active' },
      { id: 'staff14', name: 'Sarita Thapar', role: 'Verification Officer', status: 'active' },
      { id: 'staff15', name: 'Mohammed Khan', role: 'Verification Officer', status: 'active' }
    ]
  },
  'ps6': {
    id: 'ps6',
    name: 'Municipal Primary School',
    address: 'Kalkaji, New Delhi',
    district: 'South East Delhi',
    state: 'Delhi',
    boothNumber: 'DL060',
    totalVerifications: 2678,
    successfulVerifications: 2545,
    failedVerifications: 133,
    verificationRate: 95.0,
    status: 'operational',
    staff: [
      { id: 'staff16', name: 'Vijay Bhatia', role: 'Station Manager', status: 'active' },
      { id: 'staff17', name: 'Anita Desai', role: 'Verification Officer', status: 'active' },
      { id: 'staff18', name: 'Rajendra Prasad', role: 'Verification Officer', status: 'active' }
    ]
  },
  'ps7': {
    id: 'ps7',
    name: 'Sarvodaya Kanya Vidyalaya',
    address: 'Rohini Sector 3, Delhi',
    district: 'North West Delhi',
    state: 'Delhi',
    boothNumber: 'DL089',
    totalVerifications: 3056,
    successfulVerifications: 2930,
    failedVerifications: 126,
    verificationRate: 95.9,
    status: 'operational',
    staff: [
      { id: 'staff19', name: 'Ashok Khanna', role: 'Station Manager', status: 'active' },
      { id: 'staff20', name: 'Preeti Malhotra', role: 'Verification Officer', status: 'active' },
      { id: 'staff21', name: 'Rakesh Thakur', role: 'Verification Officer', status: 'active' }
    ]
  },
  'ps8': {
    id: 'ps8',
    name: 'Delhi Public School',
    address: 'Mayur Vihar Phase 1, Delhi',
    district: 'East Delhi',
    state: 'Delhi',
    boothNumber: 'DL102',
    totalVerifications: 2987,
    successfulVerifications: 2865,
    failedVerifications: 122,
    verificationRate: 95.9,
    status: 'operational',
    staff: [
      { id: 'staff22', name: 'Sunil Rastogi', role: 'Station Manager', status: 'active' },
      { id: 'staff23', name: 'Poonam Bakshi', role: 'Verification Officer', status: 'active' },
      { id: 'staff24', name: 'Manoj Varma', role: 'Verification Officer', status: 'active' }
    ]
  }
};

export default indianPollingStations; 