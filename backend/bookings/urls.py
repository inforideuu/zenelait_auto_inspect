from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BookingViewSet, 
    InspectionReportViewSet, 
    LoginView, 
    UserMeView, 
    RegisterCustomerView,
    UserListView,
    FileUploadView,
    StaffListView,
    NotificationViewSet,
    ConfirmBookingView,
    InvoiceDownloadView,
    RevenueStatsView
)

# Set trailing_slash=False to match the frontend fetch pattern exactly
router = DefaultRouter(trailing_slash=False)
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reports', InspectionReportViewSet, basename='report')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('upload', FileUploadView.as_view(), name='file-upload'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/me', UserMeView.as_view(), name='auth-me'),
    path('auth/register-customer', RegisterCustomerView.as_view(), name='auth-register-customer'),
    path('auth/users', UserListView.as_view(), name='auth-users'),
    path('auth/staff', StaffListView.as_view(), name='auth-staff'),
    
    # Payments Routing
    path('payments/confirm-booking', ConfirmBookingView.as_view(), name='payment-confirm-booking'),
    path('payments/download-invoice/<str:booking_id>', InvoiceDownloadView.as_view(), name='payment-download-invoice'),
    path('payments/revenue-stats', RevenueStatsView.as_view(), name='payment-revenue-stats'),
]


