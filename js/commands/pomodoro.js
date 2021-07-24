const { getPomodDB, updatePomodDB } = require('../db') 
const { MessageEmbed } = require('discord.js')

let prefix = process.env.PREFIX

module.exports = {
	name: 'pomodoro',
	description: 'Menampilkan pengaturan pomodoro di channel pengguna. Kamu hanya bisa menggunakan command ini saat berada di voice channel pomodoro',
	aliases: [ 'pmd', 'pomod' ],
	usages: [ `${prefix} pomodoro`, `${prefix} pomodoro start <focus> <short break> <loop> [long break] [break interval]` ],
	examples: [ `${prefix} pomodoro`, `${prefix} pmd start`, `${prefix} pomod start 25 5 4`, `${prefix} pomod start 25 5 4 15 2` ],
  async execute(msg, args) {
		const config = msg.client.pomodoro.get(msg.member.voice.channelID)

		if (!config) return msg.channel.send('Kamu harus membuat voice channel pomodoro untuk mengguanakan command ini')

		if (config.interval) {
			if (args[0] === 'start') return msg.channel.send(`Pomodoro di channelmu masih berjalan. Gunakan \`${prefix} pomodoro end\` atau buat ulang voice pomodoro untuk memulai pomodoro kembali`)
			if (args[0] === 'end') {
				clearInterval(config.interval)
				config.embed.unpin()
				msg.channel.send('Pomodoro dihentikan')
				channel.client.pomodoro.set(channel.id, { ...config, interval: false })
				getPomodDB(msg.guild.id).then(data => {
					const index = data.pomodoro.findIndex(item => item.channel === config.channel.id)
					data.pomodoro[index] = { ...data.pomodoro[index], embed: null, end: null }
					
					updatePomodDB(msg.guild.id, data)
				})
				return
			}
		}

		const subCmd = args.shift()
		let duration = config.settings.duration
		
		if (subCmd === 'start') {
			if (config.host.id !== msg.author.id) return msg.channel.send('Kamu bukan host pomodoro di channel ini')
			if (!args.every(arg => !isNaN(arg))) return msg.channel.send('Input durasi harus berupa angka')

			let useLB = true
			if (args.length >= 3) {		
				duration.focus = args[0]
				duration.sb = args[1]
				duration.loop = args[2]
				useLB = false

				if (args.length >= 5) {
					duration.lb = args[3]
					duration.lbInt = args[4]
					useLB = true
				}
			}

			const embed = new MessageEmbed()
				.setColor('#73cfff')
				.addFields(
					{ name: 'Host', value: config.host, inline: false },
					{ name: 'Channel', value: `**${config.channel}**`, inline: false },
					{ name: 'Fokus', value: `**${duration.focus}** menit`, inline: true },
					{ name: 'Jeda Pendek', value: `**${duration.sb}** menit`, inline: true },
					{ name: 'Pengulangan', value: `**${duration.loop}** putaran`, inline: true }
				)
			if (useLB) {
				embed.addFields(
					{ name: 'Jeda Panjang', value:  `**${duration.lb}** menit`, inline: true },
					{ name: 'Interval Jeda', value:  `**${duration.lbInt}** putaran`, inline: true }
				)
			}
			let userLimit = `**${config.settings.limit}** member`
			if (config.settings.limit === 0) userLimit = '-'
			embed.addFields(
				{ name: 'Voice Limit', value:  userLimit, inline: true },
				{ name: 'Silent Level', value:  `level **${config.settings.silent}**`, inline: true }
			)
			
			const embedMsg = await msg.channel.send(embed)
			play(config.channel, 'start')

			countDown(config, embedMsg, duration.loop * 2, useLB)
			return	
		} else if (subCmd === 'limit') {
			
		} else if (!subCmd) {		
			let userLimit = `**${config.settings.limit}** member`
			if (config.settings.limit === 0) userLimit = '-'
			const pomodEmbed = new MessageEmbed()
				.setColor('#73cfff')
				.setTitle(`Pengaturan Pomodoro di ${config.channel.name}`)
				.setDescription(`Gunakan \`${prefix} help pomodoro\` untuk melihat cara menggunakan command`)
				.addFields(
					{ name: 'Host', value: config.host, inline: false },
					{ name: 'Channel', value: `${config.channel}`, inline: false },
					{ name: 'Fokus', value: `**${duration.focus}** menit`, inline: true },
					{ name: 'Jeda Pendek', value: `**${duration.sb}** menit`, inline: true },
					{ name: 'Pengulangan', value: `**${duration.loop}** putaran`, inline: true },
					{ name: 'Jeda Panjang', value:  `**${duration.lb}** menit`, inline: true },
					{ name: 'Interval Jeda', value:  `**${duration.lbInt}** putaran`, inline: true },
					{ name: 'Voice Limit', value:  userLimit, inline: true },
					{ name: 'Silent Level', value:  `Level **${config.settings.silent}**`, inline: true }
				)

			msg.channel.send(pomodEmbed)
		}
	}
}

