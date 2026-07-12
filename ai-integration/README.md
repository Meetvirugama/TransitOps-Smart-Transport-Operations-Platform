# TransitOps AI Features Integration Directory

This folder contains all the files created for the AI integrations. 

Below is a detailed guide on the files in this directory and how they integrate into the main project.

---

## 📁 Directory Structure

```
ai-integration/
├── backend/
│   ├── scripts/
│   │   └── test-ai-features.js        # Test suite for Gemini, Groq, and weather endpoints
│   └── src/
│       └── modules/
│           └── ai/
│               ├── ai.service.js       # Core service for prompt building, Markdown stripping, and Groq rotation
│               ├── ai.controller.js    # Express route controller and validation
│               └── ai.routes.js        # Protected express routes
└── frontend/
    └── src/
        └── components/
            ├── AIChatbot.jsx           # Floating AI Chatbot Assistant widget
            ├── WeatherAlert.jsx        # Weather banner check for Mumbai using Open-Meteo API
            └── OperationsBrief.jsx     # Groq × Gemini Operations Brief with SVG risk dial
```

---

## 🔌 Core Project Integrations

To integrate these files into the main project, the following changes were made:

### 1. Backend Integration

#### 🔐 Environment Keys: `backend/.env`
Added variables for the API keys:
```env
# Gemini API Key (get from aistudio.google.com)
GEMINI_API_KEY=AIzaSy...

# Rotational Groq API Keys (get from console.groq.com)
GROQ_API_KEY_1=YOUR_GROQ_API_KEY_1_HERE
GROQ_API_KEY_2=YOUR_GROQ_API_KEY_2_HERE
GROQ_API_KEY_3=YOUR_GROQ_API_KEY_3_HERE
GROQ_API_KEY_4=YOUR_GROQ_API_KEY_4_HERE
```

#### ⚙️ Configuration File: `backend/src/config/env.js`
Exposed keys:
```javascript
const env = {
  // ... existing env variables
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  groqApiKeys: [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ].filter(Boolean),
};
```

#### 🚦 Server Registration: `backend/src/app.js`
Registered routes under `/api/ai`:
```javascript
const aiRoutes = require('./modules/ai/ai.routes');
// ...
app.use('/api/ai', aiRoutes);
```

---

### 2. Frontend Integration

#### 🖥️ Dashboard Page: `frontend/src/pages/Dashboard.jsx`
Integrated `<WeatherAlert />` and `<OperationsBrief />` components:
```jsx
import WeatherAlert from '../components/WeatherAlert';
import OperationsBrief from '../components/OperationsBrief';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 select-none">
      <h2>Dashboard</h2>
      
      {/* Weather Banner Alert */}
      <WeatherAlert />
      
      {/* KPI Cards and Grid */}
      {/* ... */}
      
      {/* Dual-AI Brief Card */}
      <OperationsBrief />
    </div>
  );
}
```

#### 🤖 Layout Mounting: `frontend/src/App.jsx`
Added the Chatbot widget to the layout so it is accessible everywhere:
```jsx
import AIChatbot from './components/AIChatbot';

// Rendered globally at the layout level:
<AIChatbot />
```

#### 💫 Animations: `frontend/src/index.css`
Added fade-in animation:
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}
```
