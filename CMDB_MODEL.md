# CMDB_MODEL.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 8
> **Strategy:** CMDB light — only room-level assets tracked.
> No full CSDM expansion. Rooms stay as custom table records, not full CMDB CIs.

---

## 1. Design Principles

- **Minimal CMDB footprint.** Over-engineering the CMDB creates maintenance overhead without operational value for a training management application.
- **Rooms are NOT CMDB CIs.** Room operational data lives in `x_783010_tocc_a1_room`. Only physical assets inside rooms (projector, AV system, etc.) are tracked as CIs.
- **Assets linked, not owned.** Room resources in `x_783010_tocc_a1_room_resource` have an optional `related_ci` reference to `cmdb_ci` — the CMDB record is the source of truth for asset lifecycle; the app record is the operational view.
- **Location hierarchy uses platform standard.** `cmn_location` is used directly — no custom location table.

---

## 2. Service Model (CSDM-Inspired, Lightweight)

```
Business Service
└── Training Operations Service
        │
        ├── Service Offering: Room Booking
        │       └── Fulfilled by: x_783010_tocc_a1_room_reservation workflow
        │
        ├── Service Offering: Training Enrollment
        │       └── Fulfilled by: x_783010_tocc_a1_student_enrollment workflow
        │
        └── Service Offering: Training Support
                └── Fulfilled by: Service Portal + Virtual Agent + Backoffice

Application Services
├── Training Portal (Service Portal /tocc)
└── Training Admin Workspace (UI Builder — Sprint 10)

Technical Services
├── Notification Service (Platform email + events)
└── Virtual Agent Service (NLU + topic flows)
```

> These service model records are created manually in **CMDB → Business Services** on the instance. They are informational and not required for app functionality.

---

## 3. CI Types Tracked

Only assets directly tied to room function are tracked as CIs:

| CI Class | CMDB Table | Examples |
|---|---|---|
| Projector | `cmdb_ci_hardware` | Epson EB-X41 in Room A101 |
| AV System | `cmdb_ci_hardware` | Extron AV switch in Room B202 |
| Display Panel | `cmdb_ci_hardware` | Samsung 65" display in Lab C01 |
| Room Computer | `cmdb_ci_computer` | Dell Optiplex in Training Room 3 |
| Microphone / Sound | `cmdb_ci_hardware` | Shure wireless mic set |
| Wi-Fi Access Point | `cmdb_ci_hardware` | Ubiquiti AP in Conference Hall |

Each CI is related to its room via the `x_783010_tocc_a1_room_resource.related_ci` reference field.

---

## 4. Location Hierarchy

Using standard platform tables — no custom location records needed:

```
cmn_company  (Your Organization)
    └── cmn_location  (Building / Campus)
            └── cmn_location  (Floor — optional child record)
                    └── x_783010_tocc_a1_room  (Room — custom table)
                            └── x_783010_tocc_a1_room_resource  (Resource)
                                    └── cmdb_ci  (Physical asset CI)
```

---

## 5. Relationship Map

| From | Relationship | To |
|---|---|---|
| `x_783010_tocc_a1_room` | Located in | `cmn_location` |
| `x_783010_tocc_a1_room_resource` | Installed in / Located in | `x_783010_tocc_a1_room` |
| `x_783010_tocc_a1_room_resource` | References | `cmdb_ci` |
| `x_783010_tocc_a1_room_reservation` | Uses | `x_783010_tocc_a1_room` |
| `x_783010_tocc_a1_training_session` | Hosted in | `x_783010_tocc_a1_room` |
| Training Operations Service | Supported by | Training Portal (Application Service) |

---

## 6. Manual Configuration Steps

### Step 1 — Create Location Records
Navigate to **Organization → Locations → New**
Create one record per building/floor used for training rooms.

### Step 2 — Create CMDB CIs for Room Assets
Navigate to **Asset → Hardware Assets → New** (or appropriate CI class)
For each physical asset in a training room:
- Name: descriptive (e.g., "Projector — Room A101")
- Model, serial number, assigned location
- Status: `In use`

### Step 3 — Link CIs to Room Resources
For each `x_783010_tocc_a1_room_resource` record:
- Open the record
- Set `related_ci` field to the corresponding `cmdb_ci` record

### Step 4 — Create Business Service (Optional)
Navigate to **Configuration → Business Services → New**
- Name: `Training Operations Service`
- Owner: Backoffice group
- Link service offerings as child records

### Step 5 — Validate
Run a CI relationship report for one room asset and confirm the chain:
`cmdb_ci → room_resource → room → location` is navigable.

---

*Last updated: Sprint 8 — CMDB light model, service model, location hierarchy, CI types.*
