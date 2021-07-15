const { checkDB, getTodoDB, getCompletionDB, removeDBItem, deleteDB } = require('../db')
const { MessageEmbed } = require('discord.js')


function todoInterval(client) {
	client.processOn.set('deletingTodo', false)

	async function cleanData(userID, todoList) {
		let template = [ '🔸', '🔹', '✅', '📛' ]
		const todoCompletion = await getCompletionDB(userID)
		const finalCompletion = todoCompletion.map(value => {
			if (value === 2) return 2
			return 3
		})

		const embedDesc = todoList.map((item, index) => {
			const itemCompletion = finalCompletion[index]
			return `${template[itemCompletion]} ${item}`
		})

		const todoEmbed = new MessageEmbed()
			.setColor('#73cfff')
			.setTitle('> TO DO LIST DIRESET!')
			.setDescription(embedDesc)
			.setFooter('Jangan Lupa Untuk Mengatur To Do List Besok ya')

		const user = await client.users.fetch(userID)
		user.send(todoEmbed)

		removeDBItem('todo', userID)
		removeDBItem('completions', userID)
	}

	let checkTime = setInterval(() => {
		const hours = new Date().getHours()
		const minutes = new Date().getMinutes()
		if (hours !== 15 || (hours === 15 && minutes > 10)) return

		if (minutes === 10) {
			deleteDB('todo')
			deleteDB('completions')
		} 

		checkDB('todo').then(users => {
			if (users.length < 1) return
			if (client.processOn.get('deletingTodo')) return
			client.processOn.set('deletingTodo', true)

			let index = 0
			for (const user of users) {
				cleanData(user[0], user[1])
				index++
				if (index === users.length) {
					client.processOn.set('deletingTodo', false)
				}
			}
		})
	}, 1000) 
}


module.exports = { todoInterval }