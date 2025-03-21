import { importPollingStationsFromCSV } from '../utils/csvImport';
import voterService from '../services/voterService';
import path from 'path';

// Function to import CSV data
export const importCSVData = (csvPath: string) => {
  try {
    console.log(`Importing polling station data from ${csvPath}...`);
    
    // Get the absolute path if a relative path is provided
    const absolutePath = path.isAbsolute(csvPath) 
      ? csvPath 
      : path.resolve(process.cwd(), csvPath);
    
    // Import the stations
    const stations = importPollingStationsFromCSV(absolutePath);
    console.log(`Imported ${stations.length} polling stations from CSV`);
    
    // Initialize the service with the imported data
    voterService.initializePollingStations(stations);
    console.log('Polling station data initialized successfully');
    
    return stations;
  } catch (error) {
    console.error('Error importing CSV data:', error);
    return null;
  }
};

// To use this script, call: importCSVData('path/to/polling_stations.csv') 