# Stripe Purchase Form - Data Output Specification

## Overview

This document defines the complete data structure that will be sent to your system when a purchase is completed through the Stripe payment form.

---

## Complete Data Structure

```json
{
  "plan": {
    "tier": "T1" | "T2" | "T3",
    "international": boolean,
    "overnight": boolean,
    "internationalAcknowledged": boolean
  },
  "trip": {
    "name": string,
    "dateStart": string (YYYY-MM-DD),
    "dateEnd": string (YYYY-MM-DD),
    "destCity": string,
    "destCountry": "US" | "CA" | "MX" | "OTHER",
    "adults": number,
    "minors": number,
    "originCity": string,
    "transport": "bus" | "flight" | "van" | "other" | "",
    "lodgingStatus": "booked" | "pending" | "none" | "",
    "notes": string
  },
  "addons": {
    "bgAdultsDomestic": number,
    "bgAdultsInternational": number
  },
  "org": {
    "orgName": string,
    "orgType": "k12" | "higher_ed" | "church" | "youth_sports" | "corporate" | "nonprofit" | "other",
    "role": string,
    "email": string,
    "phone": string,
    "taxExempt": boolean
  },
  "checkout": {
    "mode": "order" | "invoice" | "quote",
    "agreedToTerms": boolean,
    "agreedToAuthorization": boolean,
    "billingAddress": string,
    "apEmail": string,
    "poNumber": string
  },
  "pricing": {
    "tierPrice": number,
    "todayTotal": number,
    "postBilledTotal": number,
    "bgDomesticTotal": number,
    "bgInternationalTotal": number,
    "grandTotal": number
  }
}
```

---

## Field Descriptions

### 1. Plan Section

Configuration of the trip tier and travel type.

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `tier` | string | Yes | Selected trip tier | `"T1"`, `"T2"`, `"T3"` |
| `international` | boolean | Yes | Whether trip includes international travel | `true`, `false` |
| `overnight` | boolean | Yes | Whether trip includes overnight stay | `true`, `false` |
| `internationalAcknowledged` | boolean | No | Acknowledgment if international with non-T3 tier | `true`, `false` |

**Tier Breakdown:**

- **T1** - "Tier 1 — Day-trip essentials" ($450)
  - For local field trips, day trips, single overnight stays, in-state travel

- **T2** - "Tier 2 — Multi-day domestic" ($750)
  - For multi-day trips, out-of-state travel, multiple lodging sites

- **T3** - "Tier 3 — International/Complex" ($1,250)
  - For international travel, study abroad, mission trips, high-risk activities

---

### 2. Trip Section

Details about the trip being planned.

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `name` | string | Yes | Trip name or title | `"Spring 2025 Science Field Trip"` |
| `dateStart` | string | Yes | Trip start date (ISO 8601 format) | `"2025-03-15"` |
| `dateEnd` | string | Yes | Trip end date (ISO 8601 format) | `"2025-03-17"` |
| `destCity` | string | Yes | Destination city | `"San Francisco"` |
| `destCountry` | string | Yes | Destination country code | `"US"`, `"CA"`, `"MX"`, `"OTHER"` |
| `adults` | number | Yes | Number of adult participants | `8` |
| `minors` | number | Yes | Number of minor participants (can be 0) | `25` |
| `originCity` | string | No | Origin/departure city | `"Boston"` |
| `transport` | string | No | Primary mode of transportation | `"bus"`, `"flight"`, `"van"`, `"other"`, `""` |
| `lodgingStatus` | string | No | Status of lodging arrangements | `"booked"`, `"pending"`, `"none"`, `""` |
| `notes` | string | No | Additional trip notes/details | `"Will visit 3 science museums"` |

**Important Notes:**
- Date validation: `dateEnd` must be >= `dateStart`
- At least 1 adult is required
- Minors can be 0 or greater

---

### 3. Add-ons Section

Optional services selected for the trip.

