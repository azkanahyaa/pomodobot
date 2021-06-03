const { getRemindDB, updateRemindDB } = require('../../db')

module.exports = {
	name: 'reminder',
  async execute(msg, args) {
		//check permission
		if (msg.author.id !== msg.guild.ownerID) return msg.channel.send('hanya owner server yang dapat mengatur konfigurasi reminder')

		const filter = m => m.author.id === msg.author.id && m.mentions.channels

		msg.channel.send('masukkan channel untuk member mengatur pengingat')
		const setremindChannel = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first().mentions.channels.first()))

		msg.channel.send('masukkan channel tempat bot akan mengingatkan pengguna')
		const remindChannel = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first().mentions.channels.first()))

		const configuration = {
			setremindChannel: setremindChannel,
			remindChannel: remindChannel,
			queue: [  ] // structure: [ {time, user, desc}, etc ]
		}
		console.log(configuration)

		msg.channel.send(`reminder channel: ${remindChannel}\nset reminder channel: ${setremindChannel}`)

		updateRemindDB(msg.guild.id, configuration)
			
	}
}