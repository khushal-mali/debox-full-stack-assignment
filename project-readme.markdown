# Full-Stack Admin Panel with Role-Based Authentication and CRUD Operations

## Overview
This project is a full-stack Admin Panel with secure role-based authentication and authorization, featuring CRUD operations for **Products**, **Categories**, and **Inventory**, and a CSV bulk upload feature for Master users. The backend uses **Node.js**, **Express.js**, **TypeScript**, **MongoDB Atlas**, and **ioredis** for Redis caching. The frontend is built with **Next.js**, **TypeScript**, **Tailwind CSS**, **Shadcn/UI**, **Tanstack Query**, **React Hook Form**, and **Zod**. The system supports two roles:
- **Master**: Full CRUD access (Create, Read, Update, Delete).
- **Admin**: Read-only access.

### Features
- **Authentication**: Secure login with JWT, role-based access (Master: full CRUD; Admin: read-only).
- **Products Module**: CRUD operations with fields `name`, `description`, `price`, `stock`, and many-to-many relationship with Categories.
- **Categories Module**: CRUD operations with fields `name`, `description`, and many-to-many relationship with Products.
- **Inventory Module**: CRUD operations with fields `productId`, `available`, `sold`, and one-to-one relationship with Products.
- **CSV Bulk Upload**: Master-only feature to upload CSV files for Products, Categories, and Inventory with validation.
- **Redis Caching**: Caches read operations for Products and Categories (TTL: 1 hour).
- **UI**: Responsive forms with Shadcn/UI, multi-select dropdowns for relationships, and clear feedback.
- **Security**: JWT middleware, input validation (Zod), password hashing (bcryptjs).
- **Efficiency**: Indexed MongoDB queries, Redis caching for reads.
- **Documentation**: Detailed setup and usage instructions.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Tanstack Query, React Hook Form, Zod
- **Backend**: Node.js, Express.js, TypeScript, MongoDB Atlas, ioredis, JWT, bcryptjs, Zod, csv-parse
- **Database**: MongoDB Atlas (NoSQL)
- **Caching**: Redis
- **Other**: cors, mongoose, axios

## Project Structure
```
auth-system/
├── client/ (Frontend)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── csv-upload/page.tsx
│   │   │   └── providers.tsx
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── select.tsx
│   │   │       └── multi-select.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── hooks/
│   │   │   ├── useLoginForm.ts
│   │   │   ├── useSignupForm.ts
│   │   │   ├── useLogout.ts
│   │   │   ├── useProducts.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useInventory.ts
│   │   │   └── useCsvUpload.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── auth.ts
│   ├── .env.local
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
├── server/ (Backend)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── user.ts
│   │   │   ├── product.ts
│   │   │   ├── category.ts
│   │   │   └── inventory.ts
│   │   ├── routes/
│   │   │   ├── auth.route.ts
│   │   │   ├── product.route.ts
│   │   │   ├── category.route.ts
│   │   │   ├── inventory.route.ts
│   │   │   └── csv.route.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── lib/
│   │   │   └── db.ts
│   │   └── index.ts
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
├── sample-data.csv
└── README.md
```

## Prerequisites
- **Node.js**: v18 or higher
- **MongoDB Atlas**: Account and cluster
- **Redis**: Running instance (local via Docker or Redis Cloud)
- **npm**: For dependencies
- **Docker** (optional): For local Redis

## Setup Instructions

### Backend Setup
1. **Navigate to Backend**:
   ```bash
   cd auth-system/server
   ```

2. **Install Dependencies**:
   ```bash
   npm install express mongoose ioredis bcryptjs jsonwebtoken zod cors csv-parse
   npm install -D typescript @types/express @types/mongoose @types/ioredis @types/bcryptjs @types/jsonwebtoken @types/cors @types/zod @types/csv-parse @types/node ts-node-dev
   ```

