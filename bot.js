const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

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
const STREAM_FILE = path.join(__dirname, 'streamdata.json');

// Stream configuration
const TWITCH_USERNAME = 'josh420_710';
const TIKTOK_USERNAME = '@josh420_710';
const TWITCH_CHANNEL = 'twitch-live-noti';
const TIKTOK_CHANNEL = 'tiktok-live-noti';

// Initialize or load user data
let userData = {};
let streamData = {
    twitchLive: false,
    lastTwitchCheck: null
};

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

// Load stream data
function loadStreamData() {
    try {
        if (fs.existsSync(STREAM_FILE)) {
            const data = fs.readFileSync(STREAM_FILE, 'utf8');
            streamData = JSON.parse(data);
            console.log('✅ Stream data loaded successfully');
        }
    } catch (error) {
        console.error('Error loading stream data:', error);
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

// Save stream data
function saveStreamData() {
    try {
        fs.writeFileSync(STREAM_FILE, JSON.stringify(streamData, null, 2));
    } catch (error) {
        console.error('Error saving stream data:', error);
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

// Check if Twitch stream is live
async function checkTwitchLive() {
    return new Promise((resolve) => {
        const clientId = process.env.TWITCH_CLIENT_ID;
        const clientSecret = process.env.TWITCH_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.log('⚠️  Twitch API credentials not set. Add TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET to .env');
            resolve(null);
            return;
        }

        // First, get OAuth token
        const tokenData = JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials'
        });

        const tokenOptions = {
            hostname: 'id.twitch.tv',
            path: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': tokenData.length
            }
        };

        const tokenReq = https.request(tokenOptions, (tokenRes) => {
            let tokenBody = '';
            tokenRes.on('data', (chunk) => tokenBody += chunk);
            tokenRes.on('end', () => {
                try {
                    const tokenResponse = JSON.parse(tokenBody);
                    const accessToken = tokenResponse.access_token;

                    // Now check if stream is live
                    const streamOptions = {
                        hostname: 'api.twitch.tv',
                        path: `/helix/streams?user_login=${TWITCH_USERNAME}`,
                        method: 'GET',
                        headers: {
                            'Client-ID': clientId,
                            'Authorization': `Bearer ${accessToken}`
                        }
                    };

                    const streamReq = https.request(streamOptions, (streamRes) => {
                        let streamBody = '';
                        streamRes.on('data', (chunk) => streamBody += chunk);
                        streamRes.on('end', () => {
                            try {
                                const streamResponse = JSON.parse(streamBody);
                                if (streamResponse.data && streamResponse.data.length > 0) {
                                    resolve(streamResponse.data[0]);
                                } else {
                                    resolve(null);
                                }
                            } catch (error) {
                                console.error('Error parsing Twitch stream response:', error);
                                resolve(null);
                            }
                        });
                    });

                    streamReq.on('error', (error) => {
                        console.error('Twitch stream request error:', error);
                        resolve(null);
                    });

                    streamReq.end();
                } catch (error) {
                    console.error('Error parsing Twitch token response:', error);
                    resolve(null);
                }
            });
        });

        tokenReq.on('error', (error) => {
            console.error('Twitch token request error:', error);
            resolve(null);
        });

        tokenReq.write(tokenData);
        tokenReq.end();
    });
}

// Send Twitch live notification
async function sendTwitchNotification(guild, streamData) {
    const channel = guild.channels.cache.find(ch => ch.name === TWITCH_CHANNEL);
    
    if (!channel) {
        console.log(`⚠️  Channel "${TWITCH_CHANNEL}" not found. Create this channel for Twitch notifications.`);
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0x9146FF)
        .setTitle('🔴 LIVE ON TWITCH!')
        .setDescription(`**Come smoke and join the stream!**\n\n🎮 **${streamData.title || 'Live Stream'}**`)
        .addFields(
            { name: '📺 Game', value: streamData.game_name || 'Just Chatting', inline: true },
            { name: '👥 Viewers', value: `${streamData.viewer_count || 0}`, inline: true }
        )
        .setURL(`https://twitch.tv/${TWITCH_USERNAME}`)
        .setThumbnail(streamData.thumbnail_url ? streamData.thumbnail_url.replace('{width}', '320').replace('{height}', '180') : null)
        .setFooter({ text: `Started streaming` })
        .setTimestamp();

    try {
        await channel.send({ content: '@everyone', embeds: [embed] });
        console.log('✅ Twitch live notification sent!');
    } catch (error) {
        console.error('Error sending Twitch notification:', error);
    }
}

