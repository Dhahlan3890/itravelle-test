from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, FlightServiceViewSet, AccommodationServiceViewSet, ServiceQuoteViewSet, MetadataViewSet

router = DefaultRouter()
router.register(r'leads', LeadViewSet)
router.register(r'flights', FlightServiceViewSet)
router.register(r'accommodations', AccommodationServiceViewSet)
router.register(r'quotes', ServiceQuoteViewSet)
router.register(r'metadata', MetadataViewSet, basename='metadata')

urlpatterns = [
    path('', include(router.urls)),
]
