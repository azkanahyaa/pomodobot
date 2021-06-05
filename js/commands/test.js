const { checkDB, getProfile, updateProfile, getRemindDB, deleteDB } = require('../db.js')

module.exports = {
	name: 'test',
	description: 'code testing and debugging',
	aliases: [ 't', 'deb', 'debug', '🔄' ],
  async execute(msg, args) {
		//console.log(msg.guild)
		const num = eval(args[0]) - 1
		console.log('')
		//deleteDB('todo')
		
	}
}