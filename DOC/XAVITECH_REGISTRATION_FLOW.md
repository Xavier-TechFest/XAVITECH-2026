# XAVITECH 2026 — Registration Flow

## User Flow

```text
XAVITECH Website
      ↓
Google Login
      ↓
Firebase Authentication
      ↓
Select Event
      ↓
Individual / Team
      ↓
Participant Details
      ↓
Team Event → Team Leader Adds Members
      ↓
Review Registration
      ↓
Payment
      ↓
Payment Verification
      ↓
Registration Confirmed
      ↓
Registration ID + QR / Digital Pass
      ↓
Confirmation Email
      ↓
Event Day → QR Scan / Check-in
```

## Team Registration

- Team Leader logs in with Google.
- Team Leader creates the team.
- Team Leader adds all required team members.
- Team members do not need separate login.
- Team Leader completes the payment and registration.

## Registration Status

```text
DRAFT
  ↓
PAYMENT_PENDING
  ↓
PAYMENT_SUCCESS
  ↓
CONFIRMED
```

If payment fails:

```text
PAYMENT_FAILED
```

## Notes

- Google Login is mandatory before registration.
- Firebase Authentication will handle login.
- Event-wise team size, fees, and exact participant fields will be configured later.
- Backend should keep the registration system flexible for these changes.
