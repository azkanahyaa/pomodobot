const { getTemplateDB, getUserTemplateDB, updateUserTemplateDB } = require('../db.js')
const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'template',
	description: 'change to do list template',
	aliases: [ 'tem', 'tpl', 'sticker' ],
  async execute(msg, args) {
		const templates = await getTemplateDB(msg.guild.id)

		if (templates.length < 1) return msg.channel.send('Template Server Kosong')

		const initialEmbed = new MessageEmbed()
			.setColor('#347C7C')
			.setTitle(`${msg.guild.name} Templates`)
			.setThumbnail(msg.guild.iconURL())
			.setDescription(`🔄 Fetching Data ...`)
			.setFooter(`-/${templates.length} | ✅ : Gunakan Template | ❌ : batal`)

		let container = await msg.channel.send(initialEmbed)
		renderEmbed(msg, templates, 0, container)
		const templatesReact = [ '⬅️', '➡️', '✅', '❌'  ]
		for (const react of templatesReact) {
			container.react(react)
		}
	}
}


async function renderEmbed(msg, templates, index, embed) {
	const template = templates[index]
	const todoOptions = [ 'default', 'on Going', 'Completed (done)', 'Uncompleted (fail)' ]

	const templateEmbed = new MessageEmbed()
		.setColor('#347C7C')
		.setTitle(`${msg.guild.name} Templates`)
		.setThumbnail(msg.guild.iconURL())
		.setDescription(`\n> **ID**  : \`${template[0]}\`\n> **Nama** : \`${template[1].name}\`\n> **Stiker** : \n ${template[1].sticker.map((sticker, index) => `>   ${sticker} : ${todoOptions[index]}`).join('\n')}`)
		.setFooter(`${index + 1}/${templates.length} | ✅ : Gunakan Template | ❌ : batal`)

	embed.edit(templateEmbed)
	awaitTemplateReaction(msg, templates, index, embed)
}

async function awaitTemplateReaction(msg, templates, index, embed) {
	let newIndex = index
	const templatesReact = [ '⬅️', '➡️', '✅', '❌'  ]
	const filterReaction = (reaction, user) => templatesReact.some(react => react === reaction.emoji.name) && user.id === msg.author.id

	const reactRes = await embed.awaitReactions(filterReaction, { max: 1 }).then(collected => Promise.resolve(collected.first().emoji.name))

	switch (reactRes) {
		case '⬅️':
			newIndex--
			if (newIndex < 0) newIndex = templates.length - 1
			renderEmbed(msg, templates, newIndex, embed)
			return

		case '➡️':
			newIndex++
			console.log(newIndex)
			if (newIndex >= templates.length) newIndex = 0
			renderEmbed(msg, templates, newIndex, embed)
			return
		
		case '✅':
			const userTemplates = new Map(await getUserTemplateDB(msg.author.id))
			userTemplates.set(msg.guild.id, templates[index][0])
			updateUserTemplateDB(msg.author.id, Array.from(userTemplates))
			embed.delete()
			msg.channel.send('Template Berhasil diganti')
			return

		case '❌':
			msg.channel.send('Proses Dibatalkan')
			embed.delete()
			return
	}
}
