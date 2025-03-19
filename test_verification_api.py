import unittest
import json
from unittest.mock import patch, MagicMock
from src.backend.verification_service import app

class TestVerificationAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        
    @patch('src.backend.verification_service.token_validator')
    @patch('src.backend.verification_service.db')
    @patch('src.backend.verification_service.cache')
    @patch('src.backend.verification_service.blockchain')
    def test_verify_voter_success(self, mock_blockchain, mock_cache, mock_db, mock_token_validator):
        # Setup mocks
        mock_token_validator.validate_terminal_token.return_value = True
        mock_db.get_voter.return_value = {
            'name': 'John Doe',
            'assigned_station': 'station1'
        }
        mock_cache.exists.return_value = False
        mock_blockchain.last_transaction_id = 'tx12345'
        
        # Test data
        data = {
            'voter_id': 'voter123',
            'method': 'card',
            'terminal_id': 'terminal1',
            'polling_station_id': 'station1',
            'timestamp': '2023-05-15T10:30:00Z'
        }
        
        # Make request
        response = self.app.post('/api/verify', 
                               headers={'Authorization': 'Bearer token123'},
                               json=data)
        
        # Check response
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['status'], 'verified')
        self.assertEqual(response_data['voter_name'], 'John Doe')
        
        # Verify mocks were called correctly
        mock_cache.set.assert_called_once()
        mock_db.update_voter_status.assert_called_once_with('voter123', 'voted')
        
    @patch('src.backend.verification_service.token_validator')
    @patch('src.backend.verification_service.db')
    @patch('src.backend.verification_service.cache')
    def test_verify_voter_already_voted(self, mock_cache, mock_db, mock_token_validator):
        # Setup mocks
        mock_token_validator.validate_terminal_token.return_value = True
        mock_db.get_voter.return_value = {
            'name': 'John Doe',
            'assigned_station': 'station1'
        }
        mock_cache.exists.return_value = True  # Voter has already voted
        
        # Test data
        data = {
            'voter_id': 'voter123',
            'method': 'card',
            'terminal_id': 'terminal1',
            'polling_station_id': 'station1'
        }
        
        # Make request
        response = self.app.post('/api/verify', 
                               headers={'Authorization': 'Bearer token123'},
                               json=data)
        
        # Check response
        self.assertEqual(response.status_code, 403)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['status'], 'rejected')
        self.assertEqual(response_data['reason'], 'already_voted')

if __name__ == '__main__':
    unittest.main() 