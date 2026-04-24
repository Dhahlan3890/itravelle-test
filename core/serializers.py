from rest_framework import serializers
from .models import Lead, FlightService, AccommodationService, ServiceQuote, Client

class ClientSerializer(serializers.ModelSerializer):
    agent_name = serializers.ReadOnlyField(source='agent.name')
    parent_client_name = serializers.ReadOnlyField(source='parent_client.name')
    sub_client_parent_name = serializers.ReadOnlyField(source='sub_client_parent.name')
    
    # Counts for Agents
    client_count = serializers.SerializerMethodField()
    sub_client_count = serializers.SerializerMethodField()
    requester_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'

    def get_client_count(self, obj):
        if obj.role == 'Agent':
            return Client.objects.filter(agent=obj, role='Client').count()
        return 0

    def get_sub_client_count(self, obj):
        if obj.role == 'Agent':
            return Client.objects.filter(agent=obj, role='Sub-client').count()
        return 0

    def get_requester_count(self, obj):
        if obj.role == 'Agent':
            return Client.objects.filter(agent=obj, role='Requester').count()
        return 0

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
    
    # Expand client details for display
    agent_name = serializers.ReadOnlyField(source='agent.name')
    client_name = serializers.ReadOnlyField(source='client.name')
    sub_client_name = serializers.ReadOnlyField(source='sub_client.name')
    contact_person_name = serializers.ReadOnlyField(source='contact_person.name')

    class Meta:
        model = Lead
        fields = '__all__'
