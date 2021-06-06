const fs = require('fs')
const commandFiles = fs.readdirSync('./js/commands/settings').filter(file => file.endsWith('.js'));

const commands = new Map()

for (const file of commandFiles) {
	const command = require(`./settings/${file}`)
	commands.set(command.name, command)
}

module.exports = {
	name: 'setup',
	description: 'Mengatur konfigurasi bot terhadap akun/server kamu',
	aliases: [ 'set', 'config', 'settings' ],
  execute(msg, args) {
		const isProcessOn = msg.client.isProcessOn.get(msg.author.id)
		if (isProcessOn) return msg.channel.send('Masih ada proses yang belum selesai. ketik exit untuk menghentikan proses')
		if (args.length < 1) return
		const subArgs = args
		const subCommand = subArgs.shift().toLowerCase()

		const setCommand = commands.get(subCommand)

		if (!setCommand) return

		setCommand.execute(msg, subArgs)
	}
}

