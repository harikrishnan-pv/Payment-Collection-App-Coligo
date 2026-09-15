# iNav Technologies Hiring Test — Payment Collection App (Mobile)

> Source: candidate brief, received 2026-09-15. Verbatim requirements, typos preserved where load-bearing.

**Time:** 1 week (candidate has until 2026-09-15 15:30 IST).

**Objective:** Build a Payment Collection App for customers with personal loans. Frontend in React Native, backend in Node.js, MySQL/Postgres database.

## 1. Frontend
- Responsive UI with:
  - Display loan details for customers: Account Number, Issue Date, Interest Rate, Tenure, EMI Due
  - A form to allow customers to: enter their account number; enter the EMI amount to be paid; submit the payment
  - Display a confirmation acknowledgment upon successful payment

## 2. Backend
- REST API:
  - `GET /customers` — retrieve loan details of all customers
  - `POST /payments` — allow customers to make a payment for their personal loan
  - `GET /payments/:account_number` — retrieve payment history for a specific account
- Node.js with Express.js
- Store loan and payment data in MySQL or Postgres

## 3. Database Schema
- `customers` table: loan details (Account Number, Issue Date, Interest Rate, Tenure, EMI Due)
- `payments` table: track EMI payments (Customer ID, Payment Date, Payment Amount, Status)

## 4. CI/CD and Deployment
- Push frontend and backend code to two separate GitHub repositories *(candidate clarified: submission form takes ONE repo — monorepo)*
- CI/CD pipeline using GitHub Actions or another tool to:
  - Build the Angular frontend and Node.js backend *(candidate confirmed "Angular" is the test's typo — frontend is React Native mobile)*
  - Deploy the application to an AWS EC2 instance
  - Backend API correctly integrated with frontend using an environment variable for the API URL

## 5. Documentation
- Project setup steps
- How to run frontend and backend locally
- CI/CD pipeline configuration
- Deployment steps on AWS EC2

## Evaluation Criteria
- Frontend: responsiveness and UX; proper use of React Native features (components, services, etc.)
- Backend: API functionality and correctness; secure and clean code
- Database: schema design and query optimization
- CI/CD: proper pipeline setup and deployment
- Documentation: clarity, completeness, ease of use

## Deliverables
- Links to the frontend and backend GitHub repositories *(→ one monorepo link per candidate clarification)*
- The deployed application URL on AWS *(→ interpreted as backend/server URL; candidate confirming with team)*
