const { MessageEmbed } = require('discord.js')
const { getTodoDB, updateTodoDB } = require('../../db')

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

							const todoList = list.map(item => item.join(' pada '))
							addTodoList(msg, todoList)
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
					console.log('edit')
					return
					case '📦':
					console.log('template')
					return
					case '✅':
					console.log('done')
					return
				}
			})
		})
	}
}

async function addTodoList(msg, todoList = []) {
	
	const todoArray = todoList

	console.log('separator')
	const ynString = [ 'ya', 'tidak' ]

	const filterAuthor = m => msg.author.id === m.author.id
	const filterCondition = m => filterAuthor(m) && ynString.some(b => b === m.content.toLowerCase())
	const qTxt1 = `**<@${msg.author.id}>, silahkan Masukkan Todo List Kamu hari ini**\n\nGunakan:\n\`enter\` untuk memasukkan lebih dari 1 list sekaligus\n\`-at\` untuk mengisi Waktu Pengerjaan\n\nContoh:\n\`Solat subuh & olahraga -at 04.00 - 05.00\nSiap-siap Zoom -at 05.00 - 07.00\nSekolah Online -at 07.00 - Selesai\``

	const input1 = await awaitSingleMessage(msg, filterAuthor, qTxt1)
	const todoInput = input1.split('\n')
	const newTodoArray = [ ...todoArray, ...todoInput]

	const qTxt2 = `\`\`\`\nTO DO LIST HARI INI:\n${newTodoArray.join('\n')}\n\`\`\`\n Apakah Kamu ingin menambah to do list lagi? **(Ya/Tidak)**`

	const input2 = await awaitSingleMessage(msg, filterCondition, qTxt2)
	const isAddAgain = input2.toLowerCase() === 'ya'

	if (isAddAgain) {
		addTodoList(msg, newTodoArray)
		return
	}

	const todoData = newTodoArray.map(item =>  item.split(' -at '))
	const todoEmbed = new MessageEmbed()
		.setColor('#347C7C')
		.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
		.setTitle(`DAILY TO DO LIST`)
		.setDescription(`▫️ \`${newTodoArray.map(item => item.replace(' -at ', ' pada ')).join('\`\n▫️ \`')}\``)
		.setFooter('gunakan p!set todo untuk mengedit list')
	msg.channel.send(todoEmbed)
	updateTodoDB(msg.author.id, todoData)
}

async function removeTodoList(msg, todoList) {
	let newTodoData = todoList
	const ynString = [ 'ya', 'tidak' ]

	const filterAuthor = m => msg.author.id === m.author.id
	const filterCondition = m => filterAuthor(m) && ynString.some(b => b === m.content.toLowerCase())
	const filterNumber = m => filterAuthor(m) && m.content.split(',').every(num => eval(num) !== isNaN)

	const todoString = todoList.map((item, index) => `${index + 1}. ${item[0]} **(${item[1]})**`)
	const todoEmbed = new MessageEmbed()
		.setColor('#347C7C')
		.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
		.setTitle(`DAILY TO DO LIST`)
		.setDescription(todoString.join('\n'))
		.setFooter('ketik nomor list yang ingin dihapus')

	const input = await awaitSingleMessage(msg, filterNumber, todoEmbed)
	const inputArray = input.split(',').map(num => eval(num) - 1).sort((a, b) => b - a)

	const qTxt2 = `Hapus to do list nomor ${input}? **(Ya/Tidak)**`

	const input2 = await awaitSingleMessage(msg, filterCondition, qTxt2)
	const isDelete = input2.toLowerCase() === 'ya'

	if (!isDelete) {

		msg.channel.send('**Selesai!** Gunakan `p!todo` untuk melihat list dan gunakan `p!set todo` untuk kembali mengatur list')		
		updateTodoDB(msg.author.id, newTodoData)
		return 
	}

	for (const num of inputArray) {
		if (num > inputArray.length) {
			msg.channel.send('masukkan nomor to do list dengan benar')
			removeTodoList(msg, newTodoData)
			return
		}
		newTodoData.splice(num, 1)
	}

	const qTxt3 = `\`\`\`\nTO DO LIST HARI INI:\n${newTodoData.join('\n')}\n\`\`\`\n Apakah kamu ingin menghapus to do list lain? **(Ya/Tidak)**`

	const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
	const isAddAgain = input3.toLowerCase() === 'ya'

	if (isAddAgain) {
		removeTodoList(msg, newTodoData)
		return
	}

	msg.channel.send('**Selesai!** Gunakan `p!todo` untuk melihat list dan gunakan `p!set todo` untuk kembali mengatur list')
	updateTodoDB(msg.author.id, newTodoData)
}

async function awaitSingleMessage(msg, filter, questionTxt) {
	const questionMsg = await msg.channel.send(questionTxt)
	const input = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first()))

	questionMsg.delete()
	input.delete()

	return Promise.resolve(input.content)
}