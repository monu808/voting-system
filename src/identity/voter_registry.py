import hashlib
import uuid
from datetime import datetime
from cryptography.fernet import Fernet
from database import Database

class VoterRegistry:
    def __init__(self, database_connection):
        self.db = database_connection
        self.encryption_key = Fernet.generate_key()
        self.cipher = Fernet(self.encryption_key)
        
    def register_voter(self, voter_data):
        """
        Register a new voter in the system
        
        Args:
            voter_data: Dict containing voter information (name, DOB, address, ID number, etc.)
        
        Returns:
            voter_id: Unique voter identifier
        """
        # Validate required fields
        required_fields = ['full_name', 'date_of_birth', 'address', 'id_number']
        for field in required_fields:
            if field not in voter_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Generate unique voter ID
        voter_id = str(uuid.uuid4())
        
        # Hash sensitive data
        id_hash = hashlib.sha256(voter_data['id_number'].encode()).hexdigest()
        
        # Encrypt personal information
        encrypted_data = self.cipher.encrypt(str(voter_data).encode())
        
        # Store in database
        self.db.insert('voters', {
            'voter_id': voter_id,
            'id_hash': id_hash,
            'encrypted_data': encrypted_data,
            'registration_date': datetime.now(),
            'status': 'active'
        })
        
        return voter_id
    
    def verify_voter_exists(self, id_number):
        """Check if a voter exists based on ID number"""
        id_hash = hashlib.sha256(id_number.encode()).hexdigest()
        return self.db.query('voters', {'id_hash': id_hash}) is not None
    
    def get_voter_status(self, voter_id):
        """Get current status of a voter (active, voted, etc.)"""
        voter = self.db.query('voters', {'voter_id': voter_id})
        return voter['status'] if voter else None 