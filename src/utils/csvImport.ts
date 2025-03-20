import { PollingStation } from '../types/pollingStation';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import voterService from '../services/voterService';

interface CSVStation {
  station_id: string;
  name: string;
  address: string;
  booth_number: string;
  district: string;
  state: string;
  latitude: string;
  longitude: string;
  total_voters: string;
  status: string;
}

export const importPollingStationsFromCSV = (csvFilePath: string): PollingStation[] => {
  try {
    // Read and parse CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as CSVStation[];

    // Transform CSV data to PollingStation objects
    const pollingStations: PollingStation[] = records.map(record => ({
      id: record.station_id,
      name: record.name,
      address: record.address,
      boothNumber: record.booth_number,
      district: record.district,
      state: record.state,
      location: {
        latitude: parseFloat(record.latitude),
        longitude: parseFloat(record.longitude)
      },
      totalVoters: parseInt(record.total_voters),
      status: record.status as 'operational' | 'issue' | 'closed',
      verificationStats: {
        total: 0,
        successful: 0,
        failed: 0
      },
      staff: [],
      lastUpdated: new Date()
    }));

    return pollingStations;
  } catch (error) {
    console.error('Error importing polling stations:', error);
    throw error;
  }
};

// Example usage:
// const stations = importPollingStationsFromCSV('path/to/polling_stations.csv');
// voterService.initializePollingStations(stations); 