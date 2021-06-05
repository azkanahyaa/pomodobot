const { MessageEmbed } = require('discord.js')
const { getTodoDB } = require('../db')

module.exports = {
	name: 'todo',
	description: 'melihat to do list yang telah ditentukan untuk hari ini',
	aliases: [ 'td', 'daily', 'todolist' ],
  async execute(msg, args) {
		const userNickname = msg.guild.members.cache.get(msg.author.id).nickname
		const todoData = await getTodoDB(msg.author.id)
		if (todoData.length < 1) return msg.channel.send('todo list kamu kosong nih. Silahkan gunakan `p!setup todo` untuk mengatur list kamu')
		const embedDesc = todoData.map((item, index) => `${index + 1}. ${item}`).join('\n')

		const todoEmbed = new MessageEmbed()
			.setColor('#347C7C')
			.setAuthor(`${userNickname} Daily To Do List`, msg.author.displayAvatarURL())
			.setDescription(embedDesc)
			.setFooter('gunakan `,p set todo` untuk mengedit list')
		msg.channel.send(todoEmbed)
	}
}