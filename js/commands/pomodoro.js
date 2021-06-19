const { getPomodDB } = require('../db') 
const { MessageEmbed } = require('discord.js')
const Canvas = require('canvas')

module.exports = {
	name: 'pomodoro',
	description: 'melihat pengaturan pomodoro, atau memulai hitung mundur',
	aliases: [ 'pmd', 'pomod' ],
  async execute(msg, args) {
		const member = msg.guild.members.cache.get(msg.author.id)
		const config = msg.client.pomodoro.get(member.voice.channelID)
		const settings = config.settings

		if (!config) return msg.channel.send('Kamu harus membuat voice channel pomodoro untuk mengguanakan command ini')

		if (!config.interval && args[0] === 'end') {
			clearInterval(config.interval)
			msg.channel.send('Pomodoro dihentikan')
			return
		}

		const modeOpt = [ 'break', 'focus', 'start' ]
		const isCount = modeOpt.some(m => m === args[0])

		console.log(config)
		
		if (args.length > 0 && isCount) {
			console.log('ping')
			let mode = modeOpt.indexOf(args[0])
			let isStart = Boolean(mode)
			let loop = 1
			if (args[0] === 'start') {
				loop = config.settings[2]
			}
			
			if (config.host.id !== msg.author.id) return msg.channel.send('Kamu bukan host pomodoro di channel ini')

			const embed = new MessageEmbed()
				.setColor('#347C7C')
				.addFields(
					{ name: 'Host', value: config.host, inline: false },
					{ name: 'Channel', value: `${config.channel}`, inline: false },
					{ name: 'Fokus', value: `${settings[0]} menit`, inline: true },
					{ name: 'Break', value: `${settings[1]} menit`, inline: true }
				)
			const embedMsg = await msg.channel.send(embed)

			countDown(config, isStart, loop, embedMsg)
			return	
		}

		const pomodEmbed = new MessageEmbed()
			.setColor('#347C7C')
			.setTitle(`Pengaturan Pomodoro di ${config.channel.name}`)
			.setDescription('> Mulai: `,p pomodoro <focus|break|start>`\n> Atur: `,p set <focus|break|loop> <durasi>`')
			.addFields(
				{ name: '🔴 Durasi Fokus', value: `${settings[0]} menit`, inline: true },
				{ name: '🔵 Durasi Istirahat', value: `${settings[1]} menit`, inline: true },
				{ name: '🔄 Jumlah Pengulangan', value: `${settings[2]/2} kali`, inline: true }
			)

		msg.channel.send(pomodEmbed)
	}
}

async function countDown(config, isStart, loop, embed) {
	const { channel, settings, host } = config
	let autoFocus = false
	if (loop > 1) autoFocus = true
	
	let duration = settings[0]
	let mode = `🔴 Fokus [${settings[0]}]~${settings[1]}`
	let color = '#FF2E78'
	if(!isStart) {
		duration = settings[1]
		mode = `🔵 Break ${settings[0]}~[${settings[1]}]`
		color = '#56A9E1'
	}

	channel.setName(mode)
	const endTime = new Date().getTime() + duration * 1000 * 60
	const counting = setInterval(() => {
		channel.client.pomodoro.set(channel.channelID, { ...config, interval: counting })
		const now = new Date().getTime()
		const timeLeft = endTime - now

		const minutes = Math.floor(timeLeft / (1000 * 60))
		const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

		const embedContent = new MessageEmbed()
			.setColor(color)
			.setTitle(`${mode.split(' ')[1]} for`)
			.setDescription(`> **${minutes} min ${seconds + 1} sec**`)
			.setFooter(host.user.tag, host.user.displayAvatarURL())
		embed.edit(embedContent)

		if (timeLeft <= 0) {
			const nextLoop = loop - 1
			clearInterval(counting)
			embed.edit(`${mode.split(' ')[1]} selesai ${host} <:me:850385320230780949>`)
			if (autoFocus) embed.edit(`Pomodoro di channel ${channel.name} selesai`)
			if (nextLoop <= 0) return 
			countDown(config, !isStart, nextLoop, embed)
		}
	}, 5000)

}

/*
- ,p pomodoro <start | break | autostart>
  ~ start: 
   + create endTime (getTime() + focus * 1000 * 60)
   + startInterval, create nowTime
   + clear Interval if endTime < now, change voice name
  ~ break: 
   + create endTime (getTime() + focus * 1000 * 60)
   + startInterval, create nowTime
   + clear Interval if endTime < now, change voice name
  ~ autostart: 
   + start loop
   + create endTime (getTime() + focus * 1000 * 60)
   + startInterval, create nowTime
   + clear Interval if endTime < now, change voice name
- ,p set focus <durasi fokus dalam satuan menit>
- ,p set break <durasi jeda>
- ,p set loop <jumlah pengulangan>

init function { channel, duration, loop }
function { startInterval until end }
*/