3. **Configure Environment Variables**:
   - Create `server/.env`:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/auth-system?retryWrites=true&w=majority
     REDIS_URL=redis://localhost:6379
     JWT_SECRET=your-secure-jwt-secret
     PORT=5000
     ```

4. **Start Redis**:
   ```bash
   docker run -d -p 6379:6379 redis
   ```

5. **Configure TypeScript**:
   - Use provided `server/tsconfig.json` (from prior response):
     ```json
     {
       "compilerOptions": {
         "target": "es2020",
         "module": "commonjs",
         "strict": true,
         "esModuleInterop": true,
         "allowSyntheticDefaultImports": true,
         "skipLibCheck": true,
         "outDir": "./dist",
         "rootDir": "./src",
         "moduleResolution": "node",
         "forceConsistentCasingInFileNames": true,
         "resolveJsonModule": true,
         "types": [
           "node",
           "express",
           "mongoose",
           "@types/ioredis",
           "bcryptjs",
           "jsonwebtoken",
           "cors",
           "@types/zod"
         ]
       },
       "include": ["src/**/*"],
       "exclude": ["node_modules"]
     }
     ```

6. **Seed Master User**:
   - Insert into MongoDB Atlas:
     ```javascript
     db.users.insertOne({
       email: "admin@master.com",
       password: "$2a$10$<hashed_password>", // bcrypt.hashSync('password123', 10)
       role: "Master"
     });
     ```

7. **Start Backend**:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. **Navigate to Frontend**:
   ```bash
   cd auth-system/client
   ```

2. **Install Dependencies**:
   ```bash
   npm install next react react-dom axios @tanstack/react-query tailwindcss postcss autoprefixer @hookform/resolvers zod react-hook-form
   npm install -D @types/react @types/react-dom @types/node
   ```

3. **Install Shadcn/UI**:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button form input label select
   ```

4. **Configure Environment Variables**:
   - Create `client/.env.local`:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:5000/api
     ```

5. **Configure Tailwind CSS**:
   - Update `client/tailwind.config.js`:
     ```js
     /** @type {import('tailwindcss').Config} */
     module.exports = {
       content: ['./src/**/*.{js,ts,jsx,tsx}'],
       theme: { extend: {} },
       plugins: [],
     }
     ```

6. **Configure TypeScript**:
   - Create `client/tsconfig.json`:
     ```json
     {
       "compilerOptions": {
         "target": "es5",
         "lib": ["dom", "dom.iterable", "esnext"],
         "allowJs": true,
         "skipLibCheck": true,
         "strict": true,
         "forceConsistentCasingInFileNames": true,
         "noEmit": true,
         "esModuleInterop": true,
         "module": "esnext",
         "moduleResolution": "node",
         "resolveJsonModule": true,
         "isolatedModules": true,
         "jsx": "preserve",
         "incremental": true,
         "types": ["node", "react", "react-dom"]
       },
       "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
       "exclude": ["node_modules"]
     }
     ```

7. **Start Frontend**:
   ```bash
   npm run dev
   ```

## Usage Instructions
1. **Access the App**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
2. **Sign-In**:
   - Go to `/login`, use `admin@master.com` / `password123`.
   - Redirects to `/dashboard`.
3. **Manage Entities**:
   - **Products**: `/products` (list, add, edit, delete for Master; view for Admin).
   - **Categories**: `/categories` (list, add, edit, delete for Master; view for Admin).
   - **Inventory**: `/inventory` (list, add, edit, delete for Master; view for Admin).
   - Forms include multi-select for Products ↔ Categories, single-select for Inventory → Product.
4. **CSV Upload** (Master only):
   - Go to `/csv-upload`, upload a CSV file with Products, Categories, and Inventory data.
   - Download `sample-data.csv` for reference.
5. **Logout**:
   - Click logout on `/dashboard`.

## Environment Variables
- **Backend (`server/.env`)**:
  ```
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/auth-system
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=your-secure-jwt-secret
  PORT=5000
  ```
- **Frontend (`client/.env.local`)**:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```

## Key Code Snippets

### Backend: Product Model (`server/src/models/product.ts`)
```typescript
import mongoose, { Schema, model, Model } from 'mongoose';

interface IProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  categories: mongoose.Types.ObjectId[];
}

const productSchema: Schema<IProduct> = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
}, { timestamps: true });

productSchema.index({ name: 'text' });

export const Product: Model<IProduct> = mongoose.models.Product || model<IProduct>('Product', productSchema);
```

