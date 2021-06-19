const { checkDB, getTodoDB, getCompletionDB, removeDBItem, deleteDB } = require('../db')
const { MessageEmbed } = require('discord.js')


function todoInterval(client) {

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
			.setColor('#347C7C')
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
		if (hours === 15 && minutes === 30) {
			deleteDB('todo')
			deleteDB('completions')
		} 
		
		if (hours !== 15 || (hours === 15 && minutes > 30)) return

		checkDB('todo').then(users => {
			const todoMap = new Map(users)
			if (users.length < 1) return

			for (const [id, todo] of todoMap) {
				cleanData(id, todo)
			}
		})
	}, 30000) 
}


module.exports = { todoInterval }