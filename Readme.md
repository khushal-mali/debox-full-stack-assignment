# Admin Panel Documentation

## Overview

The Admin Panel is a full-stack web application for managing products, categories, inventory, and users with role-based access control (RBAC). It features a responsive frontend with a sidebar for navigation and a robust backend with RESTful APIs, caching, and CSV upload capabilities. The application supports two user roles: Master (full CRUD access, CSV upload, user signup) and Admin (read-only access to products, categories, and inventory).

**Master Credentials** (for full control):

- **Email**: `master@debox.com`
- **Password**: `password`


## How to Start the App

### Prerequisites

- **Node.js**: v18 or higher.
- **MongoDB**: Running locally or via a cloud provider (e.g., MongoDB Atlas).
- **Upstash Redis**: Account with `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`.
- **Git**: For cloning the repository.

### Backend Setup

1. **Clone Repository**:

   ```bash
   git clone https://github.com/khushal-mali/debox-full-stack-assignment.git

   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment** (create `backend/.env`):

   ```
   MONGODB_URI=mongodb+srv://khushalmali8448:x6tE2HXxrdaBii5D@debox-assignment.nu1hyr0.mongodb.net/?retryWrites=true&w=majority&appName=debox-assignment
   JWT_SECRET=jwt-secret
   PORT=5000
   UPSTASH_REDIS_URL=https://wealthy-gnu-17671.upstash.io
   UPSTASH_REDIS_TOKEN=AUUHAAIjcDE3NjJlODNmNTlhZjM0YTU4ODAxMjJjZDEzMTE2Y2Q4ZHAxMA

   ```

4. **Start Backend**:
   ```bash
   npm run dev
   ```
   - Server runs at `http://localhost:5000`.

### Frontend Setup

1. **Navigate to Frontend**:

   ```bash
   cd client
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment** (create `client/.env.local`):

   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start Frontend**:
   ```bash
   npm run dev
   ```
   - App runs at `http://localhost:3000`.

### Post-Setup Step

- Open `http://localhost:3000/login`.
- Log in with `master@debox.com` and `password`.
- Navigate to `/upload` to test CSV upload.
- Verify `/products`, `/categories`, `/inventory`, and `/signup` (Master-only).

## Tech Stack

### Backend

- **Node.js**: JavaScript runtime for server-side logic.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing users, categories, products, and inventory.
- **Mongoose**: ODM for MongoDB schema management and queries.
- **Upstash Redis**: Cloud-based Redis for caching API responses.
- **jsonwebtoken**: JWT for authentication.
- **bcryptjs**: Password hashing for secure user authentication.
- **zod**: Schema validation for request data.
- **multer**: Middleware for handling file uploads (CSV).
- **csv-parse**: Library for parsing CSV files.
- **TypeScript**: Static typing for improved code reliability.

### Frontend

- **Next.js**: React framework for server-side rendering and static site generation.
- **TypeScript**: Static typing for frontend code.
- **Shadcn/UI**: Component library for UI elements (Button, Input, Table, Sheet).
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **axios**: HTTP client for API requests.
- **tanstack/react-query**: Data fetching and state management for API calls.
- **sonner**: Toast notifications for user feedback.
- **lucide-react**: Icon library for UI elements.

## Features

- **Role-Based Access Control (RBAC)**:
  - **Master**: Full CRUD access to products, categories, inventory, and user signup; can upload CSV files.
  - **Admin**: Read-only access to products, categories, and inventory.
- **Sidebar Navigation**: Responsive sidebar with role-based links to `/products`, `/categories`, `/inventory`, `/upload` (Master-only), and `/signup` (Master-only).
- **CSV Upload**: Bulk product creation via CSV files (Master-only), supporting `products_200.csv` with columns: `name`, `description`, `price`, `categoryIds` (comma-separated MongoDB ObjectIds).
- **Authentication**: JWT-based login (`/api/auth/login`) and signup (`/api/auth/signup`, Master-only).
- **Data Management**:
  - CRUD operations for categories, products, and inventory.
  - Populated relationships (e.g., category products, product categories).
- **Caching**: Upstash Redis caches `/api/categories` and `/api/products` responses for performance.
- **UI/UX**: Modern, responsive interface with Shadcn/UI components, Tailwind styling, and Sonner toasts.
- **Validation**: Zod for backend request validation, ensuring robust data integrity.

## API Documentation

### Overview

The backend exposes RESTful API endpoints for authentication, data management, and CSV uploads. All protected endpoints require a JWT token in the `Authorization: Bearer <token>` header.

