# SpendSense AI 🧠💰

**Smarter Spending, Better Saving.** Turn your transaction data into actionable financial insights using AI.

## 🚀 Features

- **AI-Powered Analysis**: Automatically categorize transactions using Google's Gemini AI
- **Anomaly Detection**: Identify unusual spending patterns and potential fraud
- **Smart Savings Tips**: Get personalized recommendations to optimize your finances
- **PDF & CSV Support**: Upload bank statements in multiple formats
- **Interactive Dashboard**: Beautiful charts and visualizations
- **Export Reports**: Generate PDF reports of your financial analysis

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **AI**: Google Genkit with Gemini 2.5 Flash
- **Charts**: Recharts
- **PDF**: jsPDF, html2canvas

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/divanshu-1/SpendSenseAi.git
   cd SpendSenseAi
   ```

2. **Install dependencies**
   ```bash
   cd studio
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Google AI API key to `.env.local`:
   ```
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```
   Get your API key from: https://aistudio.google.com/app/apikey

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9002`

## 📊 How to Use

1. **Login**: Use `test@example.com` or click "Sign in with Google"
2. **Upload Data**: Drag & drop your CSV/PDF bank statements
3. **Try Sample Data**: Click "Try with Sample Data" for a quick demo
4. **Analyze**: AI will categorize transactions and detect anomalies
5. **Get Insights**: View spending breakdown and savings recommendations
6. **Export**: Download your analysis as a PDF report

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Genkit AI tools
npm run genkit:dev

# Type checking
npm run typecheck
```

## 📁 Project Structure

```
studio/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── app/            # App-specific components
│   ├── ai/                 # AI flows and configuration
│   │   └── flows/          # Genkit AI flows
│   ├── lib/                # Utilities and types
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── package.json
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect your repo to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
- **Netlify**: Works with static export
- **Railway**: Full-stack deployment
- **Firebase Hosting**: With Cloud Functions

## 🔐 Environment Variables

```bash
# Required
GOOGLE_GENAI_API_KEY=your_google_ai_api_key

# Optional (for Firebase features)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_API_KEY=your_api_key
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ by [Divanshu](https://github.com/divanshu-1)
