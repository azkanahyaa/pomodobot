const { MessageEmbed } = require('discord.js')
const { getTodoDB } = require('../db')

module.exports = {
	name: 'todo',
	description: 'melihat to do list yang telah ditentukan untuk hari ini',
	aliases: [ 'td', 'daily', 'todolist' ],
  async execute(msg, args) {
		const userNickname = msg.guild.members.cache.get(msg.author.id).nickname
		const todoData = await getTodoDB(msg.author.id)
		const embedDesc = todoData.map((item, index) => `${index + 1}. ${item[0]} **(${item[1].trim()})**`).join('\n')

		const todoEmbed = new MessageEmbed()
			.setColor('#347C7C')
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setTitle(`${userNickname} Daily To Do List`)
			.setDescription(embedDesc)
			.setFooter('gunakan p!set todo untuk mengedit list')
		msg.channel.send(todoEmbed)
	}
}