# Super Arc Group

A modern, bilingual corporate website and admin dashboard built with Next.js 16, React 19, and TypeScript. Features a comprehensive content management system with companies, projects, employees, categories, and blog management.

## 🌟 Features

### 🌐 Public Website
- **Bilingual Support**: Full English and Arabic language support with RTL layout
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Beautiful gradients, animations, and micro-interactions
- **SEO Optimized**: Meta tags, structured data, and semantic HTML
- **Performance**: Optimized images, lazy loading, and code splitting

#### Public Pages
- **Home**: Hero section with animated background and company overview
- **Companies**: Showcase of partner companies with detailed profiles
- **Projects**: Portfolio of completed projects with filtering and search
- **Blog**: News and insights with rich content editor
- **Privacy Policy & Terms**: Legal pages with bilingual content

### 🛠️ Admin Dashboard
- **Authentication**: Secure login system with token-based auth
- **Content Management**: Full CRUD operations for all entities
- **Rich Editor**: Editor.js integration for blog content
- **File Upload**: Image management with alt text support
- **Toast Notifications**: Modern notification system for all actions
- **Responsive Admin Panel**: Mobile-friendly admin interface

#### Admin Features
- **Companies Management**: Add, edit, delete companies with links and images
- **Projects Management**: Portfolio management with categories and rich descriptions
- **Employees Management**: Team member profiles with positions and photos
- **Categories Management**: Content categorization system
- **Blog Management**: Full-featured blog with rich text editor
- **Settings**: Site configuration and preferences

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom component library with Lucide icons
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: Editor.js with multiple block types
- **Internationalization**: next-intl for i18n support

### Design System
- **Color Palette**: Semantic color system with primary, secondary, and neutral colors
- **Typography**: Optimized font loading with next/font
- **Components**: Reusable UI components with consistent styling
- **Responsive**: Mobile-first approach with breakpoints
- **Accessibility**: WCAG compliant with proper ARIA labels

### State Management
- **React State**: Local state with useState and useEffect
- **Form State**: React Hook Form for form management
- **Auth State**: Token-based authentication with refresh tokens
- **Toast State**: Centralized notification system

### API Integration
- **REST API**: Full CRUD operations for all entities
- **Authentication**: JWT tokens with automatic refresh
- **Error Handling**: Comprehensive error handling with user feedback
- **File Upload**: Image management with validation

## 📁 Project Structure

```
src/
├── app/[locale]/                 # Internationalized routes
│   ├── admin/                   # Admin dashboard
│   │   ├── blog/               # Blog management
│   │   ├── companies/          # Company management
│   │   ├── projects/           # Project management
│   │   ├── employees/          # Employee management
│   │   └── categories/         # Category management
│   ├── blog/                   # Public blog pages
│   ├── companies/              # Public company pages
│   ├── projects/               # Public project pages
│   └── page.tsx               # Home page
├── components/                  # Reusable components
│   ├── admin/                  # Admin-specific components
│   ├── ui/                     # Base UI components
│   ├── sections/               # Page sections
│   └── forms/                  # Form components
├── services/                   # API services
│   ├── auth/                   # Authentication services
│   ├── entities/               # Entity CRUD services
│   └── content/                # Content services
└── messages/                   # Internationalization messages
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd super-arc-group
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run dev:fast` - Start development server without linting
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Features in Detail

### Content Management
- **Companies**: Manage company profiles, logos, descriptions, and associated links
- **Projects**: Portfolio management with categories, images, and detailed descriptions
- **Employees**: Team management with roles, photos, and company associations
- **Categories**: Hierarchical categorization for projects and content
- **Blog**: Rich content creation with Editor.js, images, and SEO metadata

### User Experience
- **Toast Notifications**: Modern slide-down notifications for all actions
- **Loading States**: Beautiful loading spinners and skeleton screens
- **Error Handling**: User-friendly error messages with recovery options
- **Form Validation**: Real-time validation with helpful error messages
- **Responsive Design**: Optimized for all screen sizes

### Internationalization
- **Full i18n Support**: English and Arabic languages
- **RTL Support**: Proper right-to-left layout for Arabic
- **Dynamic Routing**: Locale-based URL structure
- **Message Management**: Centralized translation system

### Admin Features
- **Dashboard**: Overview of all content and statistics
- **CRUD Operations**: Create, read, update, delete for all entities
- **Bulk Operations**: Mass actions for efficiency
- **Search & Filter**: Advanced search and filtering capabilities
- **Image Management**: Upload, crop, and optimize images
- **SEO Management**: Meta tags and structured data

## 🔧 Development

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting (optional)
- **Git Hooks**: Pre-commit hooks for code quality

### Component Architecture
- **Atomic Design**: Organized component structure
- **Reusable Components**: Consistent UI across the application
- **Props Interface**: Strongly typed component props
- **Storybook**: Component documentation (optional)

### Performance
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Optimized bundle size
- **Caching Strategy**: Efficient caching for API responses

## 🚀 Deployment

### Environment Setup
1. **Production Environment Variables**
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
   NEXTAUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-domain.com
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel (Recommended)**
   ```bash
   npx vercel
   ```

### Alternative Deployment Options
- **Docker**: Containerized deployment
- **AWS**: Amplify, EC2, or S3 + CloudFront
- **Netlify**: Static site generation
- **Traditional Hosting**: Node.js server deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the code comments for additional context

## 🎯 Roadmap

### Upcoming Features
- **Advanced Analytics**: Dashboard with detailed analytics
- **User Roles**: Multi-role authentication system
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing Suite**: Jest and React Testing Library
- **Performance Monitoring**: Integration with monitoring tools
- **Email Notifications**: Automated email system
- **Backup System**: Automated data backup and restore

### Technical Improvements
- **Microservices**: Service-oriented architecture
- **Database Optimization**: Query optimization and indexing
- **CDN Integration**: Content delivery network for static assets
- **Progressive Web App**: PWA capabilities
- **Offline Support**: Service worker implementation

---

Built with ❤️ using Next.js, React, and TypeScript