### Backend: Category Model (`server/src/models/category.ts`)
```typescript
import mongoose, { Schema, model, Model } from 'mongoose';

interface ICategory {
  name: string;
  description: string;
  products: mongoose.Types.ObjectId[];
}

const categorySchema: Schema<ICategory> = new Schema<ICategory>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

categorySchema.index({ name: 'text' });

export const Category: Model<ICategory> = mongoose.models.Category || model<ICategory>('Category', categorySchema);
```

### Backend: Inventory Model (`server/src/models/inventory.ts`)
```typescript
import mongoose, { Schema, model, Model } from 'mongoose';

interface IInventory {
  productId: mongoose.Types.ObjectId;
  available: number;
  sold: number;
}

const inventorySchema: Schema<IInventory> = new Schema<IInventory>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  available: { type: Number, required: true, min: 0 },
  sold: { type: Number, required: true, min: 0 },
}, { timestamps: true });

export const Inventory: Model<IInventory> = mongoose.models.Inventory || model<IInventory>('Inventory', inventorySchema);
```

### Backend: Product Routes (`server/src/routes/product.route.ts`)
```typescript
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/product';
import { Category } from '../models/category';
import { Inventory } from '../models/inventory';
import { connectMongoDB, getCachedData, setCachedData, deleteCachedData } from '../lib/db';
import { authMiddleware, masterOnly } from '../middleware/auth';

const router: Router = express.Router();

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  categoryIds: z.array(z.string()).optional(),
});

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const cacheKey = 'products';
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const products = await Product.find().populate('categories', 'name');
    await setCachedData(cacheKey, JSON.stringify(products), 3600);
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', [authMiddleware, masterOnly], async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { name, description, price, stock, categoryIds } = productSchema.parse(req.body);

    const product = new Product({ name, description, price, stock, categories: categoryIds || [] });
    await product.save();

    if (categoryIds?.length) {
      await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $addToSet: { products: product._id } }
      );
    }

    await deleteCachedData('products');
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', [authMiddleware, masterOnly], async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { id } = req.params;
    const { name, description, price, stock, categoryIds } = productSchema.parse(req.body);

    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stock, categories: categoryIds || [] },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await Category.updateMany(
      { products: id },
      { $pull: { products: id } }
    );
    if (categoryIds?.length) {
      await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $addToSet: { products: id } }
      );
    }

    await deleteCachedData('products');
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', [authMiddleware, masterOnly], async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await Category.updateMany(
      { products: id },
      { $pull: { products: id } }
    );
    await Inventory.deleteOne({ productId: id });
    await deleteCachedData('products');
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
```

