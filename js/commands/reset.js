const { getTodoDB, updateTodoDB } = require('../db')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'reset',
	description: 'Mereset semua to do list',
	aliases: [ 'cleartodo', 'ct', 'rst' ],
  async execute(msg, args) {
    const todo = await getTodoDB(msg.author.id)

    if (todo.list.length < 1) return msg.channel.send('Kamu belum mengatur to do list nih')
		if (todo.reset) return msg.channel.send('Kamu harus menonaktifkan autoreset todolist dahulu menggunakan `,a set todo`')


    let template = [ '🔸', '🔹', '✅', '📛' ]

		const embedDesc = todo.list.map(item => {
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
		msg.channel.send(`Selesai, <@${msg.author.id}>! cek DM ya.`)
	
		updateTodoDB(todo.user, { ...todo, list: [] })
  }
}