const { updateVipDB } = require('../../db')
const { prefix } = require('../../../config.js')

module.exports = {
	name: 'vip',
	execute(msg, args) {
		const hasPermit = msg.member.permissions.has('ADMINISTRATOR')
		if (!hasPermit) return msg.channel.send('Kamu harus memiliki permission `ADMINISTRATOR` untuk menggunakan command ini')
		
		const mentions = msg.mentions.roles.map(role => role.id)
		const idInputs = args.filter(arg => arg.length === 18)

		let roles = [ ...mentions, ...idInputs ]
		if (args[0] === 'none') roles = []

		console.log(roles)

		updateVipDB(msg.guild.id, roles).then(() => {
			if (roles.length < 1) return msg.channel.send('berhasil menghapus role')
			msg.channel.send('vip Role berhasil diatur')
		})
	}
}