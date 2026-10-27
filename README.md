  # Expense Tracker API

A RESTful API built with Node.js, Express.js, and SQLite for managing personal income and expenses.

## Project Overview

The Expense Tracker API allows users to record financial transactions, retrieve transaction records, update or delete transactions, filter records, and view financial summaries.

The project was built as a backend development learning project to practise REST API development, database operations, SQL queries, input validation, and error handling.

## Features

- Create new income and expense transactions.
- Retrieve all transactions.
- Retrieve a single transaction by its ID.
- Update an existing transaction using `PUT`.
- Partially update a transaction using `PATCH`.
- Delete a transaction by its ID.
- Filter transactions by type and category.
- Filter transactions by date range using a start date and end date.
- Generate a financial summary containing:
  - Total income.
  - Total expenses.
  - Current balance.
  - Total transaction count.
- Filter the financial summary by date range.
- Validate user input and handle invalid requests.
- Store transaction records in an SQLite database.

## Installation and Setup

### Prerequisites

Before running this project, make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)

This project uses Node.js's built-in `node:sqlite` module.

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

Replace `<your-repository-url>` with the URL of your GitHub repository.

### 2. Navigate to the project directory

```bash
cd Expense_tracker_api
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the API server

Use the start command configured in `package.json`. For example:

```bash
node index.js
```

The API will be available at the local address and port configured in `index.js`.


## API Endpoints

The API provides the following endpoints for managing transactions.

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/transactions` | Create a transaction |
| GET | `/transactions` | Retrieve all transactions |
| GET | `/transactions/:id` | Retrieve one transaction by ID |
| PUT | `/transactions/:id` | Replace/update a transaction |
| PATCH | `/transactions/:id` | Partially update a transaction |
| DELETE | `/transactions/:id` | Delete a transaction |

### Transaction Filters

The `GET /transactions` endpoint supports the following optional query parameters:

| Parameter | Description | Example |
|---|---|---|
| `type` | Filter by transaction type | `type=expense` |
| `category` | Filter by category | `category=Food` |
| `startDate` | Include transactions from this date onward | `startDate=2026-10-01` |
| `endDate` | Include transactions up to this date | `endDate=2026-10-31` |

You can combine multiple filters in one request.

Example:

```http
GET /transactions?type=expense&category=Food&startDate=2026-10-01&endDate=2026-10-31
```

### Financial Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/transactions/summary` | Retrieve a financial summary |

The summary includes:

- `totalIncome`: Sum of income transactions.
- `totalExpenses`: Sum of expense transactions.
- `balance`: Total income minus total expenses.
- `transactionCount`: Number of transactions included in the summary.

The summary endpoint also supports optional date filters.

Example:

```http
GET /transactions/summary?startDate=2026-10-01&endDate=2026-10-31
```

Dates must use the `YYYY-MM-DD` format.

## Request and Response Examples

### Create a Transaction

**Request**

```http
POST /transactions
Content-Type: application/json
```

**Request body**

```json
{
  "description": "Monthly salary",
  "amount": 250000,
  "type": "income",
  "category": "Salary",
  "transaction_date": "2026-10-01"
}
```

**Example response**

The exact response depends on the API implementation.

```json
{
  "id": 1,
  "description": "Monthly salary",
  "amount": 250000,
  "type": "income",
  "category": "Salary",
  "transaction_date": "2026-10-01"
}
```

### Financial Summary

**Request**

```http
GET /transactions/summary
```

**Example response**

```json
{
  "totalIncome": 250000,
  "totalExpenses": 50000,
  "balance": 200000,
  "transactionCount": 3
}
```

The figures above are illustrative. Actual totals depend on the transactions stored in the database.

### Error Responses

When a request contains invalid data, the API should return an appropriate HTTP status code and an explanatory message.

For example:

```json
{
  "message": "Invalid input"
}
```

The exact error message depends on the validation rule that was triggered.


## Technologies Used

- **Node.js** — JavaScript runtime.
- **Express.js** — HTTP server and API routing.
- **SQLite** — Relational database for storing transactions.
- **SQL** — Querying, filtering, and summarizing financial records.
- **JavaScript** — Application logic and request validation.

## Project Structure

```text
Expense_tracker_api/
├── index.js
├── database.js
├── cl.js
├── package.json
├── expenses.db
└── README.md
```

### File Descriptions

- `index.js` — Defines the API routes and handles HTTP requests.
- `database.js` — Creates the SQLite database connection and transactions table.
- `cl.js` — Contains additional project code; consult the file to confirm its current purpose.
- `package.json` — Stores project metadata, dependencies, and available npm scripts.
- `expenses.db` — SQLite database file containing transaction records.
- `README.md` — Documents the project and explains how to use it.
F