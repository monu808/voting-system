import { PollingStation } from '../types/pollingStation';

/**
 * Parses CSV data containing polling station information
 * @param csvData Raw CSV data as a string
 * @returns Array of parsed polling stations
 */
export function parsePollingStationsCSV(csvData: string): PollingStation[] {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  
  const stations: PollingStation[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue; // Skip empty lines
    
    const values = line.split(',');
    
    // Create a station object from CSV data
    const station: PollingStation = {
      id: values[0],
      name: values[1],
      address: values[2],
      boothNumber: values[3],
      district: values[4],
      state: values[5],
      location: {
        latitude: parseFloat(values[6]),
        longitude: parseFloat(values[7])
      },
      totalVoters: parseInt(values[8], 10),
      status: 'operational', // Default
      verificationStats: {
        total: 0,
        successful: 0,
        failed: 0
      },
      staff: [],
      lastUpdated: new Date()
    };
    
    stations.push(station);
  }
  
  return stations;
}

/**
 * Combines CSV polling station data with existing Indian polling stations data
 * @param csvStations Polling stations from CSV
 * @param indianStations Polling stations from Indian data source
 * @returns Combined array of polling stations with complete data
 */
export function combinePollingStationData(
  csvStations: PollingStation[],
  indianStations: Record<string, any>
): PollingStation[] {
  // Create a map of Indian stations by name for quick lookup
  const indianStationMap = new Map<string, any>();
  
  Object.values(indianStations).forEach(station => {
    indianStationMap.set(station.name.toLowerCase(), station);
  });
  
  // Enhance CSV stations with data from Indian stations where available
  return csvStations.map(csvStation => {
    const indianStation = indianStationMap.get(csvStation.name.toLowerCase());
    
    if (indianStation) {
      return {
        ...csvStation,
        verificationStats: {
          total: indianStation.totalVerifications || 0,
          successful: indianStation.successfulVerifications || 0,
          failed: indianStation.failedVerifications || 0
        },
        staff: indianStation.staff ? indianStation.staff.map((s: any) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          contact: s.status || 'active'
        })) : []
      };
    }
    
    return csvStation;
  });
} 