function play(channel, session) {
	const inVoice = client.inVoice.get(channel.guild.id)
	if (inVoice) { 
		setTimeout(() => {
			play(channel, session)
		}, 5000)
		return
	}
	channel.join().then(c => {
		channel.client.inVoice.set(channel.guild.id, true)
		c.play(`./assets/sounds/aru-${session}.mp3`)
		 .on('finish', () => {
			 channel.leave()
			 channel.client.inVoice.set(channel.guild.id, false)
		 })
	})
}

async function countDown(config, embed, loop, isUseLB) {
	const { channel, settings, host } = config
	const { focus, sb, lb, lbInt } = settings.duration
	
	let mode = `🔴 Fokus [${focus}]~${sb}`
	let duration = focus
	let color = '#FF2E78'
	if(loop % 2 !== 0) {
		mode = `🔵 Break ${focus}~[${sb}]`
		color = '#56A9E1'
		duration = sb
	}
	if (isUseLB) {
		mode += `~${lb}`
		if (loop + 1 % lbInt === 0) {
			mode = `🔵 Break ${focus}~${sb}~[${lb}]`
			color = '#56A9E1'
			duration = lb
		}
	}

	channel.setName(mode)
	embed.pin()

	const endTime = new Date().getTime() + duration * 1000 * 60

	const counting = setInterval(() => {
		channel.client.pomodoro.set(channel.id, { ...config, interval: counting, embed })
		getPomodDB(channel.guild.id).then(data => {
			const index = data.pomodoro.findIndex(item => item.channel === channel.id)
			data.pomodoro[index] = { ...data.pomodoro[index], settings, embed: [ embed.guild.id, embed.channel.id, embed.id ], end: [ endTime, loop ] }
			
			updatePomodDB(channel.guild.id, data)
		})

		if (channel.deleted) {
			clearInterval(counting)
			getPomodDB(channel.guild.id).then(data => {
				data.pomodoro = data.pomodoro.filter(item => item.channel !== channel.id)
				
				updatePomodDB(channel.guild.id, data)
			})
			channel.client.pomodoro.delete(channel.id)
			embed.unpin()
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
			getPomodDB(channel.guild.id).then(data => {
				const index = data.pomodoro.findIndex(item => item.channel === channel.id)
				data.pomodoro[index] = { ...data.pomodoro[index], embed: null, end: null }
				
				updatePomodDB(channel.guild.id, data)
			})

			embed.channel.send(`${mode.split(' ')[1]} selesai ${host} <:aru_Woaah:766703813427593216>`).then(newEmbed => {
				if (nextLoop === 0)  {
					embed.edit(`${host} Pomodoro di channel ${channel.name} selesai`)
					channel.setName(`✅ Selesai`)
					session = 'finish'
				}

				play(channel, session.toLowerCase())
				channel.client.inVoice.set(channel.guild.id, true)

				if (nextLoop <= 0) return 
				countDown(config, newEmbed, nextLoop, isUseLB)
			})
		}
	}, 5000)
}