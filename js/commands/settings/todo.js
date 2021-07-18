const { MessageEmbed } = require('discord.js')
const { getTodoDB, updateTodoDB, getCompletionDB, updateCompletionDB, getTemplateDB } = require('../../db')

let prefix = process.env.PREFIX

module.exports = {
	name: 'todo',
	execute(msg, args) {
		let userNickname = msg.member.nickname
		if (userNickname === null) userNickname = msg.author.username
		const settingsDesc = 'Tekan reaction di bawah untuk mengatur to do list anda:\n\n🌀 = `tambah list`\n🗑️ = `hapus beberapa list`\n📝 = `mengedit list`\n🔄 = `mengatur waktu autoreset`\n✅ = `selesai`'

		const settingsEmbed = new MessageEmbed()
			.setColor('#73cfff')
			.setTitle(`${userNickname} Daily To Do List`)
			.setDescription(settingsDesc)
			.setThumbnail(msg.author.displayAvatarURL())
			.setFooter(`gunakan ${prefix} todo untuk melihat to do list`);

		msg.channel.send(settingsEmbed).then(m => {
			const embedReact = [ '🌀','🗑️','📝','🔄','✅', ]

			for (const react of embedReact) {
				m.react(react)
			}

			const filter = (r, user) => embedReact.some(react => react === r.emoji.name) && user.id == msg.author.id
			m.awaitReactions(filter, {max: 1, idle: 60000}).then(collected => {
				switch (collected.first().emoji.name) {
					case '🌀':
						getTodoDB(msg.author.id).then(todo => {
							m.delete()
							if (todo.list.length < 1) return addTodoList(msg)

							addTodoList(msg, todo)
						})
						return

					case '🗑️':
						getTodoDB(msg.author.id).then(todo => {
							m.delete()
							if (todo.list.length < 1) return msg.channel.send('Kamu belum mengatur to do list')
							removeTodoList(msg, todo)
						})
						return

					case '📝': 
						getTodoDB(msg.author.id).then(todo => {
							m.delete()
							if (todo.list.length < 1) return msg.channel.send('Kamu belum mengatur to do list')
							editTodoList(msg, list)
						})
						return

					case '🔄':
						getTemplateDB(msg.guild.id).then(templates => {
							showAllTemplate(msg, templates)
							m.delete()
						})
						return

					case '✅':
						getTodoDB(msg.author.id).then(list => {							
							m.delete()
							const todoEmbed = new MessageEmbed()			
								.setColor('#73cfff')
								.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
								.setTitle(`DAILY TO DO LIST`)
								.setDescription(`▫️ ${list.join('\n▫️ ')}`)
								.setFooter(`gunakan ${prefix} todo untuk melihat kembali list`)
							msg.channel.send(todoEmbed)
						})
						return
				}
			})
		})
		
		const ynString = [ 'ya', 'tidak' ]
		const filterAuthor = m => msg.author.id === m.author.id
		const filterExit = m => m.content.toLowerCase() === 'exit'
		const filterCondition = m => filterAuthor(m) && ( filterExit(m)  || ynString.some(b => b === m.content.toLowerCase()) )
		const filterOneLine = m => filterAuthor(m) && ( filterExit(m)  || m.content.split('\n').length === 1 )
		const filterNumber = m => filterAuthor(m) && ( filterExit(m)  || eval(m.content) !== isNaN )
		const filterNumbers = m => filterAuthor(m) && ( filterExit(m)  || m.content.split(',').every(num => eval(num) !== isNaN) )
	

		async function addTodoList(msg, data) {
			try {
				let todo = data
				if (!todo) {
					todo = {
						user: msg.author.id,
						stickers: null,
						template: null,
						reset: '10.00 wib',
						list: []
					}
				}

				console.log(todo)

				const qTxt1 = `**<@${msg.author.id}>, silahkan Masukkan Todo List Kamu hari ini**. Gunakan \`enter\` (baris baru) untuk memasukkan lebih dari 1 list sekaligus\n\`\`\`\nContoh:\n**(04.00-07.00)** Rutinitas pagi\n**(07.00-11.00)** Sekolah Online\nIstirahat siang\nEkskul *Tata Boga*\n\`\`\``
				const input1 = await awaitSingleMessage(msg, filterAuthor, qTxt1)
				const todoInput = input1.split('\n').map(item => [ 0, item ])

				let newList = todoInput
				if (todo.list.length > 0) newList = [ ...todo.list, ...todoInput]

				const qTxt2 = new MessageEmbed()
					.setColor('#73cfff')
					.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
					.setDescription(`> Apakah Kamu ingin menambah to do list lagi? **(Ketik: Ya/Tidak)**\n▫️ ${newList.map(item => item[1]).join('\n▫️ ')}\n`)

				const input2 = await awaitSingleMessage(msg, filterCondition, qTxt2)
				const isAddAgain = input2.toLowerCase() === 'ya'
			
				if (isAddAgain) {
					addTodoList(msg, newList)
					return
				}
			
				let todoEmbed = new MessageEmbed()
					.setColor('#73cfff')
					.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
					.setTitle(`DAILY TO DO LIST`)
					.setDescription(`▫️ ${newList.map(item => item[1]).join('\n▫️ ')}`)
					.setFooter(`gunakan \`${prefix} todo\` untuk melihat list`)
				msg.channel.send(todoEmbed)

				todo.list = newList
				console.log(todo)
				updateTodoDB(msg.author.id, todo)
			} catch(err) {
				console.log(err.message)
				console.log(err.stack)
			}
		}
		
		async function removeTodoList(msg, data) {
			let todo = data
			
			const todoEmbed = new MessageEmbed()
				.setColor('#73cfff')
				.setAuthor(`DAILY TO DO LIST`, msg.author.displayAvatarURL())
				.setDescription(`> Masukkan Nomor List yang ingin Dihapus:\n${todo.list.map((item, index) => `**${index + 1}.** ${item[1]}`).join('\n')}\n`)
				.setFooter('ketik `exit` untuk membatalkan proses')
		
			const input = await awaitSingleMessage(msg, filterNumbers, todoEmbed)
			const todoInput = input.split(',').map(num => parseInt(num) - 1).sort((a, b) => b - a)
		
			const qTxt2 = `Hapus to do list nomor ${input}? **(Ketik: Ya/Tidak)**`
		
			const input2 = await awaitSingleMessage(msg, filterCondition, qTxt2)
			const isDelete = input2.toLowerCase() === 'ya'
		
			if (!isDelete) {
				removeTodoList(msg, todo)
				return 
			}
		
			for (const num of todoInput) {
				if (isNaN(num) || num > todo.list.length - 1) {
					msg.channel.send('masukkan nomor to do list dengan benar')
					removeTodoList(msg, todo)
					return
				}
				todo.list.splice(num, 1)
			}
		
			updateTodoDB(msg.author.id, todo)
		
			const qTxt3 = new MessageEmbed()
				.setColor('#73cfff')
				.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
				.setDescription(`> Apakah Kamu ingin menghapus to do list lagi? **(Ketik: Ya/Tidak)**\n▫️ ${todo.list.join('\n▫️ ')}`)
		
			const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
			const isAddAgain = input3.toLowerCase() === 'ya'
		
			if (isAddAgain) {
				removeTodoList(msg, todo)
				return
			}
		
			msg.channel.send(`**Selesai!** Gunakan \`${prefix} todo\` untuk melihat list dan gunakan \`${prefix} set todo\` untuk kembali mengatur list`)
		}
		
		async function editTodoList(msg, data) {
			let todo = data
		
			const todoEmbed = new MessageEmbed()
				.setColor('#73cfff')
				.setAuthor(`DAILY TO DO LIST`, msg.author.displayAvatarURL())
				.setDescription(`> Masukkan Nomor List yang ingin Diedit:\n${todo.list.map((item, index) => `**${index + 1}.** ${item}`).join('\n')}\n`)
				.setFooter('ketik `exit` untuk membatalkan proses')
		
			const inputNum = await awaitSingleMessage(msg, filterNumber, todoEmbed)
			const itemNum = parseInt(inputNum) - 1
		
			if (itemNum > todo.list.length - 1) {
				msg.channel.send('masukkan nomor to do list dengan benar')
				editTodoList(msg, todo)
				return
			}
		
			const qTxt2 = `Masukkan to do baru untuk nomor ${inputNum}:\n\`${todo.list[itemNum]}\``
			const inputItem = await awaitSingleMessage(msg, filterOneLine, qTxt2)
		
			todo.list[itemNum] = inputItem
		
			const qTxt3 = new MessageEmbed()
				.setColor('#73cfff')
				.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
				.setDescription(`> Apakah kamu ingin mengedit to do list yang lain? **(Ketik: Ya/Tidak)**\n▫️ ${newTodoData.join('\n▫️ ')}`)
		
			const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
			const isAddAgain = input3.toLowerCase() === 'ya'
			
			updateTodoDB(msg.author.id, todo)
		
			if (isAddAgain) {
				editTodoList(msg, todo)
				return
			}
		
			msg.channel.send(`**Selesai!** Gunakan \`${prefix} todo\` untuk melihat list dan gunakan \`${prefix} set todo\` untuk kembali mengatur list`)
		}
		
		async function awaitSingleMessage(msg, filter, questionTxt) {
			let channels = await msg.client.processOn.get(msg.author.id)
			if (!channels) channels = []
			msg.client.processOn.set(msg.author.id, [ ...channels, msg.channel.id ])
		
			const questionMsg = await msg.channel.send(questionTxt)
			const input = await msg.channel.awaitMessages(filter, { max: 1, idle: 600000 }).then(collected => {
				return Promise.resolve(collected.first())
			}).catch(err => {
				questionMsg.edit('Proses dihentikan setelah 10 menit tidak aktif')
			})
		
		
			questionMsg.delete()
			let newChannels = await msg.client.processOn.get(msg.author.id)
			msg.client.processOn.set(msg.author.id, newChannels.filter(c => c !== msg.channel.id))
		
			if (input.content.toLowerCase() === 'exit') return msg.channel.send('**Proses Dihentikan**')
			input.delete()
			return Promise.resolve(input.content)
		}
		
		async function showAllTemplate(msg, templates) {
			const embedDesc = templates.map(template => {
				const name = template[1].name
				const stickers = template[1].sticker.join(' ')
		
				return `\`${template[0]}\`  ${stickers} **${name}**`
			}).join('\n')
		
			const embedContent = new MessageEmbed()
				.setAuthor(`${msg.guild.name} template`, msg.guild.iconURL())
				.setDescription(embedDesc)
				.setFooter(`Gunakan \`${prefix} template <id>\` untuk menggunakan template`)
			
			msg.channel.send(embedContent)
		}
	}
}