from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Phone Number")
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="City")
    area = models.CharField(max_length=100, blank=True, null=True, verbose_name="Area")
    pincode = models.CharField(max_length=20, blank=True, null=True, verbose_name="Pincode")
    latitude = models.FloatField(blank=True, null=True, verbose_name="Latitude")
    longitude = models.FloatField(blank=True, null=True, verbose_name="Longitude")
    role = models.CharField(
        max_length=20, 
        choices=[('Admin', 'Admin'), ('Staff', 'Staff'), ('User', 'User')], 
        default='User',
        verbose_name="User Role"
    )

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Payment(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Failed', 'Failed'),
    ]

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments', verbose_name="Customer")
    booking_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="Booking ID")
    razorpay_order_id = models.CharField(max_length=255, unique=True, verbose_name="Razorpay Order ID")
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True, verbose_name="Razorpay Payment ID")
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Amount")
    currency = models.CharField(max_length=10, default='INR', verbose_name="Currency")
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', verbose_name="Payment Status")
    transaction_date = models.DateTimeField(auto_now_add=True, verbose_name="Transaction Date")

    class Meta:
        ordering = ['-transaction_date']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"{self.customer.username} - {self.razorpay_order_id} ({self.payment_status})"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    booking_id = models.CharField(max_length=50, blank=True, null=True, unique=True, verbose_name="Booking ID")
    payment_reference = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings',
        verbose_name="Payment Reference"
    )
    full_name = models.CharField(max_length=255, verbose_name="Full Name")
    whatsapp_number = models.CharField(max_length=50, verbose_name="WhatsApp Number")
    vehicle_model = models.CharField(max_length=255, verbose_name="Vehicle Model")
    city = models.CharField(max_length=100, verbose_name="City / Location")
    inspection_location = models.CharField(max_length=255, blank=True, null=True, verbose_name="Inspection Location")
    area = models.CharField(max_length=100, blank=True, null=True, verbose_name="Area")
    pincode = models.CharField(max_length=20, blank=True, null=True, verbose_name="Pincode")
    latitude = models.FloatField(blank=True, null=True, verbose_name="Latitude")
    longitude = models.FloatField(blank=True, null=True, verbose_name="Longitude")
    assigned_staff = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_bookings', 
        verbose_name="Assigned Staff"
    )
    package = models.CharField(max_length=100, verbose_name="Inspection Package")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='Pending',
        verbose_name="Booking Status"
    )
    accepted_at = models.DateTimeField(blank=True, null=True, verbose_name="Accepted At")
    accepted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='accepted_bookings',
        verbose_name="Accepted By"
    )
    travel_started_at = models.DateTimeField(blank=True, null=True, verbose_name="Travel Started At")
    reached_location_at = models.DateTimeField(blank=True, null=True, verbose_name="Reached Location At")
    inspection_status = models.CharField(
        max_length=50,
        default='Pending',
        verbose_name="Inspection Status"
    )
    assignment_method = models.CharField(
        max_length=50,
        choices=[('Auto Assigned', 'Auto Assigned'), ('Manually Assigned', 'Manually Assigned'), ('Unassigned', 'Unassigned')],
        default='Unassigned',
        verbose_name="Assignment Method"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"

    def __str__(self):
        return f"{self.booking_id or 'New'} - {self.full_name} - {self.vehicle_model} ({self.package})"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        
        # Auto-generate a unique booking ID if not provided
        if not self.booking_id:
            import random
            import string
            self.booking_id = f"BKG-{''.join(random.choices(string.digits, k=6))}"
            
        if is_new:
            if self.assigned_staff:
                self.assignment_method = 'Manually Assigned'
                self.inspection_status = 'Assigned to Staff'
            else:
                self.assign_nearest_staff()
        else:
            # For update, check if assigned_staff has changed
            orig = Booking.objects.filter(pk=self.pk).first()
            if orig:
                if self.assigned_staff != orig.assigned_staff:
                    if self.assigned_staff:
                        if self.assignment_method not in ['Auto Assigned', 'Manually Assigned']:
                            self.assignment_method = 'Manually Assigned'
                        self.inspection_status = 'Assigned to Staff'
                        print(f"[Manual Assignment] Booking {self.booking_id} assigned to {self.assigned_staff.username} (Method: {self.assignment_method}).")
                    else:
                        self.assignment_method = 'Unassigned'
                        self.inspection_status = 'Unassigned'
                        print(f"[Assignment Cleared] Booking {self.booking_id} cleared and marked as Unassigned.")
        
        # Ensure status transitions are logical
        if self.assigned_staff:
            if self.inspection_status in ['Pending', 'Pending Assignment', 'Unassigned']:
                self.inspection_status = 'Assigned to Staff'
        else:
            self.assignment_method = 'Unassigned'
            if self.inspection_status not in ['Pending Assignment', 'Unassigned', 'Pending']:
                self.inspection_status = 'Unassigned'
            
        super().save(*args, **kwargs)

    def assign_nearest_staff(self):
        import math
        from django.contrib.auth.models import User
        from django.conf import settings

        staff_members = User.objects.filter(profile__role='Staff', is_active=True)
        if not staff_members.exists():
            self.assigned_staff = None
            self.assignment_method = 'Unassigned'
            self.inspection_status = 'Unassigned'
            return

        radius_limit = getattr(settings, 'NEAREST_SERVICE_RADIUS', 15.0)
        matched_staff_list = []

        # Rules: same pincode OR same area OR within nearest service radius OR same city
        for staff in staff_members:
            prof = getattr(staff, 'profile', None)
            if not prof:
                continue

            matched = False
            distance = None
            priority = 999  # Lower number is higher priority

            # Check Pincode matching
            if self.pincode and prof.pincode:
                if self.pincode.strip().lower() == prof.pincode.strip().lower():
                    matched = True
                    priority = min(priority, 1)

            # Check Area matching (flexible keyword matching)
            if self.area and prof.area:
                a1 = self.area.strip().lower()
                a2 = prof.area.strip().lower()
                if a1 in a2 or a2 in a1:
                    matched = True
                    priority = min(priority, 2)

            # Check Radius matching
            if self.latitude is not None and self.longitude is not None and prof.latitude is not None and prof.longitude is not None:
                try:
                    lat1, lon1 = float(self.latitude), float(self.longitude)
                    lat2, lon2 = float(prof.latitude), float(prof.longitude)
                    
                    R = 6371.0  # Earth radius in km
                    dlat = math.radians(lat2 - lat1)
                    dlon = math.radians(lon2 - lon1)
                    a = (math.sin(dlat / 2)**2 + 
                         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
                         math.sin(dlon / 2)**2)
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                    distance = R * c
                    
                    if distance <= radius_limit:
                        matched = True
                        priority = min(priority, 3)
                except Exception:
                    pass

            # Check City matching (fallback keyword matching)
            if self.city and prof.city:
                c1 = self.city.strip().lower()
                c2 = prof.city.strip().lower()
                if c1 in c2 or c2 in c1:
                    matched = True
                    priority = min(priority, 4)

            if matched:
                matched_staff_list.append((staff, priority, distance))

        if matched_staff_list:
            # Sort by priority first (1 is highest), then by distance (if distance is not None)
            matched_staff_list.sort(key=lambda x: (x[1], x[2] is None, x[2] if x[2] is not None else 0))
            chosen_staff = matched_staff_list[0][0]
            self.assigned_staff = chosen_staff
            self.assignment_method = 'Auto Assigned'
            self.inspection_status = 'Assigned to Staff'
            print(f"[Auto Assignment] Booking {self.booking_id} automatically assigned to {chosen_staff.username} (Reason: location match, priority {matched_staff_list[0][1]}).")
        else:
            self.assigned_staff = None
            self.assignment_method = 'Unassigned'
            self.inspection_status = 'Unassigned'
            print(f"[Auto Assignment] Booking {self.booking_id} marked as Unassigned (No active staff matches pincode, area, or radius).")


class InspectionReport(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    id = models.CharField(max_length=50, primary_key=True, unique=True, verbose_name="Report ID") # e.g. REP-911GT3
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports', verbose_name="Assigned Customer")
    vehicle_model = models.CharField(max_length=255, verbose_name="Vehicle Model")
    year = models.IntegerField(verbose_name="Vehicle Year")
    grade = models.IntegerField(default=100, verbose_name="Inspection Score (0-100)")
    package = models.CharField(max_length=100, verbose_name="Package Plan")
    city = models.CharField(max_length=100, verbose_name="Inspection City")
    date = models.DateField(auto_now_add=True, verbose_name="Inspection Date")
    summary = models.TextField(verbose_name="Inspector Verdict Summary")
    
    # Details in JSON matching sample reports
    obd_status = models.CharField(max_length=50, default='Clean') # "Clean", "Faults Detected"
    obd_codes = models.JSONField(default=list, blank=True) # [{code: 'C1201', desc: '...', severity: 'Low'}]
    paint_status = models.CharField(max_length=50, default='Original') # "Original", "Refinished Panel"
    paint_panels = models.JSONField(default=list, blank=True) # [{name: 'Hood', value: 112, original: true}]
    checks = models.JSONField(default=list, blank=True) # [{category: '...', items: [{name: '...', status: 'Pass', desc: '...'}]}]
    
    technician_remarks = models.TextField(blank=True, null=True, verbose_name="Technician Remarks")
    disclaimer = models.TextField(default="This is an official secure document compiled by AutoInspect Network.")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', verbose_name="Report Status")
    pdf_file = models.FileField(upload_to='reports/', blank=True, null=True, verbose_name="Uploaded PDF Report File")
    video_link = models.URLField(max_length=500, blank=True, null=True, verbose_name="Walkaround Video Link")
    car_make = models.CharField(max_length=100, blank=True, null=True, verbose_name="Car Make")
    registration_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="Registration Number")
    vin_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="VIN Number")
    odometer = models.CharField(max_length=50, blank=True, null=True, verbose_name="Odometer Reading")
    fuel_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="Fuel Type")
    transmission = models.CharField(max_length=50, blank=True, null=True, verbose_name="Transmission")
    
    # New specs & safety/structural attention areas
    variant = models.CharField(max_length=100, blank=True, null=True, verbose_name="Vehicle Variant")
    engine_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="Engine Number")
    insurance_details = models.CharField(max_length=255, blank=True, null=True, verbose_name="Insurance Details")
    customer_address = models.TextField(blank=True, null=True, verbose_name="Customer Address")
    booking_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="Booking ID")
    technician_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Technician Name")
    
    # Attention Needed Areas
    body_structural = models.TextField(blank=True, null=True, verbose_name="Body & Structural State")
    accidental_history = models.TextField(blank=True, null=True, verbose_name="Accidental History")
    engine_gearbox = models.TextField(blank=True, null=True, verbose_name="Engine/Gearbox Performance")
    water_logged = models.TextField(blank=True, null=True, verbose_name="Water Logged Status")
    obd_errors = models.TextField(blank=True, null=True, verbose_name="OBD Scan Errors Details")

    header_image = models.TextField(blank=True, null=True, verbose_name="Header Image")
    images = models.JSONField(default=list, blank=True, verbose_name="Gallery Images") # list of image URLs or base64 strings
    other_references = models.JSONField(default=list, blank=True, verbose_name="Other References Images")
    obd_qr_images = models.JSONField(default=list, blank=True, verbose_name="OBD QR Images")
    obd_pdf = models.URLField(max_length=500, blank=True, null=True, verbose_name="OBD PDF Report Link")
    obd_video_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="OBD Video Link")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Inspection Report"
        verbose_name_plural = "Inspection Reports"

    def __str__(self):
        return f"{self.id} - {self.vehicle_model} for {self.user.get_full_name() or self.user.username}"


class Notification(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name="Booking"
    )
    title = models.CharField(max_length=255, verbose_name="Title")
    description = models.TextField(verbose_name="Description")
    is_read = models.BooleanField(default=False, verbose_name="Is Read")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"{self.title}: {self.description[:30]}"
