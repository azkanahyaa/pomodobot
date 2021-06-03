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
					console.log('delete')
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
	const userNickname = msg.guild.members.cache.get(msg.author.id).nickname
	const todoEmbed = new MessageEmbed()
		.setColor('#347C7C')
		.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
		.setTitle(`DAILY TO DO LIST`)
		.setDescription(`▫️ \`${newTodoArray.map(item => item.replace(' -at ', ' pada ')).join('\`\n▫️ \`')}\``)
		.setFooter('gunakan p!set todo untuk mengedit list')
	msg.channel.send(todoEmbed)
	updateTodoDB(msg.author.id, todoData)
}

async function awaitSingleMessage(msg, filter, questionTxt) {
	const questionMsg = await msg.channel.send(questionTxt)
	const input = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first()))

	questionMsg.delete()
	input.delete()

	return Promise.resolve(input.content)
}