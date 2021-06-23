const { MessageEmbed } = require('discord.js')
const { getTodoDB, getCompletionDB, getTemplateDB, getUserTemplateDB,updateCompletionDB } = require('../db')

let prefix = process.env.PREFIX

module.exports = {
	name: 'todo',
	description: 'Melihat to do list pengguna di hari tersebut atau mengatur status item to do list menjadi default, onGoing, done, atau fail',
	aliases: [ 'td', 'daily', 'todolist' ],
	usages: [ `${prefix} todo`, `${prefix} todo <no list> <default | ongoing | done | fail>` ],
	examples: [ `${prefix} todo`, `${prefix} todo 1 ongoing`, `${prefix} td 4 done`, `${prefix} daily 6 fail` ],
  async execute(msg, args) {
		const todoData = await getTodoDB(msg.author.id)
		let completions = await getCompletionDB(msg.author.id)
		const serverTemplates = new Map(await getTemplateDB(msg.guild.id))
		const userTemplates = new Map(await getUserTemplateDB(msg.author.id))
		const templateID = await userTemplates.get(msg.guild.id)

		console.log(templateID)

		if (todoData.length < 1) return msg.channel.send(`todo list kamu kosong nih. Silahkan gunakan \`${prefix}setup todo\` untuk mengatur list kamu`)
		const argsOption = [ 'default', 'ongoing', 'done', 'fail' ]
		let template = [ '🔸', '🔹', '✅', '📛' ]

		if (templateID) {
			const templateData = await serverTemplates.get(templateID)
			if (!templateData) return msg.channel.send(`Templatemu Tidak ditemukan. Cobalah untuk mengganti template to do list dengan menggunakan \`${prefix} template\``)
			template = templateData.sticker
		}

		if (args.length >= 2) {
			const editIndex = eval(args[0]) - 1
			const completionInput = argsOption.indexOf(args[1])

			if (completionInput < 0) return msg.channel.send(' hanya dapat menggunakan `default`, `ongoing`, `done`, atau `fail`')

			completions[editIndex] = completionInput

			if (completions < 0) return msg.channel.send('masukkan argumen dengan benar')
			updateCompletionDB(msg.author.id, completions)
		}

		const userNickname = msg.author.tag

		const embedDesc = todoData.map((item, index) => {
			const itemCompletion = completions[index]
			return `${template[itemCompletion]} ${item} *(${index + 1})*`
		})

		const todoEmbed = new MessageEmbed()
			.setColor('#73cfff')
			.setAuthor(`${userNickname}`, msg.author.displayAvatarURL())
			.setTitle('> DAILY TODO LIST')
			.setDescription(embedDesc)
			.setFooter(`gunakan \`${prefix} set todo\` untuk mengedit list`, 'https://cdn.discordapp.com/icons/578618709325774849/a_8cdb592b5442e78f89a15d94277ba3da.gif')
		msg.channel.send(todoEmbed)
		console.log(completions)
	}
}