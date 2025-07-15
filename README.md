# Dash

All-in-one platform for link management and developer tools. Shorten URLs, track analytics, and access 16+ powerful utilities including QR generators, JSON formatters, and text analyzers.

## Features

### 🔗 Link Management
- **URL Shortening**: Create shortened links with custom aliases
- **Link Analytics**: Track clicks, views, and performance metrics
- **Privacy Controls**: Public/private link settings with status management
- **Advanced Table Interface**: Sortable, filterable data table with bulk operations

### 🛠️ Developer Tools Suite (16+ Tools)

**Text Processing:**
- Text Counter & Analyzer
- Text Diff Comparison
- Text Encryption (Morse, Caesar cipher, etc.)
- Lorem Ipsum Generator

**Data Processing:**
- JSON Formatter & Validator
- Multi-Format Encoder/Decoder (Base64, Base32, Base16)
- URL Encoder/Decoder
- CSV/JSON Table Viewer
- Fake Data Generator

**Code Generation:**
- QR Code Generator (with watermark support)
- Barcode Generator
- ASCII Art Generator
- Open Graph Meta Tag Generator

**Utilities:**
- Password Generator (with breach checking)
- Timestamp Converter
- Binary Clock
- Markdown Editor

### 🎨 Modern UI/UX
- Responsive design with mobile-first approach
- Dark/Light mode with system preference detection
- Collapsible sidebar navigation
- Toast notifications and loading states
- Accessibility-focused design

## Tech Stack

### Frontend
- **SvelteKit 2.x** - Meta-framework
- **Svelte 5** - Modern reactivity
- **TypeScript** - Type safety
- **Tailwind CSS 4.x** - Utility-first styling
- **Shadcn/UI** - Component library

### Backend & Database
- GoLang

### Development
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **Playwright** - E2E testing
- **ESLint & Prettier** - Code quality

### Additional Features
- **Internationalization** - Paraglide.js (English, Indonesian, Japanese)
- **Deployment** - Vercel adapter configured

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/linkeunid/linkeun-app.git
cd linkeun-app

# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

### Development Commands

```bash
# Development
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build

# Database
npm run db:push     # Push schema to database
npm run db:migrate  # Run migrations
npm run db:studio   # Open database studio

# Code Quality
npm run lint        # Lint code
npm run format      # Format code
npm run check       # Type checking
npm run test        # Run tests
```

## Project Structure

```
src/
├── routes/             # Application routes
│   ├── auth/          # Authentication pages
│   ├── links/         # Link management
│   ├── tools/         # Developer tools
│   └── settings/      # User settings
├── lib/
│   ├── components/    # Reusable UI components
│   ├── server/        # Server-side utilities
│   ├── config/        # Configuration files
│   └── hooks/         # Custom hooks
└── types/             # TypeScript definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

The application is configured for deployment on Vercel:

```bash
npm run build
```

For other platforms, you may need to install a different [SvelteKit adapter](https://svelte.dev/docs/kit/adapters).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- GitHub: @Hanivan

## Support

For support, email support@linkeun.com or visit our [GitHub repository](https://github.com/linkeunid/linkeun-app).