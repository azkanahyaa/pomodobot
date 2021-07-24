const { MessageEmbed } = require('discord.js')
const { getTodoDB, updateTodoDB, getStickerDB } = require('../db')

let prefix = process.env.PREFIX
const errChnl = process.env.ERRORLOG

module.exports = {
	name: 'todo',
	description: 'Melihat to do list pengguna di hari tersebut atau mengatur status item to do list menjadi default, onGoing, done, atau fail',
	aliases: [ 'td', 'daily', 'todolist' ],
	usages: [ `${prefix} todo`, `${prefix} todo <no list> <default | ongoing | done | fail>` ],
	examples: [ `${prefix} todo`, `${prefix} todo 1 ongoing`, `${prefix} td 4 done`, `${prefix} daily 6 fail` ],
  async execute(msg, args) {
		try {
			let todoData = await getTodoDB(msg.author.id)
			const serverStickers = new Map(await getStickerDB(msg.guild.id))

			const templateID = todoData.sticker

			console.log(todoData)

			if (!todoData.list) todoData = { list: [] }
			if (todoData.list.length < 1) return msg.channel.send(`todo list kamu kosong nih. Silahkan gunakan \`${prefix} setup todo\` untuk mengatur list kamu`)

			todoStat = todoData.list.map(item => item[0])
			todoDesc = todoData.list.map(item => item[1])
			
			const argsOption = [ 'default', 'ongoing', 'done', 'fail' ]
			let template = [ '🔸', '🔹', '✅', '📛' ]

			if (templateID) {
				const templateData = await serverStickers.get(templateID)
				if (!templateData) return msg.channel.send(`Templatemu Tidak ditemukan. Cobalah untuk mengganti template to do list dengan menggunakan \`${prefix} template\``)
				template = templateData.sticker
			}

			if (args.length >= 2) {
				const editIndex = eval(args[0]) - 1
				const completionInput = argsOption.indexOf(args[1])

				if (completionInput < 0) return msg.channel.send(' hanya dapat menggunakan `default`, `ongoing`, `done`, atau `fail`')

				todoData.list[editIndex][0] = completionInput
				todoStat[editIndex] = completionInput

				updateTodoDB(msg.author.id, todoData)
			}

			const userNickname = msg.author.tag

			const embedDesc = todoDesc.map((item, index) => {
				const itemCompletion = todoStat[index]
				return `${template[itemCompletion]} ${item} *(${index + 1})*`
			})

			const todoEmbed = new MessageEmbed()
				.setColor('#73cfff')
				.setAuthor(`${userNickname}`, msg.author.displayAvatarURL())
				.setTitle('> DAILY TODO LIST')
				.setDescription(embedDesc)
				.setFooter(`gunakan \`${prefix} set todo\` untuk mengedit list`, 'https://cdn.discordapp.com/icons/578618709325774849/a_8cdb592b5442e78f89a15d94277ba3da.gif')
			msg.channel.send(todoEmbed)
		} catch(err) {
			if (err.exit) {
				msg.channel.send(err.message)
			} else {
				console.log(err.stack)
				const errOutput = `${err.message}\n\`\`\`\n${err.stack}\n\`\`\``
				msg.client.channels.fetch(errChnl).then(c => {
					c.send(errOutput)
				})
			}
		}
	}
}