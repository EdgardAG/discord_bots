const Discord = require("discord.js");
const { MessageEmbedOptions, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const { google } = require('googleapis');
const youtube = google.youtube({ version: 'v3', auth: 'AIzaSyCxsPs1yXbt6YoZhSq77liL7eQ6FqDBJUM' });
const config = require("./BelleConfig.json");

const client = new Discord.Client({
	intents: [
  		Discord.GatewayIntentBits.DirectMessages,
  		Discord.GatewayIntentBits.Guilds,
  		Discord.GatewayIntentBits.GuildBans,
  		Discord.GatewayIntentBits.GuildMessages,
  		Discord.GatewayIntentBits.MessageContent,
  		Discord.GatewayIntentBits.GuildVoiceStates
		],
	shard: false
})

let prefix = config.prefix;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const presentation = new EmbedBuilder()
        		.setColor('#0099ff')
        		.setTitle(`¡Hola a todos! ¡Ya estoy aquí! Mi prefijo actual es "${prefix}"`)
        		.setAuthor({name: 'Belle', iconURL: 'https://i.imgur.com/ADLJrUd.jpg'})
        		.setDescription("Soy una gatita muy gritona y me gusta hacer ruido.\n Tienes que usar el prefijo ! para usar mis comandos que puedes encontrar con el comando !help.\n Por el momento soy chiquita y tengo pocos comandos pero puedes pedirle a mi papá que incluya más, sólo ten en cuenta que mi misión es hacer ruido.")
        		.setImage('https://i.imgur.com/0wAjX9D.jpg')
  // client.channels.cache.get('1099751656578617367').send({ embeds: [presentation] });
  const channel = client.channels.cache.find(channel => channel.name === 'general');
  channel.send({ embeds: [presentation] });
  console.log(JSON.stringify(client.options.intents));
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	switch(command){

		case 'ping':
			let ping = Math.floor(client.ws.ping);
			message.channel.send(`pong 🏓!!\n`+ ping + "ms");
			break;
		
		case 'hi':
			message.channel.send('Holi, me das comida?');
			break;

		case 'help':
			message.channel.send('**'+message.author.username+'**, Check your DM.');
    		const user_embed = new EmbedBuilder()
    		.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
    		.addFields({name:'help', value: 'Envía la lista de comandos como mensaje directo al usuario.', inline: true},
    					{name:'ping', value: 'Revisa el ping con la Api. Este mensaje aparece en el chat principal, así que intenta no hacer spam ^^', inline: true},
    					{name:'hi', value: 'Saluda al usuario.', inline: true},
    					{name:'presentation', value: 'Me presento en el canal principal.', inline: true},
    					{name:'play', value: 'Reproduce un video de Youtube.', inline: true})
    		.setColor(0x66b3ff)
    		message.author.send({ embeds: [user_embed] })
    			.then(() => console.log('Mensaje directo enviado correctamente'))
  				.catch(error => console.error(`Error al enviar mensaje directo: ${error}`));

 		   	break;

		case 'presentation':
			const presentation = new EmbedBuilder()
        		.setColor('#0099ff')
        		.setTitle('Hola a todos')
        		.setAuthor({name: 'Belle', iconURL: 'https://i.imgur.com/ADLJrUd.jpg'})
        		.setDescription("Soy una gatita muy gritona y me gusta hacer ruido.\n Tienes que usar el prefijo ! para usar mis comandos que puedes encontrar con el comando !help.\n Por el momento soy chiquita y tengo pocos comandos pero puedes pedirle a mi papá que incluya más, sólo ten en cuenta que mi misión es hacer ruido.")
        		.setImage('https://i.imgur.com/0wAjX9D.jpg')
			message.channel.send({ embeds: [presentation] });

    		break;


		case 'play':
			const voiceChannel = message.member.voice.channel;

      		if (!voiceChannel) return message.reply('Por favor, únete a un canal de voz primero.');

      		const connection = joinVoiceChannel({
		        channelId: voiceChannel.id,
		        guildId: message.guild.id,
		        adapterCreator: message.guild.voiceAdapterCreator
      		});

			const searchQuery = args.join(' ');
			const { data: { items } } = await youtube.search.list({
				part: 'id',
				q: searchQuery,
				type: 'video',
				videoDefinition: 'high',
				maxResults: 1,
			});

			if (!items.length) {
				return message.reply(`No se encontraron videos para "${searchQuery}"`);
			}

			const videoId = items[0].id.videoId;
			const videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
			const video = videoInfo.videoDetails;
			const stream = await ytdl(video.videoId, { filter: 'audioonly' });
			const player = createAudioPlayer();
			const resource = createAudioResource(stream);

			player.play(resource);
			connection.subscribe(player);
			
			message.channel.send(`Reproduciendo "${video.title}" en el canal de voz "${voiceChannel.name}"`);

			player.on(AudioPlayerStatus.Idle, () => {
			  connection.disconnect();
			});

	      	break;

		default:
        	return message.channel.send("Lo siento, ese comando no es válido. Intente de nuevo con un comando válido.");
        	break;


	}
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.login(config.token);