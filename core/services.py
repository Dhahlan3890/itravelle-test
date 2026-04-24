import requests
import os
from dotenv import load_dotenv

import re

load_dotenv()

SERP_API_KEY = os.getenv('SERP_API_KEY')
TBO_USERNAME = os.getenv('TBO_USERNAME', 'Reztest')
TBO_PASSWORD = os.getenv('TBO_PASSWORD', 'Rez@79124934')
TBO_BASE_URL = "http://api.tbotechnology.in/TBOHolidays_HotelAPI"

def clean_price(price_val):
    if isinstance(price_val, (int, float)):
        return price_val
    if not price_val:
        return 0
    # Remove non-numeric characters except for decimal point
    cleaned = re.sub(r'[^\d.]', '', str(price_val))
    try:
        return float(cleaned) if cleaned else 0
    except ValueError:
        return 0

def search_flights_serp(origin, destination, departure_date, return_date=None, adults=1, children=0, cabin='Economy', trip_type='One Way'):
    if not SERP_API_KEY:
        return []
    
    # SerpAPI Google Flights types: 1: Round trip, 2: One way, 3: Multi-city
    serp_type = 2 # Default to One Way
    if trip_type == 'Return':
        serp_type = 1
    elif trip_type == 'Multi-city':
        serp_type = 3

    url = "https://serpapi.com/search"
    params = {
        "engine": "google_flights",
        "departure_id": origin,
        "arrival_id": destination,
        "outbound_date": departure_date,
        "currency": "USD",
        "adults": adults,
        "children": children,
        "type": serp_type,
        "travel_class": 1 if cabin == 'Economy' else (2 if cabin == 'Premium Economy' else (3 if cabin == 'Business' else 4)),
        "api_key": SERP_API_KEY
    }

    if serp_type == 1 and return_date:
        params["return_date"] = return_date
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if 'error' in data:
            print(f"SerpAPI Flight Error: {data['error']}")
            return []

        def parse_serp_flight(f, category):
            segments = f.get('flights', [])
            airline = segments[0].get('airline', 'Unknown') if segments else 'Unknown'
            price = clean_price(f.get('price', 0))
            duration = f.get('total_duration', 0)
            layovers = len(f.get('layovers', []))
            return {
                'provider': airline,
                'price': price,
                'details': f"{category}: {airline}. Duration: {duration} min. Layovers: {layovers}."
            }

        flights = []
        if 'best_flights' in data:
            for flight in data['best_flights'][:3]:
                flights.append(parse_serp_flight(flight, "Best Flight"))
        
        if 'other_flights' in data:
            # Fill up to 5 total flights if possible
            remaining = 5 - len(flights)
            if remaining > 0:
                for flight in data['other_flights'][:remaining]:
                    flights.append(parse_serp_flight(flight, "Flight"))
        
        return flights
    except Exception as e:
        print(f"SerpAPI Exception: {e}")
        return []

