const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// Path to store user activity data
const DATA_FILE = path.join(__dirname, 'userdata.json');

// Initialize or load user data
let userData = {};

// Load existing data
function loadUserData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            userData = JSON.parse(data);
            console.log('✅ User data loaded successfully');
        } else {
            userData = {};
            console.log('📝 Creating new user data file');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        userData = {};
    }
}

// Save user data
function saveUserData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

// Initialize user if they don't exist
function initUser(userId) {
    if (!userData[userId]) {
        userData[userId] = {
            messageCount: 0,
            voiceMinutes: 0,
            totalXP: 0,
            level: 1,
            voiceJoinTime: null
        };
    }
}

// Calculate level based on XP
function calculateLevel(xp) {
    // Every 1000 XP = 1 level
    return Math.floor(xp / 1000) + 1;
}

// Get rank name based on level
function getRankName(level) {
    if (level >= 50) return '👑 Legendary';
    if (level >= 40) return '💎 Diamond';
    if (level >= 30) return '🏆 Platinum';
    if (level >= 20) return '⭐ Gold';
    if (level >= 10) return '🥈 Silver';
    if (level >= 5) return '🥉 Bronze';
    return '🆕 Newcomer';
}

// When the client is ready
client.once(Events.ClientReady, readyClient => {
    console.log(`✅ Bot is online! Logged in as ${readyClient.user.tag}`);
    loadUserData();
});

// Welcome new members
client.on(Events.GuildMemberAdd, async member => {
    console.log(`New member joined: ${member.user.tag}`);
    
    // Find a channel to send welcome message (looks for 'welcome', 'general', or first text channel)
    const welcomeChannel = member.guild.channels.cache.find(
        channel => channel.name.includes('welcome') || 
                   channel.name.includes('general') ||
                   channel.type === 0 // Text channel
    );

    if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🎉 Welcome to the Server!')
            .setDescription(`Hey ${member}! Welcome to **${member.guild.name}**!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👋 Get Started', value: 'Chat and join voice channels to earn XP and level up!' },
                { name: '📊 Check Your Rank', value: 'Use `!rank` to see your stats' },
                { name: '🏆 Leaderboard', value: 'Use `!leaderboard` to see top members' }
            )
            .setFooter({ text: `Member #${member.guild.memberCount}` })
            .setTimestamp();

        try {
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        } catch (error) {
            console.error('Error sending welcome message:', error);
        }
    }

    // Initialize user data
    initUser(member.id);
    saveUserData();
});

