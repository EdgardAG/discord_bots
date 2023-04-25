const Discord = require("discord.js");
const { MessageEmbedOptions, EmbedBuilder } = require('discord.js');
const config = require("./DashConfig.json");
const fs = require('fs');



const ubicacionesPath = './ubicaciones.json';

if (!fs.existsSync(ubicacionesPath)) {
  fs.writeFileSync(ubicacionesPath, JSON.stringify({}));
}

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
        		.setAuthor({name: 'Dash', iconURL: 'https://i.imgur.com/IdkPHb6.png'})
        		.setDescription(`Soy una gatito muy travieso y me gusta explorar.\n Puedes encontrar mis comandos con el comando ${prefix}help.\n Por el momento soy chiquito y tengo pocos comandos pero puedes pedirle a mi papá que incluya más, sólo ten en cuenta que mi misión es ayudarte a explorar minecraft.`)
        		.setImage('https://i.imgur.com/saU5CQ5.jpg')
  // client.channels.cache.get('1099751656578617367').send({ embeds: [presentation] });
  const channel = client.channels.cache.find(channel => channel.name === 'general');
  channel.send({ embeds: [presentation] });
  console.log(JSON.stringify(client.options.intents));
});

function agregarUbicacion(location, x, y, z) {
  let ubicaciones;
  try {
    ubicaciones = require('./ubicaciones.json');
  } catch (error) {
    ubicaciones = {};
  }
  ubicaciones[location] = {
    x: x,
    y: y,
    z: z
  };
  fs.writeFileSync('./ubicaciones.json', JSON.stringify(ubicaciones));
}


client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	// console.log(`El comando es ${command} y los argumentos son ${args.join(' ')}.`);

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
    					{name:'dime lugar', value: 'Entrega las coordenadas de lugar', inline: true},
    					{name:'lista', value: 'Entrega las coordenadas de todos los lugares guardados', inline: true},
    					{name:'memoriza locacion x y z', value: 'Agrega "locacion" a la lista de lugares guardados, con las coordenadas x,y,z.', inline: true},
    					{name:'modificar locacion x y z', value: 'modifica las coordenadas de "locacion", con las nuevas coordenadas x,y,z.', inline: true},
    					{name:'olvida lugar', value: 'Elimina "lugar" de la lista de lugares guardados, es preferible que no se utilice ^.^', inline: true})
    		.setColor(0x66b3ff)
    	message.author.send({ embeds: [user_embed] })
    			.then(() => console.log('Mensaje directo enviado correctamente'))
  				.catch(error => console.error(`Error al enviar mensaje directo: ${error}`));
 		  break;

		case 'presentation':
			const presentation = new EmbedBuilder()
        		.setColor('#0099ff')
        		.setTitle('Hola a todos')
        		.setAuthor({name: 'Dash', iconURL: 'https://i.imgur.com/IdkPHb6.png'})
        		.setDescription(`Soy una gatito muy travieso y me gusta explorar.\n Puedes encontrar mis comandos con el comando ${prefix}help.\n Por el momento soy chiquito y tengo pocos comandos pero puedes pedirle a mi papá que incluya más, sólo ten en cuenta que mi misión es ayudarte a explorar minecraft.`)
        		.setImage('https://i.imgur.com/saU5CQ5.jpg')
			message.channel.send({ embeds: [presentation] });
			break;

    case 'memoriza':
    	if (args.length !== 4) {
        message.reply(`El formato correcto es: "##memoriza <ubicacion> <x> <y> <z>".`);
        return;
    	}
    	const location = args[0];
    	const x = args[1];
    	const y = args[2];
    	const z = args[3];
    	agregarUbicacion(location, x, y, z);
    	message.reply(`Ya me memoricé la ubicación de ${location}.`);
    	break;

    case 'dime':
			// console.log(`El comando es ${command} y los argumentos son ${args.join(' ')}.`);
    	const ubicaciones = fs.existsSync('./ubicaciones.json') ? JSON.parse(fs.readFileSync('./ubicaciones.json', 'utf8')) : {};
    	const location2 = args[0];
    	if (Object.keys(ubicaciones).length === 0) {
				message.channel.send(`Aún no hay ninguna ubicación guardada.`);
			} else{
				if (ubicaciones[location2]) {
        const {x, y, z} = ubicaciones[location2];
        message.channel.send(`La ubicación "${location2}" está en (x = ${x}, y = ${y}, z = ${z}).`);
      } else {
        message.channel.send(`La ubicación "${location2}" no existe.`);
      }}
      break;

    case 'modificar':
    	if (args.length !== 4) {
        message.reply(`El formato correcto es: "##modificar <ubicacion> <x> <y> <z>".`);
        return;
    	}
    	const ubicaciones2 = fs.existsSync('./ubicaciones.json') ? JSON.parse(fs.readFileSync('./ubicaciones.json', 'utf8')) : {};
    	// const args = message.content.slice(10).trim().split(/ +/);
    	const location3 = args[0];
    	const x2 = args[1];
    	const y2 = args[2];
    	const z2 = args[3];
    	if (Object.keys(ubicaciones2).length === 0) {
				message.channel.send(`Aún no hay ninguna ubicación guardada.`);
			}
      if (ubicaciones2[location3]) {
        ubicaciones2[location3].x = x2;
    		ubicaciones2[location3].y = y2;
    		ubicaciones2[location3].z = z2;
        fs.writeFileSync('./ubicaciones.json', JSON.stringify(ubicaciones2));
    		message.channel.send(`La ubicación "${location3}" ha sido actualizada a (${x2}, ${y2}, ${z2}).`);
      } else {
        message.channel.send(`La ubicación "${location3}" no existe.`);
      }
      break;

    case 'olvida':
  		const ubicaciones3 = fs.existsSync('./ubicaciones.json') ? JSON.parse(fs.readFileSync('./ubicaciones.json', 'utf8')) : {};
  		const location4 = args[0];
  		if (Object.keys(ubicaciones3).length === 0) {
				message.channel.send(`Aún no hay ninguna ubicación guardada.`);
			}
  		if (ubicaciones3[location4]) {
    		delete ubicaciones3[location4];
    		fs.writeFileSync('./ubicaciones.json', JSON.stringify(ubicaciones3));
    		message.channel.send(`La ubicación "${location4}" ha sido eliminada correctamente.`);
  		} else {
    		message.channel.send(`La ubicación "${location4}" nunca existió .-.`);
  		}
  		break;

  	case 'lista':
	  const ubicaciones4 = fs.existsSync('./ubicaciones.json') ? JSON.parse(fs.readFileSync('./ubicaciones.json', 'utf8')) : {};
  	if (Object.keys(ubicaciones4).length === 0) {
    	message.channel.send(`Aún no hay ninguna ubicación guardada.`);
  	} else {
    	let ubicacionesList = Object.keys(ubicaciones4).map(location => `"${location}" en (x = ${ubicaciones4[location].x}, y = ${ubicaciones4[location].y}, z = ${ubicaciones4[location].z})`);
    	message.channel.send(`Las ubicaciones guardadas son: ${ubicacionesList.join(", ")}.`);
  	}
  	break;


		default:
        	return message.channel.send("Khe?");
        	break;


	}
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.login(config.token);