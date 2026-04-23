from rest_framework import serializers
from .models import Lead, FlightService, AccommodationService, ServiceQuote

class ServiceQuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceQuote
        fields = '__all__'

class FlightServiceSerializer(serializers.ModelSerializer):
    quotes = ServiceQuoteSerializer(many=True, read_only=True)
    class Meta:
        model = FlightService
        fields = '__all__'

class AccommodationServiceSerializer(serializers.ModelSerializer):
    quotes = ServiceQuoteSerializer(many=True, read_only=True)
    class Meta:
        model = AccommodationService
        fields = '__all__'

class LeadSerializer(serializers.ModelSerializer):
    flights = FlightServiceSerializer(many=True, read_only=True)
    accommodations = AccommodationServiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lead
        fields = '__all__'
