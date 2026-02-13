# User Experience (UX) Flow Diagram

## Core User Journeys
The following flows outline the primary interactions for different user roles within the Flowrite application.

### 1. Authentication Flow
```mermaid
graph TD
    A[Visitor] -->|Navigates to App| B(Welcome Page)
    B -->|Click Login| C(Login Form)
    C -->|Enter Credentials| D{Valid?}
    D -->|No| C
    D -->|Yes| E{Role?}
    E -->|Admin| F[Admin Dashboard]
    E -->|Employee| G[Employee Dashboard]
    B -->|Click Job Form| H[Public Job Form]
    
    style A fill:#121826,color:#fff
    style F fill:#2563EB,color:#fff
    style G fill:#06B6D4,color:#fff
```

### 2. Admin: Docket Management Flow
```mermaid
graph LR
    A[Admin Dashboard] -->|Click Dockets| B(Dockets Management)
    B -->|Click Create| C(Generate Modal)
    C -->|Select Filters| D[Preview Data]
    D -->|Confirm| E[Docket Generated]
    E -->|Auto-Open| F(View Docket Details)
    F -->|Actions| G{Options}
    G -->|Print| H[PDF Download]
    G -->|Email| I[Send to Customer]
    G -->|Delete| J[Remove Record]
```

### 3. Field Worker: Job Submission Flow
```mermaid
graph TD
    A[Public/Login] -->|Access Form| B(Job Form)
    B -->|Step 1| C[General Info]
    C -->|Step 2| D[Safety Declaration]
    D -->|Step 3| E[Checklist]
    E -->|Step 4| F[Defect Reporting]
    F -->|Step 5| G[Photos & Signature]
    G -->|Submit| H{Success?}
    H -->|Yes| I[Success Message]
    H -->|No| G
```

### 4. Admin: Review Flow
```mermaid
graph LR
    A[Submissions List] -->|Filter| B[Refined List]
    B -->|Select Item| C[View Details Modal]
    C -->|Review Data| D{Action}
    D -->|Approve| E[Included in Docket]
    D -->|Edit| F[Fix Data]
    D -->|Flag| G[Mark for Review]
```
