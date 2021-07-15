const { MessageEmbed } = require('discord.js')

let prefix = process.env.PREFIX

module.exports = {
	name: 'loop',
	execute(msg, args) {
		const member = msg.guild.members.cache.get(msg.author.id)
		const config = msg.client.pomodoro.get(member.voice.channelID)

		if (!config) return msg.channel.send('Kamu harus membuat voice channel pomodoro untuk menggunakan command ini')
		if (config.host.id !== msg.author.id) return msg.channel.send('kamu bukan host dari channel pomodoro ini')

		let settings = config.settings

		const newVal = parseInt(args[0]) * 2
		if (newVal < 2 || isNaN(newVal)) return msg.channel.send(`Masukkan Jumlah Pengulangan dengan Benar. Pengulangan minimal 1 kali. Contoh: \`${prefix} set loop 6\``)
		settings[2] = newVal
		msg.client.pomodoro.set(member.voice.channelID, { ...config, settings })

		const pomodEmbed = new MessageEmbed()
			.setColor('#73cfff')
			.setTitle(`Pengaturan Pomodoro di ${config.channel.name}`)
			.setDescription(`> Mulai: \`${prefix} pomodoro <start|break|start>\`\n> Atur: \`${prefix} set <focus|break|loop> <durasi>\``)
			.addFields(
				{ name: '🔴 Durasi Fokus', value: `${settings[0]} menit`, inline: true },
				{ name: '🔵 Durasi Istirahat', value: `${settings[1]} menit`, inline: true },
				{ name: '🔄 Jumlah Pengulangan', value: `${settings[2]/2} kali`, inline: true }
			)
		msg.channel.send(pomodEmbed)
	}
}