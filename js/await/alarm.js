const gTTS = require('gtts')

async function alarmInterval(client) {
	const checkTime = setInterval(() => {
		let data = Array.from(client.alarm)
		if (data.length < 1) return
		const { channel, session } = data[0][1]
		client.alarm.delete(channel.id)

		let speech = `${session} selesai`
		let fileName = 'sessions'
		if (session === 'completed') {
			speech = 'Pomodoro selesai'
			fileName = session
		}
		const gtts = new gTTS(speech, 'id')
		gtts.save('./assets/sounds/tts.mp3')

		console.log(data)

		channel.join().then(c => {
			const files = [
				`./assets/sounds/${fileName}.mp3`,
				'./assets/sounds/tts.mp3'
			]
			play(client, c, files)
		})
	}, 5000)
} 


	const play = (client, connection, queue) => {
		if (queue.length < 1) {
			connection.channel.leave()
			return
		}

		connection.play(queue[0])
			.on('finish', () => {
				queue.shift()
				play(client, connection, queue)
				console.log(queue,'pop')
			})
	}

module.exports = { alarmInterval }