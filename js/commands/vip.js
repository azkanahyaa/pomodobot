const { getVipDB } = require('../db')
const { MessageEmbed } = require('discord.js')
let prefix = process.env.PREFIX

module.exports = {
	name: 'vip',
	description: 'Mengecek role vip server',
	aliases: [ 'viproles', 'vr' ],
	usage: [ `${prefix} vip` ],
  execute(msg, args) {
		getVipDB(msg.guild.id).then(roles => {
			if (roles.length < 1) return msg.channel.send('VIP role server ini belum diatur')
			console.log(roles)
			const desc = roles.map((role, index) => {
				return `\`${index}. \` <@&${role}>`
			}).join('\n')

			const userRoles = msg.member.roles.cache.map(role => role.id)
			const isVip = roles.some(role => {
			  return userRoles.some(userRole => role === userRole)	
			})

			const embed = new MessageEmbed()
				.setColor('#73cfff')
				.setAuthor(`${msg.guild.name} VIP roles`, msg.guild.iconURL())
				.setDescription(desc)
				.setFooter('Kamu belum menjadi VIP member')
			if (isVip) embed.setFooter('Kamu telah menjadi VIP member')

			msg.channel.send(embed)
		})
	}
}