const fs = require('fs')
const commandFiles = fs.readdirSync('./js/commands/settings').filter(file => file.endsWith('.js'));

const commands = new Map()

for (const file of commandFiles) {
	const command = require(`./settings/${file}`)
	commands.set(command.name, command)
}

let prefix = process.env.PREFIX

module.exports = {
	name: 'setup',
	description: 'Mengatur berbagai konfigurasi yang diperlukan untuk fitur lain pada bot',
	aliases: [ 'set', 'config', 'settings' ],
	usages: [ `${prefix} setup < ${Array.from(commands).map(c => c[1].name).join(' | ')} >` ],
  execute(msg, args) {
		const processOn = msg.client.processOn.get(msg.author.id)
		let isProcessOn = false
		if (processOn) isProcessOn = processOn.some(c => c === msg.channel.id)
		console.log(processOn)
		if (isProcessOn) return msg.channel.send('Masih ada proses yang belum selesai. ketik exit untuk menghentikan proses')

		if (args.length < 1) return
		const subArgs = args
		const subCommand = subArgs.shift().toLowerCase()

		const setCommand = commands.get(subCommand)

		if (!setCommand) return

		setCommand.execute(msg, subArgs)
	}
}

