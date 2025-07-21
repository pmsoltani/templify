# Templify

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)

**Automated PDF Generation Made Simple**

Templify is a powerful SaaS platform that allows you to create custom HTML templates and generate professional PDFs through a simple API. Perfect for invoices, letters, certificates, and more.

## 🌟 Features

- **🎨 Template Designer**: Create beautiful HTML templates with custom CSS styling and assets
- **📝 Code Editor**: Built-in Monaco editor for editing HTML and CSS
- **⚡ Real-time Preview**: Live PDF preview as you edit your templates
- **🔧 Mustache Variables**: Dynamic content using `{{variable}}` syntax
- **⚙️ PDF Settings**: Customize format, orientation, margins, and more
- **🔐 Secure API**: JWT authentication and API key-based access
- **☁️ Cloud Storage**: S3-compatible storage for template and PDF storage (I'm using R2)
- **📊 Dashboard**: Manage templates and track generated PDFs
- **🌙 Dark Mode**: Beautiful UI using shadcn components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- S3-compatible bucket (for file storage)
- SMTP service (for email notifications)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/pmsoltani/templify.git
cd templify
```

2. **Install dependencies**

```bash
# Backend dependencies
cd api
npm install

# Frontend dependencies
cd ../web
npm install
```

3. **Environment Setup**

Create `.env` files in both `api/` and `web/` directories:

**api/.env**

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/templify
# For Render's free tier PostgreSQL:
PGSSLMODE=no-verify

# JWT
JWT_SECRET=your-super-secret-jwt-key

# R2 Storage
R2_ENDPOINT=https://your-r2-endpoint
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# App Config
FRONTEND_URL=http://localhost:3000
PORT=3001
```

**web/.env**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Database Setup**

```bash
cd api
npm run migrate up
```

5. **Start the Application**

```bash
# Start the API server (from api/ directory)
npm run dev

# Start the web app (from web/ directory)
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📖 Usage

### Creating Templates

1. **Sign up** for an account at `/register`
2. **Create a new template** with HTML content
3. **Add variables** using Mustache syntax: `{{customerName}}`, `{{invoiceNumber}}`
4. **Upload assets** like CSS files, images, or fonts
5. **Configure PDF settings** (format, orientation, margins)
6. **Preview** your template with sample data

### Generating PDFs via API

```javascript
// Get your API key from the dashboard
const response = await fetch("/api/templates/{templateId}/generate", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    customerName: "John Doe",
    invoiceNumber: "INV-001",
    items: [
      { name: "Website Design", price: 1500 },
      { name: "Development", price: 3000 },
    ],
  }),
});

const result = await response.json();
console.log("PDF URL:", result.data.pdf.tempUrl);
```

### Template Example

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Invoice</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="invoice">
      <h1>Invoice #{{invoiceNumber}}</h1>
      <p><strong>Bill To:</strong> {{customerName}}</p>

      <table class="items">
        {{#items}}
        <tr>
          <td>{{name}}</td>
          <td>${{price}}</td>
        </tr>
        {{/items}}
      </table>

      <div class="total">
        <strong>Total: ${{total}}</strong>
      </div>
    </div>
  </body>
</html>
```

## 🏗️ Architecture

### Backend (api/)

- **Framework**: Express.js with ES modules
- **Database**: PostgreSQL with node-pg-migrate
- **Authentication**: JWT tokens + API keys
- **PDF Generation**: Puppeteer with Chromium
- **Template Engine**: Mustache.js
- **File Storage**: S3-compatible storage (R2)
- **Email**: Nodemailer
- **Validation**: Zod schemas

### Frontend (web/)

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn components
- **Code Editor**: Monaco Editor
- **State Management**: React Context

### Key Components

```
api/
├── migrations/         # Database migrations
└── src/
    ├── config/         # Database, S3, Puppeteer, etc setup
    ├── controllers/    # Request handlers
    ├── middlewares/    # Auth, validation, error handling
    ├── repositories/   # Database queries
    ├── routes/         # API routes
    ├── schemas/        # Zod validation schemas
    ├── services/       # Business logic
    └── utils/          # Helper functions

web/
├── public/             # Static assets
└── src/
    ├── app/            # Next.js app router pages
    ├── components/     # React components
    ├── contexts/       # React context providers
    ├── hooks/          # Custom React hooks
    ├── lib/            # Utilities and configuration
    └── utils/          # Helper functions
```

## 🤝 Contributing

All contributions are welcome! Feel free to submit issues or pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](api/LICENSE) file for details.

## 🙏 Acknowledgments

- [Mustache.js](https://mustache.github.io/) for template rendering
- [Puppeteer](https://pptr.dev/) for PDF generation
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

⭐ **Star this repository if you find it helpful!**

For questions or support, please [open an issue](https://github.com/pmsoltani/templify/issues).