### Backend: CSV Upload Route (`server/src/routes/csv.route.ts`)
```typescript
import express, { Request, Response, Router } from 'express';
import { parse } from 'csv-parse';
import { z } from 'zod';
import { Product } from '../models/product';
import { Category } from '../models/category';
import { Inventory } from '../models/inventory';
import { connectMongoDB, deleteCachedData } from '../lib/db';
import { authMiddleware, masterOnly } from '../middleware/auth';

const router: Router = express.Router();

const csvSchema = z.object({
  'Category Name': z.string().min(1),
  'Category Description': z.string().min(1),
  'Product Name': z.string().min(1),
  'Product Description': z.string().min(1),
  'Product Price': z.string().transform(Number).refine((n) => n >= 0),
  'Available Units': z.string().transform(Number).refine((n) => n >= 0),
  'Sold Units': z.string().transform(Number).refine((n) => n >= 0),
});

router.post('/upload', [authMiddleware, masterOnly], async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    if (!req.is('multipart/form-data')) {
      return res.status(400).json({ error: 'Expected multipart/form-data' });
    }

    const file = req.files?.file;
    if (!file || Array.isArray(file)) {
      return res.status(400).json({ error: 'Single CSV file required' });
    }

    const records: any[] = [];
    const parser = parse({ columns: true, skip_empty_lines: true, trim: true });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read())) {
        records.push(record);
      }
    });

    parser.on('error', (error) => {
      console.error('CSV parse error:', error);
      res.status(400).json({ error: 'Invalid CSV format' });
    });

    parser.on('end', async () => {
      try {
        for (const record of records) {
          const data = csvSchema.parse(record);

          let category = await Category.findOne({ name: data['Category Name'] });
          if (!category) {
            category = new Category({
              name: data['Category Name'],
              description: data['Category Description'],
              products: [],
            });
            await category.save();
          }

          let product = await Product.findOne({ name: data['Product Name'] });
          if (!product) {
            product = new Product({
              name: data['Product Name'],
              description: data['Product Description'],
              price: data['Product Price'],
              stock: data['Available Units'],
              categories: [category._id],
            });
            await product.save();

            await Category.findByIdAndUpdate(category._id, {
              $addToSet: { products: product._id },
            });
          }

          let inventory = await Inventory.findOne({ productId: product._id });
          if (!inventory) {
            inventory = new Inventory({
              productId: product._id,
              available: data['Available Units'],
              sold: data['Sold Units'],
            });
            await inventory.save();
          }
        }

        await deleteCachedData('products');
        await deleteCachedData('categories');
        await deleteCachedData('inventory');
        res.json({ message: 'CSV data uploaded successfully' });
      } catch (error) {
        console.error('CSV processing error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    parser.write(file.data);
  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
```

### Frontend: Multi-Select Component (`client/src/components/ui/multi-select.tsx`)
```typescript
'use client';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <Select open={open} onOpenChange={setOpen}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selected.length ? `${selected.length} selected` : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            onClick={() => handleSelect(option.value)}
            className={selected.includes(option.value) ? 'bg-gray-200' : ''}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### Frontend: Product Form Hook (`client/src/hooks/useProducts.ts`)
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProduct, updateProduct, deleteProduct, getProducts } from '../lib/api';
import { Product } from '../types';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  categoryIds: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const useProducts = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const productsQuery = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      router.push('/products');
    },
    onError: (error: any) => {
      console.error('Create product error:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      router.push('/products');
    },
    onError: (error: any) => {
      console.error('Update product error:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
    onError: (error: any) => {
      console.error('Delete product error:', error);
    },
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', price: 0, stock: 0, categoryIds: [] },
  });

  return { productsQuery, createMutation, updateMutation, deleteMutation, form };
};
```

### Frontend: Products Page (`client/src/app/products/page.tsx`)
```typescript
'use client';
import React from 'react';
import Link from 'next/link';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Button } from '../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { MultiSelect } from '../../components/ui/multi-select';
import { getUserRole } from '../../utils/auth';

const ProductsPage: React.FC = () => {
  const { productsQuery, createMutation, form } = useProducts();
  const { categoriesQuery } = useCategories();
  const userRole = getUserRole();

  const isMaster = userRole === 'Master';
  const categories = categoriesQuery.data?.map((cat) => ({ value: cat._id, label: cat.name })) || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      {isMaster && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4 mb-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Price" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Stock" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={categories}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select categories"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </form>
        </Form>
      )}
      <div>
        {productsQuery.isLoading ? (
          <p>Loading...</p>
        ) : productsQuery.error ? (
          <p>Error loading products</p>
        ) : (
          <ul>
            {productsQuery.data?.map((product) => (
              <li key={product._id} className="mb-2">
                <Link href={`/products/${product._id}`} className="text-blue-500">
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
```

