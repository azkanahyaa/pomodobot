const { getTemplateDB, updateTemplateDB } = require('../../db')
const { MessageEmbed } = require('discord.js')
const { customAlphabet } = require('nanoid')

let prefix = process.env.PREFIX

module.exports = {
	name: 'template',
  async execute(msg, args) {

		const guildName = msg.guild.name
		const settingsDesc = 'Tekan reaction di bawah untuk mengatur template To Do List server anda:\n\n➕ = `tambah template baru`\n🗑️ = `menghapus template`\n📝 = `mengedit template yang ada`\n✅ = `selesai`'
		const settingsEmbed = new MessageEmbed()
			.setColor('#347C7C')
			.setTitle(`${guildName} Daily To Do List`)
			.setDescription(settingsDesc)
			.setThumbnail(msg.author.displayAvatarURL())

		const embedMsg = await msg.channel.send(settingsEmbed)
		const embedReact = [ '➕','🗑️','📝','✅', ]
		const filterReaction = (reaction, user) => embedReact.some(react => react === reaction.emoji.name) && user.id == msg.author.id

		for (const react of embedReact) {
			embedMsg.react(react)
		}

		const reactRes = await embedMsg.awaitReactions(filterReaction, { max: 1 }).then(collected => Promise.resolve(collected.first().emoji.name))
		
		const templates = await getTemplateDB(msg.guild.id)

		switch (reactRes) {
			case '➕':
				embedMsg.delete()

				if (!templates) return addTemplate(msg)
				addTemplate(msg, templates)
				return

			case '🗑️':
				embedMsg.delete()
				console.log(templates)
				if (templates.length < 1) return msg.channel.send('Template Server Kosong')
				const initialDelEmbed = new MessageEmbed()
					.setColor('#347C7C')
					.setTitle(`${msg.guild.name} Templates`)
					.setThumbnail(msg.guild.iconURL())
					.setDescription(`🔄 Fetching Data ...`)
					.setFooter(`-/${templates.length} | 🗑️ : Hapus Template | ❌ : batal`)

				let containerDel = await msg.channel.send(initialDelEmbed)
				renderEmbed(msg, templates, 0, containerDel, '🗑️')

				const templatesDelReact = [ '⬅️', '➡️', '🗑️', '❌'  ]
				for (const react of templatesDelReact) {
					containerDel.react(react)
				}
				return

			case '📝':
				embedMsg.delete()
				console.log(templates)
				if (templates.length < 1) return msg.channel.send('Template Server Kosong')
				const initialEditEmbed = new MessageEmbed()
					.setColor('#347C7C')
					.setTitle(`${msg.guild.name} Templates`)
					.setThumbnail(msg.guild.iconURL())
					.setDescription(`🔄 Fetching Data ...`)
					.setFooter(`-/${templates.length} | 📝 : Edit Template | ❌ : batal`)

				let containerEdit = await msg.channel.send(initialEditEmbed)
				renderEmbed(msg, templates, 0, containerEdit, '📝')

				const templatesEditReact = [ '⬅️', '➡️', '📝', '❌'  ]
				for (const react of templatesEditReact) {
					containerEdit.react(react)
				}
				return

			case '✅':
				msg.channel.send(`Selesai! gunakan \`${prefix} template\` untuk melihat seluruh template server`)
		}


	}
}

async function addTemplate(msg, templates, spcID = false) {
	const templatesMap = new Map(templates)
	const ynString = [ 'ya', 'tidak' ]

	const filterAuthor = m => m.author.id === msg.author.id
	const filterExit = m => m.content.toLowerCase() === 'exit'
	const stickerFilter = m => filterAuthor(m) && ( filterExit(m) || m.content.split(':').length === 3 || m.content.length <= 3) && m.content.split(' ').length === 1
	const filterOneLine = m => filterAuthor(m) && ( filterExit(m)  || m.content.split('\n').length === 1 )
	const filterCondition = m => filterAuthor(m) && ( filterExit(m)  || ynString.some(b => b === m.content.toLowerCase()) )
	const todoOptions = [ 'default', 'onGoing', 'Completed (done)', 'Uncompleted (fail)' ]

	let newTemplate = {
		name: 'template',
		sticker: [ ]
	}

	let i = 0
	for (const option of todoOptions) {
		const qTxt = `Masukkan Stiker yang akan digunakan untuk \`${option}\` todo list`
		const input = await awaitSingleMessage(msg, stickerFilter, qTxt)
		newTemplate.sticker[i] = input
		i++
	}

	console.log(newTemplate)

	const qTxt2 = `Masukkan nama dari template ini`
	newTemplate.name = await awaitSingleMessage(msg, filterOneLine, qTxt2)

	let templateID = spcID

	if (!spcID) {
		const alphabet = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
		const nanoid = customAlphabet(alphabet, 6)
		templateID = nanoid()
	}

	templatesMap.set(templateID, newTemplate)
	console.log(templatesMap)
	updateTemplateDB(msg.guild.id, Array.from(templatesMap))
	msg.channel.send('Template Berhasil diupdate')

	if (spcID) return

	const qTxt3 = new MessageEmbed()
		.setColor('#347C7C')
		.setAuthor("TEMPLATE DITAMBAHKAN", msg.guild.iconURL())
		.setDescription(`\n> **ID**  : \`${templateID}\`\n> **Nama** : \`${newTemplate.name}\`\n> **Stiker** : \n ${newTemplate.sticker.map((sticker, index) => `>   ${sticker} : ${todoOptions[index]}`).join('\n')}\n\nApakah Kamu ingin menambah template lagi? (Ketik: Ya/Tidak)`)

	const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
	const isAddAgain = input3.toLowerCase() === 'ya'

	if (isAddAgain) {
		addTemplate(msg, Array.from(templatesMap))
		return
	}

	msg.channel.send(`Selesai! Gunakan \`${prefix} template\` untuk melihat dan memilih template yang akan digunakan`)
}

