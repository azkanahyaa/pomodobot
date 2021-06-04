const { MessageEmbed } = require('discord.js')
const { getTodoDB } = require('../db')

module.exports = {
	name: 'todo',
	description: 'melihat to do list yang telah ditentukan untuk hari ini',
	aliases: [ 'td', 'daily', 'todolist' ],
  async execute(msg, args) {
		const userNickname = msg.guild.members.cache.get(msg.author.id).nickname
		const todoData = await getTodoDB(msg.author.id)
		const embedDesc = todoData.map((item, index) => {
			let timeString = item[1]
			if (!timeString) timeString = 'unset'
			return `${index + 1}. ${item[0]} **(${timeString.trim()})**`
		}).join('\n')

		if (todoData.length < 1) return msg.channel.send('todo list kamu kosong nih. Silahkan gunakan `p!setup todo` untuk mengatur list kamu')

		const todoEmbed = new MessageEmbed()
			.setColor('#347C7C')
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setTitle(`${userNickname} Daily To Do List`)
			.setDescription(embedDesc)
			.setFooter('gunakan p!set todo untuk mengedit list')
		msg.channel.send(todoEmbed)
	}
}