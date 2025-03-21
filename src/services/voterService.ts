import indianPollingStations from '../data/indianPollingStations';
import { db } from '../config/firebase';
import { 
  collection, doc, getDoc, getDocs, query, where, 
  updateDoc, addDoc, onSnapshot, Timestamp 
} from 'firebase/firestore';
import { PollingStation } from '../types/pollingStation';
import { loadRealPollingStationData } from '../utils/dataLoader';

// Interface for Voter Info
export interface VoterInfo {
  id: string;
  voterID: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  pollingStationId: string;
  district: string;
  state: string;
  photo?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationDate?: Date;
  verificationMethod?: 'biometric' | 'manual' | 'photo';
  verificationOfficerId?: string;
  verificationNotes?: string;
}

// Interface for verification result
export interface VerificationResult {
  success: boolean;
  message: string;
  verificationId?: string;
  voterInfo?: VoterInfo;
  timestamp?: string;
}

class VoterService {
  private pollingStations: PollingStation[] = [];

  constructor() {
    // Initialize with real data
    this.loadRealData();
  }

  async loadRealData() {
    try {
      const stations = await loadRealPollingStationData();
      this.pollingStations = stations;
      console.log(`Initialized ${stations.length} real polling stations`);
    } catch (error) {
      console.error('Failed to load real data, falling back to Indian stations data:', error);
      this.initializeRealPollingStations();
    }
  }

  initializeRealPollingStations() {
    // Convert from record format to array format and add required properties
    const stations = Object.values(indianPollingStations).map(station => {
      return {
        ...station,
        location: {
          // Default coordinates for New Delhi if not available
          latitude: 28.6139,
          longitude: 77.2090
        },
        totalVoters: station.totalVerifications || 0,
        verificationStats: {
          total: station.totalVerifications || 0,
          successful: station.successfulVerifications || 0,
          failed: station.failedVerifications || 0
        },
        staff: station.staff ? station.staff.map(s => ({
          ...s,
          contact: s.status // Use status as contact since it's required
        })) : [],
        lastUpdated: new Date()
      } as PollingStation;
    });
    
    this.pollingStations = stations;
    console.log(`Initialized ${stations.length} real polling stations`);
  }

  initializePollingStations(stations: PollingStation[]) {
    this.pollingStations = stations;
    console.log(`Initialized ${stations.length} polling stations`);
  }

  getAllPollingStations(): PollingStation[] {
    return this.pollingStations;
  }

  getPollingStationById(id: string): PollingStation | undefined {
    return this.pollingStations.find(station => station.id === id);
  }

  // Get voter by ID
  async getVoterById(voterId: string): Promise<VoterInfo | null> {
    try {
      const voterRef = doc(db, 'voters', voterId);
      const voterSnap = await getDoc(voterRef);
      
      if (voterSnap.exists()) {
        return voterSnap.data() as VoterInfo;
      }
      return null;
    } catch (error) {
      console.error('Error fetching voter:', error);
      throw error;
    }
  }

