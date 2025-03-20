export interface PollingStation {
  id: string;
  name: string;
  address: string;
  boothNumber: string;
  district: string;
  state: string;
  location: {
    latitude: number;
    longitude: number;
  };
  totalVoters: number;
  status: 'operational' | 'issue' | 'closed';
  verificationStats: {
    total: number;
    successful: number;
    failed: number;
  };
  staff: Array<{
    id: string;
    name: string;
    role: string;
    contact: string;
  }>;
  lastUpdated: Date;
} 