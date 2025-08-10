# TalentAI Recruiter Frontend

A modern, AI-powered recruitment platform frontend built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Recruiter Dashboard**: Comprehensive dashboard for managing hiring pipeline
- **AI Automation**: Smart candidate matching and automated screening
- **Analytics**: Real-time hiring metrics and pipeline health monitoring
- **Project Management**: Create and manage multiple hiring projects
- **Profile Management**: Manage recruiter profile and settings
- **Responsive Design**: Fully responsive interface with consistent theming

## 🎨 Design System

- **Primary Colors**: Gradient from `#667eea` to `#764ba2`
- **Border Radius**: 
  - Large containers: `rounded-xl` (0.75rem)
  - Small elements: `rounded-lg` (0.5rem)
- **Typography**: Clean, modern with gradient text effects
- **Shadows**: Subtle elevation with `shadow-sm` and `shadow-lg` on hover

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Package Manager**: pnpm (recommended) or npm

## 🛠️ Installation

1. **Clone the repository** (if not already done):
```bash
git clone <repository-url>
cd hacknation-2025-talentai-challenge-10/recruiter-frontend
```

2. **Install dependencies**:
```bash
# Using pnpm (recommended)
pnpm install

# OR using npm
npm install

# OR using yarn
yarn install
```

3. **Set up environment variables**:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8002
```

## 🏃‍♂️ Running the Application

### Development Mode

Since the candidate-frontend is likely running on port 3000, run the recruiter-frontend on port 3001:

```bash
# Using pnpm
pnpm dev --port 3001

# OR using npm
npm run dev -- --port 3001

# OR using yarn
yarn dev --port 3001
```

The application will be available at [http://localhost:3001](http://localhost:3001)

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start --port 3001
```

## 📁 Project Structure

```
recruiter-frontend/
├── src/
│   ├── app/
│   │   ├── (talentai)/        # Main app routes with navigation
│   │   │   ├── _components/   # Shared components
│   │   │   │   └── recruiter/ # Recruiter-specific components
│   │   │   ├── dashboard/     # Main dashboard page
│   │   │   ├── layout.tsx     # App layout with sidebar navigation
│   │   │   └── recruiterprofile/ # Profile page
│   │   ├── page.tsx           # Root page (redirects to /dashboard)
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   └── ui/               # Reusable UI components
│   └── lib/
│       └── utils.ts          # Utility functions
├── public/                   # Static assets
├── package.json
└── README.md
```

## 🔧 Available Scripts

- `dev`: Run development server
- `build`: Build for production
- `start`: Start production server
- `lint`: Run ESLint
- `format`: Format code with Prettier

## 🎯 Key Pages

1. **Dashboard** (`/dashboard`): Main recruiter dashboard with projects, automation, and analytics (auto-redirects from `/`)
2. **Profile** (`/recruiterprofile`): Recruiter profile management

## 🔄 API Integration

The frontend connects to the recruiter backend API (default port 8002). Update the `NEXT_PUBLIC_API_URL` in `.env.local` if your backend runs on a different port.

## 🐛 Troubleshooting

### Port Already in Use
If port 3001 is already in use, you can specify a different port:
```bash
pnpm dev --port 3002
```

### Dependencies Issues
Clear cache and reinstall:
```bash
rm -rf node_modules .next
pnpm install
```

### TypeScript Errors
Run type checking:
```bash
pnpm tsc --noEmit
```

## 📝 Git Commands Reference

```bash
# Merge branch
git merge dev --no-edit

# Cherry-pick commit
git log <branch-name> -1
git cherry-pick <commit-hash>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Commit without verification
git commit -m "Message" --no-verify
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Your License Here]