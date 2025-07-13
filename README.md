# ColdScale - Cold Email Scaling Platform

A modern, free, and scalable cold email writing, scaling, and sending platform with a visually striking neo-cyber UI. Built with React, TypeScript, and powered by open-source tools.

## 🚀 Features

- **AI-Powered Email Writing**: Generate compelling cold emails with integrated AI
- **Smart Personalization**: Automatically personalize emails for each recipient
- **Bulk Email Sending**: Send thousands of emails with your own SMTP setup
- **Advanced Analytics**: Track opens, clicks, and replies with detailed insights
- **Contact Management**: Import, organize, and segment your contacts
- **Modern UI**: Neo-cyber aesthetic with glass morphism and smooth animations
- **Completely Free**: No paid APIs or services required

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom neo-cyber theme
- **Animation**: Framer Motion
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Email Sending**: Nodemailer (user's own SMTP)
- **AI**: WebLLM (browser-based) or self-hosted LLM
- **Icons**: Lucide React
- **Charts**: Recharts

## 🏗️ Project Structure

```
cold-email-scaling-platform/
├── src/
│   ├── components/           # Reusable UI components
│   ├── contexts/            # React contexts (Auth, etc.)
│   ├── lib/                 # Utility libraries (Supabase, etc.)
│   ├── pages/               # Page components
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cold-email-scaling-platform.git
   cd cold-email-scaling-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your URL and anon key
3. Update your `.env` file with these credentials

## 🎨 Design Philosophy

The UI follows a "neo-cyber" aesthetic with:

- **Glass morphism**: Translucent cards with backdrop blur
- **Kinetic animations**: Smooth micro-interactions using Framer Motion
- **Custom color palette**: Teal and copper accents on dark backgrounds
- **Modern typography**: Inter font for clean, geometric text
- **Responsive design**: Mobile-first approach with touch-friendly interfaces

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- ESLint for code quality

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms

The app can be deployed on any static hosting service:
- Netlify
- GitHub Pages
- Railway
- Render

## 📖 User Guide

### Getting Started

1. **Sign Up**: Create a free account
2. **Setup SMTP**: Configure your email provider settings
3. **Import Contacts**: Upload your contact list via CSV
4. **Create Campaign**: Use AI to generate email content
5. **Send Emails**: Launch your campaign with scheduling options
6. **Track Results**: Monitor opens, clicks, and replies

### SMTP Configuration

Supported email providers:
- Gmail (with app passwords)
- Outlook/Hotmail
- Custom SMTP servers
- Mailgun (free tier)
- SendGrid (free tier)

## 🛡️ Security

- Environment variables for sensitive data
- Supabase handles authentication securely
- No sensitive data stored in frontend
- SMTP credentials encrypted server-side

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Framer Motion](https://framer.com/motion) for animations
- [Lucide](https://lucide.dev) for icons
- [Vite](https://vitejs.dev) for build tooling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/cold-email-scaling-platform/issues) page
2. Create a new issue with detailed description
3. Join our community discussions

---

Built with ❤️ for the email marketing community