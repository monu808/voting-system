import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  getFunctions,
  httpsCallable
} from 'firebase/functions';
import { firebaseConfig } from '../config/google-cloud';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

class FirebaseService {
  // Authentication methods
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string, userData: any): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        ...userData,
        email,
        createdAt: new Date().toISOString()
      });

      return userCredential.user;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Firestore methods
  async createDocument(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      await setDoc(doc(firestore, collectionName, docId), {
        ...data,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Document creation failed:', error);
      throw error;
    }
  }

  async getDocument(collectionName: string, docId: string): Promise<any> {
    try {
      const docRef = doc(firestore, collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Document retrieval failed:', error);
      throw error;
    }
  }

  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      const docRef = doc(firestore, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Document update failed:', error);
      throw error;
    }
  }

  async queryDocuments(
    collectionName: string,
    field: string,
    operator: any,
    value: any
  ): Promise<any[]> {
    try {
      const q = query(collection(firestore, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Document query failed:', error);
      throw error;
    }
  }

  // Storage methods
  async uploadFile(path: string, file: File): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('File deletion failed:', error);
      throw error;
    }
  }

  // Cloud Functions methods
  async callFunction(name: string, data: any): Promise<any> {
    try {
      const functionRef = httpsCallable(functions, name);
      const result = await functionRef(data);
      return result.data;
    } catch (error) {
      console.error('Cloud function call failed:', error);
      throw error;
    }
  }

  // Voter-specific methods
  async registerVoter(voterData: {
    id: string;
    name: string;
    address: string;
    documentUrl: string;
    photoUrl: string;
  }): Promise<void> {
    try {
      await this.createDocument('voters', voterData.id, {
        ...voterData,
        status: 'pending',
        registeredAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Voter registration failed:', error);
      throw error;
    }
  }

  async updateVoterStatus(voterId: string, status: string): Promise<void> {
    try {
      await this.updateDocument('voters', voterId, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Voter status update failed:', error);
      throw error;
    }
  }

  async getVoterByDocument(documentNumber: string): Promise<any> {
    try {
      const voters = await this.queryDocuments(
        'voters',
        'documentNumber',
        '==',
        documentNumber
      );
      return voters[0] || null;
    } catch (error) {
      console.error('Voter retrieval failed:', error);
      throw error;
    }
  }

  // Polling station methods
  async registerPollingStation(stationData: {
    id: string;
    name: string;
    address: string;
    capacity: number;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }): Promise<void> {
    try {
      await this.createDocument('pollingStations', stationData.id, {
        ...stationData,
        status: 'active',
        registeredAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Polling station registration failed:', error);
      throw error;
    }
  }

  async updatePollingStationStatus(
    stationId: string,
    status: string,
    currentCapacity: number
  ): Promise<void> {
    try {
      await this.updateDocument('pollingStations', stationId, {
        status,
        currentCapacity,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Polling station status update failed:', error);
      throw error;
    }
  }

  async getPollingStationsByArea(
    coordinates: {
      latitude: number;
      longitude: number;
    },
    radius: number
  ): Promise<any[]> {
    try {
      // This is a simplified version - in production, use geohashing or similar
      const stations = await this.queryDocuments(
        'pollingStations',
        'status',
        '==',
        'active'
      );

      return stations.filter(station => {
        const distance = this.calculateDistance(
          coordinates,
          station.coordinates
        );
        return distance <= radius;
      });
    } catch (error) {
      console.error('Polling station retrieval failed:', error);
      throw error;
    }
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export const firebaseService = new FirebaseService(); 