**Base URL**: `http://localhost:5000/api`

### Authentication

#### POST /api/auth/login

Authenticates a user and returns a JWT token.

- **Request**:
  - Body (application/json):
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
    Example:
    ```json
    {
      "email": "master@debox.com",
      "password": "password"
    }
    ```
- **Response**:
  - 200 OK:
    ```json
    {
      "token": "string",
      "user": {
        "_id": "string",
        "email": "string",
        "role": "MASTER" | "ADMIN"
      }
    }
    ```
  - 400 Bad Request: Invalid data.
  - 401 Unauthorized: Incorrect credentials.
  - 500 Server Error: Internal error.

#### POST /api/auth/signup

Registers a new user (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body (application/json):
    ```json
    {
      "email": "string",
      "password": "string",
      "role": "MASTER" | "ADMIN"
    }
    ```
- **Response**:
  - 201 Created:
    ```json
    {
      "_id": "string",
      "email": "string",
      "role": "MASTER" | "ADMIN"
    }
    ```
  - 400 Bad Request: Invalid data or email exists.
  - 403 Forbidden: Not a Master user.
  - 500 Server Error: Internal error.

### Categories

#### GET /api/categories

Lists all categories with populated product names.

- **Request**: Headers: `Authorization: Bearer <token>`
- **Response**:
  - 200 OK:
    ```json
    [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "products": [{ "_id": "string", "name": "string" }]
      }
    ]
    ```
  - 401 Unauthorized: Missing/invalid token.
  - 500 Server Error: Internal error.

#### GET /api/categories/:id

Gets a category by ID.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Params: `id` (MongoDB ObjectId)
- **Response**:
  - 200 OK:
    ```json
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "products": [{ "_id": "string", "name": "string" }]
    }
    ```
  - 400 Bad Request: Invalid ID.
  - 404 Not Found: Category not found.
  - 500 Server Error: Internal error.

#### POST /api/categories

Creates a category (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body (application/json):
    ```json
    {
      "name": "string",
      "description": "string",
      "productIds": ["string"] // Optional
    }
    ```
- **Response**:
  - 201 Created:
    ```json
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "products": ["string"]
    }
    ```
  - 400 Bad Request: Invalid data or product IDs.
  - 403 Forbidden: Not a Master user.
  - 500 Server Error: Internal error.

#### PUT /api/categories/:id

Updates a category (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Params: `id` (MongoDB ObjectId)
  - Body (application/json):
    ```json
    {
      "name": "string",
      "description": "string",
      "productIds": ["string"] // Optional
    }
    ```
- **Response**:
  - 200 OK:
    ```json
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "products": ["string"]
    }
    ```
  - 400 Bad Request: Invalid ID or data.
  - 403 Forbidden: Not a Master user.
  - 404 Not Found: Category not found.
  - 500 Server Error: Internal error.

#### DELETE /api/categories/:id

Deletes a category (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Params: `id` (MongoDB ObjectId)
- **Response**:
  - 200 OK:
    ```json
    {
      "message": "Category deleted"
    }
    ```
  - 400 Bad Request: Invalid ID.
  - 403 Forbidden: Not a Master user.
  - 404 Not Found: Category not found.
  - 500 Server Error: Internal error.

### Products

#### GET /api/products

Lists all products with populated category names.

- **Request**: Headers: `Authorization: Bearer <token>`
- **Response**:
  - 200 OK:
    ```json
    [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "price": number,
        "categories": [
          { "_id": "string", "name": "string" }
        ]
      }
    ]
    ```
  - 401 Unauthorized: Missing/invalid token.
  - 500 Server Error: Internal error.

#### GET /api/products/:id

Gets a product by ID.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Params: `id` (MongoDB ObjectId)
- **Response**:
  - 200 OK:
    ```json
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "price": number,
      "categories": [
        { "_id": "string", "name": "string" }
      ]
    }
    ```
  - 400 Bad Request: Invalid ID.
  - 404 Not Found: Product not found.
  - 500 Server Error: Internal error.

#### POST /api/products

Creates a product (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body (application/json):
    ```json
    {
      "name": "string",
      "description": "string",
      "price": number,
      "categoryIds": ["string"] // Optional
    }
    ```
- **Response**:
  - 201 Created:
    ```json
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "price": number,
      "categories": ["string"]
    }
    ```
  - 400 Bad Request: Invalid data or category IDs.
  - 403 Forbidden: Not a Master user.
  - 500 Server Error: Internal error.

#### PUT /api/products/:id

Updates a product (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Params: `id` (MongoDB ObjectId)
  - Body (application/json):
    ```json
    {
      "name": "string",
      "description": "string",
      "price": number,
      "categoryIds": ["string"] // Optional
    }
    ```
- **Response**:
  - 200 OK:
    ```json
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "price": number,
      "categories": ["string"]
    }
    ```
  - 400 Bad Request: Invalid ID or data.
  - 403 Forbidden: Not a Master user.
  - 404 Not Found: Product not found.
  - 500 Server Error: Internal error.

#### DELETE /api/products/:id

Deletes a product (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Params: `id` (MongoDB ObjectId)
- **Response**:
  - 200 OK:
    ```json
    {
      "message": "Product deleted"
    }
    ```
  - 400 Bad Request: Invalid ID.
  - 403 Forbidden: Not a Master user.
  - 404 Not Found: Product not found.
  - 500 Server Error: Internal error.

### Inventory

#### GET /api/inventory

Lists all inventory records.

- **Request**: Headers: `Authorization: Bearer <token>`
- **Response**:
  - 200 OK:
    ```json
    [
      {
        "_id": "string",
        "productId": "string",
        "quantity": number,
        "product": { "_id": "string", "name": "string" }
      }
    ]
    ```
  - 401 Unauthorized: Missing/invalid token.
  - 500 Server Error: Internal error.

#### GET /api/inventory/:id

Gets an inventory record by ID.

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Params: `id` (MongoDB ObjectId)
- **Response**:
  - 200 OK:
    ```json
    {
      "_id": "string",
      "productId": "string",
      "quantity": number,
      "product": { "_id": "string", "name": "string" }
    }
    ```
  - 400 Bad Request: Invalid ID.
  - 404 Not Found: Inventory record not found.
  - 500 Server Error: Internal error.

#### POST /api/inventory

Creates an inventory record (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body (application/json):
    ```json
    {
      "productId": "string",
      "quantity": number
    }
    ```
- **Response**:
  - 201 Created:
    ```json
    {
      "_id": "string",
      "productId": "string",
      "quantity": number
    }
    ```
  - 400 Bad Request: Invalid product ID or quantity.
  - 403 Forbidden: Not a Master user.
  - 500 Server Error: Internal error.

#### PUT /api/inventory/:id

Updates an inventory record (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Params: `id` (MongoDB ObjectId)
  - Body (application/json):
    ```json
    {
      "productId": "string",
      "quantity": number
    }
    ```
- **Response**:
  - 200 OK:
    ```json
    {
      "_id": "string",
      "productId": "string",
      "quantity": number
    }
    ```
  - 400 Bad Request: Invalid ID or data.
  - 403 Forbidden: Not a Master user.
  - 404 Not Found: Inventory record not found.
  - 500 Server Error: Internal error.

#### DELETE /api/inventory/:id

Deletes an inventory record (Master-only).

- **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Params: `id` (MongoDB ObjectId)
- **Response**:
  - 200 OK:
    ```json
    {
      "message": "Inventory record deleted"
    }
    ```
  - 400 Bad Request: Invalid ID.
  - 403 Forbidden: Not a Master user.
  - 404 Not Found: Inventory record not found.
  - 500 Server Error: Internal error.

### CSV Upload

#### POST /api/upload

Uploads a CSV file to bulk-create products (Master-only).

- **Request**:
  - Headers:
    ```
    Authorization: Bearer <token>
    Content-Type: multipart/form-data
    ```
  - Body (form-data):
    - Key: `file`, Value: CSV with columns:
      - `Category Name`: string (required)
      - `Category Description`: string (required)
      - `Product Name`: string (required)
      - `Product Price`: string (required)
      - `Product Description`: string (required)
      - `Available Units`: string (required)
      - `Sold Units`: string (required)
- **Response**:
  - 201 Created:
    ```json
    {
      "message": "Products uploaded successfully"
    }
    ```
  - 400 Bad Request: Missing file, invalid data, or fewer than 20 records.
  - 403 Forbidden: Not a Master user.
  - 500 Server Error: Internal error.

## Notes

- **Master Access**: Use `master@debox.com` and `password` for full control.
- **CSV Upload**: `csv file` must have at least 20 records.
- **Caching**: Upstash Redis caches `/api/categories` and `/api/products` for 3600 seconds.
- **Testing**: Use Postman for backend APIs and browser DevTools for frontend debugging.
