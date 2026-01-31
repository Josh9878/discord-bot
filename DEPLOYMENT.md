# Quick Deployment Guide - Get Your Bot Online Fast!

This guide will help you deploy your Discord bot to a **free hosting platform** so it runs 24/7 and you can just invite it to your server.

## Option 1: Railway.app (Recommended - Easiest)

Railway offers $5 free credits per month (enough for a small bot).

### Steps:

1. **Create accounts:**
   - Sign up at [Railway.app](https://railway.app/)
   - Sign up at [GitHub.com](https://github.com/) if you don't have an account

2. **Upload your bot to GitHub:**
   - Go to [GitHub.com](https://github.com/new)
   - Create a new repository (name it "discord-bot")
   - Upload all bot files EXCEPT `.env` (never upload your token!)

3. **Deploy on Railway:**
   - Go to [Railway.app](https://railway.app/)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your discord-bot repository
   - Click on your project, then "Variables"
   - Add: `DISCORD_TOKEN` = your bot token
   - Railway will automatically detect and deploy your bot!

4. **Keep it running:**
   - Your bot will start automatically
   - Railway keeps it running 24/7 (as long as you have credits)

---

## Option 2: Render.com (Good Alternative)

Render offers a free tier that works great for Discord bots.

### Steps:

1. **Create accounts:**
   - Sign up at [Render.com](https://render.com/)
   - Sign up at [GitHub.com](https://github.com/) if you don't have an account

2. **Upload to GitHub:**
   - Go to [GitHub.com](https://github.com/new)
   - Create a new repository
   - Upload all bot files EXCEPT `.env`

3. **Deploy on Render:**
   - Go to your Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: discord-bot
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Add Environment Variable:
     - Key: `DISCORD_TOKEN`
     - Value: your bot token
   - Click "Create Web Service"

4. **Keep it awake:**
   - Free tier sleeps after inactivity
   - Use a service like [UptimeRobot](https://uptimerobot.com/) to ping it every 5 minutes

---

## Option 3: Replit (Beginner Friendly)

Replit is super easy but may have limitations on free tier.

### Steps:

1. **Go to [Replit.com](https://replit.com/)**
2. Click "Create Repl"
3. Choose "Node.js" template
4. Upload/paste all your bot files
5. In the "Secrets" tab (lock icon), add:
   - Key: `DISCORD_TOKEN`
   - Value: your bot token
6. Click "Run" button
7. Keep the tab open or use "Always On" feature (paid)

---

## Option 4: Your Own Computer (Testing Only)

**For permanent 24/7 hosting, use one of the options above.**

If you just want to test locally:

1. Install [Node.js](https://nodejs.org/)
2. Download all bot files to a folder
3. Create `.env` file with your token
4. Open terminal/command prompt in that folder
5. Run:
   ```bash
   npm install
   npm start
   ```
6. Keep your computer on and terminal window open

**Downside:** Bot goes offline when you close the terminal or turn off your computer.

---

## After Deployment: Invite Your Bot

Once your bot is running on any platform:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to "OAuth2" → "URL Generator"
4. Select scopes: **bot**
5. Select permissions:
   - Send Messages
   - Read Messages/View Channels
   - Embed Links
   - Read Message History
6. Copy the generated URL
7. Open it in browser and invite to your server!

---

## Troubleshooting

**Bot is offline:**
- Check your hosting platform's logs
- Verify DISCORD_TOKEN is set correctly
- Make sure you didn't upload `.env` to GitHub (security issue!)

**Bot invited but doesn't respond:**
- Enable "Message Content Intent" in Discord Developer Portal
- Enable "Server Members Intent" for welcome messages
- Check bot has proper permissions in your server

**Free tier limitations:**
- Railway: $5 credits/month (~750 hours)
- Render: May sleep after 15 mins of inactivity (use UptimeRobot)
- Replit: Needs tab open or paid "Always On"

---

## Recommended Setup (Free & Easy)

For beginners, I recommend:
1. **Railway.app** for hosting (easiest setup)
2. Create GitHub account to store code
3. Follow Railway steps above

Total time: ~10 minutes to get your bot online!

---

## Security Reminders

- ✅ Never share your bot token
- ✅ Never upload `.env` file to GitHub
- ✅ Use environment variables on hosting platforms
- ✅ Add `.env` to `.gitignore`

---

Need help? The README.md file has additional troubleshooting tips!