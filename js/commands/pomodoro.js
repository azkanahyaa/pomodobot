const { getPomodDB } = require('../db') 
const { MessageEmbed } = require('discord.js')
const Canvas = require('canvas')

let prefix = process.env.PREFIX

module.exports = {
	name: 'pomodoro',
	description: 'Menampilkan pengaturan pomodoro di channel pengguna. Kamu hanya bisa menggunakan command ini saat berada di voice channel pomodoro',
	aliases: [ 'pmd', 'pomod' ],
	usages: [ `${prefix} pomodoro`, `${prefix} pomodoro <focus | break | start>` ],
	examples: [ `${prefix} pomodoro`, `${prefix} pmd focus`, `${prefix} pomod start` ],
  async execute(msg, args) {
		const member = msg.guild.members.cache.get(msg.author.id)
		const config = msg.client.pomodoro.get(member.voice.channelID)

		if (!config) return msg.channel.send('Kamu harus membuat voice channel pomodoro untuk mengguanakan command ini')

		if (config.interval) {
			if (args[0] !== 'end' && args.length > 0) return msg.channel.send(`Pomodoro di channelmu masih berjalan. Gunakan \`${prefix} pomodoro end\` atau buat ulang voice pomodoro untuk memulai pomodoro kembali`)
			clearInterval(config.interval)
			config.embed.unpin()
			msg.channel.send('Pomodoro dihentikan')
			channel.client.pomodoro.set(channel.id, { ...config, interval: false })
			return
		}

		const modeOpt = [ 'break', 'focus', 'start' ]
		const isCount = modeOpt.some(m => m === args[0])
		const settings = config.settings

		
		if (args.length > 0 && isCount) {
			let mode = modeOpt.indexOf(args[0])
			let isStart = Boolean(mode)
			let loop = 1
			if (args[0] === 'start') {
				loop = config.settings[2]
			}
			let autoFocus = false
			if (loop > 1) autoFocus = true
			
			if (config.host.id !== msg.author.id) return msg.channel.send('Kamu bukan host pomodoro di channel ini')

			const embed = new MessageEmbed()
				.setColor('#73cfff')
				.addFields(
					{ name: 'Host', value: config.host, inline: false },
					{ name: 'Channel', value: `${config.channel}`, inline: false },
					{ name: 'Fokus', value: `${settings[0]} menit`, inline: true },
					{ name: 'Break', value: `${settings[1]} menit`, inline: true }
				)
			const embedMsg = await msg.channel.send(embed)

			countDown(config, isStart, loop, embedMsg, autoFocus)
			return	
		}

		const pomodEmbed = new MessageEmbed()
			.setColor('#73cfff')
			.setTitle(`Pengaturan Pomodoro di ${config.channel.name}`)
			.setDescription(`> Mulai: \`${prefix} pomodoro <focus|break|start>\`\n> Atur: \`${prefix} set <focus|break|loop> <durasi>\``)
			.addFields(
				{ name: '🔴 Durasi Fokus', value: `${settings[0]} menit`, inline: true },
				{ name: '🔵 Durasi Istirahat', value: `${settings[1]} menit`, inline: true },
				{ name: '🔄 Jumlah Pengulangan', value: `${settings[2]/2} kali`, inline: true }
			)

		msg.channel.send(pomodEmbed)
	}
}

async function countDown(config, isStart, loop, embed, autoFocus) {
	const { channel, settings, host } = config
	
	let duration = settings[0]
	let mode = `🔴 Fokus [${settings[0]}]~${settings[1]}`
	let color = '#FF2E78'
	if(!isStart) {
		duration = settings[1]
		mode = `🔵 Break ${settings[0]}~[${settings[1]}]`
		color = '#56A9E1'
	}

	channel.setName(mode)
	embed.pin()

	const endTime = new Date().getTime() + duration * 1000 * 60
	const counting = setInterval(() => {
		channel.client.pomodoro.set(channel.id, { ...config, interval: counting, embed })
		if (channel.deleted) {
			clearInterval(counting)
			embed.unpin()
			channel.client.pomodoro.delete(channel.id)
			embed.edit('Voice channel tidak ditemukan. Pomodoro dihentikan')
		}
		const now = new Date().getTime()
		const timeLeft = endTime - now

		const minutes = Math.floor(timeLeft / (1000 * 60))
		const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

		const embedContent = new MessageEmbed()
			.setColor(color)
			.setTitle(`${mode.split(' ')[1]} for`)
			.setDescription(`> **${minutes} min ${seconds + 1} sec**`)
			.setFooter(`Host: ${host.user.tag}`, host.user.displayAvatarURL())
		embed.edit(embedContent)

		if (timeLeft <= 0) {
			const nextLoop = loop - 1
			let session = mode.split(' ')[1]
			clearInterval(counting)
			embed.delete()
			channel.client.pomodoro.set(channel.id, { ...config })

			embed.channel.send(`${mode.split(' ')[1]} selesai ${host} <:aru_Woaah:766703813427593216>`).then(newEmbed => {
				if (autoFocus && nextLoop === 0)  {
					embed.edit(`Pomodoro di channel ${channel.name} selesai`)
					channel.setName(`✅ ${settings[0]}~${settings[1]} Selesai`)
					session = 'completed'
				}

				channel.client.alarm.set(channel.id, { channel, session })

				if (nextLoop <= 0) return 
				countDown(config, !isStart, nextLoop, newEmbed, autoFocus)
			})
		}
	}, 5000)
}