# 🚀 Deployment Instructions

## Option 1: Railway (Recommended - Easiest)

Railway is the easiest option with FFmpeg pre-installed and generous free tier.

### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (recommended)

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select this repository
   - Railway will automatically detect it's a Node.js app

3. **Automatic Deployment**
   - Railway will automatically:
     - Install dependencies (`npm install`)
     - Start the server (`npm start`)
     - Provide a public URL
   - FFmpeg is pre-installed on Railway!

4. **Get Your URL**
   - Once deployed, Railway will provide a URL like: `https://your-app-name.up.railway.app`
   - Your magical video converter is now live! ✨

### Railway Features:
- ✅ FFmpeg pre-installed
- ✅ Free tier: 500 hours/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Easy environment variables

---

## Option 2: Render (Alternative)

Render is another great free option with FFmpeg support.

### Steps:

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: billie-video-converter
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - FFmpeg is available in Render's environment

### Render Features:
- ✅ FFmpeg pre-installed
- ✅ Free tier: 750 hours/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Automatic deploys from GitHub

---

## Option 3: Heroku (Classic Option)

Heroku requires a buildpack for FFmpeg but is still reliable.

### Steps:

1. **Install Heroku CLI**
   - Download from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add FFmpeg Buildpack**
   ```bash
   heroku buildpacks:add --index 1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
   heroku buildpacks:add --index 2 heroku/nodejs
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy magical video converter"
   git push heroku main
   ```

---

## 🎯 Recommended: Railway

**Railway is the easiest option** because:
- No buildpack configuration needed
- FFmpeg works out of the box
- Simple GitHub integration
- Generous free tier
- Automatic HTTPS

## 🧪 Testing Your Deployment

Once deployed, test your app by:
1. Visiting your deployment URL
2. Uploading a small video file
3. Watching the magical conversion happen
4. Downloading the converted WebM file

## 🔧 Environment Variables (Optional)

If you need to configure anything, you can set these environment variables:
- `PORT` - Server port (automatically set by most platforms)
- `NODE_ENV` - Set to "production" for production optimizations

## 🎉 You're Live!

Your magical video converter is now available to the world! Share the URL and let people experience the magic of Billie's video conversion! ✨🪄
