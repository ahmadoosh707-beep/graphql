# GraphQL Student Dashboard

A personal student profile dashboard built as part of the Reboot01 GraphQL project.

The application connects to the Reboot01 GraphQL API to retrieve authenticated student data and presents it through an interactive dashboard containing profile information, XP progression, audits, skills, project progress, and custom SVG visualizations.

The project was developed to explore GraphQL querying, authentication, JWT authorization, data processing, SVG visualization, and frontend UI/UX design.

---

## ✨ Features

### 🔐 Authentication

- Login using either:
  - Username + password
  - Email + password
- Authentication through the Reboot01 `signin` endpoint
- JWT-based authentication
- JWT validation
- Secure GraphQL requests using Bearer authentication
- Logout functionality
- Authentication error handling

---

### 👤 Student Profile

The dashboard displays authenticated student information retrieved from the GraphQL API.

Examples include:

- Username
- Email
- Profile information
- XP
- Audit statistics
- Upvotes / downvotes
- Other available student attributes

---

### 📈 XP & Progress

The application retrieves XP transactions and processes them to visualize the student's progress throughout their journey.

The dashboard provides:

- XP progression
- XP by project/path
- Project progression
- Project journey visualization
- Interactive project exploration

Large amounts of project data are organized into navigable visualizations rather than being displayed as a simple list.

---

### 🧪 Audit Dashboard

The application retrieves audit information from GraphQL and provides an interactive audit history.

The audit interface includes:

- Audit grades
- Passed audits
- Failed audits
- Audit dates
- Project information
- Group information
- Audit timeline
- Interactive audit details

Audits are presented as an SVG-based timeline that can be explored interactively.

---

### 🛠️ Skills Visualization

Student skill transactions are processed and grouped by skill type.

The application provides:

- Skill progression
- Skill categories
- XP associated with skills
- Interactive skill visualization
- Expandable skill/project information

---

### 📊 SVG Statistics

A mandatory part of the project is the creation of statistics using SVG.

This project implements multiple custom SVG visualizations, including:

- XP/project progress visualization
- Project journey visualization
- Audit timeline
- Skills visualization
- Interactive project graphs

The visualizations are generated programmatically rather than relying on external charting libraries.

---

## 🧠 GraphQL

The main objective of the project is to learn and demonstrate GraphQL.

The application communicates with the Reboot01 GraphQL endpoint:

```text
https://learn.reboot01.com/api/graphql-engine/v1/graphql
