const { checkDB, getProfile, updateProfile, getRemindDB, deleteDB } = require('../db.js')

module.exports = {
	name: 'test',
	description: 'code testing and debugging',
	aliases: [ 't', 'deb', 'debug', '🔄' ],
  async execute(msg, argss) {
		console.log(msg.guild)
		//deleteDB('reminder')
		
	}
}