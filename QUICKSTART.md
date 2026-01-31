# 🚀 Quick Start - Get Your Bot Online in 10 Minutes!

## What You Need
1. A Discord account
2. 10 minutes of your time
3. A free Railway.app account

## Step-by-Step Setup

### Part 1: Create Your Discord Bot (3 minutes)

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Click "New Application"
   - Name it whatever you want (e.g., "My Server Bot")
   - Click "Create"

2. **Create the Bot**
   - Click on "Bot" in the left sidebar
   - Click "Add Bot" → "Yes, do it!"
   - Click "Reset Token" and copy the token (save it somewhere safe!)

3. **Enable Important Settings**
   - Scroll down to "Privileged Gateway Intents"
   - Turn ON these switches:
     - ✅ Server Members Intent
     - ✅ Message Content Intent
   - Click "Save Changes"

### Part 2: Deploy Your Bot (5 minutes)

**Option A: Railway (Recommended)**

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Click "Deploy from GitHub repo" → "Configure GitHub App"
5. Create a new GitHub repository:
   - Go to https://github.com/new
   - Name: "discord-bot"
   - Upload all files EXCEPT `.env`
6. Back to Railway, select your repository
7. Click on your project → "Variables" tab
8. Click "New Variable"
   - Name: `DISCORD_TOKEN`
   - Value: Paste your bot token from Part 1
9. Your bot will deploy automatically!

**Option B: Use Your Computer (Quick Test)**

1. Install Node.js from https://nodejs.org/
2. Download all bot files to a folder
3. Create a file named `.env` in that folder
4. Add this line: `DISCORD_TOKEN=your_token_here`
5. Open terminal/command prompt in that folder
6. Run: `npm install`
7. Run: `npm start`
8. Your bot is now online! (only while terminal is open)

### Part 3: Invite Bot to Your Server (2 minutes)

1. Go back to https://discord.com/developers/applications
2. Select your bot
3. Click "OAuth2" → "URL Generator"
4. Check these boxes under SCOPES:
   - ✅ bot
5. Check these boxes under BOT PERMISSIONS:
   - ✅ Send Messages
   - ✅ Read Messages/View Channels
   - ✅ Read Message History
   - ✅ Embed Links
6. Copy the URL at the bottom
7. Paste it in your browser
8. Select your server
9. Click "Authorize"

### Done! 🎉

Your bot should now be online in your server!

**Test it:**
- Type `!help` in any channel
- Type `!rank` to see your stats

**Welcome new members:**
- When someone joins, they'll get a welcome message automatically!

## Troubleshooting

**Bot shows offline:**
- Check Railway logs for errors
- Make sure token is correct in Railway variables
- Wait 1-2 minutes for deployment

**Bot doesn't respond to commands:**
- Did you enable "Message Content Intent"?
- Does the bot have "Send Messages" permission in your server?

**Bot doesn't welcome new members:**
- Did you enable "Server Members Intent"?
- Test by leaving and rejoining the server

## Need More Help?

Check out:
- `DEPLOYMENT.md` - Detailed deployment guide with multiple hosting options
- `README.md` - Full documentation and customization guide

Enjoy your bot! 🤖