import unittest
from unittest.mock import MagicMock, patch
from src.terminal.verification_terminal import VerificationTerminal

class TestVerificationTerminal(unittest.TestCase):
    def setUp(self):
        # Mock hardware dependencies
        self.mock_biometric = MagicMock()
        self.mock_card_reader = MagicMock()
        self.mock_printer = MagicMock()
        self.mock_connection = MagicMock()
        
        # Patch the imports
        with patch('src.terminal.verification_terminal.BiometricScanner', return_value=self.mock_biometric), \
             patch('src.terminal.verification_terminal.CardReader', return_value=self.mock_card_reader), \
             patch('src.terminal.verification_terminal.PrinterModule', return_value=self.mock_printer), \
             patch('src.terminal.verification_terminal.SecureConnection', return_value=self.mock_connection):
            
            self.terminal = VerificationTerminal('terminal123', 'station456')
    
    def test_start_session(self):
        self.terminal.start_session()
        self.assertTrue(self.terminal.session_active)
        self.mock_connection.connect.assert_called_once()
        
    def test_verify_voter_card_success(self):
        # Setup mock responses
        self.mock_card_reader.read_voter_card.return_value = {'voter_id': '12345'}
        self.mock_connection.check_eligibility.return_value = {'eligible': True}
        
        # Test verification
        result = self.terminal.verify_voter(id_method="card")
        
        # Assertions
        self.assertEqual(result['status'], 'verified')
        self.assertEqual(result['voter_data']['voter_id'], '12345')
        self.mock_connection.mark_voter_processed.assert_called_once()
        self.mock_printer.print_receipt.assert_called_once()
        
    def test_verify_voter_biometric_failure(self):
        # Setup mock responses
        self.mock_biometric.scan.return_value = 'biometric_data'
        self.mock_connection.query_by_biometric.return_value = None
        
        # Test verification
        result = self.terminal.verify_voter(id_method="biometric")
        
        # Assertions
        self.assertEqual(result['status'], 'failed')
        self.assertEqual(result['reason'], 'identification_failed')
        
    def test_verify_voter_ineligible(self):
        # Setup mock responses
        self.mock_card_reader.read_voter_card.return_value = {'voter_id': '12345'}
        self.mock_connection.check_eligibility.return_value = {
            'eligible': False,
            'reason': 'already_voted'
        }
        
        # Test verification
        result = self.terminal.verify_voter(id_method="card")
        
        # Assertions
        self.assertEqual(result['status'], 'rejected')
        self.assertEqual(result['reason'], 'already_voted')
        self.mock_connection.mark_voter_processed.assert_not_called()

if __name__ == '__main__':
    unittest.main() 