const { checkDB, updateTodoDB } = require('../db')
const { MessageEmbed } = require('discord.js')


function todoInterval(client) {
	async function startReset(todo, delay) {
		console.log(todo, delay)
		setTimeout(() => {
			let template = [ '🔸', '🔹', '✅', '📛' ]

			if (todo.list.length < 1) return startReset(todo, 1000 * 60 * 60 * 24)
			const embedDesc = todo.list.map(item => {
				if (item[0] !== 2) item[0] = 3
				return `${template[item[0]]} ${item[1]}`
			}).join('\n')
	
			const todoEmbed = new MessageEmbed()
				.setColor('#73cfff')
				.setTitle('> TO DO LIST DIRESET!')
				.setDescription(embedDesc)
				.setFooter('Jangan Lupa Untuk Mengatur To Do List Besok ya')
	
			client.users.fetch(todo.user).then(user => {
				user.send(todoEmbed)
			})
	
			updateTodoDB(todo.user, { ...todo, list: [] })
			startReset(todo, 1000 * 60 * 60 * 24)
		}, delay)
	}

	checkDB('todo').then(allTodo => {
		for (const todo of allTodo) {
			if (!todo[1].reset) continue

			const resetTime = todo[1].reset

			const d = new Date()
			const date = d.getDate()
			d.setHours(resetTime)
			d.setMinutes(0)

			const now = new Date().getTime()
			if (d.getTime() - now < 0) d.setDate(date + 1)

			const end = d.getTime()

			startReset(todo[1], end - now)
		}
	})
}


module.exports = { todoInterval }