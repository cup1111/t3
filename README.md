# T3 Social Media Application

A modern social media application built with the [T3 Stack](https://create.t3.gg/), focused on emoji sharing and user interaction.

## 🚀 Features

- **Emoji Posts**: Users can create and share posts containing emoji content
- **User Authentication**: Integrated Clerk authentication system for user login and registration
- **Real-time Data**: Type-safe API calls using tRPC and React Query
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Database Integration**: Post data management using Prisma ORM and MySQL database

## 🛠️ Tech Stack

### Frontend Framework
- [Next.js 15](https://nextjs.org) - React full-stack framework
- [React 19](https://react.dev) - User interface library
- [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript

### Styling and UI
- [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
- [React Hot Toast](https://react-hot-toast.com) - Lightweight notification component

### Backend and API
- [tRPC](https://trpc.io) - End-to-end type-safe APIs
- [Prisma](https://prisma.io) - Modern database ORM
- [MySQL](https://www.mysql.com) - Relational database

### Authentication and Infrastructure
- [Clerk](https://clerk.com) - User authentication and user management
- [Upstash Redis](https://upstash.com) - Redis caching and rate limiting

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── _components/       # Reusable components
│   │   ├── authform.tsx   # Authentication form component
│   │   ├── create_post_wizard.tsx  # Post creation component
│   │   ├── post.tsx       # Post display component
│   │   └── page_header.tsx # Page header component
│   ├── [slug]/            # Dynamic user pages
│   └── api/               # API routes
├── server/                 # Server-side code
│   ├── api/               # tRPC API routes
│   └── db.ts              # Database connection
└── trpc/                  # tRPC client configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- npm or yarn package manager

### Installation Steps

1. **Clone the project**
   ```bash
   git clone <repository-url>
   cd t3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   Create a `.env` file and configure the following environment variables:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/database_name"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will start at [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run code linting
- `npm run typecheck` - Run type checking
- `npm run format:write` - Format code
- `npm run db:studio` - Open Prisma Studio database management interface

## 🔧 Core Functionality

### Post System
In the `src/app/_components/create_post_wizard.tsx` file, the `CreatePostWizard` component implements the post creation functionality. Users can input emoji content and click the post button to create new posts. This component calls the `post.create` API through tRPC and saves post data to the MySQL database.

### User Authentication
In the `src/app/_components/authform.tsx` file, the `AuthForm` component integrates with the Clerk authentication system, providing user login and registration functionality. User authentication state is managed through Clerk's `useUser` hook.

### Data Display
In the `src/app/_components/post.tsx` file, the `LatestPost` component is responsible for displaying the latest post content. It fetches post data through tRPC queries and updates the display in real-time.

## 🌐 Deployment

### Vercel Deployment
We recommend using [Vercel](https://vercel.com) for deployment as it provides the best Next.js support.

### Environment Variables
Ensure all necessary environment variables are properly configured in production, especially the database connection string and Clerk keys.

## 🤝 Contributing

Issues and Pull Requests are welcome! Before contributing code, please ensure:

1. Run `npm run lint` to check code style
2. Run `npm run typecheck` to validate types
3. Run `npm run format:write` to format code

## 📚 Learning Resources

- [T3 Stack Documentation](https://create.t3.gg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This project is open source under the MIT License.
