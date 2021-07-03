const { checkDB, getRemindDB, updateRemindDB } = require('../db')


async function awaitReminderMessage(msg, serverID) {
	try {
		let serverConfig = await getRemindDB(serverID)

		if (serverConfig.length < 1) return

		if (serverConfig.setremindChannel.id === msg.channel.id) {
			if (msg.content.startsWith('clear')) {
				const clearArg = msg.content.split(/ +/)[1]

				if (clearArg) {
					if (clearArg === 'loop') {
						serverConfig.queue = serverConfig.queue.filter(item => {
							return item.user !== msg.author.id && !item.loop
						})
					} else	if (clearArg.length === 18) {
						serverConfig.queue = serverConfig.queue.filter(item => {
							return item.id !== clearArg
						})
					}
					const newConfig = { ...serverConfig }
					updateRemindDB(serverID, newConfig)
					msg.react('<:aru_syedih:773951720597225483>')
					return
				}

				serverConfig.queue = serverConfig.queue.filter(item => {
					return item.user !== msg.author.id
				})
				const newConfig = { ...serverConfig }
				updateRemindDB(serverID, newConfig)
				msg.react('<:aru_syedih:773951720597225483>')
				return
			}
			const types = [ 'in', 'at', 'every' ]
			const type = types.find(type => {
				return msg.content.split(`.${type}`).length > 1
			})

			console.log(type)

			const input = msg.content.split(`.${type}`)
			const desc = input[0]
			const timeInput = input[1]

 			let reminder = {
				id: msg.id,
				time: null,
				user: msg.author.id,
				loop: false,
				desc
			}
			

			// 3h 25m 10s
			if (type !== 'at') {
				let timeValue = 0

				const hoursInput = timeInput.split('h')
				let minutesInput = timeInput.split('m')
				if (hoursInput.length > 1 && minutesInput.length > 1) minutesInput = hoursInput[1].split('m')
				let secondsInput = timeInput.split('s')
				if (minutesInput.length > 1) secondsInput = minutesInput[1].split('s')

				if (hoursInput.length > 1) timeValue += eval(hoursInput[0]) * 1000 * 60 * 60
				if (minutesInput.length > 1) timeValue += eval(minutesInput[0]) * 1000 * 60
				if (secondsInput.length > 1) timeValue += eval(secondsInput[0]) * 1000

				if (timeValue === 0) return
				if (type === 'every') {
					reminder.loop = timeValue
				}
				reminder.time = new Date().getTime() + timeValue
			} else {
				const zones = [ 'wib', 'wita', 'wit' ]
				const timeZone = [ 7, 8, 9 ]
				const zoneIndex = zones.findIndex(zone => {
					return timeInput.toLowerCase().endsWith(zone)
				})
				if (zoneIndex === -1) return
				const gmt = timeZone[zoneIndex]

				const timeValue = new Date()
				const cutInput = timeInput.split('.')

				let dayInput = timeValue.getDate()
				let hoursInput = eval(cutInput[0].substr(cutInput[0].length - 2, 2)) - gmt
				if (hoursInput < 0) hoursInput += 24
				let minutesInput = eval(cutInput[1].substr(0, 2))

				if (timeValue.getHours > hoursInput || (timeValue.getHours === hoursInput && timeValue.getMinutes > minutesInput)) dayInput++

				timeValue.setDate(dayInput)
				timeValue.setHours(hoursInput)
				timeValue.setMinutes(minutesInput)

				console.log(timeValue)
				reminder.time = timeValue.getTime()
			}

			if (!reminder.time) return
			serverConfig.queue.push(reminder)
			serverConfig.queue.sort((a, b) => a.time - b.time)
			console.log(reminder)

			const newConfig = serverConfig
			updateRemindDB(serverID, newConfig)
			msg.react('<:aru_key_sip:766703898295271424>')
		}
	} catch(err) {
		console.log(err)
	}
		
}


function reminderInterval(client) {
	async function checkQueue(serverID, config, now) {
		if (config.queue.length < 1) return

		const reminder = config.queue[0]
		const channel = await client.channels.fetch(config.remindChannel.id)

		if (reminder.time - now > 0) return

		const m = await channel.send(`Hallo <@${reminder.user}>, sudah waktunya untuk **${reminder.desc}** nih <:aru_Woaah:766703813427593216>. Jangan lupa atur reminder untuk to do listmu selanjutnya ya.`)
		m.react('👌')
		if (reminder.loop) {
			config.queue.push({ ...reminder, time: reminder.time + reminder.loop })
			config.queue.sort((a, b) => a.time - b.time)
		}
		config.queue.splice(0, 1)

		const newConfig = config
		updateRemindDB(serverID, newConfig)
	}



	let updateTime = setInterval(() => {
		const time = new Date().getTime()
		checkDB('reminder').then(servers => {
			const serversMap = new Map(servers)
			if (servers.length < 1) return

			for (const [id, config] of serversMap) {
				checkQueue(id, config, time)
			}
		})
	}, 1000) 
}


module.exports = { awaitReminderMessage, reminderInterval }