async function renderEmbed(msg, templates, index, embed, option) {
	const template = templates[index]
	const todoOptions = [ 'default', 'on Going', 'Completed (done)', 'Uncompleted (fail)' ]
	let optionString = 'hapus'
	if (option === '📝') optionString = 'edit'
	const templateEmbed = new MessageEmbed()
		.setColor('#347C7C')
		.setTitle(`${msg.guild.name} Templates`)
		.setThumbnail(msg.guild.iconURL())
		.setDescription(`\n> **ID**  : \`${template[0]}\`\n> **Nama** : \`${template[1].name}\`\n> **Stiker** : \n ${template[1].sticker.map((sticker, index) => `>   ${sticker} : ${todoOptions[index]}`).join('\n')}`)
		.setFooter(`${index + 1}/${templates.length} | ${option} : ${optionString} Template | ❌ : batal`)

	embed.edit(templateEmbed)
	awaitTemplateReaction(msg, templates, index, embed, option)
}

async function awaitTemplateReaction(msg, templates, index, embed, option) {
	let newIndex = index
	const templatesReact = [ '⬅️', '➡️', option, '❌'  ]
	const filterReaction = (reaction, user) => templatesReact.some(react => react === reaction.emoji.name) && user.id === msg.author.id

	const reactRes = await embed.awaitReactions(filterReaction, { max: 1 }).then(collected => Promise.resolve(collected.first().emoji.name))

	switch (reactRes) {
		case '⬅️':
			newIndex--
			if (newIndex < 0) newIndex = templates.length - 1
			renderEmbed(msg, templates, newIndex, embed, option)
			return

		case '➡️':
			newIndex++
			console.log(newIndex)
			if (newIndex >= templates.length) newIndex = 0
			renderEmbed(msg, templates, newIndex, embed, option)
			return
		
		case option:
			let optionString = 'hapus'
			if (option === '📝') optionString = 'edit'
			const ynString = [ 'ya', 'tidak' ]
			const filterAuthor = m => m.author.id === msg.author.id
			const filterExit = m => m.content.toLowerCase() === 'exit'
			const filterCondition = m => filterAuthor(m) && ( filterExit(m)  || ynString.some(b => b === m.content.toLowerCase()) )

			const qTxt = `${optionString} template ${templates[index][1].name}? (Ketik: Ya/Tidak)`

			const input = await awaitSingleMessage(msg, filterCondition, qTxt)
			const isYes = input.toLowerCase() === 'ya'

			if (!isYes) {
				awaitTemplateReaction(msg, templates, newIndex, embed, option)
				return
			}

			if (optionString === 'hapus') {
				templates.splice(newIndex, 1)
				updateTemplateDB(msg.guild.id, templates)
				embed.delete()
			} else if (optionString === 'edit') {
				await addTemplate(msg, templates, templates[index][0])
				embed.delete()
			}

			const qTxt2 = `${optionString} template lain? (Ketik: Ya/Tidak)`

			const input2 = await awaitSingleMessage(msg, filterCondition, qTxt2)
			const isAgain = input2.toLowerCase() === 'ya'

			if (isAgain) {
				if (optionString === 'hapus') newIndex--
				if (templates.length < 1) return msg.channel.send('Template Server ini kosong')
				console.log(newIndex, option, embed)
				renderEmbed(msg, templates, newIndex, embed, option)
				return
			}

			msg.channel.send(`Selesai! Gunakan \`${prefix} template\` untuk melihat dan memilih template yang akan digunakan`)
			return

		case '❌':
			msg.channel.send('Proses Dibatalkan')
			embed.delete()
			return
	}
}

async function awaitSingleMessage(msg, filter, questionTxt) {
	msg.client.isProcessOn.set(msg.author.id, true)
	const questionMsg = await msg.channel.send(questionTxt)
	const input = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first()))


	questionMsg.delete()
	msg.client.isProcessOn.set(msg.author.id, false)
	if (input.content.toLowerCase() === 'exit') return Promise.reject('**Proses Dihentikan**')
	input.delete()
	return Promise.resolve(input.content)
}