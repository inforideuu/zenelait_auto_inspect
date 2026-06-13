from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    # Fields to display in the list view
    list_display = (
        'full_name',
        'vehicle_model',
        'package',
        'city',
        'status',
        'created_at',
    )
    
    # Enable filtering by these fields in the sidebar
    list_filter = (
        'status',
        'package',
        'city',
        'created_at',
    )
    
    # Enable search on these fields
    search_fields = (
        'full_name',
        'whatsapp_number',
        'vehicle_model',
        'notes',
    )
    
    # Default ordering
    ordering = ('-created_at',)
    
    # Read-only fields
    readonly_fields = ('created_at', 'updated_at')
    
    # Fieldset layout for editing/viewing in the admin
    fieldsets = (
        ('Customer Info', {
            'fields': ('full_name', 'whatsapp_number')
        }),
        ('Vehicle & Details', {
            'fields': ('vehicle_model', 'city', 'package')
        }),
        ('Status & Notes', {
            'fields': ('status', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
