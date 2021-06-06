const { MessageEmbed } = require('discord.js')
const { getTodoDB, getCompletionDB, getTemplateDB, getUserTemplateDB,updateCompletionDB } = require('../db')

module.exports = {
	name: 'todo',
	description: 'melihat to do list yang telah ditentukan untuk hari ini',
	aliases: [ 'td', 'daily', 'todolist' ],
  async execute(msg, args) {
		const todoData = await getTodoDB(msg.author.id)
		let completions = await getCompletionDB(msg.author.id)
		const serverTemplates = new Map(await getTemplateDB(msg.guild.id))
		const userTemplates = new Map(await getUserTemplateDB(msg.author.id))
		const templateID = await userTemplates.get(msg.guild.id)

		console.log(templateID)

		if (todoData.length < 1) return msg.channel.send('todo list kamu kosong nih. Silahkan gunakan `p!setup todo` untuk mengatur list kamu')
		const argsOption = [ 'default', 'ongoing', 'done', 'fail' ]
		let template = [ '🔸', '🔹', '✅', '📛' ]

		if (templateID) {
			const templateData = await serverTemplates.get(templateID)
			template = templateData.sticker
		}

		if (args.length >= 2) {

			const editIndex = eval(args[0]) - 1
			const completionInput = argsOption.indexOf(args[1])

			console.log(completionInput)

			completions[editIndex] = completionInput

			if (completions < 0) return msg.channel.send('masukkan argumen dengan benar')
			updateCompletionDB(msg.author.id, completions)
		}

		const userNickname = msg.guild.members.cache.get(msg.author.id).nickname

		const embedDesc = todoData.map((item, index) => {
			const itemCompletion = completions[index]
			return `${template[itemCompletion]} ${item} *(${index + 1})*`
		})

		const todoEmbed = new MessageEmbed()
			.setColor('#347C7C')
			.setAuthor(`${userNickname}`, msg.author.displayAvatarURL())
			.setTitle('> DAILY TODO LIST')
			.setDescription(embedDesc)
			.setFooter('gunakan `,p set todo` untuk mengedit list')
		msg.channel.send(todoEmbed)
		console.log(completions)
	}
}