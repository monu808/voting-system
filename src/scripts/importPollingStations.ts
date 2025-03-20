import fs from 'fs';
import path from 'path';
import { db } from '../config/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

async function importPollingStations() {
  try {
    console.log('Starting import...');
    
    // Read CSV file (you would need to source this data)
    const csvPath = path.resolve(__dirname, '../data/all_india_polling_stations.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');
    
    // Process in batches (Firestore limits batch operations to 500)
    const batchSize = 450;
    let batch = writeBatch(db);
    let operationCount = 0;
    let totalImported = 0;
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;
      
      const values = rows[i].split(',');
      const station: any = {};
      
      // Map CSV columns to object properties
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        const key = header.trim().toLowerCase().replace(/\s+/g, '');
        
        station[key] = value;
      });
      
      // Generate a unique ID
      const stationId = `ps_${station.state}_${station.district}_${station.boothnumber}`.replace(/\s+/g, '_');
      station.id = stationId;
      
      // Set initial verification stats
      station.totalVerifications = 0;
      station.successfulVerifications = 0;
      station.failedVerifications = 0;
      station.verificationRate = 0;
      station.status = 'operational';
      
      // Add to batch
      const stationRef = doc(db, 'pollingStations', stationId);
      batch.set(stationRef, station);
      operationCount++;
      totalImported++;
      
      // Commit when batch size is reached
      if (operationCount >= batchSize) {
        await batch.commit();
        console.log(`Imported ${totalImported} stations...`);
        batch = writeBatch(db);
        operationCount = 0;
      }
    }
    
    // Commit any remaining
    if (operationCount > 0) {
      await batch.commit();
    }
    
    console.log(`Import complete. Total imported: ${totalImported} polling stations.`);
  } catch (error) {
    console.error('Error importing polling stations:', error);
  }
}

// Run the import
importPollingStations(); 