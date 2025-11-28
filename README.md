# French Learning App

A modern, interactive web application for learning French vocabulary. Organize your studies with modules and lessons, add French words and phrases, and practice with automatic English translations. Designed for students who need persistent storage that survives browser session clears.

## Features

### 👤 Profile System
- **Simple Access**: Create a profile with an optional nickname to get a unique 4-digit code
- **Code-Based Resume**: Save your code to resume practice anytime, even after browser closes
- **No Login Required**: Start learning immediately without account creation
- **Persistent Storage**: All progress is saved in the cloud (Vercel KV/Redis)

### 📚 Organization
- **Modules**: Create custom learning modules to organize your vocabulary by topic, level, or theme
- **Lessons**: Break down modules into manageable lessons (e.g., by week or category)
- **Flexible Structure**: Edit, rename, and delete modules and lessons as your learning evolves

### 📝 Vocabulary Management
- **Add Entries**: Easily add French words or phrases to any lesson
- **Auto-Translation**: Automatically fetches English translations using Google Translate API
- **Edit & Delete**: Update existing entries or remove them with confirmation dialogs
- **Auto-Save**: Changes are automatically saved to the cloud every 1.5 seconds

### 🎯 Practice Mode
- **Interactive Learning**: Toggle translations on/off to test your knowledge
- **Audio Playback**: Listen to French pronunciation using browser text-to-speech
- **Visual Feedback**: Clear indicators for showing/hiding translations

### 💾 Data Persistence
- **Cloud Storage**: All data is saved in Vercel KV (Redis-based storage)
- **Survives Browser Closes**: Perfect for school laptops that clear sessions
- **Instant Access**: Resume practice instantly with just your 4-digit code

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4 with custom theme variables
- **Database**: Vercel KV (Redis) for persistent storage
- **UI Components**: Radix UI primitives (Tabs, Alert Dialog, Button, Input, Card)
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications
- **Translation API**: Google Cloud Translation API

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- Vercel account (for KV database)
- Google Cloud Translation API key (for translations)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd french-learning-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

   Create a `.env.local` file in the root directory:
   ```env
   REDIS_URL=your_redis_url_here
   GOOGLE_TRANSLATE_KEY=your_google_translate_api_key_here
   ```

   **Getting your Redis URL:**
   - Go to Vercel Dashboard → Storage → Create KV Database
   - Copy the connection string and add it as `REDIS_URL`

   **Getting your Google Translate Key:**
   - Go to Google Cloud Console
   - Enable Cloud Translation API
   - Create credentials and copy the API key

4. Link to Vercel project (optional, for pulling env vars):
```bash
npm install -g vercel
vercel link
vercel env pull .env.local
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Usage

### First Time

1. **Create a Profile**: 
   - Go to the home page
   - Click "Start New Profile"
   - Optionally enter a nickname
   - Click "Create My Practice"
   - **Save your 4-digit code** - write it in your notebook!

2. **Start Practicing**:
   - Click "Start Practicing" to go to the practice page
   - Create modules and lessons
   - Add French vocabulary entries
   - Your progress auto-saves in the background

### Returning User

1. **Resume Practice**:
   - Go to the home page
   - Click "Resume Practice"
   - Enter your 4-digit code
   - Continue where you left off!

### Practice Features

1. **Create a Module**: Click "Add Module" to create a new learning module
2. **Add Lessons**: Within each module, click "Add Lesson" to create vocabulary lessons
3. **Add Vocabulary**: 
   - Select an active lesson
   - Type French text in the input field
   - Press Enter or click "Add" to add the entry with automatic translation
4. **Practice**: 
   - Click the language button to toggle translations
   - Use the play button to hear pronunciation
   - Practice reading French and checking your understanding
5. **Organize**: Use the edit and delete buttons to manage your content

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── profile/
│   │   │   ├── create/route.js      # Create new profile
│   │   │   └── lookup/route.js      # Lookup profile by code
│   │   ├── progress/
│   │   │   ├── save/route.js        # Save learner progress
│   │   │   └── load/route.js        # Load learner progress
│   │   └── translate/route.js       # Translation API endpoint
│   ├── components/ui/                # Reusable UI components
│   ├── practice/
│   │   └── [learnerId]/page.js      # Main practice page
│   ├── start/page.js                 # Profile creation page
│   ├── resume/page.js                # Code entry page
│   ├── page.js                       # Landing page
│   ├── globals.css                   # Global styles
│   └── layout.js                     # Root layout
└── lib/
    ├── kv.js                         # KV database utilities
    └── utils.ts                      # Utility functions
```

## Data Storage

All data is stored in Vercel KV (Redis) with the following structure:

### Storage Keys:
- `code:{code}` → `learnerId` (maps 4-digit code to learner ID)
- `profile:{learnerId}` → Profile object
- `progress:{learnerId}` → Progress data

### Data Structure:

**Profile:**
```typescript
{
  learnerId: string,
  name: string,
  code: string,
  createdAt: string
}
```

**Progress:**
```typescript
{
  modules: [
    {
      id: string,
      name: string,
      lessons: [
        {
          id: string,
          name: string,
          entries: [
            {
              id: string,
              french: string,
              english: string,
              showTranslation: boolean
            }
          ]
        }
      ]
    }
  ],
  activeModuleId: string,
  activeLessonId: string
}
```

## Deployment

This app is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel Dashboard:
   - `REDIS_URL` (or KV connection variables)
   - `GOOGLE_TRANSLATE_KEY`
4. Create a Vercel KV database in the Storage tab
5. Deploy!

The KV database connection will be automatically available in production.

## License

This project is private.

## Acknowledgments

- Translation service provided by [Google Cloud Translation API](https://cloud.google.com/translate)
- Storage provided by [Vercel KV](https://vercel.com/storage/kv)
- UI components built with [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
