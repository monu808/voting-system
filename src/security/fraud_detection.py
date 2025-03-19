import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta

class FraudDetectionSystem:
    def __init__(self, db_connection):
        self.db = db_connection
        self.model = IsolationForest(contamination=0.01)
        self.trained = False
        
    def train_model(self):
        """Train the anomaly detection model on historical voting data"""
        # Get historical verification data
        historical_data = self.db.query_all("SELECT * FROM verification_logs WHERE timestamp > %s", 
                                          [datetime.now() - timedelta(hours=4)])
        
        if len(historical_data) < 100:
            return False  # Not enough data to train yet
            
        # Extract features
        features = self._extract_features(historical_data)
        
        # Train isolation forest model
        self.model.fit(features)
        self.trained = True
        return True
        
    def check_verification(self, verification_data):
        """
        Check if a verification attempt appears fraudulent
        
        Args:
            verification_data: dict with verification details
            
        Returns:
            tuple: (is_suspicious, confidence, reasons)
        """
        if not self.trained:
            self.train_model()
            if not self.trained:
                return False, 0, ["Model not trained, insufficient data"]
                
        # Extract features for this verification
        features = self._extract_verification_features(verification_data)
        
        # Predict anomaly score
        score = self.model.decision_function([features])[0]
        prediction = self.model.predict([features])[0]
        
        # Convert score to a confidence value (0-1)
        confidence = 1 - (score + 0.5)  # normalize to 0-1 range
        
        # Check specific rules
        reasons = []
        if verification_data['verification_time'] < 2:  # Too fast (less than 2 seconds)
            reasons.append("Verification speed abnormally fast")
            
        recent_verifications = self.db.query(
            "SELECT COUNT(*) FROM verification_logs WHERE terminal_id = %s AND timestamp > %s",
            [verification_data['terminal_id'], datetime.now() - timedelta(minutes=5)]
        )
        
        if recent_verifications > 30:  # More than 30 verifications in 5 minutes
            reasons.append("High verification rate at terminal")
            
        # Check for impossible travel (same voter ID at different stations)
        last_seen = self.db.query(
            "SELECT polling_station_id, timestamp FROM verification_logs WHERE voter_id = %s ORDER BY timestamp DESC LIMIT 1",
            [verification_data['voter_id']]
        )
        
        if last_seen and last_seen['polling_station_id'] != verification_data['polling_station_id']:
            time_diff = datetime.now() - last_seen['timestamp']
            if time_diff < timedelta(hours=1):
                reasons.append("Impossible travel between polling stations")
                
        is_suspicious = prediction == -1 or len(reasons) > 0
        
        # Log this check
        self.db.insert("fraud_checks", {
            "verification_id": verification_data['verification_id'],
            "is_suspicious": is_suspicious,
            "confidence": confidence,
            "reasons": ",".join(reasons),
            "timestamp": datetime.now()
        })
        
        return is_suspicious, confidence, reasons
        
    def _extract_features(self, verification_records):
        """Extract features from verification records for model training"""
        features = []
        
        for record in verification_records:
            features.append(self._extract_verification_features(record))
            
        return np.array(features)
        
    def _extract_verification_features(self, record):
        """Extract features from a single verification record"""
        # Example features: time of day, verification duration, terminal load, etc.
        hour_of_day = record['timestamp'].hour + record['timestamp'].minute / 60.0
        
        # Create feature vector
        return [
            hour_of_day,
            record['verification_time'],
            record['terminal_load'],
            record['verification_method_id'],
            record['retry_count']
        ] 