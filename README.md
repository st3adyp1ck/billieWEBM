# 🪄 Billie's Magic Video Converter

A playful, storybook-themed video converter that transforms videos into WebM format with magical 512x512 resizing!

## ✨ Features

- **🎬 Magic Video Conversion**: Convert any video format to WebM
- **📐 Smart Resizing**: Automatically resizes to 512x512 while preserving aspect ratio
- **🎨 Playful UI**: Storybook-themed interface with bubbly animations
- **⚡ Lightning Fast**: Uses system FFmpeg for optimal performance
- **🌈 Progress Tracking**: Real-time conversion progress with magical effects
- **📱 Responsive Design**: Works on all devices
- **🌍 Multi-language**: English and French support

## 🚀 Getting Started

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Install FFmpeg** (for local development):
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and install to `C:\ffmpeg\`
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg`

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎭 Tech Stack

- **Backend**: Express.js with Node.js
- **Video Processing**: FFmpeg with fluent-ffmpeg
- **File Upload**: Multer
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Styling**: Custom CSS with magical animations
- **Fonts**: Google Fonts (Fredoka)

## 📁 Project Structure

```
billie-webm-converter/
├── public/           # Static files (HTML, CSS, JS, images)
├── server.js         # Express server
├── package.json      # Dependencies and scripts
├── Procfile         # Deployment configuration
└── README.md        # This file
```

## 🌟 Deployment

This app is ready for deployment on platforms like Railway, Render, or Heroku that have FFmpeg pre-installed.

## 🎨 Customization

The magical theme can be customized by editing:
- `public/styles.css` - All the magical animations and colors
- `public/translations.js` - Text content and language support
- `public/billie.png` - The main logo image
