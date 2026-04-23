from django.db import models

class Lead(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
    ]
    name = models.CharField(max_length=255)
    client_account = models.CharField(max_length=255)
    sub_account = models.CharField(max_length=255, blank=True, null=True)
    contact_person = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    pax_count = models.IntegerField(default=1)
    start_date = models.DateField()
    end_date = models.DateField()
    currency = models.CharField(max_length=10, default='USD')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class FlightService(models.Model):
    CABIN_CHOICES = [
        ('Economy', 'Economy'),
        ('Premium Economy', 'Premium Economy'),
        ('Business', 'Business'),
        ('First Class', 'First Class'),
    ]
    TRIP_TYPE_CHOICES = [
        ('One Way', 'One Way'),
        ('Return', 'Return'),
        ('Multi-city', 'Multi-city'),
    ]
    lead = models.ForeignKey(Lead, related_name='flights', on_delete=models.CASCADE)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    departure_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    cabin_class = models.CharField(max_length=50, choices=CABIN_CHOICES, default='Economy')
    trip_type = models.CharField(max_length=50, choices=TRIP_TYPE_CHOICES, default='One Way')

class AccommodationService(models.Model):
    lead = models.ForeignKey(Lead, related_name='accommodations', on_delete=models.CASCADE)
    hotel_name = models.CharField(max_length=255)
    hotel_id = models.CharField(max_length=100, blank=True, null=True) # To store TBO HotelCode
    city = models.CharField(max_length=100)
    check_in = models.DateField()
    check_out = models.DateField()
    rooms = models.IntegerField(default=1)
    guests = models.IntegerField(default=1)
    room_type = models.CharField(max_length=100, blank=True, null=True)
    meal_type = models.CharField(max_length=100, blank=True, null=True)

class ServiceQuote(models.Model):
    SOURCE_CHOICES = [
        ('AI', 'AI Agentic Bot'),
        ('Direct', 'Airline Direct'),
        ('Manual', 'Aviation Manual'),
    ]
    # Use generic relation or specific FKs
    flight_service = models.ForeignKey(FlightService, related_name='quotes', on_delete=models.CASCADE, null=True, blank=True)
    accommodation_service = models.ForeignKey(AccommodationService, related_name='quotes', on_delete=models.CASCADE, null=True, blank=True)
    
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    provider = models.CharField(max_length=100) # e.g., "Fly Dubai", "Emirates", "TBO"
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    details = models.TextField(blank=True, null=True) # JSON or string for flight times, etc.
    is_selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
