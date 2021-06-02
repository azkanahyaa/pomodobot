const { checkDB, getRemindDB, updateRemindDB } = require('../db')


async function awaitReminderMessage(msg, serverID) {
	try {
		let serverConfig = await getRemindDB(serverID)

		if (serverConfig.length < 1) return console.log('baaa')

		if (serverConfig.setremindChannel.id === msg.channel.id) {
			const timeInput = msg.content.split('--')[1]
			let timeValue = 0

			// 3h 25m 10s

			const hoursInput = timeInput.split('h')
			let minutesInput = timeInput.split('m')
			if (hoursInput.length > 1) minutesInput = hoursInput[1].split('m')
			let secondsInput = timeInput.split('s')
			if (minutesInput.length > 1) secondsInput = secondsInput[1].split('s')

			if (hoursInput.length > 1) timeValue += eval(hoursInput[0]) * 1000 * 60 * 60
			if (minutesInput.length > 1) timeValue += eval(minutesInput[0]) * 1000 * 60
			if (secondsInput.length > 1) timeValue += eval(secondsInput[0]) * 1000
			
			console.log(timeInput, '\n', timeValue)

			const endTime = new Date().getTime() + timeValue
			if (!endTime || timeValue === 0) return
			let reminder = {
				time: endTime,
				user: msg.author.id,
				desc: msg.content.split('--')[0]
			}
			serverConfig.queue.push(reminder)
			serverConfig.queue.sort((a, b) => a.time - b.time)
			console.log(reminder)

			const newConfig = serverConfig
			updateRemindDB(serverID, newConfig)
			msg.react('💪')
		}
	} catch(err) {
		console.log(err)
	}
		
}


function startInterval(client) {
	async function checkQueue(serverID, config, now) {
		if (config.queue.length < 1) return

		const reminder = config.queue[0]
		const channel = await client.channels.fetch(config.remindChannel.id)

		if (reminder.time - now > 0) return

		const m = await channel.send(`Hallo <@${reminder.user}>, sudah waktunya untuk **${reminder.desc}** nih. Semangat ya ><.`)
		m.react('👌')
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


module.exports = { awaitReminderMessage, startInterval }