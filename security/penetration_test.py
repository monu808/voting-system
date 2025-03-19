import requests
import json
import random
import string

def test_sql_injection():
    """Test SQL injection vulnerabilities in the API"""
    injection_payloads = [
        "' OR '1'='1",
        "'; DROP TABLE voters; --",
        "1; SELECT * FROM users"
    ]
    
    for payload in injection_payloads:
        response = requests.post(
            "https://test-voting-api.example.com/api/verify",
            json={
                "voter_id": payload,
                "method": "manual",
                "terminal_id": "test-terminal",
                "polling_station_id": "test-station"
            }
        )
        
        # Check if response indicates successful exploitation
        if response.status_code == 200 or "SQL syntax" in response.text:
            print(f"Possible SQL injection vulnerability with payload: {payload}")

def test_token_forgery():
    """Test if forged authorization tokens are accepted"""
    # Generate random token
    forged_token = ''.join(random.choices(string.ascii_letters + string.digits, k=40))
    
    response = requests.post(
        "https://test-voting-api.example.com/api/verify",
        json={
            "voter_id": "test-voter",
            "method": "card",
            "terminal_id": "test-terminal",
            "polling_station_id": "test-station"
        },
        headers={"Authorization": f"Bearer {forged_token}"}
    )
    
    # Should be rejected with 401 Unauthorized
    if response.status_code != 401:
        print(f"SECURITY ISSUE: API accepted forged token with status {response.status_code}")

# More security tests... 