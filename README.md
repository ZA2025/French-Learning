# French Learning App

A modern, interactive web application for learning French vocabulary. Organize your studies with modules and lessons, add French words and phrases, and practice with automatic English translations.

## Features

### 📚 Organization
- **Modules**: Create custom learning modules to organize your vocabulary by topic, level, or theme
- **Lessons**: Break down modules into manageable lessons (e.g., by week or category)
- **Flexible Structure**: Edit, rename, and delete modules and lessons as your learning evolves

### 📝 Vocabulary Management
- **Add Entries**: Easily add French words or phrases to any lesson
- **Auto-Translation**: Automatically fetches English translations using MyMemory Translation API
- **Edit & Delete**: Update existing entries or remove them with confirmation dialogs

### 🎯 Practice Mode
- **Interactive Learning**: Toggle translations on/off to test your knowledge
- **Audio Playback**: Listen to French pronunciation using browser text-to-speech
- **Visual Feedback**: Clear indicators for showing/hiding translations

### 💾 Data Persistence
- **Local Storage**: All your data is saved automatically in your browser's local storage
- **No Account Required**: Start learning immediately without registration

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4 with custom theme variables
- **UI Components**: Radix UI primitives (Tabs, Alert Dialog, Button, Input, Card)
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications
- **Translation API**: MyMemory Translation API

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn

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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Usage

1. **Create a Module**: Click "Add Module" to create a new learning module
2. **Add Lessons**: Within each module, click "Add Lesson" to create vocabulary lessons
3. **Add Vocabulary**: 
   - Select an active lesson
   - Type French text in the input field
   - Press Enter or click "Add" to add the entry with automatic translation
4. **Practice**: 
   - Click on entries to toggle translations
   - Use the language button to hear pronunciation
   - Practice reading French and checking your understanding
5. **Organize**: Use the edit and delete buttons to manage your content

## Project Structure

```
src/
├── app/
│   ├── components/ui/     # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   ├── alert-dialog.tsx
│   │   └── sonner.tsx
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.js          # Root layout
│   └── page.js            # Main application component
└── lib/
    └── utils.ts           # Utility functions (cn helper)
```

## Data Storage

All data is stored in the browser's `localStorage` under the key `frenchLearningData`. The data structure:

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
  ]
}
```

## License

This project is private.

## Acknowledgments

- Translation service provided by [MyMemory Translation API](https://mymemory.translated.net/)
- UI components built with [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