// Send TikTok live notification (triggered by Twitch going live)
async function sendTiktokNotification(guild) {
    const channel = guild.channels.cache.find(ch => ch.name === TIKTOK_CHANNEL);
    
    if (!channel) {
        console.log(`⚠️  Channel "${TIKTOK_CHANNEL}" not found. Create this channel for TikTok notifications.`);
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle('📱 LIVE ON TIKTOK!')
        .setDescription(`**Come smoke and join the stream!**\n\n${TIKTOK_USERNAME} is now live!`)
        .setURL(`https://tiktok.com/${TIKTOK_USERNAME}/live`)
        .setFooter({ text: 'Started streaming' })
        .setTimestamp();

    try {
        await channel.send({ content: '@everyone', embeds: [embed] });
        console.log('✅ TikTok live notification sent!');
    } catch (error) {
        console.error('Error sending TikTok notification:', error);
    }
}

// Monitor streams
async function monitorStreams() {
    if (!client.guilds.cache.size) return;

    const guild = client.guilds.cache.first();

    // Check Twitch (this also triggers TikTok notification since you multistream)
    try {
        const twitchStream = await checkTwitchLive();
        
        if (twitchStream && !streamData.twitchLive) {
            // Just went live on Twitch (and TikTok)!
            streamData.twitchLive = true;
            saveStreamData();
            
            // Send notifications to BOTH channels
            await sendTwitchNotification(guild, twitchStream);
            await sendTiktokNotification(guild);
            
            console.log('🔴 Stream started! Notifications sent to both platforms.');
        } else if (!twitchStream && streamData.twitchLive) {
            // Stream ended
            streamData.twitchLive = false;
            saveStreamData();
            console.log('📴 Stream ended');
        }
    } catch (error) {
        console.error('Error checking Twitch:', error);
    }
}

// When the client is ready
client.once(Events.ClientReady, readyClient => {
    console.log(`✅ Bot is online! Logged in as ${readyClient.user.tag}`);
    loadUserData();
    loadStreamData();
    
    // Start monitoring streams every 60 seconds
    setInterval(monitorStreams, 60000);
    console.log('🎥 Stream monitoring started! (Twitch only - TikTok notifications trigger with Twitch)');
    
    // Do initial check after 5 seconds
    setTimeout(monitorStreams, 5000);
});

// Welcome new members
client.on(Events.GuildMemberAdd, async member => {
    console.log(`New member joined: ${member.user.tag}`);
    
    const welcomeChannel = member.guild.channels.cache.find(
        channel => channel.name.includes('welcome') || 
                   channel.name.includes('general') ||
                   channel.type === 0
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

    initUser(member.id);
    saveUserData();
});

// Track messages for activity
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    const userId = message.author.id;
    initUser(userId);

    userData[userId].messageCount++;
    userData[userId].totalXP += 10;

    const oldLevel = userData[userId].level;
    const newLevel = calculateLevel(userData[userId].totalXP);
    userData[userId].level = newLevel;

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
        const sortedUsers = Object.entries(userData)
            .sort(([, a], [, b]) => b.totalXP - a.totalXP)
            .slice(0, 10);

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

    if (message.content.toLowerCase() === '!stream test') {
        if (message.member.permissions.has('Administrator')) {
            await monitorStreams();
            message.reply('🔍 Manually checking stream status...');
        } else {
            message.reply('❌ Only administrators can use this command.');
        }
    }

    if (message.content.toLowerCase() === '!stream status') {
        const statusEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('📺 Stream Status')
            .setDescription(streamData.twitchLive ? '🔴 **LIVE** on both Twitch and TikTok!' : '⚫ **Offline**')
            .addFields(
                { name: 'Monitoring', value: 'Twitch (TikTok notifications auto-triggered)', inline: false }
            )
            .setFooter({ text: 'Checks every 60 seconds' })
            .setTimestamp();

        message.reply({ embeds: [statusEmbed] });
    }

    if (message.content.toLowerCase() === '!help') {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('📚 Bot Commands')
            .setDescription('Here are the available commands:')
            .addFields(
                { name: '!rank', value: 'View your current stats, level, and rank' },
                { name: '!leaderboard', value: 'See the top 10 most active members' },
                { name: '!stream status', value: 'Check current stream status' },
                { name: '!stream test', value: 'Manually check streams (Admin only)' },
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

    if (!oldState.channel && newState.channel) {
        userData[userId].voiceJoinTime = Date.now();
        console.log(`${newState.member.user.tag} joined voice channel`);
    }

    if (oldState.channel && !newState.channel) {
        if (userData[userId].voiceJoinTime) {
            const timeSpent = Date.now() - userData[userId].voiceJoinTime;
            const minutesSpent = Math.floor(timeSpent / 60000);
            
            userData[userId].voiceMinutes += minutesSpent;
            userData[userId].totalXP += minutesSpent * 5;
            userData[userId].level = calculateLevel(userData[userId].totalXP);
            userData[userId].voiceJoinTime = null;

            console.log(`${newState.member.user.tag} left voice channel. Time spent: ${minutesSpent} minutes`);
            saveUserData();
        }
    }

    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        if (userData[userId].voiceJoinTime) {
            const timeSpent = Date.now() - userData[userId].voiceJoinTime;
            const minutesSpent = Math.floor(timeSpent / 60000);
            
            userData[userId].voiceMinutes += minutesSpent;
            userData[userId].totalXP += minutesSpent * 5;
            userData[userId].level = calculateLevel(userData[userId].totalXP);
            
            saveUserData();
        }
        userData[userId].voiceJoinTime = Date.now();
    }
});

// Save data periodically
setInterval(() => {
    for (const [userId, user] of Object.entries(userData)) {
        if (user.voiceJoinTime) {
            const timeSpent = Date.now() - user.voiceJoinTime;
            const minutesSpent = Math.floor(timeSpent / 60000);
            
            if (minutesSpent > 0) {
                user.voiceMinutes += minutesSpent;
                user.totalXP += minutesSpent * 5;
                user.level = calculateLevel(user.totalXP);
                user.voiceJoinTime = Date.now();
            }
        }
    }
    saveUserData();
    console.log('💾 User data auto-saved');
}, 5 * 60 * 1000);

// Error handling
client.on(Events.Error, error => {
    console.error('Discord client error:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
