const { checkDB, getRemindDB, updateRemindDB } = require('../db')


async function awaitReminderMessage(msg, serverID) {
	try {
		let serverConfig = await getRemindDB(serverID)

		/*
				setremindChannel = setremindChannel
				remindChannel = remindChannel
				queue
		*/

		if (serverConfig.length < 1) return console.log('baaa')
		
		if (serverConfig.setremindChannel.id === msg.channel.id) {
			const timeInput = msg.content.split('--')[1]
			let timeValue = eval(timeInput.slice(0, timeInput.length - 3))
			if (timeInput.endsWith('sec') || timeInput.endsWith('s')) {
				timeValue *= 1000
			} else if (timeInput.endsWith('min') || timeInput.endsWith('m')) {
				timeValue *= 1000 * 60
			} else if (timeInput.endsWith('hou') || timeInput.endsWith('h')) {
				timeValue *= 1000 *60 * 60
			}
			console.log(timeInput, '\n', timeValue)

			const endTime = new Date().getTime() + timeValue
			if (!endTime) return
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