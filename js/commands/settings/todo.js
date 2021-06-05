const { MessageEmbed } = require('discord.js')
const { getTodoDB, updateTodoDB } = require('../../db')

const defaultTemp = {
	default: '🔸',
	onGoing: '🔹',
	completed: '✅',
	uncompleted: '📛'
}
/*



*/
module.exports = {
	name: 'todo',
	execute(msg, args) {
		const userNickname = msg.guild.members.cache.get(msg.author.id).nickname
		const settingsDesc = 'Tekan reaction di bawah untuk mengatur to do list anda:\n\n➕ = `tambah list`\n🗑️ = `hapus beberapa list`\n📝 = `mengedit list`\n📦 = `template todolist`\n✅ = `selesai`'
		const settingsEmbed = new MessageEmbed()
			.setColor('#347C7C')
			.setTitle(`${userNickname} Daily To Do List`)
			.setDescription(settingsDesc)
			.setThumbnail(msg.author.displayAvatarURL())
			.setFooter('gunakan p!todo untuk melihat to do list');

		msg.channel.send(settingsEmbed).then(m => {
			const embedReact = [ '➕','🗑️','📝','📦','✅', ]

			for (const react of embedReact) {
				m.react(react)
			}

			const filter = (reaction, user) => embedReact.some(react => react === reaction.emoji.name) && user.id == msg.author.id
			m.awaitReactions(filter, {max: 1}).then(collected => {
				console.log(collected.first().emoji.name)
				switch (collected.first().emoji.name) {
					case '➕':
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
						m.delete()
						msg.channel.send('belum ada template diatur untuk server ini')
						return

					case '✅':
						getTodoDB(msg.author.id).then(list => {							
							m.delete()
							const todoEmbed = new MessageEmbed()
								.setColor('#347C7C')
								.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
								.setTitle(`DAILY TO DO LIST`)
								.setDescription(`▫️ \`${list.map(item => item.join(' pada ')).join('\`\n▫️ \`')}\``)
								.setFooter('gunakan p!set todo untuk mengedit list')
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
	const newTodoArray = [ ...todoArray, ...todoInput]

	const qTxt2 = new MessageEmbed()
		.setColor('#347C7C')
		.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
		.setDescription(`\n▫️ ${newTodoArray.join('\n▫️ ')}\n\n\`\`\`json\nApakah Kamu ingin menambah to do list lagi? "(Ketik: Ya/Tidak)"\n\`\`\``)

	const input2 = await awaitSingleMessage(msg, filterCondition, qTxt2)
	const isAddAgain = input2.toLowerCase() === 'ya'

	if (isAddAgain) {
		addTodoList(msg, newTodoArray)
		return
	}

	let todoEmbed = new MessageEmbed()
		.setColor('#347C7C')
		.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
		.setTitle(`DAILY TO DO LIST`)
		.setDescription(`▫️ ${newTodoArray.join('\n▫️ ')}`)
		.setFooter('gunakan `,p set todo` untuk mengedit list')
	msg.channel.send(todoEmbed)
	updateTodoDB(msg.author.id, newTodoArray)
}

async function removeTodoList(msg, todoList) {
	let newTodoData = todoList

	if (newTodoData.length < 1) return msg.channel.send('Todo List kamu hari ini kosong')

	const ynString = [ 'ya', 'tidak' ]

	const filterAuthor = m => msg.author.id === m.author.id
	const filterExit = m => m.content.toLowerCase() === 'exit'
	const filterCondition = m => filterAuthor(m) && ( filterExit(m)  || ynString.some(b => b === m.content.toLowerCase()) )
	const filterOneLine = m => filterAuthor(m) && ( filterExit(m)  || m.content.split('\n').length === 1 )
	const filterNumber = m => filterAuthor(m) && ( filterExit(m)  || eval(m.content) !== isNaN )
	const filterNumbers = m => filterAuthor(m) && ( filterExit(m)  || m.content.split(',').every(num => eval(num) !== isNaN) )

	const todoEmbed = new MessageEmbed()
		.setColor('#347C7C')
		.setAuthor(`DAILY TO DO LIST`, msg.author.displayAvatarURL())
		.setDescription(`\`\`\`json\n"Masukkan Nomor List yang ingin Dihapus:"\`\`\`\n${newTodoData.map((item, index) => `**${index + 1}.** ${item}`).join('\n')}\n`)
		.setFooter('ketik `exit` untuk membatalkan proses')

	const input = await awaitSingleMessage(msg, filterNumbers, todoEmbed)
	const inputArray = input.split(',').map(num => eval(num) - 1).sort((a, b) => b - a)

	const qTxt2 = `Hapus to do list nomor ${input}? **(Ya/Tidak)**`

	const input2 = await awaitSingleMessage(msg, filterCondition, qTxt2)
	const isDelete = input2.toLowerCase() === 'ya'

	if (!isDelete) {
		removeTodoList(msg, newTodoArray)
		return 
	}

	for (const num of inputArray) {
		if (isNaN(num) || num > newTodoData.length - 1) {
			msg.channel.send('masukkan nomor to do list dengan benar')
			removeTodoList(msg, newTodoData)
			return
		}
		newTodoData.splice(num, 1)
	}

	const qTxt3 = new MessageEmbed()
		.setColor('#347C7C')
		.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
		.setDescription(`\n▫️ ${newTodoData.join('\n▫️ ')}\n\n\`\`\`json\nApakah Kamu ingin menghapus to do list lagi? "(Ketik: Ya/Tidak)"\n\`\`\``)

	const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
	const isAddAgain = input3.toLowerCase() === 'ya'

	if (isAddAgain) {
		removeTodoList(msg, newTodoData)
		return
	}

	msg.channel.send('**Selesai!** Gunakan `,p todo` untuk melihat list dan gunakan `p!set todo` untuk kembali mengatur list')
	updateTodoDB(msg.author.id, newTodoData)
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
		.setColor('#347C7C')
		.setAuthor(`DAILY TO DO LIST`, msg.author.displayAvatarURL())
		.setDescription(`\`\`\`json\n"Masukkan Nomor List yang ingin Diedit:"\`\`\`\n${newTodoData.map((item, index) => `**${index + 1}.** ${item}`).join('\n')}\n`)
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
		.setColor('#347C7C')
		.setAuthor("TODO LIST HARI INI:", msg.author.displayAvatarURL())
		.setDescription(`\n▫️ ${newTodoData.join('\n▫️ ')}\n\n\`\`\`json\nApakah Kamu ingin mengedit to do list lagi? "(Ketik: Ya/Tidak)"\n\`\`\``)

	const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
	const isAddAgain = input3.toLowerCase() === 'ya'

	if (isAddAgain) {
		editTodoList(msg, newTodoData)
		return
	}

	msg.channel.send('**Selesai!** Gunakan `p!todo` untuk melihat list dan gunakan `p!set todo` untuk kembali mengatur list')
	updateTodoDB(msg.author.id, newTodoData)
}

async function awaitSingleMessage(msg, filter, questionTxt) {
	const questionMsg = await msg.channel.send(questionTxt)
	const input = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first()))


	questionMsg.delete()
	if (input.content.toLowerCase() === 'exit') return msg.channel.send('**Proses Dihentikan**')
	input.delete()
	return Promise.resolve(input.content)
}