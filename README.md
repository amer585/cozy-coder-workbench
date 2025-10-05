# AI Code Studio

![AI Code Studio](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-18.3-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Vite](https://img.shields.io/badge/Vite-5.x-646cff)

An AI-powered code editor with live preview, chat assistant, and intelligent file management. Build and edit code with the help of AI, see changes in real-time, and manage conversations seamlessly.

## ✨ Features

- 🤖 **AI Code Assistant** - Chat with AI to generate, edit, and debug code
- 📝 **Live Code Editor** - Monaco-based editor with syntax highlighting
- 👁️ **Instant Preview** - See your changes in real-time
- 💬 **Chat History** - Save and manage multiple conversations
- 📁 **Smart File Management** - Collapsible file explorer with full CRUD operations
- 🎨 **Modern UI** - Beautiful gradient design with dark theme
- 🔄 **Auto-sync** - Files automatically update with AI suggestions

## 🚀 Tech Stack

- **Frontend Framework**: React 18.3
- **Build Tool**: Vite 5.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui
- **Backend**: Supabase (Database, Authentication, Edge Functions)
- **AI Provider**: OpenRouter API
- **Router**: React Router v6

## 📋 Prerequisites

- Node.js (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or yarn
- Supabase account (for backend features)
- OpenRouter API key (for AI features)

## 🛠️ Installation

1. **Clone the repository**
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```sh
npm install
# or
yarn install
```

3. **Set up environment variables**

The project uses Supabase and requires the following environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

These are automatically configured when using Lovable Cloud.

4. **Start the development server**
```sh
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:8080`

## 🎯 Usage

### Getting Started

1. **Landing Page**: Visit the home page to see the introduction
2. **Start Building**: Click "Get Started" to open the studio
3. **Create Files**: Use the file explorer to create new files
4. **Chat with AI**: Use the AI Assistant tab to generate code
5. **Live Preview**: Switch to the Preview tab to see your work

### AI Assistant Commands

The AI can help you:
- Create new files: "Create a React component called Button"
- Edit existing files: "Add a hover effect to the button"
- Debug code: "Why isn't this function working?"
- Explain concepts: "Explain how React hooks work"

### File Operations

- **Create**: Click the + button in the file explorer
- **Edit**: Click a file to open it in the editor
- **Rename**: Hover over a file and click the edit icon
- **Delete**: Hover over a file and click the trash icon
- **Collapse**: Click the arrow to minimize the file explorer

### Chat History

- **New Chat**: Click "New Chat" to start a fresh conversation
- **Switch Chats**: Click any previous conversation to continue
- **Delete Chat**: Hover over a chat and click the delete icon

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Chat.tsx        # AI chat interface
│   ├── ChatHistory.tsx # Conversation management
│   ├── CodeEditor.tsx  # Code editing component
│   ├── PreviewPane.tsx # Live preview display
│   ├── CollapsibleFileExplorer.tsx
│   └── ui/             # shadcn-ui components
├── hooks/              # Custom React hooks
│   └── useFileSystem.ts # File management logic
├── pages/              # Route-level components
│   ├── Landing.tsx     # Home page
│   └── Studio.tsx      # Main editor workspace
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client & types
└── lib/                # Utility functions
    └── utils.ts
```

## 📦 Building for Production

```sh
npm run build
# or
yarn build
```

The optimized production build will be in the `dist/` directory.

## 🚀 Deployment

### Deploy with Lovable (Recommended)

1. Open your project in [Lovable](https://lovable.dev)
2. Click Share → Publish
3. Your app will be deployed instantly

### Deploy to Netlify

```sh
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Deploy to Vercel

```sh
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🔐 Environment Variables for Production

Make sure to set these in your deployment platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 🌐 Custom Domain

To connect a custom domain:

1. Go to Project > Settings > Domains in Lovable
2. Click "Connect Domain"
3. Follow the DNS configuration instructions

[Learn more about custom domains](https://docs.lovable.dev/features/custom-domain)

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Ensure all dependencies are installed: `npm install`
- Clear cache and reinstall: `rm -rf node_modules package-lock.json && npm install`

**Runtime Errors**
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure Supabase project is running

**AI Not Responding**
- Verify OpenRouter API key is configured
- Check network tab for failed requests
- Ensure edge function is deployed

## 📚 Documentation

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn-ui](https://ui.shadcn.com)
- [Supabase Docs](https://supabase.com/docs)
- [Lovable Docs](https://docs.lovable.dev)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- AI powered by [OpenRouter](https://openrouter.ai)
- Backend by [Supabase](https://supabase.com)
- UI components by [shadcn-ui](https://ui.shadcn.com)

---

**Project URL**: https://lovable.dev/projects/3e450a25-3826-4314-85e5-fe277f4b9267

Built with ❤️ using Lovable
