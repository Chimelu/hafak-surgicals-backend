# Medical Equipment Backend API

A Node.js backend API for managing medical equipment inventory with MongoDB and Cloudinary image uploads.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Equipment Management**: CRUD operations for medical equipment
- **Category Management**: Equipment categorization system
- **Image Uploads**: Cloudinary integration for image storage
- **Search & Filtering**: Advanced search and filtering capabilities
- **Pagination**: Efficient data pagination
- **Statistics**: Equipment and category analytics

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account

## Installation

1. **Clone the repository and navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update the following variables:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/medical-equipment
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     JWT_EXPIRE=24h
     NODE_ENV=development
     
     # Cloudinary Configuration
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

4. **Database Setup:**
   - Ensure MongoDB is running
   - The API will automatically create the database and collections

5. **Seed Database (Optional):**
   ```bash
   npm run seed
   ```
       This creates:
    - Owner user: `owner` / `HafakSurgicals2024!`
    - Sample categories
    - Sample equipment

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Equipment Management
- `GET /api/equipment` - Get all equipment (with pagination & filtering)
- `GET /api/equipment/:id` - Get single equipment
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment
- `GET /api/equipment/search` - Search equipment
- `GET /api/equipment/stats/overview` - Get equipment statistics

### Category Management
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/:id/equipment` - Get category with equipment
- `GET /api/categories/stats/overview` - Get category statistics

### Public Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search` - Search products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/featured` - Get featured products

## File Upload

The API supports image uploads for equipment using Cloudinary:
- Supported formats: JPG, JPEG, PNG, GIF, WebP
- Maximum file size: 5MB
- Images are automatically optimized and resized
- Stored in the `medical-equipment` folder on Cloudinary

## Database Models

### User
- Username, email, password (hashed)
- Role-based access control (admin, super_admin)
- Account status and last login tracking

### Category
- Name, description, icon
- Automatic slug generation
- Equipment count tracking
- Sort order support

### Equipment
- Comprehensive equipment details
- Category relationships
- Image support
- Stock management
- Search indexing

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation and sanitization
- CORS configuration
- File upload security

## Error Handling

- Comprehensive error messages
- HTTP status codes
- Validation errors
- File upload error handling

## Development

### Project Structure
```
backend/
├── config/          # Configuration files
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── scripts/         # Database seeding
├── uploads/         # File uploads (if using local storage)
├── server.js        # Main server file
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

### Adding New Features
1. Create/update models in `models/` folder
2. Add routes in `routes/` folder
3. Update middleware if needed
4. Test with appropriate HTTP client

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Cloudinary Upload Failures**
   - Verify Cloudinary credentials
   - Check file size and format

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set
   - Check token expiration

4. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing process on port 5000

## License

This project is licensed under the ISC License.
