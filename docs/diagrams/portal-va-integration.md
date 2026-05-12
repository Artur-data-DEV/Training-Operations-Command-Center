# Portal and Virtual Agent Integration Diagram

```mermaid
flowchart LR
    Student[Student User] --> Portal[Service Portal Widgets]
    Student --> VA[Virtual Agent Topic]

    Portal --> SPServer[Widget Server Script]
    VA --> VATopicService[VirtualAgentTopicService]

    SPServer --> PortalApiService[PortalApiService]
    VATopicService --> PortalApiService

    PortalApiService --> Config[TrainingConfigService]
    VATopicService --> Props[Portal/Backoffice Properties]
    PortalApiService --> Props

    PortalApiService --> Domain[(TOCC Tables)]
    PortalApiService --> Notif[NotificationHelper]
    PortalApiService --> EnrollmentSvc[EnrollmentService]

    Domain --> Sessions[x_783010_tocc_a1_training_session]
    Domain --> Enrollments[x_783010_tocc_a1_student_enrollment]
    Domain --> Students[x_783010_tocc_a1_student]
```

## Notes

- Virtual Agent uses `VirtualAgentTopicService` as a single backend adapter.
- Portal widgets and VA share policy/link outputs via `PortalApiService` + properties.
- Enrollment cancellation path triggers seat sync and notification flow.

