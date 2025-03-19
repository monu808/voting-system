import unittest
from unittest.mock import MagicMock
from src.identity.voter_registry import VoterRegistry

class TestVoterRegistry(unittest.TestCase):
    def setUp(self):
        # Create a mock database connection
        self.mock_db = MagicMock()
        self.registry = VoterRegistry(self.mock_db)
        
        # Sample test data
        self.valid_voter_data = {
            'full_name': 'John Doe',
            'date_of_birth': '1980-01-01',
            'address': '123 Main St',
            'id_number': 'AB123456'
        }
        
    def test_register_voter_valid_data(self):
        # Test valid registration
        voter_id = self.registry.register_voter(self.valid_voter_data)
        self.assertIsNotNone(voter_id)
        self.assertTrue(isinstance(voter_id, str))
        self.mock_db.insert.assert_called_once()
        
    def test_register_voter_missing_fields(self):
        # Test with missing required fields
        invalid_data = self.valid_voter_data.copy()
        del invalid_data['full_name']
        
        with self.assertRaises(ValueError):
            self.registry.register_voter(invalid_data)
            
    def test_verify_voter_exists(self):
        # Test voter verification
        self.mock_db.query.return_value = {'voter_id': '123'}
        result = self.registry.verify_voter_exists('AB123456')
        self.assertTrue(result)
        
        # Test non-existent voter
        self.mock_db.query.return_value = None
        result = self.registry.verify_voter_exists('NonExistent')
        self.assertFalse(result)
        
    def test_get_voter_status(self):
        # Test getting status of existing voter
        self.mock_db.query.return_value = {'status': 'active'}
        status = self.registry.get_voter_status('some_voter_id')
        self.assertEqual(status, 'active')
        
        # Test getting status of non-existent voter
        self.mock_db.query.return_value = None
        status = self.registry.get_voter_status('nonexistent_id')
        self.assertIsNone(status)

if __name__ == '__main__':
    unittest.main() 