# Discord Activity & Welcome Bot

A Discord bot that welcomes new members and tracks user activity with a ranking system based on chat messages and voice channel participation.

## Features

- 🎉 **Automatic Welcome Messages**: Greets new members with a stylish embed
- 📊 **Activity Tracking**: Tracks messages sent and time spent in voice channels
- 🏆 **XP & Leveling System**: Users earn XP and level up based on activity
- 🎖️ **Rank Tiers**: From Newcomer to Legendary based on level
- 📈 **Leaderboard**: Shows top 10 most active members
- 💾 **Persistent Data**: Saves user stats to a JSON file

## XP System

**How Users Earn XP:**
- 💬 **10 XP** per message sent
- 🎤 **5 XP** per minute in voice channels
- 🎊 **1000 XP** = 1 Level

**Rank Tiers:**
- 🆕 Newcomer (Level 1-4)
- 🥉 Bronze (Level 5-9)
- 🥈 Silver (Level 10-19)
- ⭐ Gold (Level 20-29)
- 🏆 Platinum (Level 30-39)
- 💎 Diamond (Level 40-49)
- 👑 Legendary (Level 50+)

## Prerequisites

- Node.js (v16.9.0 or higher)
- A Discord account
- A Discord bot token

## Setup Instructions

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under the "TOKEN" section, click "Reset Token" and copy your bot token
5. Enable these **Privileged Gateway Intents** (IMPORTANT!):
   - ✅ **Server Members Intent** (for welcome messages)
   - ✅ **Message Content Intent** (for tracking messages)
   - ✅ **Presence Intent** (optional, for enhanced features)

### 2. Invite the Bot to Your Server

1. Go to the "OAuth2" tab, then "URL Generator"
2. Under "SCOPES", select:
   - ✅ bot
3. Under "BOT PERMISSIONS", select:
   - ✅ Send Messages
   - ✅ Read Messages/View Channels
   - ✅ Read Message History
   - ✅ Embed Links
   - ✅ View Channels (Voice)
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### 3. Install and Run

1. Download all the bot files
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and paste your bot token:
   ```
   DISCORD_TOKEN=your_actual_token_here
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the bot:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## Available Commands

- `!rank` - View your current stats, level, XP, and rank
- `!leaderboard` - Display the top 10 most active server members
- `!help` - Show all available commands and XP information

## How It Works

### Welcome System
When a new member joins, the bot:
- Sends a welcome message to a channel named "welcome" or "general" (or the first available text channel)
- Shows the new member count
- Explains how to earn XP and rank up

### Activity Tracking
- **Messages**: Every message earns 10 XP
- **Voice Channels**: Users earn 5 XP per minute while in voice channels
- **Level Ups**: When users reach level thresholds, they get a public announcement
- **Data Persistence**: All stats are saved to `userdata.json` automatically

### Data Storage
User data is stored in `userdata.json` with the following structure:
```json
{
  "userId": {
    "messageCount": 150,
    "voiceMinutes": 45,
    "totalXP": 1725,
    "level": 2,
    "voiceJoinTime": null
  }
}
```

## Project Structure

```
discord-bot/
├── bot.js           # Main bot file with all logic
├── package.json     # Project dependencies
├── userdata.json    # User activity data (auto-generated)
├── .env.example     # Environment variable template
├── .env            # Your bot token (don't share!)
├── .gitignore      # Git ignore rules
└── README.md       # This file
```

## Customization

You can customize the bot by editing `bot.js`:

**Change XP amounts:**
```javascript
userData[userId].totalXP += 10; // Change message XP
userData[userId].totalXP += minutesSpent * 5; // Change voice XP
```

**Modify rank names:**
```javascript
function getRankName(level) {
    if (level >= 50) return '👑 Your Custom Rank';
    // ... add your own ranks
}
```

**Change level formula:**
```javascript
function calculateLevel(xp) {
    return Math.floor(xp / 1000) + 1; // Change 1000 to adjust difficulty
}
```

## Troubleshooting

- **Bot doesn't welcome new members**: Make sure "Server Members Intent" is enabled
- **Bot doesn't track messages**: Enable "Message Content Intent" in Developer Portal
- **Bot doesn't respond to commands**: Check that it has "Send Messages" permission
- **Voice tracking doesn't work**: Ensure the bot has "View Channels" permission for voice

## Important Notes

⚠️ **Security**: Never share your `.env` file or bot token!

💾 **Data Backup**: The `userdata.json` file contains all user stats. Back it up regularly!

🔄 **Auto-Save**: User data is saved every 5 minutes and when voice users disconnect

## Resources

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js Guide](https://discordjs.guide/)

## License

ISC
