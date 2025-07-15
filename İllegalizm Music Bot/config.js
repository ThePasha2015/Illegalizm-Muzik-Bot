module.exports = { //discord.gg/vsc ❤️ oxyinc, can066
    app: {
        token: 'TOKEN GİR AQ',
        playing: 'Shade was here',
        global: true, // Eğer global false olur ise sadece gelirlediğiniz sunucuda çalışır
        guild: '1392894663974719668', // GuildID
        extraMessages: false,
        loopMessage: false,
        lang: 'tr',
        enableEmojis: true,
    },

    emojis:{
        'back': '⏪',
        'skip': '⏩',
        'ResumePause': '⏯️',
        'savetrack': '💾',
        'volumeUp': '🔊',
        'volumeDown': '🔉',
        'loop': '🔁',
    },

    opt: {
        DJ: {
            enabled: false,
            roleName: '',
            commands: []
        },
        Translate_Timeout: 1000,
        maxVol: 100,
        spotifyBridge: true,
        volume: 75,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 30000,
        leaveOnEnd: true,
        leaveOnEndCooldown: 30000,
        discordPlayer: {
            ytdlOptions: {
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            }
        }
    }
};
