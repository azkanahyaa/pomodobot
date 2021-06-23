const { MessageEmbed } = require('discord.js')

let prefix = process.env.PREFIX

module.exports = {
	name: 'help',
	description: 'Menampilkan dan menjelaskan seluruh command pada bot atau melihat info detail terhadap command spesifik tertentu',
	aliases: [ 'commands', 'cmd' ],
	usages: [ `${prefix} help`, `${prefix} help <command>` ],
	examples: [ `${prefix} help`, `${prefix} help pomod`, `${prefix} help todo` ],
  async execute(msg, args) {
		const commands = msg.client.commands

		const command = commands.get(args[0]) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]))

		if (command) {
			const { name, description, aliases, usages, examples } = command
			const fields = []

			if (aliases) fields.push({ name: 'Alias', value: aliases })
			if (usages) fields.push({ name: 'Penggunaan', value: usages })
			if (examples) fields.push({ name: 'Contoh Penggunaan', value: examples })

			const helpEmbed = new MessageEmbed()
				.setColor('#56A9E1')
				.setAuthor(`${prefix} ${command.name}`, msg.client.user.avatarURL())
				.setDescription(command.description)
				.addFields(...fields)
				.setFooter('Ruang Belajar Official Bot', 'https://cdn.discordapp.com/icons/578618709325774849/a_8cdb592b5442e78f89a15d94277ba3da.gif')


			msg.channel.send(helpEmbed)
			return
		}

		const fieldVal = commands.map(command => {
			return `•  ${command.name}`
		}).join('\n')

		const helpEmbed = new MessageEmbed()
			.setColor('#73cfff')
			.setAuthor(`List Command ${msg.client.user.username}`, msg.client.user.avatarURL())
			.setDescription(`prefix bot: \`${prefix}\`\n\`${prefix} <command>\`: menggunakan command\n\`${prefix} help <command>\`: melihat informasi command`)
			.addField('> Command List', fieldVal)
			.setFooter('Ruang Belajar Official Bot', 'https://cdn.discordapp.com/icons/578618709325774849/a_8cdb592b5442e78f89a15d94277ba3da.gif')

		msg.channel.send(helpEmbed)
	}
}