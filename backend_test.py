#!/usr/bin/env python3
"""
FishDex Italia Backend API Test Suite
Tests all backend endpoints for the Italian fish species database
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from environment configuration
BACKEND_URL = "https://catch-collect.preview.emergentagent.com/api"

class FishDexTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.fish_data = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_get_all_fish(self):
        """Test GET /api/fish endpoint"""
        try:
            response = requests.get(f"{self.base_url}/fish", timeout=10)
            
            if response.status_code != 200:
                self.log_test("GET /api/fish", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
            
            fish_list = response.json()
            self.fish_data = fish_list
            
            # Check if we have 150+ fish species
            if len(fish_list) < 150:
                self.log_test("GET /api/fish", False, 
                            f"Expected 150+ fish, got {len(fish_list)}")
                return False
            
            self.log_test("GET /api/fish", True, 
                        f"Successfully retrieved {len(fish_list)} fish species")
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_test("GET /api/fish", False, "Request failed", str(e))
            return False
    
    def test_fish_data_structure(self):
        """Test fish data structure validation"""
        if not self.fish_data:
            self.log_test("Fish Data Structure", False, "No fish data available")
            return False
        
        required_fields = ['name', 'scientificName', 'habitat', 'description', 'referenceImage']
        sample_fish = self.fish_data[0] if self.fish_data else {}
        
        missing_fields = []
        for field in required_fields:
            if field not in sample_fish:
                missing_fields.append(field)
        
        if missing_fields:
            self.log_test("Fish Data Structure", False, 
                        f"Missing required fields: {missing_fields}")
            return False
        
        # Check if we have Italian fish names (should contain Italian characters or common Italian fish names)
        italian_fish_found = False
        italian_names = ['Spigola', 'Orata', 'Tonno', 'Luccio', 'Carpa', 'Persico']
        
        for fish in self.fish_data[:20]:  # Check first 20 fish
            if any(name in fish.get('name', '') for name in italian_names):
                italian_fish_found = True
                break
        
        if not italian_fish_found:
            self.log_test("Fish Data Structure", False, 
                        "No recognizable Italian fish names found")
            return False
        
        self.log_test("Fish Data Structure", True, 
                    "All required fields present with Italian fish names")
        return True
    
    def test_habitat_filtering(self):
        """Test habitat filtering - verify we have fish from 'mare', 'fiume', 'lago'"""
        if not self.fish_data:
            self.log_test("Habitat Filtering", False, "No fish data available")
            return False
        
        habitats = {'mare': 0, 'fiume': 0, 'lago': 0}
        
        for fish in self.fish_data:
            habitat = fish.get('habitat', '')
            if habitat in habitats:
                habitats[habitat] += 1
        
        missing_habitats = [h for h, count in habitats.items() if count == 0]
        
        if missing_habitats:
            self.log_test("Habitat Filtering", False, 
                        f"Missing fish from habitats: {missing_habitats}")
            return False
        
        self.log_test("Habitat Filtering", True, 
                    f"Fish found in all habitats - Mare: {habitats['mare']}, "
                    f"Fiume: {habitats['fiume']}, Lago: {habitats['lago']}")
        return True
    
    def test_unlock_fish_endpoint(self):
        """Test POST /api/fish/{fish_id}/unlock endpoint"""
        if not self.fish_data:
            self.log_test("Unlock Fish Endpoint", False, "No fish data available")
            return False
        
        # Get a sample fish ID
        sample_fish = self.fish_data[0]
        fish_id = sample_fish.get('id') or sample_fish.get('_id')
        
        if not fish_id:
            self.log_test("Unlock Fish Endpoint", False, "No fish ID found in sample data")
            return False
        
        # Sample unlock data
        unlock_data = {
            "photo": "https://example.com/my-catch.jpg",
            "location": "Lago di Garda, Italia",
            "equipment": "Canna da spinning 2.4m",
            "date": "2025-01-15"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/fish/{fish_id}/unlock",
                json=unlock_data,
                timeout=10
            )
            
            if response.status_code not in [200, 201]:
                self.log_test("Unlock Fish Endpoint", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
            
            result = response.json()
            
            if not result.get('success'):
                self.log_test("Unlock Fish Endpoint", False, 
                            "Response indicates failure", str(result))
                return False
            
            self.log_test("Unlock Fish Endpoint", True, 
                        f"Successfully unlocked fish {fish_id}")
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_test("Unlock Fish Endpoint", False, "Request failed", str(e))
            return False
    
    def test_stats_endpoint(self):
        """Test GET /api/stats endpoint"""
        try:
            response = requests.get(f"{self.base_url}/stats", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Stats Endpoint", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
            
            stats = response.json()
            
            # Check required stats fields
            required_stats = ['total_fish', 'total_catches', 'marine_fish', 'river_fish', 'lake_fish']
            missing_stats = [stat for stat in required_stats if stat not in stats]
            
            if missing_stats:
                self.log_test("Stats Endpoint", False, 
                            f"Missing stats fields: {missing_stats}")
                return False
            
            # Validate stats make sense
            total_fish = stats.get('total_fish', 0)
            marine_fish = stats.get('marine_fish', 0)
            river_fish = stats.get('river_fish', 0)
            lake_fish = stats.get('lake_fish', 0)
            
            if total_fish != (marine_fish + river_fish + lake_fish):
                self.log_test("Stats Endpoint", False, 
                            f"Stats don't add up: total={total_fish}, "
                            f"sum={marine_fish + river_fish + lake_fish}")
                return False
            
            if total_fish < 150:
                self.log_test("Stats Endpoint", False, 
                            f"Expected 150+ total fish, got {total_fish}")
                return False
            
            self.log_test("Stats Endpoint", True, 
                        f"Stats valid - Total: {total_fish}, Marine: {marine_fish}, "
                        f"River: {river_fish}, Lake: {lake_fish}, Catches: {stats.get('total_catches', 0)}")
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_test("Stats Endpoint", False, "Request failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🐟 Starting FishDex Italia Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_get_all_fish,
            self.test_fish_data_structure,
            self.test_habitat_filtering,
            self.test_unlock_fish_endpoint,
            self.test_stats_endpoint
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print(f"🏁 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! FishDex Italia backend is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False
    
    def get_summary(self):
        """Get test summary"""
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        return {
            "total_tests": total,
            "passed": passed,
            "failed": total - passed,
            "success_rate": f"{(passed/total*100):.1f}%" if total > 0 else "0%",
            "results": self.test_results
        }

def main():
    """Main test execution"""
    tester = FishDexTester()
    success = tester.run_all_tests()
    
    # Print detailed summary
    summary = tester.get_summary()
    print(f"\n📊 Detailed Summary:")
    print(f"   Success Rate: {summary['success_rate']}")
    print(f"   Passed: {summary['passed']}")
    print(f"   Failed: {summary['failed']}")
    
    # Save results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())