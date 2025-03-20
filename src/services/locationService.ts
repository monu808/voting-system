import { db } from '../config/firebase';
import { collection, getDocs, query, where, doc, writeBatch } from 'firebase/firestore';

class LocationService {
  // Get all states
  async getAllStates(): Promise<string[]> {
    try {
      const statesRef = collection(db, 'states');
      const snapshot = await getDocs(statesRef);
      return snapshot.docs.map(doc => doc.data().name);
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  }
  
  // Get districts by state
  async getDistrictsByState(state: string): Promise<string[]> {
    try {
      const districtsQuery = query(
        collection(db, 'districts'),
        where('state', '==', state)
      );
      const snapshot = await getDocs(districtsQuery);
      return snapshot.docs.map(doc => doc.data().name);
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }
  
  // Import polling station data (to be run once for setup)
  async importPollingStationData(data: any[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      data.forEach(station => {
        const stationRef = doc(db, 'pollingStations', station.id);
        batch.set(stationRef, station);
      });
      
      await batch.commit();
      console.log('Polling station data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

export default new LocationService(); 