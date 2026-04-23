import os
import requests
from dotenv import load_dotenv

load_dotenv()

TBO_USERNAME = os.getenv('TBO_USERNAME', 'Reztest')
TBO_PASSWORD = os.getenv('TBO_PASSWORD', 'Rez@79124934')
TBO_BASE_URL = "http://api.tbotechnology.in/TBOHolidays_HotelAPI"

def test_hotels(city_code):
    url = f"{TBO_BASE_URL}/TBOHotelCodeList"
    payload = {
        "CityCode": str(city_code),
        "IsDetailedResponse": "false"
    }
    auth = (TBO_USERNAME, TBO_PASSWORD)
    
    print(f"Requesting: {url} with {payload}")
    try:
        response = requests.post(url, json=payload, auth=auth)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Keys in response: {data.keys()}")
        if 'Status' in data:
            print(f"TBO Status: {data['Status']}")
        if 'Hotels' in data:
            print(f"Hotels count: {len(data['Hotels'])}")
            if len(data['Hotels']) > 0:
                print(f"First Hotel Sample: {data['Hotels'][0]}")
        else:
            print(f"Response snippet: {str(data)[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Testing with a city code from the logs
    test_hotels("100765")
