# PlantCare AI - Frontend

A modern React + TypeScript application built with Vite for managing and caring for your plants.

## 🌱 Project Structure

```
src/
├── assets/           # Images, icons, and other static files
├── components/       # Reusable React components
├── hooks/            # Custom React hooks
├── pages/            # Page components (Login, Register, Dashboard)
├── services/         # API service calls and external integrations
├── styles/           # CSS stylesheets
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and constants
├── App.tsx           # Main App component with routing
└── main.tsx          # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm build

# Preview production build
npm run preview
```

## 📄 Pages

### Login (`/login`)
- Email and password authentication
- Link to register page
- Form validation with error handling

### Register (`/register`)
- Create new user account
- Full name, email, password fields
- Password confirmation validation
- Minimum 6-character password requirement

### Dashboard (`/dashboard`)
- Main application hub after login
- Display user's plants with care information
- Watering schedule and history
- Quick tips for plant care
- Add new plants (placeholder for now)

## 🛠️ Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **CSS3** - Styling with modern features

## 📋 Features

✅ Modern responsive UI
✅ Type-safe React components
✅ Clean folder structure
✅ Routing between pages
✅ Form validation
✅ Error handling
✅ Reusable hooks and utilities
✅ Placeholder data for plants

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] User authentication
- [ ] Plant management CRUD operations
- [ ] Watering reminders/notifications
- [ ] Plant care tips and guides
- [ ] User profile management
- [ ] Dark mode
- [ ] Mobile app

## 📝 Component Usage

### Using Custom Hooks

```typescript
import { useForm, useAsync } from '../hooks';

const MyComponent = () => {
  const { values, handleChange, reset } = useForm({ email: '', password: '' });
  
  return (
    <form>
      <input name="email" value={values.email} onChange={handleChange} />
    </form>
  );
};
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## 📦 Available Scripts

- `npm run dev` - Start development server (default: http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Planting! 🌿**
