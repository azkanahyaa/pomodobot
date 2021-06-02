const { checkDB, getProfile, updateProfile, getRemindDB, deleteDB } = require('../db.js')

module.exports = {
	name: 'test',
	description: 'code testing and debugging',
	aliases: [ 't', 'deb', 'debug', '🔄' ],
  async execute(msg, args) {
		/*
		const end = new Date().getTime() + 1000 * 60 * eval(args[0])
		const now = new Date().getTime()

		console.log(`${end}\n${(end-now)/(1000*60)}`)
		*/
		//deleteDB('reminder')
		/*
		const channel = msg.client.channels.fetch(msg.channel.id)
		console.log(channel)
		*/
		console.log(msg.createdAt)
		console.log(new Date().getTime())
	}
}