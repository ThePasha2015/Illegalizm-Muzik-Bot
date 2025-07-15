require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { YoutubeApi } = require('youtube-search-api');

// Bot client oluştur
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Müzik kuyruğu için Map
const queues = new Map();

// Bot hazır olduğunda
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} aktif!`);
    console.log(`📊 ${client.guilds.cache.size} sunucuda aktif`);
    
    // Bot durumu ayarla
    client.user.setActivity('🎵 Müzik | !help', { type: 'LISTENING' });
});

// Mesaj dinleyicisi
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX || '!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Komutlar
    switch (command) {
        case 'play':
        case 'p':
            await playMusic(message, args);
            break;
        
        case 'skip':
        case 's':
            await skipMusic(message);
            break;
        
        case 'stop':
            await stopMusic(message);
            break;
        
        case 'queue':
        case 'q':
            await showQueue(message);
            break;
        
        case 'help':
            await showHelp(message);
            break;
    }
});

// Müzik çalma fonksiyonu
async function playMusic(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply('❌ Müzik çalmak için bir sesli kanala katılmalısın!');
    }

    if (!args.length) {
        return message.reply('❌ Lütfen bir şarkı adı veya YouTube URL\'si girin!');
    }

    const query = args.join(' ');
    
    try {
        let url = query;
        
        // Eğer URL değilse YouTube'da ara
        if (!ytdl.validateURL(query)) {
            const searchResults = await YoutubeApi.GetListByKeyword(query, false, 1);
            if (!searchResults.items.length) {
                return message.reply('❌ Hiçbir sonuç bulunamadı!');
            }
            url = `https://www.youtube.com/watch?v=${searchResults.items[0].id}`;
        }

        const songInfo = await ytdl.getInfo(url);
        const song = {
            title: songInfo.videoDetails.title,
            url: url,
            duration: songInfo.videoDetails.lengthSeconds,
            requestedBy: message.author
        };

        const serverQueue = queues.get(message.guild.id);

        if (!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                player: createAudioPlayer(),
                songs: [],
                volume: parseInt(process.env.DEFAULT_VOLUME) || 50,
                playing: true
            };

            queues.set(message.guild.id, queueConstruct);
            queueConstruct.songs.push(song);

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                queueConstruct.connection = connection;
                connection.subscribe(queueConstruct.player);
                
                await playNextSong(message.guild);
                
                message.reply(`✅ **${song.title}** kuyruğa eklendi!`);
            } catch (error) {
                console.error(error);
                queues.delete(message.guild.id);
                return message.reply('❌ Sesli kanala bağlanırken hata oluştu!');
            }
        } else {
            serverQueue.songs.push(song);
            return message.reply(`✅ **${song.title}** kuyruğa eklendi!`);
        }
    } catch (error) {
        console.error(error);
        message.reply('❌ Şarkı çalınırken hata oluştu!');
    }
}

// Sonraki şarkıyı çal
async function playNextSong(guild) {
    const serverQueue = queues.get(guild.id);
    
    if (!serverQueue || !serverQueue.songs.length) {
        if (serverQueue) {
            serverQueue.connection.destroy();
            queues.delete(guild.id);
        }
        return;
    }

    const song = serverQueue.songs[0];
    
    try {
        const stream = ytdl(song.url, {
            filter: 'audioonly',
            highWaterMark: 1 << 25
        });
        
        const resource = createAudioResource(stream);
        serverQueue.player.play(resource);
        
        serverQueue.player.on(AudioPlayerStatus.Idle, () => {
            serverQueue.songs.shift();
            playNextSong(guild);
        });

        serverQueue.textChannel.send(`🎵 Şu an çalıyor: **${song.title}**`);
    } catch (error) {
        console.error(error);
        serverQueue.textChannel.send('❌ Şarkı çalınırken hata oluştu!');
        serverQueue.songs.shift();
        playNextSong(guild);
    }
}

// Şarkı atla
async function skipMusic(message) {
    const serverQueue = queues.get(message.guild.id);
    
    if (!serverQueue || !serverQueue.songs.length) {
        return message.reply('❌ Çalan şarkı yok!');
    }
    
    serverQueue.player.stop();
    message.reply('⏭️ Şarkı atlandı!');
}

// Müziği durdur
async function stopMusic(message) {
    const serverQueue = queues.get(message.guild.id);
    
    if (!serverQueue) {
        return message.reply('❌ Çalan şarkı yok!');
    }
    
    serverQueue.songs = [];
    serverQueue.player.stop();
    serverQueue.connection.destroy();
    queues.delete(message.guild.id);
    
    message.reply('⏹️ Müzik durduruldu ve kuyruk temizlendi!');
}

// Kuyruğu göster
async function showQueue(message) {
    const serverQueue = queues.get(message.guild.id);
    
    if (!serverQueue || !serverQueue.songs.length) {
        return message.reply('❌ Kuyruk boş!');
    }
    
    const queueList = serverQueue.songs.slice(0, 10).map((song, index) => {
        return `${index + 1}. **${song.title}** - ${song.requestedBy}`;
    }).join('\n');
    
    message.reply(`📋 **Müzik Kuyruğu:**\n${queueList}${serverQueue.songs.length > 10 ? `\n\n... ve ${serverQueue.songs.length - 10} şarkı daha` : ''}`);
}

// Yardım menüsü
async function showHelp(message) {
    const helpEmbed = {
        color: 0x0099FF,
        title: '🎵 İllegalizm Music Bot',
        description: 'Mevcut komutlar:',
        fields: [
            {
                name: '!play <şarkı adı/URL>',
                value: 'Şarkı çalar veya kuyruğa ekler',
                inline: true
            },
            {
                name: '!skip',
                value: 'Şarkıyı atlar',
                inline: true
            },
            {
                name: '!stop',
                value: 'Müziği durdurur',
                inline: true
            },
            {
                name: '!queue',
                value: 'Kuyruğu gösterir',
                inline: true
            },
            {
                name: '!help',
                value: 'Bu menüyü gösterir',
                inline: true
            }
        ],
        footer: {
            text: 'İllegalizm#1337 tarafından yapıldı'
        }
    };
    
    message.reply({ embeds: [helpEmbed] });
}

// Error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.on('error', error => {
    console.error('Discord client error:', error);
});

// Bot'u başlat
client.login(process.env.DISCORD_TOKEN);