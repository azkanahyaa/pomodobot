const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'loop',
	execute(msg, args) {
		const member = msg.guild.members.cache.get(msg.author.id)
		const config = msg.client.pomodoro.get(member.voice.channelID)
		let settings = config.settings

		if (!config) return msg.channel.send('Kamu harus membuat voice channel pomodoro untuk mengguanakan command ini')

		const newVal = eval(args[0]) * 2
		if (newVal < 2) return msg.channel.send('Pengulangan minimal 1 kali')
		settings[2] = newVal
		msg.client.pomodoro.set(member.voice.channelID, { ...config, settings })

		const pomodEmbed = new MessageEmbed()
			.setColor('#347C7C')
			.setTitle(`Pengaturan Pomodoro di ${config.channel.name}`)
			.setDescription('> Mulai: `,p pomodoro <start|break|start>`\n> Atur: `,p set <focus|break|loop> <durasi>`')
			.addFields(
				{ name: '🔴 Durasi Fokus', value: `${settings[0]} menit`, inline: true },
				{ name: '🔵 Durasi Istirahat', value: `${settings[1]} menit`, inline: true },
				{ name: '🔄 Jumlah Pengulangan', value: `${settings[2]/2} kali`, inline: true }
			)
		msg.channel.send(pomodEmbed)
	}
}