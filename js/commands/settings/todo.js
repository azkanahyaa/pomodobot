const { MessageEmbed } = require('discord.js')
const { getTodoDB, updateTodoDB, getTemplateDB } = require('../../db')

const { prefix, errChnl } = require('../../../config.js')

module.exports = {
	name: 'todo',
	execute(msg, args) {
		const ynString = [ 'ya', 'tidak' ]
		const filterAuthor = m => msg.author.id === m.author.id
		const filterExit = m => m.content.toLowerCase() === 'exit'
		const filterCondition = m => filterAuthor(m) && ( filterExit(m)  || ynString.some(b => b === m.content.toLowerCase()) )
		const filterOneLine = m => filterAuthor(m) && ( filterExit(m)  || m.content.split('\n').length === 1 )
		const filterNumber = m => filterAuthor(m) && ( filterExit(m)  || eval(m.content) !== isNaN )
		const filterNumbers = m => filterAuthor(m) && ( filterExit(m)  || m.content.split(',').every(num => eval(num) !== isNaN) )
		
		try {
			let userNickname = msg.member.nickname
			if (userNickname === null) userNickname = msg.author.username
			const settingsDesc = 'Tekan reaction di bawah untuk mengatur to do list anda:\n\n🌀 = `tambah list`\n🗑️ = `hapus beberapa list`\n📝 = `mengedit list`\n🔄 = `mengatur autoreset`\n✅ = `selesai`'
	
			const settingsEmbed = new MessageEmbed()
				.setColor('#73cfff')
				.setTitle(`${userNickname} Daily To Do List`)
				.setDescription(settingsDesc)
				.setThumbnail(msg.author.displayAvatarURL())
				.setFooter(`gunakan ${prefix} todo untuk melihat to do list`);
	
			msg.channel.send(settingsEmbed).then(m => {
				const embedReact = [ '🌀','🗑️','📝','🔄','✅', ]
				let reacted = false
				for (const react of embedReact) {
				  if (reacted) return
					m.react(react)
				}
	
				const filter = (r, user) => embedReact.some(react => react === r.emoji.name) && user.id == msg.author.id
				m.awaitReactions(filter, {max: 1, idle: 60000}).then(collected => {
					reacted = true
					getTodoDB(msg.author.id).then(todo => {
						switch (collected.first().emoji.name) {
							case '🌀':
								addTodoList(msg, todo)
								return
		
							case '🗑️':
								if (todo.list.length < 1) return msg.channel.send('Kamu belum mengatur to do list')
								removeTodoList(msg, todo)
								return
		
							case '📝': 
								if (todo.list.length < 1) return msg.channel.send('Kamu belum mengatur to do list')
								editTodoList(msg, todo)
								return
		
							case '🔄':						
								if (todo.list.length < 1) return msg.channel.send('Kamu belum mengatur to do list')
								setReset(msg, todo)
								return
		
							case '✅':
								const todoEmbed = new MessageEmbed()			
									.setColor('#73cfff')
									.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
									.setTitle(`DAILY TO DO LIST`)
									.setDescription(`▫️ ${todo.list.join('\n▫️ ')}`)
									.setFooter(`gunakan ${prefix} todo untuk melihat kembali list`)
								msg.channel.send(todoEmbed)
								return
						}
					})
				})
			})
	
			async function addTodoList(msg, data) {
				try {
					let todo = data
	
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
					
					todo.list = newList
					console.log(todo)
					updateTodoDB(msg.author.id, todo)
				
					if (isAddAgain) {
						addTodoList(msg, todo)
						return
					}
				
					let todoEmbed = new MessageEmbed()
						.setColor('#73cfff')
						.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
						.setTitle(`DAILY TO DO LIST`)
						.setDescription(`▫️ ${newList.map(item => item[1]).join('\n▫️ ')}`)
						.setFooter(`gunakan \`${prefix} todo\` untuk melihat list`)
					msg.channel.send(todoEmbed)
				} catch(err) {
					if (err.exit) {
						msg.channel.send(err.message)
					} else {
						console.log(err.stack)
		const errOutput = `${err.message}\n\`\`\`\n${err.stack}\n\`\`\``
						msg.client.guilds.fetch('810581510541410325').then(guild => {
							const c = guild.channels.cache.get(errChnl)
							c.send(errOutput)
						})
					}
				}
			}

    } catch(err) {
			if (err.exit) {
				msg.channel.send(err.message)
			} else {
				console.log(err.stack)
		const errOutput = `${err.message}\n\`\`\`\n${err.stack}\n\`\`\``
				msg.client.guilds.fetch('810581510541410325').then(guild => {
          const c = guild.channels.cache.get(errChnl)
          c.send(errOutput)
        })
			}
		}
		
		async function removeTodoList(msg, data) {
			try {
				let todo = data
				
				const todoEmbed = new MessageEmbed()
					.setColor('#73cfff')
					.setAuthor(`DAILY TO DO LIST`, msg.author.displayAvatarURL())
					.setDescription(`> Masukkan Nomor List yang ingin Dihapus (gunakan koma untuk memilih lebih dari 1 list yang ingin dihapus):\n${todo.list.map((item, index) => `**${index + 1}.** ${item[1]}`).join('\n')}\n`)
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
			} catch(err) {
				if (err.exit) {
					msg.channel.send(err.message)
				} else {
				console.log(err.stack)
		const errOutput = `${err.message}\n\`\`\`\n${err.stack}\n\`\`\``
				msg.client.guilds.fetch('810581510541410325').then(guild => {
          const c = guild.channels.cache.get(errChnl)
          c.send(errOutput)
        })
			}
			}
		}
		
		async function editTodoList(msg, data) {
			try {
				let todo = data
			
				const todoEmbed = new MessageEmbed()
					.setColor('#73cfff')
					.setAuthor(`DAILY TO DO LIST`, msg.author.displayAvatarURL())
					.setDescription(`> Masukkan Nomor List yang ingin Diedit:\n${todo.list.map((item, index) => `**${index + 1}.** ${item[1]}`).join('\n')}\n`)
					.setFooter('ketik `exit` untuk membatalkan proses')
			
				const inputNum = await awaitSingleMessage(msg, filterNumber, todoEmbed)
				const itemNum = parseInt(inputNum) - 1
			
				if (itemNum > todo.list.length - 1) {
					msg.channel.send('masukkan nomor to do list dengan benar')
					editTodoList(msg, todo)
					return
				}
			
				const qTxt2 = `Masukkan to do baru untuk nomor ${inputNum}:\n\`${todo.list[itemNum][1]}\``
				const inputItem = await awaitSingleMessage(msg, filterOneLine, qTxt2)
			
				todo.list[itemNum][1] = inputItem
			
				const qTxt3 = new MessageEmbed()
					.setColor('#73cfff')
					.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
					.setDescription(`> Apakah kamu ingin mengedit to do list yang lain? **(Ketik: Ya/Tidak)**\n▫️ ${todo.list.map(item => item[1]).join('\n▫️ ')}`)
			
				const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
				const isAddAgain = input3.toLowerCase() === 'ya'
				
				updateTodoDB(msg.author.id, todo)
			
				if (isAddAgain) {
					editTodoList(msg, todo)
					return
				}
			
				msg.channel.send(`**Selesai!** Gunakan \`${prefix} todo\` untuk melihat list dan gunakan \`${prefix} set todo\` untuk kembali mengatur list`)
			} catch(err) {
				if (err.exit) {
					msg.channel.send(err.message)
				} else {
					console.log(err.stack)
					const errOutput = `${err.message}\n\`\`\`\n${err.stack}\n\`\`\``
					msg.client.guilds.fetch('810581510541410325').then(guild => {
						const c = guild.channels.cache.get(errChnl)
						c.send(errOutput)
					})
				}
			}
		}
		
		async function setReset(msg, todo) {
			const qTxt1 = 'Apakah kamu ingin menggunakan reset otomatis to do list? **(ya/tidak)**'
			const input1 = await awaitSingleMessage(msg, filterCondition, qTxt1)
			const isAuto = input1.toLowerCase() === 'ya'

			if (!isAuto) {
				todo.reset = false
				updateTodoDB(msg.author.id, todo)
				msg.channel.send('reset otomatis dinonaktifkan')
				return
			}

			const qTxt2 = 'Jam berapakah kamu ingin todolist kamu di reset? `(dalam WIB/+07GMT)`'
			const input2 = await awaitSingleMessage(msg, filterOneLine, qTxt2)
			let resetTime = parseInt(input2)
			if ((resetTime < 0 && resetTime > 24) || isNaN(resetTime)) return msg.channel.send('masukkan jam dengan benar')
			
			resetTime -= 7
			if (resetTime < 0) resetTime += 24

			todo.reset = resetTime
			
			const d = new Date()
			const hours = d.getHours()
			const date = d.getDate()
		
			if (resetTime - hours < 0) d.setDate(date + 1)
			d.setHours(resetTime)
			d.setMinutes(28)

			const now = new Date().getTime()
			const end = d.getTime()

			updateTodoDB(msg.author.id, todo)
			msg.channel.send('Waktu reset berhasil diatur pukul ' + todo.reset + ' WIB')
			sendReset(end - now)

			function sendReset(delay) {
				setTimeout(() => {
					let template = [ '🔸', '🔹', '✅', '📛' ]

					getTodoDB(msg.author.id).then(data => {
						const embedDesc = data.list.map(item => {
							if (item[0] !== 2) item[0] = 3
							return `${template[item[0]]} ${item[1]}`
						}).join('\n')
				
						const todoEmbed = new MessageEmbed()
							.setColor('#73cfff')
							.setTitle('> TO DO LIST DIRESET!')
							.setDescription(embedDesc)
							.setFooter('Jangan Lupa Untuk Mengatur To Do List Besok ya')
				
						const user = msg.author
						user.send(todoEmbed)
				
						updateTodoDB(msg.author.id, { ...data, list: [] })
						sendReset(1000 * 60 * 60 * 24)
						
					})
				}, delay)
			}
		}
		
		async function awaitSingleMessage(msg, filter, questionTxt) {
			try {
				let channels = await msg.client.processOn.get(msg.author.id)
				if (!channels) channels = []
				msg.client.processOn.set(msg.author.id, [ ...channels, msg.channel.id ])
			
				const questionMsg = await msg.channel.send(questionTxt)
				const input = await msg.channel.awaitMessages(filter, { max: 1, idle: 600000 }).then(collected => {
					return Promise.resolve(collected.first())
				}).catch(err => {
					questionMsg.edit('Proses dihentikan setelah 10 menit tidak aktif')
					msg.client.processOn.set(msg.author.id, [ ...channels] )
				})
			
			
				questionMsg.delete()
				let newChannels = await msg.client.processOn.get(msg.author.id)
				msg.client.processOn.set(msg.author.id, newChannels.filter(c => c !== msg.channel.id))
			
				if (input.content.toLowerCase() === 'exit') return Promise.reject({ exit: true,  message: "**Proses dihentikan**"})
				input.delete()
				return Promise.resolve(input.content)
			} catch(err) {
				const errOutput = `${err.message}\n\`\`\`\n${err.stack}\n\`\`\``
				msg.client.guilds.fetch('810581510541410325').then(guild => {
          const c = guild.channels.cache.get(errChnl)
          c.send(errOutput)
        })
			}
		}
	}
}