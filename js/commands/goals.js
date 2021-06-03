const { MessageEmbed } = require('discord.js')
const { getProfile, updateProfile } = require('../db')

module.exports = {
	name: 'goals',
	description: 'melihat  target jangka panjang pengguna yang telah disimpan dalam bot',
	aliases: [ 'g' ],
  execute(msg, args) {
		if (args[0] !== 'set') {
			getProfile(msg.author.id).then(profile => {
				const goalsEmbed = new MessageEmbed()
					.setTitle('Target Jangka Panjang')					
    			.setColor('#EDCD55')
					.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
					.setDescription(profile)
					.setFooter('Good Luck For Your Dreams')

				msg.channel.send(goalsEmbed)
			})
			.catch(err => {
				msg.channel.send(err)
			})
		} else {
			
		}
	}
}