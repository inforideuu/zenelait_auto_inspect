from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Booking, UserProfile, InspectionReport, Notification, Payment

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'city', 'area', 'pincode', 'latitude', 'longitude', 'role']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'is_staff']
        read_only_fields = ['id', 'is_staff']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        # Support logging in by email as well as username
        user = None
        if '@' in username:
            try:
                user = User.objects.get(email=username)
                username = user.username
            except User.DoesNotExist:
                pass
        
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials provided.")
        
        data['user'] = user
        return data


class RegisterCustomerSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    city = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'phone_number', 'city']

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        city = validated_data.pop('city', '')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=password
        )
        
        # Create user profile
        UserProfile.objects.create(
            user=user,
            phone_number=phone_number,
            city=city,
            role='User'
        )
        return user


class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'customer',
            'customer_name',
            'booking_id',
            'razorpay_order_id',
            'razorpay_payment_id',
            'amount',
            'currency',
            'payment_status',
            'transaction_date'
        ]
        read_only_fields = ['id', 'transaction_date']

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username


class BookingSerializer(serializers.ModelSerializer):
    assigned_staff_name = serializers.SerializerMethodField()
    assigned_staff_email = serializers.SerializerMethodField()
    payment_reference_details = PaymentSerializer(source='payment_reference', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_id',
            'payment_reference',
            'payment_reference_details',
            'full_name',
            'whatsapp_number',
            'vehicle_model',
            'city',
            'inspection_location',
            'area',
            'pincode',
            'latitude',
            'longitude',
            'assigned_staff',
            'assigned_staff_name',
            'assigned_staff_email',
            'package',
            'notes',
            'status',
            'accepted_at',
            'accepted_by',
            'travel_started_at',
            'reached_location_at',
            'inspection_status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'booking_id', 'created_at', 'updated_at']

    def get_assigned_staff_name(self, obj):
        if obj.assigned_staff:
            return obj.assigned_staff.get_full_name() or obj.assigned_staff.username
        return None

    def get_assigned_staff_email(self, obj):
        if obj.assigned_staff:
            return obj.assigned_staff.email
        return None


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'description', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


class InspectionReportSerializer(serializers.ModelSerializer):
    assigned_customer_name = serializers.SerializerMethodField()
    assigned_customer_email = serializers.SerializerMethodField()
    assigned_customer_phone = serializers.SerializerMethodField()

    class Meta:
        model = InspectionReport
        fields = [
            'id',
            'user',
            'assigned_customer_name',
            'assigned_customer_email',
            'assigned_customer_phone',
            'vehicle_model',
            'year',
            'grade',
            'package',
            'city',
            'date',
            'summary',
            'obd_status',
            'obd_codes',
            'paint_status',
            'paint_panels',
            'checks',
            'technician_remarks',
            'disclaimer',
            'status',
            'pdf_file',
            'video_link',
            'car_make',
            'registration_number',
            'vin_number',
            'odometer',
            'fuel_type',
            'transmission',
            'body_structural',
            'accidental_history',
            'engine_gearbox',
            'water_logged',
            'obd_errors',
            'images',
            'other_references',
            'obd_qr_images',
            'obd_pdf',
            'obd_video_url',
            'header_image',
            'variant',
            'engine_number',
            'insurance_details',
            'customer_address',
            'booking_id',
            'technician_name',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_assigned_customer_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_assigned_customer_email(self, obj):
        return obj.user.email

    def get_assigned_customer_phone(self, obj):
        try:
            return obj.user.profile.phone_number or ""
        except Exception:
            return ""