| Field | Type | Required | Description | Pricing | Example Values |
|-------|------|----------|-------------|---------|----------------|
| `bgAdultsDomestic` | number | Yes | Number of U.S. adults requesting background checks | $35/adult (post-billed) | `5` |
| `bgAdultsInternational` | number | Yes | Number of international adults requesting background checks | $65/adult (post-billed) | `2` |

**Add-on Details:**

- **Background Checks (U.S.)** - $35 per adult
  - U.S. background checks for adult chaperones
  - Consent collected after checkout
  - **POST-BILLED** (not included in today's total)

- **Background Checks (International)** - $65 per adult
  - International background checks for adults with international travel history
  - **POST-BILLED** (not included in today's total)

**Future Add-ons (Currently Disabled):**
- Rush Turnaround: $150 (24-48 hour expedited analyst review)
- Translation Pack: $120 (Translate packet into 20+ languages)
- Parent Communications Kit: $95 (Automated email/SMS updates)
- Debrief & Binder: $250 (Post-trip incident review)

---

### 4. Organization Section

Information about the organization and primary contact.

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `orgName` | string | Yes | Organization name | `"Lincoln High School"` |
| `orgType` | string | Yes | Type of organization | `"k12"`, `"higher_ed"`, `"church"`, `"youth_sports"`, `"corporate"`, `"nonprofit"`, `"other"` |
| `role` | string | Yes | Contact's role/title | `"Trip Coordinator"`, `"Principal"` |
| `email` | string | Yes | Contact email (validated) | `"coordinator@lincolnhs.edu"` |
| `phone` | string | No | Contact phone number | `"(555) 123-4567"` |
| `taxExempt` | boolean | Yes | Whether organization is tax-exempt | `true`, `false` |

**Organization Type Values:**
- `k12` - K-12 School
- `higher_ed` - College/University
- `church` - Church/Religious Organization
- `youth_sports` - Youth Sports Organization
- `corporate` - Corporate/Business
- `nonprofit` - Nonprofit Organization
- `other` - Other

**Validation Rules:**
- Email must be valid format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Phone (if provided) must be valid format with at least 10 digits

---

### 5. Checkout Section

Payment method and legal agreements.

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `mode` | string | Yes | Selected payment/checkout mode | `"order"`, `"invoice"`, `"quote"` |
| `agreedToTerms` | boolean | Yes | User agreed to Terms of Service & Privacy Policy | `true` |
| `agreedToAuthorization` | boolean | Yes | User confirmed authorization to make purchase | `true` |
| `billingAddress` | string | Conditional | Billing address (required if mode=invoice) | `"123 Main St, Boston, MA 02101"` |
| `apEmail` | string | Conditional | Accounts Payable email (required if mode=invoice) | `"ap@lincolnhs.edu"` |
| `poNumber` | string | No | Purchase Order number (optional if mode=invoice) | `"PO-2025-001"` |

**Checkout Modes:**

- **`order`** - Pay Now (Stripe Credit Card)
  - Fastest option
  - Payment processed immediately via Stripe
  - Account setup within 24 hours
  - Stripe integration fields will be added here

- **`invoice`** - Request Invoice
  - Invoice sent via email (Net 30 terms)
  - Work starts after payment or approved PO
  - Requires: `billingAddress`, `apEmail`
  - Optional: `poNumber`

- **`quote`** - Request PDF Quote
  - 30-day quote delivered as PDF
  - No immediate payment
  - Cart saved for future ordering

**Required Fields by Mode:**
- `order`: Stripe payment fields (to be integrated)
- `invoice`: `billingAddress`, `apEmail`
- `quote`: No additional fields

---

### 6. Pricing Section

Calculated pricing breakdown (computed server-side for verification).

| Field | Type | Description | Example Values |
|-------|------|-------------|----------------|
| `tierPrice` | number | Base tier price | `450`, `750`, `1250` |
| `todayTotal` | number | Amount due today (tier price only) | `450` |
| `postBilledTotal` | number | Total post-billed amount (background checks) | `245` |
| `bgDomesticTotal` | number | Total for U.S. background checks | `175` |
| `bgInternationalTotal` | number | Total for international background checks | `130` |
| `grandTotal` | number | Total of all charges (today + post-billed) | `695` |

**Pricing Calculation:**
```javascript
tierPrice = tiers[plan.tier].price
bgDomesticTotal = addons.bgAdultsDomestic × 35
bgInternationalTotal = addons.bgAdultsInternational × 65
postBilledTotal = bgDomesticTotal + bgInternationalTotal
todayTotal = tierPrice
grandTotal = tierPrice + postBilledTotal
```

---

## Example Payloads

### Example 1: Single Day Trip (Domestic, No Add-ons)

```json
{
  "plan": {
    "tier": "T1",
    "international": false,
    "overnight": false,
    "internationalAcknowledged": false
  },
  "trip": {
    "name": "Museum Field Trip",
    "dateStart": "2025-04-10",
    "dateEnd": "2025-04-10",
    "destCity": "Boston",
    "destCountry": "US",
    "adults": 4,
    "minors": 30,
    "originCity": "Cambridge",
    "transport": "bus",
    "lodgingStatus": "none",
    "notes": "Visiting Museum of Science"
  },
  "addons": {
    "bgAdultsDomestic": 0,
    "bgAdultsInternational": 0
  },
  "org": {
    "orgName": "Lincoln Elementary School",
    "orgType": "k12",
    "role": "Teacher",
    "email": "msmith@lincolnelem.edu",
    "phone": "(617) 555-0100",
    "taxExempt": true
  },
  "checkout": {
    "mode": "order",
    "agreedToTerms": true,
    "agreedToAuthorization": true,
    "billingAddress": "",
    "apEmail": "",
    "poNumber": ""
  },
  "pricing": {
    "tierPrice": 450,
    "todayTotal": 450,
    "postBilledTotal": 0,
    "bgDomesticTotal": 0,
    "bgInternationalTotal": 0,
    "grandTotal": 450
  }
}
```

---

### Example 2: Multi-Day Domestic Trip (With Background Checks)

```json
{
  "plan": {
    "tier": "T2",
    "international": false,
    "overnight": true,
    "internationalAcknowledged": false
  },
  "trip": {
    "name": "Washington D.C. History Tour",
    "dateStart": "2025-05-15",
    "dateEnd": "2025-05-18",
    "destCity": "Washington",
    "destCountry": "US",
    "adults": 8,
    "minors": 40,
    "originCity": "New York City",
    "transport": "bus",
    "lodgingStatus": "booked",
    "notes": "4-day educational tour visiting monuments and museums"
  },
  "addons": {
    "bgAdultsDomestic": 8,
    "bgAdultsInternational": 0
  },
  "org": {
    "orgName": "Roosevelt High School",
    "orgType": "k12",
    "role": "History Department Chair",
    "email": "jdoe@roosevelths.edu",
    "phone": "(212) 555-0200",
    "taxExempt": true
  },
  "checkout": {
    "mode": "invoice",
    "agreedToTerms": true,
    "agreedToAuthorization": true,
    "billingAddress": "100 Roosevelt Way, New York, NY 10001",
    "apEmail": "accounting@roosevelths.edu",
    "poNumber": "PO-2025-0542"
  },
  "pricing": {
    "tierPrice": 750,
    "todayTotal": 750,
    "postBilledTotal": 280,
    "bgDomesticTotal": 280,
    "bgInternationalTotal": 0,
    "grandTotal": 1030
  }
}
```

---

### Example 3: International Trip (Complex)

```json
{
  "plan": {
    "tier": "T3",
    "international": true,
    "overnight": true,
    "internationalAcknowledged": false
  },
  "trip": {
    "name": "Costa Rica Service Learning Trip",
    "dateStart": "2025-07-10",
    "dateEnd": "2025-07-20",
    "destCity": "San José",
    "destCountry": "OTHER",
    "adults": 6,
    "minors": 18,
    "originCity": "Austin",
    "transport": "flight",
    "lodgingStatus": "booked",
    "notes": "10-day service learning experience with homestays and community service"
  },
  "addons": {
    "bgAdultsDomestic": 4,
    "bgAdultsInternational": 2
  },
  "org": {
    "orgName": "First Community Church",
    "orgType": "church",
    "role": "Youth Pastor",
    "email": "youth@firstcommunitychurch.org",
    "phone": "(512) 555-0300",
    "taxExempt": true
  },
  "checkout": {
    "mode": "order",
    "agreedToTerms": true,
    "agreedToAuthorization": true,
    "billingAddress": "",
    "apEmail": "",
    "poNumber": ""
  },
  "pricing": {
    "tierPrice": 1250,
    "todayTotal": 1250,
    "postBilledTotal": 270,
    "bgDomesticTotal": 140,
    "bgInternationalTotal": 130,
    "grandTotal": 1520
  }
}
```

---

## Important Business Logic Notes

### 1. International Travel Validation

If `plan.international = true` AND `plan.tier != "T3"`:
- Display warning to user
- Require `plan.internationalAcknowledged = true` to proceed
- Or user must select Tier 3 or uncheck international

### 2. Background Check Processing

Background checks are **POST-BILLED**:
- NOT included in `todayTotal`
- Billed separately after adult consent forms are completed
- User is informed during checkout about post-billing

### 3. Payment Mode Conditional Fields

**Invoice Mode** requires:
- `checkout.billingAddress` (required)
- `checkout.apEmail` (required)
- `checkout.poNumber` (optional)

**Order Mode** will require:
- Stripe payment token/ID (to be added)
- Cardholder info (to be added)

### 4. Date Validation

- `trip.dateStart` must be a valid date
- `trip.dateEnd` must be >= `trip.dateStart`
- Both dates required

### 5. Participant Validation

- `trip.adults` must be >= 1
- `trip.minors` must be >= 0

### 6. Tax Handling

Current configuration (from pricing.json):
```json
"tax": {
  "policy": "destination",
  "rateDefault": 0.0
}
```

Tax rate is currently 0%, but destination-based tax policy is planned for future implementation.

---

## Webhook/API Integration Points

When implementing Stripe integration, your system should expect to receive this data via:

1. **Stripe Webhook** (for `mode = "order"`)
   - Event: `checkout.session.completed`
   - Payload will include all form data + Stripe payment details

2. **Server-side API** (for `mode = "invoice"` or `mode = "quote"`)
   - Direct API call with complete form data
   - No payment processing required

---

## Validation Rules Summary

| Field | Validation |
|-------|------------|
| `plan.tier` | Must be "T1", "T2", or "T3" |
| `plan.international` + `plan.tier` | If international=true and tier!="T3", require acknowledgment |
| `trip.name` | Required, non-empty string |
| `trip.dateStart` | Required, valid date |
| `trip.dateEnd` | Required, valid date, >= dateStart |
| `trip.destCity` | Required, non-empty string |
| `trip.destCountry` | Required, must be "US", "CA", "MX", or "OTHER" |
| `trip.adults` | Required, >= 1 |
| `trip.minors` | Required, >= 0 |
| `org.orgName` | Required, non-empty string |
| `org.orgType` | Required, valid organization type |
| `org.role` | Required, non-empty string |
| `org.email` | Required, valid email format |
| `org.phone` | Optional, valid phone format if provided |
| `checkout.mode` | Required, must be "order", "invoice", or "quote" |
| `checkout.agreedToTerms` | Required, must be true |
| `checkout.agreedToAuthorization` | Required, must be true |
| `checkout.billingAddress` | Required if mode="invoice" |
| `checkout.apEmail` | Required if mode="invoice" |

---

## Data Source

All data comes from `/components/quote-form.js` and `/config/pricing.json`

**Last Updated:** 2025-01-16

---

## Questions?

For questions about this specification, please contact the SafeTrekr development team.
