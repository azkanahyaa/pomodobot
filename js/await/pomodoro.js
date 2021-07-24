const gTTS = require('gtts')
const { checkDB, getPomodDB, updatePomodDB } = require('../db')
const {MessageEmbed} = require('discord.js')

async function backupPmd(client) {
	const data = await checkDB('pomodoro')

	for (const server of data) {
		const pmdList = server[1].pomodoro
		for (const pmd of pmdList) {
			let getDataFunct = [ 
				addHostData(client, pmd.host),
				addChannelData(client, pmd.channel),
			]

			if (pmd.embed) getDataFunct.push(addEmbedData(client, pmd.embed))
			Promise.all(getDataFunct).then(data => {
				let pmdData = {
					host: data[0],
					channel: data[1],
					settings: pmd.settings
				}
					

				if (pmd.embed) {
					pmdData.embed = data[2] 
					console.log(pmdData)
					pmdData.interval = countDown(pmdData, pmdData.embed, pmd.end)
				}
				client.pomodoro.set(pmd.channel, pmdData)
			})
		}
	}
}

const addHostData = async (client, id) => {
	return Promise.resolve(await client.users.fetch(id))
}

const addChannelData = async (client, id) => {
	return client.channels.fetch(id)
}

const addEmbedData = async (client, ids) => {
	const guild = await client.guilds.fetch(ids[0])
	const channel = guild.channels.cache.get(ids[1])
	return Promise.resolve(await channel.messages.fetch(ids[2]))
}

const countDown = (config, embed, end, isUseLB = false, isFirst = true) => {
	const { channel, settings, host } = config
	const { focus, sb, lb, lbInt } = settings.duration
	
	let mode = channel.name
	let color = '#FF2E78'
	if (isFirst) color = embed.embeds[0].color
	let endTime = end[0]
	let loop = end[1]
	isUseLB = mode.split('~').length === 3


	if (!isFirst) {
		mode = `🔴 Fokus [${focus}]~${sb}`
		let duration = focus
		color = '#FF2E78'
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

		endTime = new Date().getTime() + duration * 1000 * 60
	}

	const counting = setInterval(() => {
		channel.client.pomodoro.set(channel.id, { ...config, interval: counting, embed })
		getPomodDB(channel.guild.id).then(data => {
			const index = data.pomodoro.findIndex(item => item.channel === channel.id)
			data.pomodoro[index] = { ...data.pomodoro[index], settings, embed: [ embed.channel.id, embed.id ], end: [ endTime, loop ] }
			
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
			.setFooter(`Host: ${host.tag}`, host.displayAvatarURL())
		embed.edit(embedContent)

		if (timeLeft <= 0) {
			const nextLoop = loop - 1
			let session = mode.split(' ')[1]
			clearInterval(counting)
			embed.delete()
			channel.client.pomodoro.set(channel.id, { ...config })
			getPomodDB(channel.guild.id).then(data => {
				const index = data.pomodoro.findIndex(item => item.channel === channel.id)
				data.pomodoro[index] = { ...data.pomodoro[index], embed: null, endTime: null }
				
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
				countDown(config, newEmbed, end, isUseLB, false)
			})
		}
	}, 5000)
	return counting
}

const play = (channel, session) => {
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

module.exports = { backupPmd }