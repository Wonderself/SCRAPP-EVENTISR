#!/usr/bin/env python3
"""
Backend API Testing Script for Event Scraping Application
Tests all the event scraping API endpoints as requested.
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, List

# Backend URL from frontend/.env
BACKEND_URL = "https://83ad28df-6db7-4031-b8f3-9682a3004624.preview.emergentagent.com"

class EventAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
    
    def log_test(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test results"""
        result = {
            'test_name': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
    
    def test_health_check(self):
        """Test 1: Basic API health check at /api/"""
        try:
            response = self.session.get(f"{self.base_url}/api/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test(
                        "Health Check (/api/)",
                        True,
                        f"API is responding correctly with message: {data['message']}",
                        data
                    )
                else:
                    self.log_test(
                        "Health Check (/api/)",
                        False,
                        "Response missing expected 'message' field",
                        data
                    )
            else:
                self.log_test(
                    "Health Check (/api/)",
                    False,
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "Health Check (/api/)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_events(self):
        """Test 2: GET /api/events/ endpoint to retrieve events"""
        try:
            response = self.session.get(f"{self.base_url}/api/events/")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test(
                        "Get Events (/api/events/)",
                        True,
                        f"Successfully retrieved {len(data)} events",
                        {"event_count": len(data), "sample": data[:2] if data else []}
                    )
                else:
                    self.log_test(
                        "Get Events (/api/events/)",
                        False,
                        "Response is not a list as expected",
                        data
                    )
            else:
                self.log_test(
                    "Get Events (/api/events/)",
                    False,
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "Get Events (/api/events/)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_event_stats(self):
        """Test 3: GET /api/events/stats endpoint to get event statistics"""
        try:
            response = self.session.get(f"{self.base_url}/api/events/stats")
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["total_events", "by_source", "by_importance", "by_language"]
                
                if all(field in data for field in expected_fields):
                    self.log_test(
                        "Get Event Stats (/api/events/stats)",
                        True,
                        f"Successfully retrieved event statistics with all expected fields",
                        data
                    )
                else:
                    missing_fields = [field for field in expected_fields if field not in data]
                    self.log_test(
                        "Get Event Stats (/api/events/stats)",
                        False,
                        f"Response missing expected fields: {missing_fields}",
                        data
                    )
            else:
                self.log_test(
                    "Get Event Stats (/api/events/stats)",
                    False,
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "Get Event Stats (/api/events/stats)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_scraping_jobs(self):
        """Test 4: GET /api/events/jobs endpoint to get scraping jobs"""
        try:
            response = self.session.get(f"{self.base_url}/api/events/jobs")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test(
                        "Get Scraping Jobs (/api/events/jobs)",
                        True,
                        f"Successfully retrieved {len(data)} scraping jobs",
                        {"job_count": len(data), "sample": data[:2] if data else []}
                    )
                else:
                    self.log_test(
                        "Get Scraping Jobs (/api/events/jobs)",
                        False,
                        "Response is not a list as expected",
                        data
                    )
            else:
                self.log_test(
                    "Get Scraping Jobs (/api/events/jobs)",
                    False,
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "Get Scraping Jobs (/api/events/jobs)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_scrape_all_sources(self):
        """Test 5: POST /api/events/scrape/all endpoint to start scraping all sources"""
        try:
            response = self.session.post(f"{self.base_url}/api/events/scrape/all")
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["message", "sources"]
                
                if all(field in data for field in expected_fields):
                    if "Started scraping from all sources" in data["message"]:
                        self.log_test(
                            "Start Scraping All Sources (/api/events/scrape/all)",
                            True,
                            f"Successfully initiated scraping for {len(data['sources'])} sources",
                            data
                        )
                    else:
                        self.log_test(
                            "Start Scraping All Sources (/api/events/scrape/all)",
                            False,
                            "Unexpected message content",
                            data
                        )
                else:
                    missing_fields = [field for field in expected_fields if field not in data]
                    self.log_test(
                        "Start Scraping All Sources (/api/events/scrape/all)",
                        False,
                        f"Response missing expected fields: {missing_fields}",
                        data
                    )
            else:
                self.log_test(
                    "Start Scraping All Sources (/api/events/scrape/all)",
                    False,
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "Start Scraping All Sources (/api/events/scrape/all)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_top_events(self):
        """Test 6: GET /api/events/top/250 endpoint to get top 250 events"""
        try:
            response = self.session.get(f"{self.base_url}/api/events/top/250")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) <= 250:  # Should not exceed the limit
                        self.log_test(
                            "Get Top 250 Events (/api/events/top/250)",
                            True,
                            f"Successfully retrieved {len(data)} top events (limit: 250)",
                            {"event_count": len(data), "sample": data[:2] if data else []}
                        )
                    else:
                        self.log_test(
                            "Get Top 250 Events (/api/events/top/250)",
                            False,
                            f"Response exceeded limit: got {len(data)} events, expected max 250",
                            {"event_count": len(data)}
                        )
                else:
                    self.log_test(
                        "Get Top 250 Events (/api/events/top/250)",
                        False,
                        "Response is not a list as expected",
                        data
                    )
            else:
                self.log_test(
                    "Get Top 250 Events (/api/events/top/250)",
                    False,
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "Get Top 250 Events (/api/events/top/250)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_error_handling(self):
        """Test error handling with invalid endpoints"""
        try:
            # Test invalid endpoint
            response = self.session.get(f"{self.base_url}/api/events/invalid")
            
            if response.status_code == 404:
                self.log_test(
                    "Error Handling (Invalid Endpoint)",
                    True,
                    "Correctly returned 404 for invalid endpoint"
                )
            else:
                self.log_test(
                    "Error Handling (Invalid Endpoint)",
                    False,
                    f"Expected 404, got {response.status_code}",
                    response.text
                )
                
            # Test invalid limit for top events
            response = self.session.get(f"{self.base_url}/api/events/top/2000")  # Exceeds max limit
            
            if response.status_code == 400:
                self.log_test(
                    "Error Handling (Invalid Limit)",
                    True,
                    "Correctly returned 400 for invalid limit"
                )
            else:
                self.log_test(
                    "Error Handling (Invalid Limit)",
                    False,
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "Error Handling",
                False,
                f"Request failed: {str(e)}"
            )
    
    def run_all_tests(self):
        """Run all API tests"""
        print("=" * 80)
        print("STARTING EVENT SCRAPING API TESTS")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print()
        
        # Run all tests
        self.test_health_check()
        self.test_get_events()
        self.test_get_event_stats()
        self.test_get_scraping_jobs()
        self.test_scrape_all_sources()
        self.test_get_top_events()
        self.test_error_handling()
        
        # Summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test_name']}: {result['details']}")
        
        print("\n" + "=" * 80)
        return self.test_results

def main():
    """Main function to run the tests"""
    tester = EventAPITester(BACKEND_URL)
    results = tester.run_all_tests()
    
    # Save results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nDetailed results saved to: /app/backend_test_results.json")
    
    # Return exit code based on test results
    failed_tests = sum(1 for result in results if not result['success'])
    return 0 if failed_tests == 0 else 1

if __name__ == "__main__":
    exit(main())