from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Booking, UserProfile, InspectionReport
from rest_framework.authtoken.models import Token

class BookingAPITests(APITestCase):
    def setUp(self):
        self.valid_payload = {
            "full_name": "John Doe",
            "whatsapp_number": "+971 50 123 4567",
            "vehicle_model": "2023 Porsche 911",
            "city": "Dubai Marina",
            "package": "Premium",
            "notes": "Please check the brakes thoroughly."
        }
        self.invalid_payload = {
            "whatsapp_number": "+971 50 123 4567",
            "vehicle_model": "2023 Porsche 911",
            "city": "Dubai Marina",
            "package": "Premium"
        }

    def test_create_booking_success(self):
        """Ensure we can create a new booking."""
        url = reverse('booking-list')
        response = self.client.post(url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        booking = Booking.objects.first()
        self.assertEqual(booking.full_name, "John Doe")
        self.assertEqual(booking.status, "Pending")

    def test_create_booking_missing_field(self):
        """Ensure booking creation fails if required fields are missing."""
        url = reverse('booking-list')
        response = self.client.post(url, self.invalid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Booking.objects.count(), 0)

    def test_get_bookings_list(self):
        """Ensure we can retrieve the list of bookings."""
        admin_user = User.objects.create_superuser(
            username="admin_list_test",
            email="admin_list@autoinspect.com",
            password="adminpassword"
        )
        UserProfile.objects.create(
            user=admin_user,
            role="Admin"
        )
        token, _ = Token.objects.get_or_create(user=admin_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        Booking.objects.create(
            full_name="Jane Smith",
            whatsapp_number="+971 50 987 6543",
            vehicle_model="2021 BMW M3",
            city="Downtown Dubai",
            package="Standard"
        )
        url = reverse('booking-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['full_name'], "Jane Smith")


class AuthAndReportAPITests(APITestCase):
    def setUp(self):
        # Create an admin user
        self.admin_user = User.objects.create_superuser(
            username="adminuser",
            email="admin@autoinspect.com",
            password="adminpassword"
        )
        self.admin_profile = UserProfile.objects.create(
            user=self.admin_user,
            phone_number="123456",
            city="Dubai",
            role="Admin"
        )
        self.admin_token, _ = Token.objects.get_or_create(user=self.admin_user)

        # Create a regular customer user
        self.customer_user = User.objects.create_user(
            username="custuser",
            email="cust@autoinspect.com",
            password="custpassword"
        )
        self.customer_profile = UserProfile.objects.create(
            user=self.customer_user,
            phone_number="789012",
            city="Abu Dhabi",
            role="User"
        )
        self.customer_token, _ = Token.objects.get_or_create(user=self.customer_user)

        # Create another customer user to check isolation
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="other@autoinspect.com",
            password="otherpassword"
        )
        self.other_profile = UserProfile.objects.create(
            user=self.other_user,
            role="User"
        )
        self.other_token, _ = Token.objects.get_or_create(user=self.other_user)

        # Create an inspection report for the main customer
        self.report = InspectionReport.objects.create(
            id="REP-TEST001",
            user=self.customer_user,
            vehicle_model="Porsche 911 GT3",
            year=2023,
            grade=98,
            package="Premium",
            city="Dubai",
            summary="Excellent condition.",
            obd_status="Clean",
            obd_codes=[],
            paint_status="Original",
            paint_panels=[],
            checks=[
                {
                    "category": "Engine",
                    "items": [{"name": "Oil Level", "status": "Pass", "desc": "Oil level is optimal"}]
                }
            ],
            technician_remarks="Stunning vehicle.",
            status="Completed"
        )

    def test_login_success_username(self):
        url = reverse('auth-login')
        payload = {"username": "custuser", "password": "custpassword"}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['role'], 'user')

    def test_login_success_email(self):
        url = reverse('auth-login')
        payload = {"username": "cust@autoinspect.com", "password": "custpassword"}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['role'], 'user')

    def test_login_failure(self):
        url = reverse('auth-login')
        payload = {"username": "custuser", "password": "wrongpassword"}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_customer_by_admin(self):
        url = reverse('auth-register-customer')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        payload = {
            "username": "newcust",
            "email": "newcust@autoinspect.com",
            "first_name": "New",
            "last_name": "Customer",
            "password": "newpassword123",
            "phone_number": "555-0199",
            "city": "Sharjah"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newcust").exists())
        new_user = User.objects.get(username="newcust")
        self.assertEqual(new_user.profile.role, "User")
        self.assertEqual(new_user.profile.phone_number, "555-0199")

    def test_register_customer_by_non_admin_succeeds(self):
        url = reverse('auth-register-customer')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.customer_token.key)
        payload = {
            "username": "newcust2",
            "email": "newcust2@autoinspect.com",
            "password": "newpassword123"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_report_list_admin_sees_all(self):
        url = reverse('report-list')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_report_list_customer_sees_only_own(self):
        url = reverse('report-list')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.customer_token.key)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], "REP-TEST001")

        # Now test that other user sees 0 reports
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.other_token.key)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_report_create_by_customer_fails(self):
        url = reverse('report-list')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.customer_token.key)
        payload = {
            "id": "REP-HACK",
            "user": self.customer_user.id,
            "vehicle_model": "Fake Car",
            "year": 2020,
            "grade": 100,
            "package": "Premium",
            "city": "Dubai",
            "summary": "Fake summary",
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_report_pdf_download(self):
        url = reverse('report-pdf', kwargs={'pk': self.report.id})
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.customer_token.key)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn(f'attachment; filename="AutoInspect_{self.report.id}_Report.pdf"', response['Content-Disposition'])

    def test_report_create_by_admin_success(self):
        url = reverse('report-list')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        payload = {
            "id": "REP-ADMIN-CREATED",
            "user": self.customer_user.id,
            "vehicle_model": "Mercedes-AMG E63S",
            "year": 2022,
            "grade": 95,
            "package": "Premium",
            "city": "Abu Dhabi",
            "summary": "Meticulously maintained by the owner. Beautiful paint specs.",
            "obd_status": "Clean",
            "obd_codes": [],
            "paint_status": "Original",
            "paint_panels": [],
            "checks": [],
            "technician_remarks": "Highly recommended for purchase.",
            "video_link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "images": [
                "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70"
            ],
            "header_image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
            "car_make": "Mercedes-Benz",
            "registration_number": "A-99999",
            "vin_number": "WDD1234567890",
            "odometer": "25,000 km",
            "fuel_type": "Petrol",
            "transmission": "Automatic",
            "body_structural": "No structural anomalies detected.",
            "accidental_history": "No accident record.",
            "engine_gearbox": "Runs incredibly smooth.",
            "water_logged": "Passed inspection. Zero moisture.",
            "obd_errors": "No error codes logged."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(InspectionReport.objects.filter(id="REP-ADMIN-CREATED").exists())
        report = InspectionReport.objects.get(id="REP-ADMIN-CREATED")
        self.assertEqual(len(report.images), 2)
        self.assertEqual(report.video_link, "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        self.assertEqual(report.header_image, "https://images.unsplash.com/photo-1503376780353-7e6692767b70")

    def test_file_upload_success(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        
        file_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        uploaded_file = SimpleUploadedFile("test_image.png", file_data, content_type="image/png")
        
        url = reverse('file-upload')
        response = self.client.post(url, {'file': uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('url', response.data)
        self.assertIn('test_image', response.data['filename'])

    def test_file_upload_no_file_fails(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        url = reverse('file-upload')
        response = self.client.post(url, {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], "No file was submitted.")


class BookingLocationAssignmentTests(APITestCase):
    def setUp(self):
        # Create an admin user for management
        self.admin = User.objects.create_superuser(
            username="admin_test", email="admin_test@autoinspect.com", password="password123"
        )
        self.admin_profile = UserProfile.objects.create(user=self.admin, role="Admin")
        self.admin_token = Token.objects.create(user=self.admin)

        # Create two staff users
        self.staff_a = User.objects.create_user(
            username="staff_a", email="staff_a@autoinspect.com", password="password123"
        )
        self.profile_a = UserProfile.objects.create(
            user=self.staff_a,
            role="Staff",
            phone_number="111111",
            city="Dubai",
            area="Jebel Ali",
            pincode="33333",
            latitude=25.0748,
            longitude=55.1308
        )
        self.token_a = Token.objects.create(user=self.staff_a)

        self.staff_b = User.objects.create_user(
            username="staff_b", email="staff_b@autoinspect.com", password="password123"
        )
        self.profile_b = UserProfile.objects.create(
            user=self.staff_b,
            role="Staff",
            phone_number="222222",
            city="Dubai",
            area="Dubai Marina",
            pincode="44444",
            latitude=25.2048,
            longitude=55.2708
        )
        self.token_b = Token.objects.create(user=self.staff_b)

    def test_haversine_distance_assignment(self):
        """Verify automatic assignment to the nearest staff using coordinates."""
        # Booking coordinates (25.0800, 55.1400) are much closer to staff_a (25.0748, 55.1308) than staff_b (25.2048, 55.2708)
        booking = Booking.objects.create(
            full_name="Customer Near A",
            whatsapp_number="+971501111111",
            vehicle_model="Tesla Model 3",
            city="Dubai",
            area="Jebel Ali Area",
            pincode="33333",
            latitude=25.0800,
            longitude=55.1400,
            package="Standard"
        )
        self.assertEqual(booking.assigned_staff, self.staff_a)

    def test_pincode_fallback_assignment(self):
        """Verify fallback to exact pincode when coordinates are not provided."""
        booking = Booking.objects.create(
            full_name="Customer Pincode Match",
            whatsapp_number="+971502222222",
            vehicle_model="Toyota Camry",
            city="Dubai",
            package="Standard",
            pincode="44444"
        )
        self.assertEqual(booking.assigned_staff, self.staff_b)

    def test_area_fallback_assignment(self):
        """Verify fallback to area keyword matching when coordinates/pincode mismatch/empty."""
        booking = Booking.objects.create(
            full_name="Customer Area Match",
            whatsapp_number="+971503333333",
            vehicle_model="Nissan Patrol",
            city="Dubai",
            package="Standard",
            area="Jebel Ali Community"
        )
        self.assertEqual(booking.assigned_staff, self.staff_a)

    def test_city_fallback_assignment(self):
        """Verify fallback to city keyword matching when other fields do not match."""
        # Let's create an Abu Dhabi staff member
        staff_c = User.objects.create_user(
            username="staff_c", email="staff_c@autoinspect.com", password="password123"
        )
        UserProfile.objects.create(
            user=staff_c,
            role="Staff",
            city="Abu Dhabi"
        )
        
        booking = Booking.objects.create(
            full_name="Customer City Match",
            whatsapp_number="+971504444444",
            vehicle_model="Ford Mustang",
            city="Abu Dhabi",
            package="Standard"
        )
        self.assertEqual(booking.assigned_staff, staff_c)

    def test_staff_dashboard_rbac_isolation(self):
        """Verify that staff can only list and see their assigned bookings."""
        # Booking for staff_a
        booking_a = Booking.objects.create(
            full_name="Booking A",
            whatsapp_number="+971505555555",
            vehicle_model="Audi A6",
            city="Dubai",
            package="Standard",
            latitude=25.0748,
            longitude=55.1308
        )
        # Booking for staff_b
        booking_b = Booking.objects.create(
            full_name="Booking B",
            whatsapp_number="+971506666666",
            vehicle_model="Audi Q7",
            city="Dubai",
            package="Standard",
            latitude=25.2048,
            longitude=55.2708
        )

        url = reverse('booking-list')

        # Request as staff_a
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_a.key)
        response_a = self.client.get(url, format='json')
        self.assertEqual(response_a.status_code, status.HTTP_200_OK)
        # Staff must only see matched/assigned bookings
        self.assertEqual(len(response_a.data), 1)

        # Request as staff_b
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token_b.key)
        response_b = self.client.get(url, format='json')
        self.assertEqual(response_b.status_code, status.HTTP_200_OK)
        # Staff must only see matched/assigned bookings
        self.assertEqual(len(response_b.data), 1)

        # Request as admin
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        response_admin = self.client.get(url, format='json')
        self.assertEqual(response_admin.status_code, status.HTTP_200_OK)
        # Admin should see both bookings
        self.assertEqual(len(response_admin.data), 2)



