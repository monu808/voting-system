import { PollingStation } from '../types/pollingStation';
import indianPollingStations from '../data/indianPollingStations';
import { parsePollingStationsCSV, combinePollingStationData } from './csvParser';

/**
 * Loads real polling station data by combining CSV and JSON sources
 * @returns Array of polling stations with complete data
 */
export async function loadRealPollingStationData(): Promise<PollingStation[]> {
  try {
    // Fetch the CSV file from public directory
    const response = await fetch('/pollingStations.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    const csvData = await response.text();
    
    // Parse CSV data
    const csvStations = parsePollingStationsCSV(csvData);
    
    // Combine with Indian polling stations data
    return combinePollingStationData(csvStations, indianPollingStations);
  } catch (error) {
    console.error('Error loading polling station data:', error);
    
    // Fallback to just using the Indian stations data directly
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
    
    return stations;
  }
} 