// Track messages for activity
client.on(Events.MessageCreate, async message => {
    // Ignore bots
    if (message.author.bot) return;

    const userId = message.author.id;
    initUser(userId);

    // Award XP for messages (10 XP per message, with cooldown handled by simple increment)
    userData[userId].messageCount++;
    userData[userId].totalXP += 10;

    const oldLevel = userData[userId].level;
    const newLevel = calculateLevel(userData[userId].totalXP);
    userData[userId].level = newLevel;

    // Check if user leveled up
    if (newLevel > oldLevel) {
        const rankName = getRankName(newLevel);
        const levelUpEmbed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle('🎊 Level Up!')
            .setDescription(`Congratulations ${message.author}! You've reached **Level ${newLevel}**!`)
            .addFields({ name: '🏅 Rank', value: rankName })
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        message.channel.send({ embeds: [levelUpEmbed] });
    }

    saveUserData();

    // Commands
    if (message.content.toLowerCase() === '!rank') {
        const userStats = userData[userId];
        const rankName = getRankName(userStats.level);
        const xpForNextLevel = (userStats.level * 1000) - userStats.totalXP;

        const rankEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`📊 ${message.author.username}'s Stats`)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🏅 Rank', value: rankName, inline: true },
                { name: '📈 Level', value: `${userStats.level}`, inline: true },
                { name: '⭐ Total XP', value: `${userStats.totalXP}`, inline: true },
                { name: '💬 Messages Sent', value: `${userStats.messageCount}`, inline: true },
                { name: '🎤 Voice Time', value: `${Math.floor(userStats.voiceMinutes)} minutes`, inline: true },
                { name: '📊 XP to Next Level', value: `${xpForNextLevel}`, inline: true }
            )
            .setFooter({ text: 'Keep chatting and joining voice to earn more XP!' })
            .setTimestamp();

        message.reply({ embeds: [rankEmbed] });
    }

    if (message.content.toLowerCase() === '!leaderboard') {
        // Sort users by total XP
        const sortedUsers = Object.entries(userData)
            .sort(([, a], [, b]) => b.totalXP - a.totalXP)
            .slice(0, 10); // Top 10

        let leaderboardText = '';
        for (let i = 0; i < sortedUsers.length; i++) {
            const [userId, stats] = sortedUsers[i];
            try {
                const user = await client.users.fetch(userId);
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                leaderboardText += `${medal} **${user.username}** - Level ${stats.level} (${stats.totalXP} XP)\n`;
            } catch (error) {
                console.error(`Error fetching user ${userId}:`, error);
            }
        }

        const leaderboardEmbed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle('🏆 Server Leaderboard')
            .setDescription(leaderboardText || 'No data available yet!')
            .setFooter({ text: 'Top 10 most active members' })
            .setTimestamp();

        message.reply({ embeds: [leaderboardEmbed] });
    }

    if (message.content.toLowerCase() === '!help') {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('📚 Bot Commands')
            .setDescription('Here are the available commands:')
            .addFields(
                { name: '!rank', value: 'View your current stats, level, and rank' },
                { name: '!leaderboard', value: 'See the top 10 most active members' },
                { name: '!help', value: 'Show this help message' }
            )
            .addFields(
                { name: '\n💡 How to Earn XP', value: '• Send messages: **10 XP** per message\n• Voice chat: **5 XP** per minute\n• Every **1000 XP** = 1 level up!' }
            )
            .setFooter({ text: 'Stay active to climb the ranks!' });

        message.reply({ embeds: [helpEmbed] });
    }
});

// Track voice activity
client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    const userId = newState.id;
    initUser(userId);

    // User joined a voice channel
    if (!oldState.channel && newState.channel) {
        userData[userId].voiceJoinTime = Date.now();
        console.log(`${newState.member.user.tag} joined voice channel`);
    }

    // User left a voice channel
    if (oldState.channel && !newState.channel) {
        if (userData[userId].voiceJoinTime) {
            const timeSpent = Date.now() - userData[userId].voiceJoinTime;
            const minutesSpent = Math.floor(timeSpent / 60000);
            
            userData[userId].voiceMinutes += minutesSpent;
            userData[userId].totalXP += minutesSpent * 5; // 5 XP per minute
            userData[userId].level = calculateLevel(userData[userId].totalXP);
            userData[userId].voiceJoinTime = null;

            console.log(`${newState.member.user.tag} left voice channel. Time spent: ${minutesSpent} minutes`);
            saveUserData();
        }
    }

    // User switched channels
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        // Update time for old channel
        if (userData[userId].voiceJoinTime) {
            const timeSpent = Date.now() - userData[userId].voiceJoinTime;
            const minutesSpent = Math.floor(timeSpent / 60000);
            
            userData[userId].voiceMinutes += minutesSpent;
            userData[userId].totalXP += minutesSpent * 5;
            userData[userId].level = calculateLevel(userData[userId].totalXP);
            
            saveUserData();
        }
        // Reset join time for new channel
        userData[userId].voiceJoinTime = Date.now();
    }
});

// Save data periodically (every 5 minutes)
setInterval(() => {
    // Update voice time for users currently in voice
    for (const [userId, user] of Object.entries(userData)) {
        if (user.voiceJoinTime) {
            const timeSpent = Date.now() - user.voiceJoinTime;
            const minutesSpent = Math.floor(timeSpent / 60000);
            
            if (minutesSpent > 0) {
                user.voiceMinutes += minutesSpent;
                user.totalXP += minutesSpent * 5;
                user.level = calculateLevel(user.totalXP);
                user.voiceJoinTime = Date.now(); // Reset timer
            }
        }
    }
    saveUserData();
    console.log('💾 User data auto-saved');
}, 5 * 60 * 1000); // 5 minutes

// Error handling
client.on(Events.Error, error => {
    console.error('Discord client error:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
