# Salesforce LWC – Contact Search Application

This project is a Salesforce Lightning Web Components (LWC) application that searches for contacts. 

---
# Index:
## Features
## Technologies Used
## Project Structure
## How to Deploy This Project in Another Salesforce Org

## Features

### Contact Search
- Search Contacts by **Name or Email**
- Manual search via button
- Auto-search with debounced input

### Live Filters
- Filter contacts with email only
- Filters trigger search automatically

### Search Analytics (Lightning Message Service)
- Publishes search activity
- Decoupled analytics component
- Demonstrates LMS best practices

### Smart Contact Preview
- Parent → Child communication
- Preview opens on contact click
- Close preview without clearing results
- Preview resets on new search

### Clear Search
- Resets search, filters, preview, and state
- UI reacts automatically via computed getters

---

## Technologies Used

- Salesforce Lightning Web Components (LWC)
- Apex
- SLDS (Salesforce Lightning Design System)
- Lightning Message Service
- Salesforce CLI
- Git / GitHub

---

## Project Structure

force-app/
└── main/
└── default/
├── lwc/
│ ├── contactSearch/
│ ├── contactPreview/
│ └── contactSearchAnalytics/
├── classes/
│ ├── ContactSearchController.cls
│ ├── ContactPreviewController.cls
│ └── ContactSearchAnalyticsController.cls
└── messageChannels/
└── ContactSearchMessageChannel.messageChannel-meta.xml


---

## How to Deploy This Project in Another Salesforce Org

###  *Prerequisites
- Salesforce CLI installed
- A Salesforce Developer Edition or Trailhead Playground

---

### 

Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/salesforce-lwc-contact-search.git
cd salesforce-lwc-contact-search
```

Step 2 — Authenticate to Salesforce

```bash
sf org login web
```
(or)
```bash
sfdx auth:web:login
```

Step 3 — Deploy to the Org
```bash
sf project deploy start
```
(or)
```bash
sfdx force:source:push
```

Step 4 — Add Components to a Lightning Page

Open Setup → Lightning App Builder

Edit a Home Page (or create a new one)

Add:

Contact Search 
Search Analytics

Save & Activate

## Thank you for supporting
