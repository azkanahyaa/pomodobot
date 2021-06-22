async function alarmInterval(client) {
	const checkTime = setInterval(() => {
		let data = Array.from(client.alarm)
		if (data.length < 1) return
		const channel = data[0][1]

		console.log(data)

		channel.join().then(connection => {
			const dispatcher = connection.play('./assets/sounds/ring.mp3', {})
			dispatcher.on('finish', () => {
				channel.leave()
				client.alarm.delete(channel.id)
			})
		})
	}, 2500)
} 

module.exports = { alarmInterval }