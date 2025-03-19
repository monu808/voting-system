import time
from datetime import datetime
import biometric_utils
from secure_network import SecureConnection
from hardware_drivers import BiometricScanner, CardReader, PrinterModule

class VerificationTerminal:
    def __init__(self, terminal_id, polling_station_id):
        self.terminal_id = terminal_id
        self.polling_station_id = polling_station_id
        self.biometric_scanner = BiometricScanner()
        self.card_reader = CardReader()
        self.printer = PrinterModule()
        self.secure_connection = SecureConnection()
        self.session_active = False
        self.verification_log = []
        
    def start_session(self):
        """Initialize the terminal and connect to backend services"""
        self.session_active = True
        self.secure_connection.connect()
        self.log_event("Terminal session started")
        
    def verify_voter(self, id_method="card"):
        """
        Verify a voter's identity and eligibility
        
        Args:
            id_method: Method of identification ("card", "biometric", or "manual")
            
        Returns:
            dict: Verification result with status and voter information
        """
        voter_data = None
        
        # Step 1: Capture identification data
        if id_method == "card":
            voter_data = self.card_reader.read_voter_card()
        elif id_method == "biometric":
            biometric_data = self.biometric_scanner.scan()
            voter_data = self.secure_connection.query_by_biometric(biometric_data)
        elif id_method == "manual":
            # Fallback method using manual ID entry
            voter_id = input("Enter voter ID: ")
            voter_data = self.secure_connection.query_by_id(voter_id)
            
        if not voter_data:
            self.log_event("Verification failed - no data retrieved")
            return {"status": "failed", "reason": "identification_failed"}
            
        # Step 2: Verify eligibility
        eligibility = self.secure_connection.check_eligibility(voter_data['voter_id'])
        
        if not eligibility['eligible']:
            self.log_event(f"Voter ineligible: {eligibility['reason']}")
            return {"status": "rejected", "reason": eligibility['reason']}
            
        # Step 3: Mark voter as processed
        self.secure_connection.mark_voter_processed(
            voter_data['voter_id'], 
            self.terminal_id,
            self.polling_station_id
        )
        
        # Step 4: Print verification receipt if needed
        self.printer.print_receipt(voter_data, eligibility)
        
        self.log_event(f"Voter verified: {voter_data['voter_id']}")
        return {"status": "verified", "voter_data": voter_data}
    
    def log_event(self, message):
        """Record terminal events for audit purposes"""
        timestamp = datetime.now()
        log_entry = {
            "timestamp": timestamp,
            "terminal_id": self.terminal_id,
            "message": message
        }
        self.verification_log.append(log_entry)
        self.secure_connection.send_log(log_entry) 