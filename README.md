# İllegalizm#1337 Müzik Botu

Discord.js v14 ile geliştirilmiş tam özellikli müzik botu.

## 🚀 Kurulum

1. Gerekli paketleri yükleyin:
```bash
npm install
```

2. `.env` dosyasını düzenleyin ve bot tokeninizi ekleyin:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
PREFIX=!
DEFAULT_VOLUME=50
```

3. Botu başlatın:
```bash
npm start
```

## 🎵 Komutlar

- `!play <şarkı adı/URL>` - Şarkı çalar veya kuyruğa ekler
- `!skip` veya `!s` - Şarkıyı atlar
- `!stop` - Müziği durdurur ve kuyruğu temizler
- `!queue` veya `!q` - Müzik kuyruğunu gösterir
- `!help` - Yardım menüsünü gösterir

## 📋 Özellikler

- ✅ YouTube şarkı çalma
- ✅ Müzik kuyruğu sistemi
- ✅ Şarkı atlama ve durdurma
- ✅ Sesli kanallara otomatik bağlanma
- ✅ Gelişmiş hata yönetimi
- ✅ Türkçe arayüz

## 🛠️ Gereksinimler

- Node.js v16 veya üzeri
- Discord Bot Token
- FFmpeg (otomatik yüklenir)

## 📝 Notlar

Bot'un düzgün çalışması için:
1. Bot'un MESSAGE CONTENT INTENT iznine sahip olması gerekir
2. Sesli kanallarda konuşma ve bağlanma izinleri verilmelidir
3. Metin kanallarında mesaj gönderme izni olmalıdır

## 👨‍💻 Geliştirici

İllegalizm#1337 tarafından geliştirilmiştir.
