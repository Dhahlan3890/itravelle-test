from django.db import models
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Lead, FlightService, AccommodationService, ServiceQuote, Client
from .serializers import LeadSerializer, FlightServiceSerializer, AccommodationServiceSerializer, ServiceQuoteSerializer, ClientSerializer
from .services import search_flights_serp, search_hotels_serp, search_hotels_tbo, get_tbo_hotels, get_tbo_countries, get_tbo_cities, get_serp_airports
import random

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer

    def get_queryset(self):
        queryset = Client.objects.all().order_by('-created_at')
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        agent_id = self.request.query_params.get('agent_id')
        parent_id = self.request.query_params.get('parent_id')
        sub_parent_id = self.request.query_params.get('sub_parent_id')
        
        if role:
            queryset = queryset.filter(role=role)
        if search:
            queryset = queryset.filter(name__icontains=search)
        if agent_id:
            queryset = queryset.filter(agent_id=agent_id)
        if parent_id:
            queryset = queryset.filter(parent_client_id=parent_id)
        if sub_parent_id:
            queryset = queryset.filter(sub_client_parent_id=sub_parent_id)
            
        return queryset

    @action(detail=True, methods=['get'])
    def leads(self, request, pk=None):
        client = self.get_object()
        # Leads where this client is agent, client, sub_client, or contact_person
        leads = Lead.objects.filter(
            Q(agent=client) | 
            Q(client=client) | 
            Q(sub_client=client) | 
            Q(contact_person=client)
        ).distinct()
        serializer = LeadSerializer(leads, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        client = self.get_object()
        # Descendants linked to this client as agent or parent
        descendants = Client.objects.filter(
            Q(agent=client) | 
            Q(parent_client=client) | 
            Q(sub_client_parent=client)
        ).exclude(id=client.id).distinct()
        serializer = ClientSerializer(descendants, many=True)
        return Response(serializer.data)

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().order_by('-created_at')
    serializer_class = LeadSerializer

class FlightServiceViewSet(viewsets.ModelViewSet):
    queryset = FlightService.objects.all()
    serializer_class = FlightServiceSerializer

    @action(detail=True, methods=['post'])
    def generate_ai_quotes(self, request, pk=None):
        flight = self.get_object()
        results = search_flights_serp(
            flight.origin, 
            flight.destination, 
            flight.departure_date.isoformat(),
            flight.return_date.isoformat() if flight.return_date else None,
            flight.adults,
            flight.children,
            flight.cabin_class,
            flight.trip_type
        )
        
        if not results:
            # Fallback to dummy data
            airlines = ['Fly Dubai', 'Vistara', 'IndiGo', 'Qatar Airways']
            results = []
            for airline in airlines:
                results.append({
                    'provider': airline,
                    'price': random.randint(300, 1200),
                    'details': f"Mock Flight from {flight.origin} to {flight.destination}. Dep: 10:00"
                })

        quotes = []
        for res in results:
            quote = ServiceQuote.objects.create(
                flight_service=flight,
                source='AI',
                provider=res['provider'],
                price=res['price'],
                details=res['details']
            )
            quotes.append(ServiceQuoteSerializer(quote).data)
        return Response(quotes, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def generate_direct_quotes(self, request, pk=None):
        flight = self.get_object()
        # Mocking Direct Airline API
        airlines = ['Emirates', 'SriLankan Airlines']
        quotes = []
        for airline in airlines:
            price = random.randint(400, 1500)
            quote = ServiceQuote.objects.create(
                flight_service=flight,
                source='Direct',
                provider=airline,
                price=price,
                details=f"Direct Flight via {airline} API."
            )
            quotes.append(ServiceQuoteSerializer(quote).data)
        return Response(quotes, status=status.HTTP_201_CREATED)

class AccommodationServiceViewSet(viewsets.ModelViewSet):
    queryset = AccommodationService.objects.all()
    serializer_class = AccommodationServiceSerializer

    @action(detail=True, methods=['post'])
    def generate_ai_quotes(self, request, pk=None):
        acc = self.get_object()
        results = search_hotels_serp(acc.city, acc.check_in.isoformat(), acc.check_out.isoformat())
        
        if not results:
            providers = ['Booking.com', 'Expedia', 'Agoda']
            results = []
            for p in providers:
                results.append({
                    'provider': p,
                    'price': random.randint(100, 500),
                    'details': f"Mock Property: {acc.hotel_name}. Room: Deluxe."
                })

        quotes = []
        for res in results:
            quote = ServiceQuote.objects.create(
                accommodation_service=acc,
                source='AI',
                provider=res['provider'],
                price=res['price'],
                details=res['details']
            )
            quotes.append(ServiceQuoteSerializer(quote).data)
        return Response(quotes, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def generate_direct_quotes(self, request, pk=None):
        acc = self.get_object()
        # Pass hotel_id if available to filter by specific hotel
        results = search_hotels_tbo(
            city_code=acc.city, 
            check_in=acc.check_in.isoformat(), 
            check_out=acc.check_out.isoformat(), 
            adults=acc.guests,
            hotel_code=acc.hotel_id,
            hotel_name_input=acc.hotel_name
        )
        
        quotes = []
        for res in results:
            quote = ServiceQuote.objects.create(
                accommodation_service=acc,
                source='Direct',
                provider=res['provider'],
                price=res['price'],
                details=res['details']
            )
            quotes.append(ServiceQuoteSerializer(quote).data)
        return Response(quotes, status=status.HTTP_201_CREATED)

class ServiceQuoteViewSet(viewsets.ModelViewSet):
    queryset = ServiceQuote.objects.all()
    serializer_class = ServiceQuoteSerializer

    @action(detail=True, methods=['post'])
    def select_quote(self, request, pk=None):
        quote = self.get_object()
        if quote.flight_service:
            ServiceQuote.objects.filter(flight_service=quote.flight_service).update(is_selected=False)
        elif quote.accommodation_service:
            ServiceQuote.objects.filter(accommodation_service=quote.accommodation_service).update(is_selected=False)
        
        quote.is_selected = True
        quote.save()
        return Response({'status': 'quote selected'})

# --- Metadata / Dummy Data Endpoints ---

class MetadataViewSet(viewsets.ViewSet):
    def list(self, request):
        countries = [
            {'code': 'AE', 'name': 'United Arab Emirates'},
            {'code': 'LK', 'name': 'Sri Lanka'},
            {'code': 'US', 'name': 'United States'},
            {'code': 'GB', 'name': 'United Kingdom'},
            {'code': 'IN', 'name': 'India'},
        ]
        cities = [
            {'code': 'DXB', 'name': 'Dubai', 'country': 'AE', 'tbo_code': '125261'},
            {'code': 'CMB', 'name': 'Colombo', 'country': 'LK', 'tbo_code': '110757'},
            {'code': 'NYC', 'name': 'New York', 'country': 'US', 'tbo_code': '144306'},
            {'code': 'LON', 'name': 'London', 'country': 'GB', 'tbo_code': '121518'},
            {'code': 'BOM', 'name': 'Mumbai', 'country': 'IN', 'tbo_code': '124311'},
        ]
        airports = [
            {'code': 'DXB', 'name': 'Dubai Intl Airport', 'city': 'DXB'},
            {'code': 'CMB', 'name': 'Bandaranaike Intl Airport', 'city': 'CMB'},
            {'code': 'JFK', 'name': 'John F. Kennedy Intl Airport', 'city': 'NYC'},
            {'code': 'LHR', 'name': 'London Heathrow Airport', 'city': 'LON'},
            {'code': 'BOM', 'name': 'Chhatrapati Shivaji Maharaj Intl Airport', 'city': 'BOM'},
        ]
        return Response({
            'countries': countries,
            'cities': cities,
            'airports': airports
        })

    @action(detail=False, methods=['get'])
    def hotels(self, request):
        city_code = request.query_params.get('city_code')
        if not city_code:
            return Response({'error': 'city_code is required'}, status=400)
        
        hotels = get_tbo_hotels(city_code)
        return Response(hotels)

    @action(detail=False, methods=['get'])
    def countries(self, request):
        countries = get_tbo_countries()
        # Map to code/name format for dropdowns
        return Response([{'code': c.get('Code'), 'name': c.get('Name')} for c in countries])

    @action(detail=False, methods=['get'])
    def cities(self, request):
        country_code = request.query_params.get('country_code')
        if not country_code:
            return Response({'error': 'country_code is required'}, status=400)
        cities = get_tbo_cities(country_code)
        return Response([{'code': str(c.get('Code')), 'name': c.get('Name')} for c in cities])

    @action(detail=False, methods=['get'])
    def airports(self, request):
        query = request.query_params.get('q')
        if not query:
            return Response([])
        airports = get_serp_airports(query)
        return Response(airports)
