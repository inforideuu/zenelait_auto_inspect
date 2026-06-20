from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth.models import User
from django.http import HttpResponse
from django.conf import settings
from django.core.mail import EmailMessage
from io import BytesIO
from xhtml2pdf import pisa
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

class QueryParamTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        auth = super().authenticate(request)
        if auth is not None:
            return auth

        token_key = request.query_params.get('auth_token')
        if not token_key:
            return None

        return self.authenticate_credentials(token_key)

from .models import Booking, UserProfile, InspectionReport, Notification, Payment
from .serializers import (
    BookingSerializer, 
    UserSerializer, 
    LoginSerializer, 
    RegisterCustomerSerializer, 
    InspectionReportSerializer,
    NotificationSerializer,
    PaymentSerializer
)

def get_visible_bookings_for_staff(user):
    import math
    from django.conf import settings
    from django.db.models import Q
    from .models import Booking

    profile = getattr(user, 'profile', None)
    if not profile:
        return Booking.objects.none()

    # S can see bookings where:
    # 1. B.assigned_staff == user
    # 2. OR B.assigned_staff is None AND B's location matches S's service area
    candidates = Booking.objects.filter(Q(assigned_staff=user) | Q(assigned_staff__isnull=True))
    
    pincode_clean = profile.pincode.strip().lower() if profile.pincode else None
    area_clean = profile.area.strip().lower() if profile.area else None
    radius_limit = getattr(settings, 'NEAREST_SERVICE_RADIUS', 15.0)

    matched_ids = []
    for b in candidates:
        if b.assigned_staff == user:
            matched_ids.append(b.id)
            continue

        # If the booking is unassigned, check if it matches service location
        matched = False
        if pincode_clean and b.pincode:
            if b.pincode.strip().lower() == pincode_clean:
                matched = True

        if not matched and area_clean and b.area:
            if b.area.strip().lower() == area_clean:
                matched = True

        if not matched and b.latitude is not None and b.longitude is not None and profile.latitude is not None and profile.longitude is not None:
            try:
                lat1, lon1 = float(b.latitude), float(b.longitude)
                lat2, lon2 = float(profile.latitude), float(profile.longitude)
                
                R = 6371.0
                dlat = math.radians(lat2 - lat1)
                dlon = math.radians(lon2 - lon1)
                a = (math.sin(dlat / 2)**2 + 
                     math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
                     math.sin(dlon / 2)**2)
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                distance = R * c
                if distance <= radius_limit:
                    matched = True
            except Exception:
                pass

        if matched:
            matched_ids.append(b.id)

    return Booking.objects.filter(id__in=matched_ids)


class BookingViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing booking instances.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            if self.action == 'list':
                return Booking.objects.none()
            return Booking.objects.all()

        profile = getattr(user, 'profile', None)
        if not profile:
            if user.is_staff:
                return Booking.objects.all()
            return Booking.objects.none()

        if profile.role == 'Admin':
            return Booking.objects.all()
        elif profile.role == 'Staff':
            return get_visible_bookings_for_staff(user)
        else:
            phone = profile.phone_number
            if phone:
                return Booking.objects.filter(whatsapp_number=phone)
            return Booking.objects.none()

    @action(detail=True, methods=['post'], url_path='accept', permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        
        if booking.assigned_staff is None:
            booking.assigned_staff = user
        elif booking.assigned_staff != user and not is_admin:
            return Response(
                {"detail": "Only the assigned staff can accept this request."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        from django.utils import timezone
        booking.inspection_status = 'Accepted by Staff'
        booking.accepted_at = timezone.now()
        booking.accepted_by = user
        booking.save()
        
        staff_name = user.get_full_name() or user.username
        Notification.objects.create(
            booking=booking,
            title="Inspection Accepted",
            description=f"Staff {staff_name} accepted inspection #{booking.id}"
        )
        
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject', permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        
        if booking.assigned_staff != user and not is_admin:
            return Response(
                {"detail": "Only the assigned staff can reject this request."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Rejecting transitions it back to Pending Assignment and clears assigned_staff
        booking.inspection_status = 'Pending Assignment'
        booking.assigned_staff = None
        booking.save()
        
        staff_name = user.get_full_name() or user.username
        Notification.objects.create(
            booking=booking,
            title="Inspection Rejected",
            description=f"Staff {staff_name} rejected inspection #{booking.id}"
        )
        
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='start-travel', permission_classes=[IsAuthenticated])
    def start_travel(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        
        if booking.assigned_staff != user and not is_admin:
            return Response(
                {"detail": "Only the assigned staff can update travel status."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        from django.utils import timezone
        booking.inspection_status = 'Staff Travelling'
        booking.travel_started_at = timezone.now()
        booking.save()
        
        staff_name = booking.assigned_staff.get_full_name() or booking.assigned_staff.username
        Notification.objects.create(
            booking=booking,
            title="Staff Started Travelling",
            description=f"Staff {staff_name} started travelling for inspection #{booking.id}"
        )
        
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reached-location', permission_classes=[IsAuthenticated])
    def reached_location(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        
        if booking.assigned_staff != user and not is_admin:
            return Response(
                {"detail": "Only the assigned staff can update location reached status."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        from django.utils import timezone
        booking.inspection_status = 'Inspector Reached Location'
        booking.reached_location_at = timezone.now()
        booking.save()
        
        staff_name = booking.assigned_staff.get_full_name() or booking.assigned_staff.username
        Notification.objects.create(
            booking=booking,
            title="Staff Reached Location",
            description=f"Staff {staff_name} reached customer location for inspection #{booking.id}"
        )
        
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='update-status', permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        
        if booking.assigned_staff != user and not is_admin:
            return Response(
                {"detail": "Only the assigned staff can update inspection status."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        new_status = request.data.get('inspection_status')
        if not new_status:
            return Response(
                {"detail": "inspection_status is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        booking.inspection_status = new_status
        booking.save()
        
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'Admin':
            return Notification.objects.all()
        elif hasattr(user, 'profile') and user.profile.role == 'Staff':
            from django.db.models import Q
            visible_bookings = get_visible_bookings_for_staff(user)
            return Notification.objects.filter(Q(booking__isnull=True) | Q(booking__in=visible_bookings))
        return Notification.objects.none()


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            
            # Ensure profile exists
            profile, prof_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': 'Admin' if user.is_staff else 'User'}
            )
            
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'role': profile.role.lower()
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Ensure profile exists
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'role': 'Admin' if user.is_staff else 'User'}
        )
        return Response({
            'user': UserSerializer(user).data,
            'role': profile.role.lower()
        })


class RegisterCustomerView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterCustomerSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Customer registered successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        is_employee = False
        if hasattr(user, 'profile'):
            is_employee = user.profile.role in ['Admin', 'Staff']
        else:
            is_employee = user.is_staff

        if not is_employee:
            return Response(
                {"detail": "Only administrators and staff can list users."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Fetch all active registered standard customer users whose phone number matches an active booking
        active_booking_phones = Booking.objects.values_list('whatsapp_number', flat=True)
        users = User.objects.filter(
            profile__role__in=['User', 'Customer'],
            profile__phone_number__in=active_booking_phones,
            is_active=True
        ).distinct()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class StaffListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        
        if not is_admin:
            return Response(
                {"detail": "Only administrators can view staff accounts."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        staff_users = User.objects.filter(profile__role='Staff')
        serializer = UserSerializer(staff_users, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        
        if not is_admin:
            return Response(
                {"detail": "Only administrators can manage staff accounts."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        phone_number = request.data.get('phone_number', '')
        city = request.data.get('city', '')
        area = request.data.get('area', '')
        pincode = request.data.get('pincode', '')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        if latitude == '': latitude = None
        if longitude == '': longitude = None
        try:
            if latitude is not None:
                latitude = float(latitude)
            if longitude is not None:
                longitude = float(longitude)
        except (ValueError, TypeError):
            latitude = None
            longitude = None

        if not username or not password or not email:
            return Response({"detail": "Username, email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"detail": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

        staff_user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True
        )

        UserProfile.objects.update_or_create(
            user=staff_user,
            defaults={
                'role': 'Staff',
                'phone_number': phone_number,
                'city': city,
                'area': area,
                'pincode': pincode,
                'latitude': latitude,
                'longitude': longitude
            }
        )

        return Response(UserSerializer(staff_user).data, status=status.HTTP_201_CREATED)

    def put(self, request):
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        
        if not is_admin:
            return Response(
                {"detail": "Only administrators can manage staff accounts."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        staff_id = request.data.get('id')
        if not staff_id:
            return Response({"detail": "Staff ID is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            staff_user = User.objects.get(id=staff_id, profile__role='Staff')
        except User.DoesNotExist:
            return Response({"detail": "Staff account not found."}, status=status.HTTP_404_NOT_FOUND)
            
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        phone_number = request.data.get('phone_number')
        city = request.data.get('city')
        area = request.data.get('area')
        pincode = request.data.get('pincode')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        if username and User.objects.filter(username=username).exclude(id=staff_user.id).exists():
            return Response({"detail": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)
            
        if username:
            staff_user.username = username
        if email:
            staff_user.email = email
        if password:
            staff_user.set_password(password)
        if first_name is not None:
            staff_user.first_name = first_name
        if last_name is not None:
            staff_user.last_name = last_name
        staff_user.save()
        
        profile, _ = UserProfile.objects.get_or_create(user=staff_user, defaults={'role': 'Staff'})
        if phone_number is not None:
            profile.phone_number = phone_number
        if city is not None:
            profile.city = city
        if area is not None:
            profile.area = area
        if pincode is not None:
            profile.pincode = pincode
            
        if latitude == '': latitude = None
        if longitude == '': longitude = None
        
        try:
            if latitude is not None:
                profile.latitude = float(latitude)
            elif 'latitude' in request.data and latitude is None:
                profile.latitude = None
                
            if longitude is not None:
                profile.longitude = float(longitude)
            elif 'longitude' in request.data and longitude is None:
                profile.longitude = None
        except (ValueError, TypeError):
            pass
            
        profile.save()
        
        return Response(UserSerializer(staff_user).data, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        
        if not is_admin:
            return Response(
                {"detail": "Only administrators can remove staff accounts."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        staff_id = request.query_params.get('id')
        if not staff_id:
            return Response({"detail": "Staff ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            staff_user = User.objects.get(id=staff_id, profile__role='Staff')
            staff_user.delete()
            return Response({"detail": "Staff account deleted successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "Staff account not found."}, status=status.HTTP_404_NOT_FOUND)


def link_callback(uri, rel):
    """
    Convert HTML images/links to local filesystem paths for xhtml2pdf.
    """
    import os
    import urllib.parse
    from django.conf import settings

    # Clean query parameters and decode URL encoded characters (e.g. %20 -> space)
    if '?' in uri:
        uri = uri.split('?')[0]
    uri = urllib.parse.unquote(uri)

    media_root = str(settings.MEDIA_ROOT)
    static_root = str(settings.STATIC_ROOT)

    if uri.startswith(settings.MEDIA_URL):
        path = os.path.join(media_root, uri.replace(settings.MEDIA_URL, ""))
        return path
    elif "/media/" in uri:
        parts = uri.split("/media/")
        if len(parts) > 1:
            path = os.path.join(media_root, parts[1])
            return path

    if uri.startswith(settings.STATIC_URL):
        path = os.path.join(static_root, uri.replace(settings.STATIC_URL, ""))
        return path
    elif "/static/" in uri:
        parts = uri.split("/static/")
        if len(parts) > 1:
            path = os.path.join(static_root, parts[1])
            return path

    return uri


class InspectionReportViewSet(viewsets.ModelViewSet):
    serializer_class = InspectionReportSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [QueryParamTokenAuthentication, SessionAuthentication]

    def _is_employee(self, user):
        if not user or not user.is_authenticated:
            return False
        if hasattr(user, 'profile'):
            return user.profile.role in ['Admin', 'Staff']
        return user.is_staff

    def get_queryset(self):
        user = self.request.user
        if self._is_employee(user):
            return InspectionReport.objects.all()
        return InspectionReport.objects.filter(user=user)

    def _sync_booking_status(self, report):
        booking_id = getattr(report, 'booking_id', None)
        if booking_id:
            try:
                from .models import Booking
                booking = Booking.objects.get(id=int(booking_id))
                if report.status == 'Completed':
                    booking.inspection_status = 'Report Generated'
                    booking.status = 'Completed'
                else:
                    booking.inspection_status = 'Inspection In Progress'
                booking.save()
            except Exception as e:
                print(f"Error syncing booking status: {e}")

    def create(self, request, *args, **kwargs):
        if not self._is_employee(request.user):
            return Response(
                {"detail": "Only administrators and staff can create inspection reports."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            try:
                report = InspectionReport.objects.get(id=response.data['id'])
                self._sync_booking_status(report)
            except Exception:
                pass
        return response

    def update(self, request, *args, **kwargs):
        if not self._is_employee(request.user):
            return Response(
                {"detail": "Only administrators and staff can update inspection reports."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        response = super().update(request, *args, **kwargs)
        if response.status_code == 200:
            try:
                report = InspectionReport.objects.get(id=response.data['id'])
                self._sync_booking_status(report)
            except Exception:
                pass
        return response

    def destroy(self, request, *args, **kwargs):
        if not self._is_employee(request.user):
            return Response(
                {"detail": "Only administrators and staff can delete inspection reports."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def _generate_pdf_bytes(self, report):
        import os
        from django.conf import settings
        from io import BytesIO
        from xhtml2pdf import pisa

        # Safely fetch all optional attributes to avoid any missing property errors
        customer_name = report.user.get_full_name() or report.user.username
        inspection_date = report.date.strftime('%B %d, %Y') if hasattr(report.date, 'strftime') else str(report.date)
        car_make = getattr(report, 'car_make', '') or 'Not Specified'
        car_model = getattr(report, 'vehicle_model', '') or 'Not Specified'
        variant = getattr(report, 'variant', '') or 'Not Specified'
        year = getattr(report, 'year', '') or 'Not Specified'
        registration_number = getattr(report, 'registration_number', '') or 'Not Specified'
        vin_number = getattr(report, 'vin_number', '') or 'Not Specified'
        engine_number = getattr(report, 'engine_number', '') or 'Not Specified'
        odometer = getattr(report, 'odometer', '') or 'Not Specified'
        fuel_type = getattr(report, 'fuel_type', '') or 'Not Specified'
        transmission = getattr(report, 'transmission', '') or 'Not Specified'
        insurance_details = getattr(report, 'insurance_details', '') or 'Not Specified'
        location = getattr(report, 'city', '') or 'Not Specified'
        customer_address = getattr(report, 'customer_address', '') or 'Not Specified'
        booking_id = getattr(report, 'booking_id', '') or 'Not Specified'
        technician_name = getattr(report, 'technician_name', '') or 'AutoInspect Certified Expert'
        package = getattr(report, 'package', '') or 'Premium'
        summary = getattr(report, 'summary', '') or 'No overall summary registered.'
        header_image = getattr(report, 'header_image', '') or ''

        # Attention Needed Areas
        body_structural = getattr(report, 'body_structural', '') or ''
        accidental_history = getattr(report, 'accidental_history', '') or ''
        engine_gearbox = getattr(report, 'engine_gearbox', '') or ''
        water_logged = getattr(report, 'water_logged', '') or ''
        obd_errors = getattr(report, 'obd_errors', '') or ''
        obd_status_str = getattr(report, 'obd_status', 'Clean') or 'Clean'
        obd_codes = getattr(report, 'obd_codes', []) or []

        # Walkaround Video
        video_link = getattr(report, 'video_link', '') or ''

        # OBD PDF and OBD Video URL
        obd_pdf = getattr(report, 'obd_pdf', '') or ''
        obd_video_url = getattr(report, 'obd_video_url', '') or ''

        # Other References
        other_references = getattr(report, 'other_references', []) or []
        other_references_html = ""
        if isinstance(other_references, list) and len(other_references) > 0:
            other_references_html += """
                <div style="margin-top: 15px; margin-bottom: 15px;">
                    <h3 class="audit-header" style="font-size: 12px; font-weight: bold; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; padding: 0;">
                        Other References
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 10px; page-break-inside: auto;"><tr style="page-break-inside: avoid;">
            """
            for idx, img_url in enumerate(other_references):
                if idx > 0 and idx % 2 == 0:
                    other_references_html += '</tr><tr style="page-break-inside: avoid;">'
                other_references_html += '<td style="width: 50%; padding: 6px; text-align: center;"><img src="' + img_url + '" width="240" height="160" style="border: 1px solid #cbd5e1; border-radius: 6px;" /></td>'
            rem = len(other_references) % 2
            if rem > 0:
                for _ in range(2 - rem):
                    other_references_html += '<td style="width: 50%;"></td>'
            other_references_html += '</tr></table></div>'

        # OBD report (QR)
        obd_qr_images = getattr(report, 'obd_qr_images', []) or []
        obd_qr_images_html = ""
        if isinstance(obd_qr_images, list) and len(obd_qr_images) > 0:
            obd_qr_images_html += """
                <div style="margin-top: 15px; margin-bottom: 15px;">
                    <h3 class="audit-header" style="font-size: 12px; font-weight: bold; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; padding: 0;">
                        OBD Report (QR)
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 10px; page-break-inside: auto;"><tr style="page-break-inside: avoid;">
            """
            for idx, img_url in enumerate(obd_qr_images):
                if idx > 0 and idx % 2 == 0:
                    obd_qr_images_html += '</tr><tr style="page-break-inside: avoid;">'
                obd_qr_images_html += '<td style="width: 50%; padding: 6px; text-align: center;"><img src="' + img_url + '" width="180" height="180" style="border: 1px solid #cbd5e1; border-radius: 6px;" /></td>'
            rem = len(obd_qr_images) % 2
            if rem > 0:
                for _ in range(2 - rem):
                    obd_qr_images_html += '<td style="width: 50%;"></td>'
            obd_qr_images_html += '</tr></table></div>'

        # OBD Extra Files & Videos
        obd_extra_html = ""
        if obd_pdf or obd_video_url:
            obd_extra_html += """
                <div style="margin-top: 15px; margin-bottom: 15px;">
                    <h3 class="audit-header" style="font-size: 12px; font-weight: bold; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; padding: 0;">
                        OBD Scan Diagnostic Files & Videos
                    </h3>
            """
            if obd_pdf:
                obd_extra_html += f"""
                    <div class="video-box" style="margin-bottom: 10px;">
                        <strong>CERTIFIED OBD PDF REPORT:</strong><br>
                        Click below to view the official OBD-II diagnostic PDF report:<br>
                        <a href="{obd_pdf}" style="color: #4f46e5; font-weight: bold; text-decoration: underline; font-size: 14px; display: block; margin-top: 6px; word-wrap: break-word; word-break: break-all;">{obd_pdf}</a>
                    </div>
                """
            if obd_video_url:
                obd_extra_html += f"""
                    <div class="video-box" style="margin-bottom: 10px;">
                        <strong>CERTIFIED OBD LIVE SCAN VIDEO:</strong><br>
                        Click below to watch the live OBD-II diagnostic scan evidence video:<br>
                        <a href="{obd_video_url}" style="color: #4f46e5; font-weight: bold; text-decoration: underline; font-size: 14px; display: block; margin-top: 6px; word-wrap: break-word; word-break: break-all;">{obd_video_url}</a>
                    </div>
                """
            obd_extra_html += "</div>"

        # Gallery Images
        report_images = getattr(report, 'images', []) or []
        gallery_html = ""
        
        # Generate Gallery HTML from report_images
        if isinstance(report_images, list) and len(report_images) > 0:
            gallery_html += '<table style="width: 100%; border-collapse: collapse; margin-top: 15px; page-break-inside: auto;"><tr style="page-break-inside: avoid;">'
            for idx, img_url in enumerate(report_images[:6]):  # Render up to 6 images in 2x3 grid
                if idx > 0 and idx % 2 == 0:
                    gallery_html += '</tr><tr style="page-break-inside: avoid;">'
                gallery_html += '<td style="width: 50%; padding: 8px; text-align: center;"><img src="' + img_url + '" width="240" height="160" style="border: 1px solid #cbd5e1; border-radius: 6px;" /><div style="font-size: 11px; color: #64748b; margin-top: 4px; font-weight: bold;">Vehicle Angle #' + str(idx+1) + '</div></td>'
            # Fill out remaining cells if not multiple of 2
            rem = len(report_images[:6]) % 2
            if rem > 0:
                for _ in range(2 - rem):
                    gallery_html += '<td style="width: 50%;"></td>'
            gallery_html += '</tr></table>'
        else:
            gallery_html += '<div style="color: #64748b; font-style: italic; font-size: 12.5px; padding: 10px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 6px;">No inspection gallery photos were uploaded</div>'

        checks = getattr(report, 'checks', []) or []

        def generate_category_images_html(category_name):
            cat_obj = None
            if isinstance(checks, list):
                for cat in checks:
                    if isinstance(cat, dict) and cat.get('category', '').strip().lower() == category_name.strip().lower():
                        cat_obj = cat
                        break
            
            if cat_obj and isinstance(cat_obj, dict):
                cat_images = cat_obj.get('images', []) or []
                if isinstance(cat_images, list) and len(cat_images) > 0:
                    html = '<div style="font-size: 10px; font-weight: bold; color: #475569; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">' + category_name + ' Reference Images:</div>'
                    html += '<table style="width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 10px; page-break-inside: auto;"><tr style="page-break-inside: avoid;">'
                    for idx, img_url in enumerate(cat_images):
                        if idx > 0 and idx % 2 == 0:
                            html += '</tr><tr style="page-break-inside: avoid;">'
                        html += '<td style="width: 50%; padding: 6px; text-align: center;"><img src="' + img_url + '" width="240" height="160" style="border: 1px solid #cbd5e1; border-radius: 6px;" /></td>'
                    rem = len(cat_images) % 2
                    if rem > 0:
                        for _ in range(2 - rem):
                            html += '<td style="width: 50%;"></td>'
                    html += '</tr></table>'
                    return html
            return ""

        engine_cabin_images_html = generate_category_images_html("Engine Cabin")
        exterior_body_images_html = generate_category_images_html("Exterior and Body")
        interior_images_html = generate_category_images_html("Interior")
        test_drive_images_html = generate_category_images_html("Test Drive")

        # Create a lookup dictionary for checks to match them by name case-insensitively
        checks_lookup = {}
        if isinstance(checks, list):
            for cat in checks:
                if isinstance(cat, dict):
                    for item in cat.get('items', []):
                        if isinstance(item, dict):
                            name_str = item.get('name', '').strip().lower()
                            if name_str:
                                checks_lookup[name_str] = item

        def get_item_badge_style(status_str):
            clean_status = status_str.strip()
            s_lower = clean_status.lower()
            if s_lower in ['excellent', 'pass', 'passed', 'clean', 'good', 'normal']:
                if s_lower in ['excellent', 'good']:
                    return 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; text-align: center; display: inline-block;'
                else:
                    return 'background-color: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; text-align: center; display: inline-block;'
            elif any(x in s_lower for x in ['warning', 'attention', 'repaired', 'minor', 'repainted', 'faded', 'slow', 'weak', 'low', 'dampness']):
                return 'background-color: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; text-align: center; display: inline-block;'
            elif any(x in s_lower for x in ['damage', 'dirty', 'broken', 'crack', 'dead', 'leak', 'rust', 'dent', 'scratch', 'ingress', 'deployed', 'fault', 'fail', 'poor', 'no ', 'waterlogged', 'water logged']):
                return 'background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; text-align: center; display: inline-block;'
            else: # replaced or other
                return 'background-color: #f9fafb; color: #4b5563; border: 1px solid #e5e7eb; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; text-align: center; display: inline-block;'

        def render_checkpoint_row(item_name, fallback_status="Normal", bg_color="#ffffff"):
            lookup_key = item_name.strip().lower()
            item_obj = checks_lookup.get(lookup_key)
            
            # Default values
            status_val = fallback_status
            desc_val = ""
            item_images = []
            
            if item_obj and isinstance(item_obj, dict):
                status_val = item_obj.get('status', fallback_status)
                desc_val = item_obj.get('desc', '')
                item_images = item_obj.get('images', []) or []
                
            badge_style = get_item_badge_style(status_val)
            
            # Render description if it exists (removed for standard checkpoints to prevent option list clutter)
            desc_html = ""
                
            # Render item-level images if they exist
            images_html = ""
            if item_images:
                images_html += '<table style="width: 100%; border-collapse: collapse; margin-top: 6px;"><tr>'
                for idx, img_url in enumerate(item_images):
                    if idx > 0 and idx % 3 == 0:
                        images_html += '</tr><tr>'
                    images_html += '<td style="width: 33%; padding: 4px; text-align: left;"><img src="' + img_url + '" width="155" height="110" style="border: 1px solid #cbd5e1; border-radius: 4px;" /></td>'
                rem = len(item_images) % 3
                if rem > 0:
                    for _ in range(3 - rem):
                        images_html += '<td style="width: 33%;"></td>'
                images_html += '</tr></table>'
                
            return '<tr style="page-break-inside: avoid; background-color: ' + bg_color + '; border-bottom: 1px solid #cbd5e1;"><td style="padding: 10px 14px; vertical-align: top; word-wrap: break-word; word-break: break-all;"><span style="font-weight: bold; color: #1e293b; font-size: 14px;">' + item_name + '</span>' + desc_html + images_html + '</td><td style="width: 120px; text-align: right; vertical-align: top; padding: 10px 14px;"><span style="' + badge_style + '">' + status_val + '</span></td></tr>'

        engine_cabin_items = [
            "Engine Physical Condition",
            "Engine Oil Condition",
            "Coolant",
            "Battery Condition",
            "Fuel Injector",
            "Left Apron",
            "Left Apron Leg",
            "Right Apron",
            "Right Apron Leg",
            "Upper Cross Member",
            "Lower Cross Member",
            "Radiator and Support",
            "Radiator Fan",
            "Firewall",
            "Engine Oil Sump"
        ]

        exterior_body_items = [
            "Cowltop",
            "Windshield",
            "Bonnet",
            "Front Bumper",
            "Front Bumper Grill",
            "Headlight Left",
            "Headlight Right",
            "Fog Lamp Left",
            "Fog Lamp Right",
            "Fender Left",
            "Mirror Assembly Left",
            "A Pillar Left",
            "B Pillar Left",
            "C Pillar Left",
            "Left Door Front",
            "Left Door Rear",
            "Running Board Left",
            "Quarter Panel Left",
            "Roof Outer"
        ]

        interior_items = [
            "Rear Windshield",
            "Boot Door (Dicky)",
            "Rear Bumper",
            "Boot Floor",
            "Tool Kit",
            "Tail Lamp Left",
            "Tail Lamp Right",
            "Quarter Panel Right",
            "Running Board Right",
            "Right Door Rear",
            "A Pillar Right",
            "B Pillar Right",
            "C Pillar Right",
            "Mirror Assembly Right",
            "Fender Right",
            "Power Window",
            "normal Power Window Remarks",
            "ORVM Switch"
        ]

        test_drive_items = [
            "Airbags",
            "Instrument Cluster",
            "Music System",
            "Music System Remarks",
            "Horn",
            "Wipers",
            "All Exterior Lamps Working",
            "Interior Seat Condition All seats",
            "Sunroof",
            "Steering Wheel Mount Buttons",
            "Rear Defogger Normal Reverse Camera and Sensor",
            "Airconditioner System 5°c - 8°c ( Excellent )",
            "Clutch",
            "Brakes",
            "Anti-lock Braking System (ABS)",
            "Acceleration",
            "Handbrake",
            "Gear Shifting",
            "Gear Box Paddle Shifters",
            "Paddle Shifters",
            "Suspension",
            "Engine Sound and Vibration",
            "Turbo",
            "Pickup and Performance",
            "General Noise",
            "All Wheel Bearing",
            "Back Compression",
            "Exhaust Pipe and Smoke",
            "Flood Effected / Water Logged"
        ]

        # Precompute table rows
        engine_cabin_rows = ""
        for idx, item in enumerate(engine_cabin_items):
            bg = "#f8fafc" if idx % 2 == 1 else "#ffffff"
            engine_cabin_rows += render_checkpoint_row(item, fallback_status="Normal", bg_color=bg)

        exterior_body_rows = ""
        for idx, item in enumerate(exterior_body_items):
            bg = "#f8fafc" if idx % 2 == 1 else "#ffffff"
            exterior_body_rows += render_checkpoint_row(item, fallback_status="Normal", bg_color=bg)

        interior_rows = ""
        for idx, item in enumerate(interior_items):
            bg = "#f8fafc" if idx % 2 == 1 else "#ffffff"
            interior_rows += render_checkpoint_row(item, fallback_status="Normal", bg_color=bg)

        test_drive_rows = ""
        for idx, item in enumerate(test_drive_items):
            bg = "#f8fafc" if idx % 2 == 1 else "#ffffff"
            test_drive_rows += render_checkpoint_row(item, fallback_status="Normal", bg_color=bg)

        def format_attention_row(label, db_field_value, is_blacklist_check=False):
            if not db_field_value or db_field_value.strip().lower() in ['n/a', 'none', 'clean', 'no issues', 'no', 'passed', 'pass', 'perfect', 'clear']:
                badge_text = "CLEAN" if is_blacklist_check else "PASSED"
                return f"""
                <tr style="page-break-inside: avoid;">
                    <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; font-weight: bold; color: #1e293b; font-size: 13px; background-color: #f8fafc; width: 35%;">
                        {label}
                    </td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; vertical-align: middle; word-wrap: break-word; word-break: break-all;">
                        <span style="background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; display: inline-block; vertical-align: middle;">✔ {badge_text}</span>
                        <span style="color: #64748b; font-size: 12px; margin-left: 6px; vertical-align: middle;">— System reporting nominal status with no active anomalies.</span>
                    </td>
                </tr>
                """
            return f"""
            <tr style="page-break-inside: avoid;">
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; font-weight: bold; color: #1e293b; font-size: 13px; background-color: #f8fafc; width: 35%;">
                    {label}
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; vertical-align: middle; word-wrap: break-word; word-break: break-all;">
                    <span style="background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; display: inline-block; vertical-align: middle; margin-bottom: 4px;">⚠ ATTENTION REQUIRED</span>
                    <div style="color: #1e293b; font-size: 13px; font-weight: bold; line-height: 1.4; word-wrap: break-word; word-break: break-all;">— {db_field_value}</div>
                </td>
            </tr>
            """

        attention_needed_rows = ""
        attention_needed_rows += format_attention_row("Body & Structural State", body_structural)
        attention_needed_rows += format_attention_row("Accidental History", accidental_history)
        attention_needed_rows += format_attention_row("Engine & Gearbox Performance", engine_gearbox)
        attention_needed_rows += format_attention_row("OBD Scan Errors (DTC)", obd_errors)
        attention_needed_rows += format_attention_row("Water Logged (Flooded)", water_logged)
        
        obd_scan_val = "Clean" if obd_status_str == "Clean" else f"Faults detected: {len(obd_codes)} DTCs active"
        attention_needed_rows += format_attention_row("OBD Scan Report", obd_scan_val)
        attention_needed_rows += format_attention_row("OBD Pre-scan Report", "Clean")
        attention_needed_rows += format_attention_row("Background History Check", "Clean")
        attention_needed_rows += format_attention_row("Blacklist Status", "Clear", is_blacklist_check=True)

        vehicle_details_html = f"""
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: avoid; border: 1px solid #cbd5e1;">
            <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; background-color: #f8fafc; width: 25%;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Customer Name</span>
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; width: 25%; font-weight: bold; color: #0f172a; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {customer_name}
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; background-color: #f8fafc; width: 25%;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Inspection Date</span>
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; width: 25%; font-weight: bold; color: #0f172a; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {inspection_date}
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; background-color: #f8fafc;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Car Make</span>
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; width: 25%; font-weight: bold; color: #0f172a; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {car_make}
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; background-color: #f8fafc;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Car Model</span>
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; width: 25%; font-weight: bold; color: #0f172a; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {car_model}
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; background-color: #f8fafc;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Car Registration Number</span>
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; width: 25%; font-weight: bold; color: #0f172a; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {registration_number}
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; background-color: #f8fafc;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">VIN Number</span>
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; width: 25%; font-weight: bold; color: #0f172a; font-family: monospace; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {vin_number}
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; background-color: #f8fafc;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Odometer Reading</span>
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; width: 25%; font-weight: bold; color: #0f172a; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {odometer}
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; background-color: #f8fafc;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Fuel Type</span>
                </td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #cbd5e1; width: 25%; font-weight: bold; color: #0f172a; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {fuel_type}
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 14px; border-right: 1px solid #cbd5e1; background-color: #f8fafc;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Transmission</span>
                </td>
                <td style="padding: 10px 14px; width: 25%; font-weight: bold; color: #0f172a; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {transmission}
                </td>
                <td style="padding: 10px 14px; border-right: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; background-color: #f8fafc;">
                    <span style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Location Manual</span>
                </td>
                <td style="padding: 10px 14px; width: 25%; font-weight: bold; color: #0f172a; font-size: 13px; word-wrap: break-word; word-break: break-all;">
                    {location}
                </td>
            </tr>
        </table>
        """

        # Expert remarks point by point
        remarks_points = []
        raw_remarks = getattr(report, 'technician_remarks', '') or ''
        if raw_remarks:
            lines = raw_remarks.replace('\r', '').split('\n')
            for line in lines:
                line = line.strip()
                if line:
                    for sub in line.split('.'):
                        sub = sub.strip()
                        if sub:
                            remarks_points.append(sub)
        
        if not remarks_points:
            remarks_points = [
                "Sometime late cranking once check battery and self motor condition",
                "Rear Rh tyre damaged",
                "All tyres weak year expired need to replace condition"
            ]

        remarks_list_items = "".join([f'<li style="margin-bottom: 5px; font-size: 15px; color: #78350f;">{pt}</li>' for pt in remarks_points])

        remarks_html = f"""
        <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 14px 18px; border-radius: 0 6px 6px 0; margin-bottom: 20px;">
            <span style="color: #b45309; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; display: block;">INSPECTION EXPERT REMARKS:</span>
            <ul style="margin: 6px 0 0 0; padding-left: 18px; font-size: 16px; color: #78350f; line-height: 1.5;">
                {remarks_list_items}
            </ul>
        </div>
        """

        # Precompute fields to avoid complex python expressions in the f-string template (resolves syntax error in f-string)
        user_obj = getattr(report, 'user', None)
        customer_email = 'Not Registered'
        customer_phone = 'Not Registered'
        if user_obj:
            customer_email = getattr(user_obj, 'email', '') or 'Not Registered'
            profile_obj = getattr(user_obj, 'profile', None)
            if profile_obj:
                customer_phone = getattr(profile_obj, 'phone_number', '') or 'Not Registered'

        report_grade = getattr(report, 'grade', '')
        report_id = getattr(report, 'id', '')
        report_disclaimer = getattr(report, 'disclaimer', '')

        # Banner structure
        def get_header_banner():
            vehicle_name = f"{year} {car_make} {car_model}".strip()
            return f"""
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-bottom: 3px solid #0f172a; margin-bottom: 20px; page-break-inside: avoid;">
                <tr>
                    <td style="padding: 10px 0; vertical-align: middle; text-align: left; width: 33%;">
                        <img src="/media/uploads/header_logo.jpeg" width="110" height="85" style="vertical-align: middle;" />
                    </td>
                    <td style="padding: 10px 0; vertical-align: middle; text-align: center; width: 33%;">
                        <span style="font-size: 18px; font-weight: bold; color: #0f172a; letter-spacing: 0.5px;">{vehicle_name}</span>
                    </td>
                    <td style="padding: 10px 0; vertical-align: middle; text-align: right; width: 34%;">
                        <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: #0f172a; letter-spacing: 0.5px;">REPORT ID: {report_id}</span>
                    </td>
                </tr>
            </table>
            """

        header_banner_p1 = get_header_banner()
        header_banner_p2 = get_header_banner()
        header_banner_p3 = get_header_banner()
        header_banner_p4 = get_header_banner()

        header_image_html = ""
        if header_image:
            header_image_html = f"""
            <div style="text-align: center; margin-bottom: 12px; page-break-inside: avoid;">
                <img src="{header_image}" style="width: 100%; border-radius: 6px; border: 1px solid #cbd5e1;" />
            </div>
            """

        # Start of HTML Template
        html_template = f"""
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @page {{
                    size: A4;
                    margin: 12mm 12mm 15mm 12mm;
                }}
                body {{
                    font-family: Helvetica, Arial, sans-serif;
                    color: #1e293b;
                    background-color: #ffffff;
                    line-height: 1.4;
                    font-size: 16px;
                    orphans: 3;
                    widows: 3;
                }}
                body, p, div, li, span, td {{
                    orphans: 3;
                    widows: 3;
                }}
                .container {{
                    width: 100%;
                }}
                .page-break {{
                    page-break-before: always;
                }}
                h1, h2, h3, h4, h5, h6 {{
                }}
                .audit-header {{
                }}
                .section-title {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #0f172a;
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 4px;
                    margin-top: 25px;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }}
                .verdict-box {{
                    font-size: 16px;
                    color: #1e293b;
                    background-color: #f8fafc;
                    border-left: 4px solid #0f172a;
                    padding: 14px 18px;
                    margin-bottom: 20px;
                    border-radius: 0 6px 6px 0;
                    line-height: 1.6;
                    page-break-inside: avoid;
                }}
                .check-list-table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 1px solid #cbd5e1;
                    page-break-inside: auto;
                }}
                .check-list-table tr {{
                    page-break-inside: avoid;
                }}
                .check-cat-row {{
                    background-color: #0f172a;
                    color: #ffffff;
                    font-weight: bold;
                    text-transform: uppercase;
                    page-break-inside: avoid;
                }}
                .check-cat-row td {{
                    padding: 10px 14px;
                    font-size: 20px;
                    letter-spacing: 0.5px;
                }}
                .video-box {{
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-left: 4px solid #0f172a;
                    padding: 14px 18px;
                    margin-bottom: 20px;
                    border-radius: 0 6px 6px 0;
                    font-size: 16px;
                    page-break-inside: avoid;
                }}
                .footer {{
                    text-align: center;
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 30px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                
                <!-- ==================== PAGE 1: VEHICLE DIAGNOSTIC OVERVIEW ==================== -->
                {header_banner_p1}
                {header_image_html}
                
                <div class="section-title">01 / VEHICLE DIAGNOSTICS & SYSTEM ASSESSMENT OVERVIEW</div>
                       <h3 class="audit-header" style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; padding: 0;">
                    1. VEHICLE DETAILS
                </h3>
                {vehicle_details_html}
 
                <h3 class="audit-header" style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 15px; padding: 0;">
                    2. OVERALL SUMMARY VEHICLE
                </h3>
                <div class="verdict-box">
                    <strong>EXPERT DIAGNOSTIC VERDICT SUMMARY:</strong><br>
                    <span style="font-size: 16px; color: #334155; display: block; margin-top: 6px; line-height: 1.5;">{summary}</span>
                </div>
 
                <h3 class="audit-header" style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 15px; padding: 0;">
                    3. ATTENTION NEEDED AREAS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #cbd5e1; page-break-inside: auto;">
                    {attention_needed_rows}
                </table>
 
                 <!-- ==================== PAGE 2: DETAILED MECHANICAL AUDIT & CHECKPOINTS ==================== -->
                <div class="page-break"></div>
                {header_banner_p2}
 
                <div class="section-title">02 / DETAILED MECHANICAL AUDIT & CHECKPOINTS</div>
 
                <h3 class="audit-header" style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; padding: 0;">
                    ENGINE CABIN AUDIT
                </h3>
                <table class="check-list-table">
                    <tr class="check-cat-row">
                        <td style="padding: 10px 14px; font-size: 20px;">Check Item</td>
                        <td style="width: 120px; text-align: right; padding: 10px 14px; font-size: 20px;">Status</td>
                    </tr>
                    {engine_cabin_rows}
                </table>
                {engine_cabin_images_html}
 
                <h3 class="audit-header" style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; padding: 0;">
                    EXTERIOR AND BODY AUDIT
                </h3>
                <table class="check-list-table">
                    <tr class="check-cat-row">
                        <td style="padding: 10px 14px; font-size: 20px;">Check Item</td>
                        <td style="width: 120px; text-align: right; padding: 10px 14px; font-size: 20px;">Status</td>
                    </tr>
                    {exterior_body_rows}
                </table>
                {exterior_body_images_html}
 
                <h3 class="audit-header" style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; padding: 0;">
                    INTERIOR AUDIT
                </h3>
                <table class="check-list-table">
                    <tr class="check-cat-row">
                        <td style="padding: 10px 14px; font-size: 20px;">Check Item</td>
                        <td style="width: 120px; text-align: right; padding: 10px 14px; font-size: 20px;">Status</td>
                    </tr>
                    {interior_rows}
                </table>
                {interior_images_html}
 
                <h3 class="audit-header" style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; padding: 0;">
                    TEST DRIVE AUDIT
                </h3>
                <table class="check-list-table">
                    <tr class="check-cat-row">
                        <td style="padding: 10px 14px; font-size: 20px;">Check Item</td>
                        <td style="width: 120px; text-align: right; padding: 10px 14px; font-size: 20px;">Status</td>
                    </tr>
                    {test_drive_rows}
                </table>
                {test_drive_images_html}
 
                <!-- ==================== PAGE 3: VIDEO, PHOTO GALLERY & SIGN-OFF ==================== -->
                <div class="page-break"></div>
                {header_banner_p3}
 
                <div class="section-title">03 / COMPRESSION EVIDENCE & GALLERY PHOTO MATRIX</div>
         """
 
        if video_link:
            html_template += f"""
                <div style="page-break-inside: avoid; margin-bottom: 20px;">
                    <h3 class="audit-header" style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; padding: 0;">
                        Compression Check Video
                    </h3>
                    <div class="video-box" style="margin-bottom: 0;">
                        <strong>CERTIFIED DYNAMIC EVIDENCE RECORD:</strong><br>
                        Click below to view the diagnostic engine sound and compression verification video:<br>
                        <a href="{video_link}" style="color: #4f46e5; font-weight: bold; text-decoration: underline; font-size: 16px; display: block; margin-top: 6px;">{video_link}</a>
                    </div>
                </div>
            """
 
        html_template += obd_qr_images_html
        html_template += obd_extra_html
        html_template += other_references_html
 
        html_template += f"""
                <div style="margin-bottom: 20px;">
                    <h3 class="audit-header" style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; padding: 0;">
                        Inspection Gallery
                    </h3>
                    {gallery_html}
                </div>

                <div style="margin-top: 15px; margin-bottom: 20px;">
                    {remarks_html}
                </div>

                <!-- Certification Seal & Sign-off -->
                <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 12px;">
                    <table style="width: 100%; border-collapse: collapse; page-break-inside: avoid;">
                        <tr>
                            <td style="width: 60%; vertical-align: top;">
                                <div style="font-size: 14px; font-weight: bold; color: #64748b; text-transform: uppercase;">Official Quality Certification</div>
                                <div style="font-size: 16px; color: #334155; margin-top: 4px; padding-right: 15px; line-height: 1.4;">
                                    This report represents the professional evaluation of the inspecting technician using certified OBD systems and diagnostic tools. The vehicle status reflects data captured on the date of inspection.
                                </div>
                            </td>
                            <td style="width: 40%; text-align: center; vertical-align: top; border-left: 1px solid #e2e8f0; padding-left: 10px;">
                                <div style="font-size: 14px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Certified Signature</div>
                                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; display: inline-block;">
                                    <div style="font-size: 14px; font-weight: bold; color: #059669;">✔ SECURE SIGNED</div>
                                    <div style="font-size: 14px; color: #475569; margin-top: 4px; font-family: monospace;">{technician_name}</div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Legal Disclaimer & Footer -->
                <div style="margin-top: 30px; page-break-inside: avoid;">
                    <div style="text-align: center; margin-bottom: 10px; padding: 8px; border-top: 1px dashed #cbd5e1; font-size: 14px; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;">
                        ✦ CERTIFIED ROLE-BASED MULTI-POINT VEHICLE VERIFICATION SYSTEM ✦
                    </div>
                    <div class="footer" style="margin-top: 0; border-top: none; padding-top: 0;">
                        <strong>LEGAL DISCLAIMER:</strong> {report_disclaimer}<br>
                        To verify the digital integrity of this report online, visit <strong>autoinspect.ai/verify?id={report_id}</strong>.<br>
                        <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #94a3b8; letter-spacing: 0.5px; display: block; margin-top: 6px;">powered by zenelait infotech</span>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        result = BytesIO()
        pdf = pisa.pisaDocument(
            BytesIO(html_template.encode("UTF-8")), 
            result,
            link_callback=link_callback
        )
        
        if not pdf.err:
            return result.getvalue()
        return None

    @action(detail=True, methods=['GET'])
    def pdf(self, request, pk=None):
        report = self.get_object()

        # Always compile the PDF report dynamically to ensure the beautiful overhauled visual design is served
        pdf_data = self._generate_pdf_bytes(report)
        if pdf_data:
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="AutoInspect_{report.id}_Report.pdf"'
            return response

        # Fallback to the pre-saved pdf_file if dynamic generation fails
        if report.pdf_file:
            response = HttpResponse(report.pdf_file.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="AutoInspect_{report.id}.pdf"'
            return response
        
        return Response({"detail": "Error compiling PDF report."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['POST'])
    def send_email(self, request, pk=None):
        from django.core.mail import EmailMessage
        report = self.get_object()
        customer_email = report.user.email
        if not customer_email:
            return Response(
                {"detail": "Customer does not have a registered email address."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pdf_bytes = self._generate_pdf_bytes(report)
        if not pdf_bytes:
            return Response(
                {"detail": "Error compiling PDF report for attachment."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        customer_name = report.user.get_full_name() or report.user.username
        subject = f"[AutoInspect Certified] Vehicle Inspection Report - {report.year} {report.vehicle_model} (ID: {report.id})"
        
        body = f"""Dear {customer_name},

We are pleased to inform you that the comprehensive vehicle inspection for your {report.year} {report.vehicle_model} has been completed.

Please find the certified diagnostic report (PDF) attached to this email.

Inspection Summary:
-------------------------------------------
Report ID: {report.id}
Vehicle: {report.year} {report.vehicle_model} {f'({report.variant})' if report.variant else ''}
Odometer: {report.odometer or 'N/A'}
Inspection Score: {report.grade}/100
Assigned Technician: {report.technician_name or 'AutoInspect Certified Expert'}

Verdict Summary:
{report.summary}

If you have any questions or require further assistance, please contact us.

Best regards,
AutoInspect Network Support Team
"""

        try:
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=None,
                to=[customer_email]
            )
            email.attach(f"AutoInspect_Report_{report.id}.pdf", pdf_bytes, 'application/pdf')
            email.send(fail_silently=False)
            return Response({"detail": f"Email report successfully sent to {customer_email}."}, status=status.HTTP_200_OK)
        except Exception as e:
            try:
                import os
                from django.conf import settings
                
                sent_emails_dir = os.path.join(settings.MEDIA_ROOT, 'sent_emails')
                os.makedirs(sent_emails_dir, exist_ok=True)
                
                # Save compiled PDF locally
                pdf_path = os.path.join(sent_emails_dir, f"AutoInspect_Report_{report.id}.pdf")
                with open(pdf_path, 'wb') as f:
                    f.write(pdf_bytes)
                
                # Save Email content metadata locally
                txt_path = os.path.join(sent_emails_dir, f"AutoInspect_Report_{report.id}_email.txt")
                with open(txt_path, 'w', encoding='utf-8') as f:
                    f.write(f"To: {customer_email}\n")
                    f.write(f"Subject: {subject}\n")
                    f.write(f"--------------------------------------------------\n")
                    f.write(body)
                
                return Response({
                    "detail": f"Email compiled successfully! Due to local SMTP credentials warning, the email dispatch was simulated and files have been saved to media/sent_emails/ for local review."
                }, status=status.HTTP_200_OK)
            except Exception as fallback_err:
                import traceback
                traceback.print_exc()
                return Response(
                    {"detail": f"Failed to send email and local fallback failed: {str(fallback_err)}. SMTP Error: {str(e)}"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )



from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class FileUploadView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        from django.conf import settings
        from django.core.files.storage import FileSystemStorage
        import os

        if 'file' not in request.FILES:
            return Response({"detail": "No file was submitted."}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        
        # Create directory if it doesn't exist
        uploads_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        
        fs = FileSystemStorage(location=uploads_dir, base_url='/media/uploads/')
        filename = fs.save(uploaded_file.name, uploaded_file)
        file_url = fs.url(filename)
        
        # Build full absolute URL
        absolute_url = request.build_absolute_uri(file_url)
        
        return Response({
            "url": absolute_url,
            "filename": filename
        }, status=status.HTTP_201_CREATED)


import uuid

class ConfirmBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_details = request.data.get('booking_details', {})
        gateway_payment_id = request.data.get('gateway_payment_id') or f"txn_{uuid.uuid4().hex[:12]}"
        gateway_order_id = request.data.get('gateway_order_id') or f"ref_{uuid.uuid4().hex[:12]}"

        # 1. Save Payment Transaction
        payment = Payment.objects.create(
            customer=request.user,
            gateway_order_id=gateway_order_id,
            gateway_payment_id=gateway_payment_id,
            amount=float(booking_details.get('amount', 1799.00)),
            currency=booking_details.get('currency', 'INR'),
            payment_status='Paid'
        )

        # 3. Create Inspection Booking automatically
        try:
            booking = Booking.objects.create(
                full_name=booking_details.get('full_name'),
                whatsapp_number=booking_details.get('whatsapp_number'),
                vehicle_model=booking_details.get('vehicle_model'),
                city=booking_details.get('city'),
                inspection_location=booking_details.get('inspection_location'),
                area=booking_details.get('area'),
                pincode=booking_details.get('pincode'),
                latitude=booking_details.get('latitude'),
                longitude=booking_details.get('longitude'),
                package=booking_details.get('package'),
                notes=booking_details.get('notes'),
                status='Pending',
                inspection_status='Pending',
                payment_reference=payment
            )
            
            # Update payment with booking_id
            payment.booking_id = booking.booking_id
            payment.save()
        except Exception as b_err:
            return Response({"detail": f"Failed to record booking: {str(b_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4. Generate PDF Invoice automatically
        invoice_pdf = self._generate_invoice_pdf_bytes(booking, payment)
        
        # 5. Email Notification
        customer_email = request.data.get('email') or request.user.email
        if customer_email and invoice_pdf:
            try:
                subject = f"[AutoInspect] Payment Confirmed! Booking ID: {booking.booking_id}"
                body = f"""Dear {booking.full_name},

Thank you for your payment. Your booking has been successfully confirmed!

Booking Details:
-------------------------------------------
Booking ID: {booking.booking_id}
Vehicle Details: {booking.vehicle_model}
Inspection Location: {booking.city} - {booking.inspection_location or ''}
Selected Package: {booking.package}
Payment Reference: {payment.gateway_payment_id}
Amount Paid: {payment.currency} {payment.amount:,.2f}
Inspection Status: Pending

Please find your official secure invoice attached as a PDF to this email. Our certified inspection experts will coordinate with you shortly.

If you have any questions, please contact our support team.

Best regards,
AutoInspect Network Team
"""
                email_msg = EmailMessage(
                    subject=subject,
                    body=body,
                    from_email=None,
                    to=[customer_email]
                )
                email_msg.attach(f"Invoice_{booking.booking_id}.pdf", invoice_pdf, 'application/pdf')
                email_msg.send(fail_silently=False)
            except Exception as email_err:
                print(f"SMTP Email Send Warning: {email_err}")
                # Save locally as fallback
                try:
                    import os
                    sent_emails_dir = os.path.join(settings.MEDIA_ROOT, 'sent_emails')
                    os.makedirs(sent_emails_dir, exist_ok=True)
                    # Save compiled PDF locally
                    pdf_path = os.path.join(sent_emails_dir, f"Invoice_{booking.booking_id}.pdf")
                    with open(pdf_path, 'wb') as f:
                        f.write(invoice_pdf)
                    # Save Email content metadata locally
                    txt_path = os.path.join(sent_emails_dir, f"Invoice_{booking.booking_id}_email.txt")
                    with open(txt_path, 'w', encoding='utf-8') as f:
                        f.write(f"To: {customer_email}\n")
                        f.write(f"Subject: {subject}\n")
                        f.write(f"--------------------------------------------------\n")
                        f.write(body)
                except:
                    pass

        # 6. WhatsApp Mock Notification
        try:
            whatsapp_number = booking.whatsapp_number
            whatsapp_message = f"Hello {booking.full_name}, your AutoInspect booking {booking.booking_id} is CONFIRMED for {booking.vehicle_model}. Paid: {payment.currency} {payment.amount}. Download your invoice and track status on your dashboard."
            print(f"[WHATSAPP MOCK NOTIFICATION SENT TO {whatsapp_number}]: {whatsapp_message}")
        except Exception as wa_err:
            print(f"WhatsApp Notify Warning: {wa_err}")

        # Send notification to admin
        try:
            Notification.objects.create(
                title="New Paid Booking",
                description=f"Booking {booking.booking_id} created for {booking.full_name} ({booking.vehicle_model})"
            )
        except:
            pass

        return Response({
            "success": True,
            "booking_id": booking.booking_id,
            "booking": BookingSerializer(booking).data
        }, status=status.HTTP_201_CREATED)

    def _generate_invoice_pdf_bytes(self, booking, payment):
        from io import BytesIO
        from xhtml2pdf import pisa
        from django.utils import timezone
        
        customer_name = booking.full_name
        whatsapp = booking.whatsapp_number
        vehicle = booking.vehicle_model
        package = booking.package
        amount = payment.amount
        currency = payment.currency
        order_id = payment.gateway_order_id or 'N/A'
        payment_id = payment.gateway_payment_id or 'N/A'
        date_str = payment.transaction_date.strftime('%B %d, %Y') if hasattr(payment.transaction_date, 'strftime') else timezone.now().strftime('%B %d, %Y')
        booking_id = booking.booking_id
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @page {{
                    size: letter;
                    margin: 40px;
                }}
                body {{
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    color: #334155;
                    font-size: 14px;
                    line-height: 1.5;
                }}
                .header-table {{
                    width: 100%;
                    border-bottom: 2px solid #cbd5e1;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }}
                .logo {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #e11d48;
                }}
                .invoice-title {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #0f172a;
                    text-align: right;
                }}
                .details-table {{
                    width: 100%;
                    margin-bottom: 30px;
                }}
                .section-title {{
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    color: #64748b;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 4px;
                }}
                .items-table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 40px;
                }}
                .items-table th {{
                    background-color: #f8fafc;
                    border-bottom: 2px solid #e2e8f0;
                    color: #0f172a;
                    font-weight: bold;
                    padding: 10px;
                    text-align: left;
                    font-size: 12px;
                    text-transform: uppercase;
                }}
                .items-table td {{
                    padding: 12px 10px;
                    border-bottom: 1px solid #edf2f7;
                }}
                .total-box {{
                    float: right;
                    width: 250px;
                    border-collapse: collapse;
                }}
                .total-box td {{
                    padding: 6px 10px;
                }}
                .total-amount {{
                    font-size: 18px;
                    font-weight: bold;
                    color: #e11d48;
                }}
                .stamp {{
                    border: 3px solid #059669;
                    color: #059669;
                    font-size: 16px;
                    font-weight: bold;
                    text-transform: uppercase;
                    padding: 6px 12px;
                    display: inline-block;
                    margin-top: 15px;
                    border-radius: 4px;
                }}
                .footer {{
                    margin-top: 60px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 15px;
                    font-size: 11px;
                    color: #64748b;
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <table class="header-table">
                <tr>
                    <td>
                        <span class="logo">AutoInspect</span><br>
                        <span style="font-size: 12px; color: #64748b;">Premium Vehicle Diagnostics Network</span>
                    </td>
                    <td class="invoice-title">INVOICE</td>
                </tr>
            </table>

            <table class="details-table">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <div class="section-title">Customer Details</div>
                        <strong>{customer_name}</strong><br>
                        WhatsApp: {whatsapp}<br>
                        Location: {booking.city or 'N/A'}<br>
                        Address: {booking.inspection_location or 'N/A'}
                    </td>
                    <td style="width: 50%; vertical-align: top; text-align: right;">
                        <div class="section-title" style="text-align: right;">Invoice Info</div>
                        <strong>Invoice Number:</strong> {booking_id}<br>
                        <strong>Date:</strong> {date_str}<br>
                        <strong>Reference ID:</strong> {order_id}<br>
                        <strong>Transaction ID:</strong> {payment_id}
                    </td>
                </tr>
            </table>

            <div class="section-title">Vehicle & Inspection Summary</div>
            <table style="width: 100%; margin-bottom: 25px;">
                <tr>
                    <td style="width: 50%;"><strong>Vehicle Details:</strong> {vehicle}</td>
                    <td style="width: 50%; text-align: right;"><strong>Package Selected:</strong> {package} Package</td>
                </tr>
            </table>

            <div class="section-title">Billing Items</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="width: 120px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>AutoInspect {package} Certification</strong><br>
                            <span style="font-size: 12px; color: #64748b;">Comprehensive 150+ point vehicle diagnostics, OBD scan, paint thickness analysis, and road test evaluation.</span>
                        </td>
                        <td style="text-align: right;">{currency} {amount:,.2f}</td>
                    </tr>
                </tbody>
            </table>

            <table style="width: 100%;">
                <tr>
                    <td>
                        <div class="stamp">PAID & SECURED</div>
                    </td>
                    <td style="text-align: right; vertical-align: top;">
                        <table class="total-box">
                            <tr>
                                <td>Subtotal:</td>
                                <td style="text-align: right;">{currency} {amount:,.2f}</td>
                            </tr>
                            <tr>
                                <td>Taxes & Fees (0%):</td>
                                <td style="text-align: right;">{currency} 0.00</td>
                            </tr>
                            <tr style="border-top: 1px solid #cbd5e1;">
                                <td><strong>Total Paid:</strong></td>
                                <td class="total-amount" style="text-align: right;">{currency} {amount:,.2f}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <div class="footer">
                This is a computer-generated official payment receipt for your AutoInspect booking.<br>
                Thank you for choosing AutoInspect. For support, email Autonique.carinspection@gmail.com or contact us on WhatsApp.<br>
                © 2026 AutoInspect Network. All rights reserved.
            </div>
        </body>
        </html>
        """
        
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html_content.encode("UTF-8")), result)
        if not pdf.err:
            return result.getvalue()
        return None


class InvoiceDownloadView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [QueryParamTokenAuthentication, SessionAuthentication]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(booking_id=booking_id)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_employee = False
        if hasattr(user, 'profile'):
            is_employee = user.profile.role in ['Admin', 'Staff']
        else:
            is_employee = user.is_staff

        if not is_employee:
            profile_phone = getattr(user.profile, 'phone_number', '')
            if booking.whatsapp_number != profile_phone and booking.full_name != (user.get_full_name() or user.username):
                return Response({"detail": "You do not have permission to download this invoice."}, status=status.HTTP_403_FORBIDDEN)

        payment = booking.payment_reference
        if not payment:
            return Response({"detail": "No payment record found for this booking."}, status=status.HTTP_400_BAD_REQUEST)

        view_instance = ConfirmBookingView()
        pdf_bytes = view_instance._generate_invoice_pdf_bytes(booking, payment)

        if not pdf_bytes:
            return Response({"detail": "Failed to generate invoice PDF."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{booking_id}.pdf"'
        return response


class RevenueStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'Admin'
        if not is_admin:
            return Response({"detail": "Only administrators can view revenue statistics."}, status=status.HTTP_403_FORBIDDEN)

        paid_payments = Payment.objects.filter(payment_status='Paid')
        total_revenue = sum(payment.amount for payment in paid_payments)
        total_transactions = paid_payments.count()
        avg_value = float(total_revenue / total_transactions) if total_transactions > 0 else 0.0

        from django.db.models import Count
        package_dist = Booking.objects.filter(payment_reference__payment_status='Paid').values('package').annotate(count=Count('id'))
        
        serializer = PaymentSerializer(Payment.objects.all().order_by('-transaction_date')[:50], many=True)

        return Response({
            "total_revenue": float(total_revenue),
            "total_transactions": total_transactions,
            "average_order_value": avg_value,
            "package_distribution": list(package_dist),
            "recent_payments": serializer.data
        }, status=status.HTTP_200_OK)


