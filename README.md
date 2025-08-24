# Invasion Events Manager

A real-time event tracking application for game invasion events with countdown timers and notification system.

## Features

- ⏰ **Real-time Countdown**: Live countdown timers for each event
- 🔔 **Smart Notifications**: Get notified 5 minutes before events start
- 💾 **Persistent Storage**: Your followed events are saved locally
- 🔍 **Quick Search**: Search with suggestions and quick tags
- 🌙 **Dark Mode**: Clean dark interface
- 📱 **Responsive Design**: Works on all devices

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Build the application
npm run build

# The static files will be in the 'out' directory
```

## Deployment to GitHub Pages

### Method 1: Automatic Deployment (Recommended)

1. Fork or clone this repository to your GitHub account
2. Go to Settings → Pages in your repository
3. Set Source to "GitHub Actions"
4. Push to main branch or manually trigger the workflow
5. Your site will be available at: `https://[your-username].github.io/event-nextjs-app`

### Method 2: Manual Deployment

1. Build the project locally:
```bash
npm run build
```

2. Push the `out` folder to gh-pages branch:
```bash
npx gh-pages -d out
```

3. Enable GitHub Pages in repository settings

## Usage

### For Users

1. **Enable Notifications**: Click "Enable Notifications" button and allow browser notifications
2. **Follow Events**: Click "Follow" on any event card to receive notifications
3. **Search Events**: Use the search bar with quick tags or type to search
4. **View Details**: Hover over event cards to see all rewards and spawn times

### For Admins

1. Press `Ctrl+Shift+A` to show admin button
2. Click "Admin" and login with password: `admin123`
3. Add, edit, or delete events as needed

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Date-fns**: Date manipulation
- **Lucide Icons**: Beautiful icons

## Event Data Structure

Events include:
- Name and location (map)
- Multiple spawn times (repeating daily)
- Reward items list
- Currency rewards (Ruud, WC, GP)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited notification support
- Mobile browsers: Basic functionality (notifications may not work)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

**Note**: All times are displayed in GMT+7 timezone.
