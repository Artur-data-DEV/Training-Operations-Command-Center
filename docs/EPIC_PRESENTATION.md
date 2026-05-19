# TOCC - Presentation Epic & Live Demo Script

**Project:** Training Operations Command Center (TOCC)
**Scope:** `x_783010_tocc_a1`
**Methodology:** Now Create - *Deliver & Close Phase*

This document serves as the master presentation script and epic breakdown for presenting the TOCC application to stakeholders. It highlights the business value, aligns with the exact instance configuration, and provides a step-by-step walkthrough for the Live Demo.

---

## 1. Executive Summary & Business Value

### The Problem
Historically, training operations were fragmented:
- **Instructors** lacked a unified way to create courses and request rooms.
- **Students** had to navigate emails or disconnected portals to find and enroll in sessions.
- **Backoffice** staff managed reservations in spreadsheets, leading to conflicts and poor occupancy tracking.

### The Solution (TOCC)
A centralized ServiceNow scoped application that orchestrates the entire training lifecycle.
- **Self-Service Portal:** A dedicated, branded experience for Students and Instructors.
- **Automated Workflows:** Seamless room reservation approvals, catalog requests, and session scheduling.
- **Backoffice Workspace:** A modern UI Builder workspace for resolving conflicts, managing inventory, and tracking KPIs.

---

## 2. Key Features Aligned with the Instance

1. **Service Portal (`/tocc`)**
   - My Courses, My Sessions, Knowledge Base, and Quick Links.
   - Distinct views based on roles (Instructor vs. Student).
2. **Catalog & Record Producers**
   - **Create Course:** Uses controlled choices for `Duration` (1h to 6h) and `Delivery Category` (Online (VILT) / In Person), assigns the current instructor as course owner, and redirects back to `My Courses` after submit.
   - **Room Reservation:** Connected directly to CMDB-lite room data (`x_783010_tocc_a1_room`).
3. **Automated Testing (ATF)**
   - Code-defined ATF coverage exists for the core services, ACLs, portal APIs, workflows, CMDB resource checks, and operational closure scenarios. Present only the latest instance execution result, not a planned pass count.
4. **Platform Analytics & Workspaces**
   - **TOCC Workspace:** Centralized view of pending approvals, active courses, and upcoming sessions.
   - Data visualization for room utilization and session fill-rates.

---

## 3. Live Demo Script (Step-by-Step)

### Scene 1: The Instructor (Creating a Course)
**Persona:** Instructor (`x_783010_tocc_a1.instructor`)
**Goal:** Propose a new training course.
1. Navigate to the **TOCC Portal** (`/tocc`).
2. Click **"Create Course"** under Quick Links.
3. Show the dynamic Catalog Item form.
   - *Talking Point:* "Notice how Delivery Category and Duration are controlled choices. Invalid free text is blocked before it becomes bad operational data."
4. Fill out the course details (e.g., "Advanced ServiceNow SDK", 4h, Online (VILT)).
5. Submit the form and show the redirect to "My Courses".

### Scene 2: The Backoffice Coordinator (Managing Operations)
**Persona:** Backoffice (`x_783010_tocc_a1.backoffice`)
**Goal:** Review operations, approve reservations, and monitor KPIs.
1. Open the **TOCC Workspace** (UI Builder).
2. Show the Landing Page dashboards.
   - *Talking Point:* "Here, the backoffice has a 360-degree view of operations. They can see pending room reservations, room utilization metrics, and overall system health without running manual reports."
3. Open a pending **Room Reservation** task and approve it.
   - *Talking Point:* "This leverages the standard ServiceNow approval engine, fully integrated into the custom workspace."

### Scene 3: The Student (Self-Service Enrollment)
**Persona:** Student (Any internal user)
**Goal:** Find an upcoming session and enroll.
1. Return to the **TOCC Portal** (`/tocc`).
2. Go to the **Sessions** page.
   - *Talking Point:* "The portal is dynamically generated using the Fluent SDK. It aggregates active sessions seamlessly."
3. Click on a session and enroll.
4. Show the Knowledge Base widget for self-help (e.g., "How to connect to VILT sessions").

### Scene 4: System Reliability & Quality Assurance
**Persona:** Platform Admin / Architect
**Goal:** Demonstrate enterprise-grade build quality.
1. Open the **Automated Test Framework (ATF)** module.
2. Show the TOCC Smoke Test Suite.
   - *Talking Point:* "To ensure zero regression, we built code-first ATF tests using the Fluent SDK. Every catalog item, ACL, and client script is automatically validated upon deployment."
3. Show the latest ATF execution evidence. If the suite has not been run after the latest deploy, present it as pending validation instead of claiming a pass rate.

---

## 4. Next Steps & Phase 2 Roadmap
- **LMS Integration:** Connecting course completion data to external Learning Management Systems.
- **Virtual Agent Expansion:** Deploying conversational AI for instant enrollment and FAQ deflection.
- **Advanced Resource Management:** Instructor scheduling conflict detection.
