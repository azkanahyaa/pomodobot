const { MessageEmbed } = require('discord.js')
const { getTodoDB, updateTodoDB, getCompletionDB, updateCompletionDB, getTemplateDB } = require('../../db')

let prefix = process.env.PREFIX

module.exports = {
	name: 'todo',
	execute(msg, args) {
		const hours = new Date().getHours()
		const minutes = new Date().getMinutes()
		if (hours === 15 && minutes < 10) return msg.channel.send(`Sedang mereset semua to do list. Kamu dapat mengatur to do listmu lagi setelah ${11 - minutes} menit lagi`)

		let userNickname = msg.member.nickname
		if (userNickname === null) userNickname = msg.author.username
		const settingsDesc = 'Tekan reaction di bawah untuk mengatur to do list anda:\n\n🌀 = `tambah list`\n🗑️ = `hapus beberapa list`\n📝 = `mengedit list`\n📦 = `server template`\n✅ = `selesai`'

		const settingsEmbed = new MessageEmbed()
			.setColor('#73cfff')
			.setTitle(`${userNickname} Daily To Do List`)
			.setDescription(settingsDesc)
			.setThumbnail(msg.author.displayAvatarURL())
			.setFooter(`gunakan ${prefix} todo untuk melihat to do list`);

		msg.channel.send(settingsEmbed).then(m => {
			const embedReact = [ '🌀','🗑️','📝','📦','✅', ]

			for (const react of embedReact) {
				m.react(react)
			}

			const filter = (reaction, user) => embedReact.some(react => react === reaction.emoji.name) && user.id == msg.author.id
			m.awaitReactions(filter, {max: 1}).then(collected => {
				console.log(collected.first().emoji.name)
				switch (collected.first().emoji.name) {
					case '🌀':
						getTodoDB(msg.author.id).then(list => {
							m.delete()
							if (!list) return addTodoList(msg)

							addTodoList(msg, list)
						})
						return
					case '🗑️':
						getTodoDB(msg.author.id).then(list => {
							m.delete()
							if (!list) return msg.channel.send('Kamu belum mengatur to do list')
							removeTodoList(msg, list)
						})
						return

					case '📝': 
						getTodoDB(msg.author.id).then(list => {
							m.delete()
							if (!list) return msg.channel.send('Kamu belum mengatur to do list')
							editTodoList(msg, list)
						})
						return

					case '📦':
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
	}
}

async function addTodoList(msg, todoList = []) {
	
	const todoArray = todoList
	const completionData = await getCompletionDB(msg.author.id)

	const ynString = [ 'ya', 'tidak' ]

	const filterAuthor = m => msg.author.id === m.author.id
	const filterExit = m => m.content.toLowerCase() === 'exit'
	const filterCondition = m => filterAuthor(m) && ( filterExit(m)  || ynString.some(b => b === m.content.toLowerCase()) )
	const filterOneLine = m => filterAuthor(m) && ( filterExit(m)  || m.content.split('\n').length === 1 )
	const filterNumber = m => filterAuthor(m) && ( filterExit(m)  || eval(m.content) !== isNaN )
	const filterNumbers = m => filterAuthor(m) && ( filterExit(m)  || m.content.split(',').every(num => eval(num) !== isNaN) )


	const qTxt1 = `**<@${msg.author.id}>, silahkan Masukkan Todo List Kamu hari ini**. Gunakan \`enter\` (baris baru) untuk memasukkan lebih dari 1 list sekaligus\n\`\`\`\nContoh:\n**(04.00-07.00)** Rutinitas pagi\n**(07.00-11.00)** Sekolah Online\nIstirahat siang\nEkskul *Tata Boga*\n\`\`\``

	const input1 = await awaitSingleMessage(msg, filterAuthor, qTxt1)
	const todoInput = input1.split('\n')
	const newCompletion = todoInput.map(() => 0 )
	const newTodoArray = [ ...todoArray, ...todoInput]
	let mergeCompletion = newCompletion
	if (completionData) mergeCompletion = [ ...completionData, ...newCompletion ]
	console.log(newCompletion, completionData)

	const qTxt2 = new MessageEmbed()
		.setColor('#347C7C')
		.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
		.setDescription(`> Apakah Kamu ingin menambah to do list lagi? **(Ketik: Ya/Tidak)**\n▫️ ${newTodoArray.join('\n▫️ ')}\n`)

	const input2 = await awaitSingleMessage(msg, filterCondition, qTxt2)
	const isAddAgain = input2.toLowerCase() === 'ya'

	if (isAddAgain) {
		addTodoList(msg, newTodoArray)
		return
	}

	let todoEmbed = new MessageEmbed()
		.setColor('#73cfff')
		.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
		.setTitle(`DAILY TO DO LIST`)
		.setDescription(`▫️ ${newTodoArray.join('\n▫️ ')}`)
		.setFooter(`gunakan \`${prefix} todo\` untuk melihat list`)
	msg.channel.send(todoEmbed)
	updateCompletionDB(msg.author.id, mergeCompletion)
	updateTodoDB(msg.author.id, newTodoArray)
}

async function removeTodoList(msg, todoList) {
	let newTodoData = todoList
	let completionData = await getCompletionDB(msg.author.id)

	if (newTodoData.length < 1) return msg.channel.send('Todo List kamu hari ini kosong')

	const ynString = [ 'ya', 'tidak' ]

	const filterAuthor = m => msg.author.id === m.author.id
	const filterExit = m => m.content.toLowerCase() === 'exit'
	const filterCondition = m => filterAuthor(m) && ( filterExit(m)  || ynString.some(b => b === m.content.toLowerCase()) )
	const filterOneLine = m => filterAuthor(m) && ( filterExit(m)  || m.content.split('\n').length === 1 )
	const filterNumber = m => filterAuthor(m) && ( filterExit(m)  || eval(m.content) !== isNaN )
	const filterNumbers = m => filterAuthor(m) && ( filterExit(m)  || m.content.split(',').every(num => eval(num) !== isNaN) )

	const todoEmbed = new MessageEmbed()
		.setColor('#73cfff')
		.setAuthor(`DAILY TO DO LIST`, msg.author.displayAvatarURL())
		.setDescription(`> Masukkan Nomor List yang ingin Dihapus:\n${newTodoData.map((item, index) => `**${index + 1}.** ${item}`).join('\n')}\n`)
		.setFooter('ketik `exit` untuk membatalkan proses')

	const input = await awaitSingleMessage(msg, filterNumbers, todoEmbed)
	const inputArray = input.split(',').map(num => eval(num) - 1).sort((a, b) => b - a)

	const qTxt2 = `Hapus to do list nomor ${input}? **(Ketik: Ya/Tidak)**`

	const input2 = await awaitSingleMessage(msg, filterCondition, qTxt2)
	const isDelete = input2.toLowerCase() === 'ya'

	if (!isDelete) {
		removeTodoList(msg, newTodoData)
		return 
	}

	for (const num of inputArray) {
		if (isNaN(num) || num > newTodoData.length - 1) {
			msg.channel.send('masukkan nomor to do list dengan benar')
			removeTodoList(msg, newTodoData)
			return
		}
		newTodoData.splice(num, 1)
		completionData.splice(num, 1)
	}

	updateCompletionDB(msg.author.id, completionData)
	updateTodoDB(msg.author.id, newTodoData)

	const qTxt3 = new MessageEmbed()
		.setColor('#73cfff')
		.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
		.setDescription(`> Apakah Kamu ingin menghapus to do list lagi? **(Ketik: Ya/Tidak)**\n▫️ ${newTodoData.join('\n▫️ ')}`)

	const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
	const isAddAgain = input3.toLowerCase() === 'ya'

	if (isAddAgain) {
		removeTodoList(msg, newTodoData)
		return
	}

	msg.channel.send(`**Selesai!** Gunakan \`${prefix} todo\` untuk melihat list dan gunakan \`${prefix} set todo\` untuk kembali mengatur list`)
}

async function editTodoList(msg, todoList) {
	let newTodoData = todoList

	const ynString = [ 'ya', 'tidak' ]

	const filterAuthor = m => msg.author.id === m.author.id
	const filterExit = m => m.content.toLowerCase() === 'exit'
	const filterCondition = m => filterAuthor(m) && ( filterExit(m)  || ynString.some(b => b === m.content.toLowerCase()) )
	const filterOneLine = m => filterAuthor(m) && ( filterExit(m)  || m.content.split('\n').length === 1 )
	const filterNumber = m => filterAuthor(m) && ( filterExit(m)  || eval(m.content) !== NaN )
	const filterNumbers = m => filterAuthor(m) && ( filterExit(m)  || m.content.split(',').every(num => eval(num) !== NaN) )

	const todoEmbed = new MessageEmbed()
		.setColor('#73cfff')
		.setAuthor(`DAILY TO DO LIST`, msg.author.displayAvatarURL())
		.setDescription(`> Masukkan Nomor List yang ingin Diedit:\n${newTodoData.map((item, index) => `**${index + 1}.** ${item}`).join('\n')}\n`)
		.setFooter('ketik `exit` untuk membatalkan proses')

	const inputNum = await awaitSingleMessage(msg, filterNumber, todoEmbed)
	const itemNum = eval(inputNum) - 1

	if (itemNum > newTodoData.length - 1) {
		msg.channel.send('masukkan nomor to do list dengan benar')
		editTodoList(msg, newTodoData)
		return
	}

	const qTxt2 = `Masukkan to do baru untuk nomor ${inputNum}:\n*${newTodoData[itemNum]}*`

	const inputItem = await awaitSingleMessage(msg, filterOneLine, qTxt2)

	newTodoData[itemNum] = inputItem

	const qTxt3 = new MessageEmbed()
		.setColor('#73cfff')
		.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
		.setDescription(`> Apakah kamu ingin mengedit to do list yang lain? **(Ketik: Ya/Tidak)**\n▫️ ${newTodoData.join('\n▫️ ')}`)

	const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
	const isAddAgain = input3.toLowerCase() === 'ya'
	
	updateTodoDB(msg.author.id, newTodoData)

	if (isAddAgain) {
		editTodoList(msg, newTodoData)
		return
	}

	msg.channel.send(`**Selesai!** Gunakan \`${prefix} todo\` untuk melihat list dan gunakan \`${prefix} set todo\` untuk kembali mengatur list`)
}

async function awaitSingleMessage(msg, filter, questionTxt) {
	let channels = await msg.client.processOn.get(msg.author.id)
	if (!channels) channels = []
	msg.client.processOn.set(msg.author.id, [ ...channels, msg.channel.id ])

	const questionMsg = await msg.channel.send(questionTxt)
	const input = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first()))


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