def get_serp_airports(query):
    if not SERP_API_KEY or not query:
        return []
    
    url = "https://serpapi.com/search"
    params = {
        "engine": "google_flights_autocomplete",
        "q": query,
        "api_key": SERP_API_KEY
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        suggestions = data.get('suggestions', [])
        airports = []
        for s in suggestions:
            # Check for city-level suggestions which might have airports
            for airport in s.get('airports', []):
                airports.append({
                    'code': airport.get('id'),
                    'name': f"{airport.get('name')} ({airport.get('id')})"
                })
            # Also include the suggestion itself if it has an ID and is an airport
            if s.get('id') and len(s.get('id')) == 3: # Likely IATA code
                airports.append({
                    'code': s.get('id'),
                    'name': s.get('name')
                })
        
        # Deduplicate
        seen = set()
        unique_airports = []
        for a in airports:
            if a['code'] not in seen:
                unique_airports.append(a)
                seen.add(a['code'])
        
        return unique_airports[:10]
    except Exception as e:
        print(f"SerpAPI Airport Error: {e}")
        return []

def search_hotels_serp(city, check_in, check_out):
    if not SERP_API_KEY:
        return []
        
    url = "https://serpapi.com/search"
    params = {
        "engine": "google_hotels",
        "q": f"hotels in {city}",
        "check_in_date": check_in,
        "check_out_date": check_out,
        "api_key": SERP_API_KEY
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if 'error' in data:
            print(f"SerpAPI Hotel Error: {data['error']}")
            return []

        hotels = []
        if 'properties' in data:
            for prop in data['properties'][:5]:
                hotels.append({
                    'provider': prop.get('name', 'Unknown'),
                    'price': clean_price(prop.get('rate_per_night', {}).get('lowest', 0)),
                    'details': f"Hotel: {prop.get('name')}. Rating: {prop.get('overall_rating')} stars."
                })
        return hotels
    except Exception as e:
        print(f"SerpAPI Hotel Exception: {e}")
        return []

def get_tbo_auth():
    return (TBO_USERNAME, TBO_PASSWORD)

def get_tbo_countries():
    url = f"{TBO_BASE_URL}/CountryList"
    try:
        response = requests.get(url, auth=get_tbo_auth(), timeout=15)
        data = response.json()
        return data.get('CountryList', [])
    except Exception as e:
        print(f"TBO Country List Error: {e}")
        return []

def get_tbo_cities(country_code):
    url = f"{TBO_BASE_URL}/CityList"
    payload = {"CountryCode": country_code}
    try:
        response = requests.post(url, json=payload, auth=get_tbo_auth(), timeout=15)
        data = response.json()
        return data.get('CityList', [])
    except Exception as e:
        print(f"TBO City List Error: {e}")
        return []

def get_tbo_hotels(city_code):
    url = f"{TBO_BASE_URL}/TBOHotelCodeList"
    payload = {
        "CityCode": str(city_code),
        "IsDetailedResponse": "false"
    }
    try:
        response = requests.post(url, json=payload, auth=get_tbo_auth(), timeout=20)
        data = response.json()
        hotels_data = data.get('Hotels', [])
        print(f"TBO Hotels found for {city_code}: {len(hotels_data)}")
        
        hotels = []
        # The documentation shows TBOHotelCodeList returns a list of hotel objects
        for res in hotels_data[:50]: # Return more for the list
            hotels.append({
                'code': res.get('HotelName'),
                'name': res.get('HotelName'),
                'tbo_id': res.get('HotelCode')
            })
        return hotels
    except Exception as e:
        print(f"TBO Hotel List Error: {e}")
        return []

def search_hotels_tbo(city_code, check_in, check_out, adults=1, children=0, hotel_code=None, hotel_name_input=None):
    url = f"{TBO_BASE_URL}/Search"
    payload = {
        "CheckIn": check_in,
        "CheckOut": check_out,
        "HotelCodes": hotel_code if hotel_code else "", # Filter by specific hotel if provided
        "GuestNationality": "AE",
        "PaxRooms": [
            {
                "Adults": adults,
                "Children": children,
                "ChildrenAges": [10] * children
            }
        ],
        "IsDetailedResponse": "false",
        "Filters": {
            "Refundable": False,
            "NoOfRooms": 1,
            "MealType": "All"
        }
    }
    
    # If no specific hotel_code, we might need to handle city-wide search.
    # Note: Some TBO versions require HotelCodes OR CityCode.
    # In search v2.1, if HotelCodes is empty, it usually searches city-wide if a city code is available.
    # If our city_code is a TBO ID (from the dropdown), we can try to use it if the API supports it.
    
    try:
        response = requests.post(url, json=payload, auth=get_tbo_auth(), timeout=20)
        data = response.json()
        
        results = data.get('HotelResult', [])
        if not results:
            return get_mock_tbo_results()

        hotels = []
        for res in results[:5]:
            # Use provided name fallback if TBO response lacks it
            res_name = res.get('HotelName') or hotel_name_input or res.get('HotelCode')
            provider_name = f"TBO - {res_name}"
            
            for room in res.get('Rooms', [])[:1]: # Just first room for simplicity
                hotels.append({
                    'provider': provider_name,
                    'price': clean_price(room.get('TotalFare', 0)),
                    'details': f"Room: {', '.join(room.get('Name', []))}. Meal: {room.get('MealType')}. Refundable: {room.get('IsRefundable')}"
                })
        return hotels
    except Exception as e:
        print(f"TBO Search Error: {e}")
        return get_mock_tbo_results()

def get_mock_tbo_results():
    return [
        {
            'provider': 'TBO - Grand Hyatt (Mock)',
            'price': 250,
            'details': 'Mock: TBO API call failed or is restricted by IP. Showing fallback data.'
        },
        {
            'provider': 'TBO - Atlantis (Mock)',
            'price': 550,
            'details': 'Mock: TBO API call failed or is restricted by IP. Showing fallback data.'
        }
    ]
