import unittest
from unittest.mock import MagicMock
from src.security.fraud_detection import FraudDetectionSystem
from datetime import datetime, timedelta

class TestFraudDetection(unittest.TestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        self.fraud_system = FraudDetectionSystem(self.mock_db)
        
        # Create sample verification data
        self.verification_data = {
            'verification_id': '12345',
            'voter_id': 'voter123',
            'terminal_id': 'terminal1',
            'polling_station_id': 'station1',
            'verification_time': 5.2,  # 5.2 seconds
            'timestamp': datetime.now(),
            'verification_method_id': 1,
            'terminal_load': 15,
            'retry_count': 0
        }
        
        # Mock the features extraction to return valid features
        self.fraud_system._extract_verification_features = MagicMock(
            return_value=[12.5, 5.2, 15, 1, 0]
        )
        
    def test_fraud_detection_untrained_model(self):
        # Mock getting insufficient data for training
        self.mock_db.query_all.return_value = []
        
        # Test with untrained model
        result, confidence, reasons = self.fraud_system.check_verification(self.verification_data)
        
        # Should return not suspicious due to insufficient data
        self.assertFalse(result)
        self.assertEqual(confidence, 0)
        self.assertEqual(reasons, ["Model not trained, insufficient data"])
        
    def test_fraud_detection_suspicious_speed(self):
        # Mark model as trained
        self.fraud_system.trained = True
        
        # Mock model prediction (not an anomaly)
        self.fraud_system.model.predict = MagicMock(return_value=[1])
        self.fraud_system.model.decision_function = MagicMock(return_value=[0.2])
        
        # Set verification time to be very fast (suspicious)
        fast_verification = self.verification_data.copy()
        fast_verification['verification_time'] = 0.5  # 0.5 seconds
        
        # Test detection
        result, confidence, reasons = self.fraud_system.check_verification(fast_verification)
        
        # Should be suspicious due to fast verification
        self.assertTrue(result)
        self.assertIn("Verification speed abnormally fast", reasons)
        
    def test_fraud_detection_high_rate(self):
        # Mark model as trained
        self.fraud_system.trained = True
        
        # Mock model prediction (not an anomaly)
        self.fraud_system.model.predict = MagicMock(return_value=[1])
        self.fraud_system.model.decision_function = MagicMock(return_value=[0.2])
        
        # Mock high verification rate at terminal
        self.mock_db.query.return_value = 40  # 40 verifications in 5 minutes
        
        # Test detection
        result, confidence, reasons = self.fraud_system.check_verification(self.verification_data)
        
        # Should be suspicious due to high rate
        self.assertTrue(result)
        self.assertIn("High verification rate at terminal", reasons)

if __name__ == '__main__':
    unittest.main() 