  // Verify voter and update status
  async verifyVoter(voterId: string, officerId: string, method: string, status: 'verified' | 'failed', notes?: string): Promise<boolean> {
    try {
      const voterRef = doc(db, 'voters', voterId);
      
      await updateDoc(voterRef, {
        verificationStatus: status,
        verificationDate: Timestamp.now(),
        verificationMethod: method,
        verificationOfficerId: officerId,
        verificationNotes: notes || ''
      });
      
      // Also update the polling station stats
      const voter = await this.getVoterById(voterId);
      if (voter && voter.pollingStationId) {
        await this.updatePollingStationStats(voter.pollingStationId, status);
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying voter:', error);
      throw error;
    }
  }

  // Update polling station verification stats
  private async updatePollingStationStats(stationId: string, status: 'verified' | 'failed'): Promise<void> {
    // Find the station in our local collection
    const stationIndex = this.pollingStations.findIndex(s => s.id === stationId);
    
    if (stationIndex !== -1) {
      const station = this.pollingStations[stationIndex];
      
      // Update stats
      station.verificationStats.total += 1;
      
      if (status === 'verified') {
        station.verificationStats.successful += 1;
      } else {
        station.verificationStats.failed += 1;
      }
      
      station.lastUpdated = new Date();
      
      // Update the station in the array
      this.pollingStations[stationIndex] = station;
    }
    
    // Also try to update in Firebase if available
    try {
      const stationRef = doc(db, 'pollingStations', stationId);
      const stationSnap = await getDoc(stationRef);
      
      if (stationSnap.exists()) {
        const station = stationSnap.data();
        const updates: any = {
          totalVerifications: (station.totalVerifications || 0) + 1
        };
        
        if (status === 'verified') {
          updates.successfulVerifications = (station.successfulVerifications || 0) + 1;
        } else {
          updates.failedVerifications = (station.failedVerifications || 0) + 1;
        }
        
        // Calculate rate
        updates.verificationRate = (updates.successfulVerifications / updates.totalVerifications) * 100;
        
        await updateDoc(stationRef, updates);
      }
    } catch (error) {
      console.error('Error updating station stats in Firestore:', error);
      // Continue anyway - we've updated local data
    }
  }

  // Get all voters with real-time updates
  subscribeToVoters(callback: (voters: VoterInfo[]) => void): () => void {
    const votersRef = collection(db, 'voters');
    
    const unsubscribe = onSnapshot(votersRef, (snapshot) => {
      const voters = snapshot.docs.map(doc => doc.data() as VoterInfo);
      callback(voters);
    });
    
    return unsubscribe;
  }
  
  // Get polling station with real-time updates
  subscribeToPollingStation(stationId: string, callback: (station: any) => void): () => void {
    const stationRef = doc(db, 'pollingStations', stationId);
    
    const unsubscribe = onSnapshot(stationRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
    
    return unsubscribe;
  }
  
  // Get all polling stations with real-time updates
  subscribeToAllPollingStations(callback: (stations: any[]) => void): () => void {
    const stationsRef = collection(db, 'pollingStations');
    
    const unsubscribe = onSnapshot(stationsRef, (snapshot) => {
      const stations = snapshot.docs.map(doc => doc.data());
      callback(stations);
    });
    
    return unsubscribe;
  }
  
  // Get polling stations by state and district
  async getPollingStationsByStateAndDistrict(state: string, district?: string): Promise<PollingStation[]> {
    // First try from local data
    let filteredStations = this.pollingStations.filter(station => 
      station.state === state && (!district || station.district === district)
    );
    
    if (filteredStations.length > 0) {
      return filteredStations;
    }
    
    // If no local data, try Firebase
    try {
      let stationsQuery = query(collection(db, 'pollingStations'), where('state', '==', state));
      
      if (district) {
        stationsQuery = query(stationsQuery, where('district', '==', district));
      }
      
      const snapshot = await getDocs(stationsQuery);
      return snapshot.docs.map(doc => doc.data() as PollingStation);
    } catch (error) {
      console.error('Error fetching polling stations:', error);
      return [];
    }
  }
  
  // Verify voter by ID and name
  async verifyVoterById(voterId: string, fullName?: string): Promise<VerificationResult> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find voter
    const voter = await this.getVoterById(voterId);
    
    if (!voter) {
      return {
        success: false,
        message: 'Voter not found in our records. Please check your Voter ID.',
      };
    }
    
    // If fullName provided, verify it matches
    if (fullName && voter.fullName.toLowerCase() !== fullName.toLowerCase()) {
      return {
        success: false,
        message: 'Name does not match records. Please verify your information.',
      };
    }
    
    // Generate verification ID
    const verificationId = `VF-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    
    return {
      success: true,
      message: 'Voter verified successfully.',
      verificationId,
      voterInfo: voter,
      timestamp: new Date().toISOString(),
    };
  }
  
  // Verify voter using biometric data (photo/facial recognition)
  async verifyVoterByBiometric(
    voterId: string, 
    facialImage: string,
    idImage?: string
  ): Promise<VerificationResult> {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find voter
    const voter = await this.getVoterById(voterId);
    
    if (!voter) {
      return {
        success: false,
        message: 'Voter not found in our records. Please check your Voter ID.',
      };
    }
    
    // In a real implementation, this would use a service like Google Cloud Vision API
    // to compare the facial image with the registered voter photo
    
    // For demo, assume 90% of verifications succeed
    const verificationSucceeds = Math.random() > 0.1;
    
    if (!verificationSucceeds) {
      return {
        success: false,
        message: 'Facial verification failed. Please try again or use alternative verification.',
      };
    }
    
    // Generate verification ID
    const verificationId = `VF-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    
    return {
      success: true,
      message: 'Biometric verification successful.',
      verificationId,
      voterInfo: {
        ...voter,
        photo: facialImage  // Include the captured photo
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  // Get polling station details
  getPollingStation(stationId: string): PollingStation | undefined {
    return this.getPollingStationById(stationId);
  }
}

export default new VoterService(); 