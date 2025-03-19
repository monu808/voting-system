from flask import Flask, request, jsonify
import jwt
import redis
from database import Database
from blockchain_service import BlockchainService
from security import TokenValidator

app = Flask(__name__)
db = Database()
cache = redis.Redis()
blockchain = BlockchainService()
token_validator = TokenValidator()

@app.route('/api/verify', methods=['POST'])
def verify_voter():
    """API endpoint for voter verification"""
    if not token_validator.validate_terminal_token(request.headers.get('Authorization')):
        return jsonify({"error": "Unauthorized terminal"}), 401
    
    data = request.json
    voter_id = data.get('voter_id')
    verification_method = data.get('method')
    terminal_id = data.get('terminal_id')
    polling_station_id = data.get('polling_station_id')
    
    # Check if voter exists
    voter = db.get_voter(voter_id)
    if not voter:
        return jsonify({"status": "failed", "reason": "voter_not_found"}), 404
    
    # Check if voter has already voted
    voted_key = f"voted:{voter_id}"
    if cache.exists(voted_key):
        return jsonify({"status": "rejected", "reason": "already_voted"}), 403
    
    # Verify voter is assigned to this polling station
    if voter['assigned_station'] != polling_station_id:
        return jsonify({
            "status": "rejected", 
            "reason": "wrong_polling_station",
            "correct_station": voter['assigned_station']
        }), 403
    
    # Record verification transaction on blockchain for audit
    blockchain.record_verification(
        voter_id=voter_id,
        terminal_id=terminal_id,
        polling_station=polling_station_id,
        timestamp=request.json.get('timestamp')
    )
    
    # Mark voter as processed in cache (with TTL for the election day)
    cache.set(voted_key, terminal_id, ex=86400)  # 24 hour expiry
    
    # Update database
    db.update_voter_status(voter_id, 'voted')
    
    return jsonify({
        "status": "verified",
        "voter_name": voter['name'],
        "verification_id": blockchain.last_transaction_id
    })

@app.route('/api/terminal/heartbeat', methods=['POST'])
def terminal_heartbeat():
    """Endpoint for terminal health monitoring"""
    terminal_id = request.json.get('terminal_id')
    status = request.json.get('status')
    
    db.update_terminal_status(terminal_id, status)
    
    # Check if terminal needs updates
    updates_available = db.check_terminal_updates(terminal_id)
    
    return jsonify({
        "status": "acknowledged",
        "updates_available": updates_available
    })

if __name__ == '__main__':
    app.run(ssl_context='adhoc', host='0.0.0.0', port=5000) 