### Frontend: CSV Upload Page (`client/src/app/csv-upload/page.tsx`)
```typescript
'use client';
import React from 'react';
import { useCsvUpload } from '../../hooks/useCsvUpload';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getUserRole } from '../../utils/auth';

const CsvUploadPage: React.FC = () => {
  const { uploadMutation } = useCsvUpload();
  const userRole = getUserRole();

  if (userRole !== 'Master') {
    return <div className="container mx-auto p-4">Access denied</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      uploadMutation.mutate(formData);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">CSV Upload</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Upload CSV</label>
        <Input type="file" accept=".csv" onChange={handleFileChange} />
      </div>
      {uploadMutation.isPending && <p>Uploading...</p>}
      {uploadMutation.isError && <p className="text-red-500">Upload failed: {uploadMutation.error.message}</p>}
      {uploadMutation.isSuccess && <p className="text-green-500">Upload successful</p>}
      <p className="mt-4">
        Download <a href="/sample-data.csv" className="text-blue-500">sample CSV</a> for reference.
      </p>
    </div>
  );
};

export default CsvUploadPage;
```

### Sample CSV (`sample-data.csv`)
```
Category Name,Category Description,Product Name,Product Description,Product Price,Available Units,Sold Units
Electronics,Gadgets and devices,Smartphone,High-end smartphone,999,100,50
Electronics,Gadgets and devices,Laptop,Powerful laptop,1499,50,20
Clothing,Fashion apparel,T-Shirt,Cotton t-shirt,29,200,100
Clothing,Fashion apparel,Jeans,Denim jeans,59,150,80
Books,Literature,Fiction Novel,Bestseller novel,19,300,150
Books,Literature,Science Book,Educational book,39,100,40
Home,Home essentials,Table,Wooden table,199,30,10
Home,Home essentials,Chair,Ergonomic chair,99,50,25
Electronics,Gadgets and devices,Headphones,Wireless headphones,79,80,30
Clothing,Fashion apparel,Jacket,Leather jacket,129,60,20
Books,Literature,Comic Book,Graphic novel,15,200,90
Home,Home essentials,Lamp,Desk lamp,49,40,15
Electronics,Gadgets and devices,Tablet,10-inch tablet,299,70,25
Clothing,Fashion apparel,Sneakers,Sports sneakers,89,100,45
Books,Literature,History Book,Historical analysis,29,120,50
Home,Home essentials,Sofa,Comfortable sofa,599,20,5
Electronics,Gadgets and devices,Smartwatch,Fitness tracker,199,90,40
Clothing,Fashion apparel,Hat,Baseball cap,19,150,70
Books,Literature,Poetry Book,Poetry collection,12,180,80
Home,Home essentials,Bed,Queen-size bed,799,15,3
```

## Notes
- **Security**:
  - JWT middleware ensures authenticated access.
  - Zod validates API inputs and form data.
  - Passwords hashed with bcryptjs.
  - CSV upload restricted to Master users.
- **Efficiency**:
  - MongoDB indexes on `name` fields for Products and Categories.
  - Redis caches read operations (TTL: 1 hour).
  - Bulk CSV processing uses efficient MongoDB updates.
- **UI/UX**:
  - Shadcn/UI forms with multi-select for relationships.
  - Clear feedback for form submissions and CSV uploads.
  - Responsive design with Tailwind CSS.
- **Error Handling**:
  - Try-catch blocks in backend routes.
  - Zod validation for forms and CSV data.
  - User-friendly error messages in UI.
- **Separation of Concerns**:
  - Backend: Routes, middleware, models, config, types.
  - Frontend: Components, hooks, API, utils, types.

## Troubleshooting
- **Redis Errors**:
  - Ensure Redis is running: `redis-cli -h localhost -p 6379 ping` (expect `PONG`).
  - Check `REDIS_URL` in `server/.env`.
- **MongoDB Issues**:
  - Verify `MONGODB_URI` and cluster accessibility.
  - Ensure Master user is seeded.
- **Frontend Errors**:
  - Confirm `NEXT_PUBLIC_API_URL` in `client/.env.local`.
  - Check Shadcn/UI components are installed.
- **CSV Upload Issues**:
  - Ensure CSV matches `sample-data.csv` format.
  - Install `csv-parse`: `npm install csv-parse @types/csv-parse`.
- **Auth Failures**:
  - Test with `admin@master.com` / `password123`.

## Repository
- **URL**: https://github.com/your-username/auth-system
- **Setup**: Follow instructions for backend and frontend.
- **Contact**: [your-email@example.com]