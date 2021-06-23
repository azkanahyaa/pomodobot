const { getRemindDB, updateRemindDB } = require('../../db')

module.exports = {
	name: 'reminder',
  async execute(msg, args) {
		//check permission
		const hasPermit = msg.member.permissions.has('MANAGE_GUILD')
		if (!hasPermit) return msg.channel.send('Kamu harus memiliki permission `MANAGE_GUILD` untuk menggunakan command ini')

		const filter = m => m.author.id === msg.author.id && m.mentions.channels

		msg.channel.send('masukkan channel untuk member mengatur pengingat')
		const setremindChannel = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first().mentions.channels.first()))

		msg.channel.send('masukkan channel tempat bot akan mengingatkan pengguna')
		const remindChannel = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first().mentions.channels.first()))

		const configuration = {
			setremindChannel: setremindChannel,
			remindChannel: remindChannel,
			queue: [  ] // structure: [ {time, user, desc}, ... ]
		}
		console.log(configuration)

		msg.channel.send(`set reminder channel: ${setremindChannel}\nreminder channel: ${remindChannel}`)

		updateRemindDB(msg.guild.id, configuration)
			
	}
}