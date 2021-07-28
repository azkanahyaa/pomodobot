const { getStickerDB, getTodoDB, updateTodoDB, getVipDB } = require('../db.js')
const { MessageEmbed } = require('discord.js')

let prefix = process.env.PREFIX

module.exports = {
	name: 'sticker',
	description: 'Memilih template sticker to do list yang akan digunakan untuk menunjukan status to do list (default, onGoing, done, fail)',
	aliases: [ 'tem', 'tpl', 'sticker' ],
	usages: [ `${prefix} template`, `${prefix} template <id>`],
	examples: [ `${prefix} template`, `${prefix} tpl 2En75A` ],
  async execute(msg, args) {
		const templates = await getStickerDB(msg.guild.id)
		const templatesMap = new Map(templates)
		const vipRoles = await getVipDB(msg.guild.id)
		if (templates.length < 1) return msg.channel.send('Template Server Kosong')

		const userRoles = msg.member.roles.cache.map(role => role.id)
		const template = templatesMap.get(args[0])

		const isUserVip = vipRoles.some(role => {
			return userRoles.some(userRole => userRole === role)
		})

		console.log(template)

		if (template) {		
			const reacts = [ '❌',  '✅' ]
			const filter = (reaction, user) => reacts.some(react => react === reaction.emoji.name) && user.id === msg.author.id	
			const todoOptions = [ 'default', 'on Going', 'Completed (done)', 'Uncompleted (fail)' ]
			
			let vipString = '🔹'
			if (template.vip) vipString = '💎'

			const templateEmbed = new MessageEmbed()
				.setColor('#73cfff')
				.setTitle(`${template.name} Templates`)
				.setThumbnail(msg.guild.iconURL())
				.setDescription(`\n> \`ID      \`: \`${args[0]}\`\n> \`Nama    \`: **${template.name}** (${vipString})\n> \`Stiker  \`: \n ${template.sticker.map((sticker, index) => `>   ${sticker} : ${todoOptions[index]}`).join('\n')}`)
				.setFooter(`❌ : batal | ✅ : Gunakan Template`)

			const embed = await msg.channel.send(templateEmbed)
			for (const react of reacts) {
				embed.react(react)
			}
			embed.awaitReactions(filter, { max: 1 }).then(collection => {
				switch(collection.first().emoji.name) {
					case '❌':
						msg.channel.send('Proses Dibatalkan')
						embed.delete()
						return

					case '✅':
						if (template.vip && !isUserVip) return msg.channel.send('Sticker ini hanya untuk member VIP')
						getTodoDB(msg.author.id).then(todo => {
							todo.sticker = args[0]
							updateTodoDB(msg.author.id, todo)
							embed.delete()
							msg.channel.send('Template Berhasil diganti')
						})
						return
				}
			})
			return
		}

		const initialEmbed = new MessageEmbed()
			.setColor('#73cfff')
			.setTitle(`${msg.guild.name} Templates`)
			.setThumbnail(msg.guild.iconURL())
			.setDescription(`🔄 Fetching Data ...`)
			.setFooter(`-/${templates.length} | ✅ : Gunakan Template | ❌ : batal`)

		let container = await msg.channel.send(initialEmbed)
		renderEmbed(msg, templates, 0, container, isUserVip)
		const templatesReact = [ '⬅️', '➡️', '✅', '❌'  ]
		for (const react of templatesReact) {
			container.react(react)
		}
	}
}


async function renderEmbed(msg, templates, index, embed, isUserVip) {
	const template = templates[index]
	const todoOptions = [ 'default', 'on Going', 'Completed (done)', 'Uncompleted (fail)' ]

	const templateEmbed = new MessageEmbed()
		.setColor('#73cfff')
		.setTitle(`${msg.guild.name} Templates`)
		.setThumbnail(msg.guild.iconURL())
		.setDescription(`\n> **ID**  : \`${template[0]}\`\n> **Nama** : \`${template[1].name}\`\n> **Stiker** : \n ${template[1].sticker.map((sticker, index) => `>   ${sticker} : ${todoOptions[index]}`).join('\n')}`)
		.setFooter(`${index + 1}/${templates.length} | ✅ : Gunakan Template | ❌ : batal`)

	embed.edit(templateEmbed)
	awaitTemplateReaction(msg, templates, index, embed, isUserVip)
}

async function awaitTemplateReaction(msg, templates, index, embed, isUserVip) {
	let newIndex = index
	const templatesReact = [ '⬅️', '➡️', '✅', '❌'  ]
	const filterReaction = (reaction, user) => templatesReact.some(react => react === reaction.emoji.name) && user.id === msg.author.id

	const reactRes = await embed.awaitReactions(filterReaction, { max: 1 }).then(collected => Promise.resolve(collected.first().emoji.name))

	switch (reactRes) {
		case '⬅️':
			newIndex--
			if (newIndex < 0) newIndex = templates.length - 1
			renderEmbed(msg, templates, newIndex, embed, isUserVip)
			return

		case '➡️':
			newIndex++
			console.log(newIndex)
			if (newIndex >= templates.length) newIndex = 0
			renderEmbed(msg, templates, newIndex, embed, isUserVip)
			return
		
		case '✅':
			if (templates[index].vip && !isUserVip) return msg.channel.send('Sticker ini hanya untuk member VIP')
			let todoData = await getTodoDB(msg.author.id)
			todoData.sticker = templates[index][0]
			updateTodoDB(msg.author.id, todoData)
			embed.delete()
			msg.channel.send('Template Berhasil diganti')
			return

		case '❌':
			msg.channel.send('Proses Dibatalkan')
			embed.delete()
			return
	}
}
