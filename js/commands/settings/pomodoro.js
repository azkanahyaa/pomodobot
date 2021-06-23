const { updatePomodDB } = require('../../db')
const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'pomodoro',
  async execute(msg, args) {
		const hasPermit = msg.member.permissions.has('MANAGE_GUILD')
		if (!hasPermit) return msg.channel.send('Kamu harus memiliki permission `MANAGE_GUILD` untuk menggunakan command ini')

		const ynString = [ 'ya', 'tidak' ]
		
		const filterAuthor = m => msg.author.id === m.author.id
		const filterExit = m => m.content.toLowerCase() === 'exit'
		const filterCondition = m => filterAuthor(m) && ( filterExit(m)  || ynString.some(b => b === m.content.toLowerCase()) )
		const filterNumber = m => filterAuthor(m) && ( filterExit(m)  || eval(m.content) !== isNaN )
		const filterID = m => filterAuthor(m) && ( filterExit(m)  || (eval(m.content) !== NaN && m.content.length === 18)) 

		const qTxt = 'Masukkan id Voice Channel untuk membuat channel pomodoro baru'

		const channelID = await awaitSingleMessage(msg, filterID, qTxt)
		const vChannel = await msg.guild.channels.cache.get(channelID)

		if (!vChannel) return msg.channel.send('Channel Tidak ditemukan')
		console.log(vChannel.name)

		let defaultValue = [ 25, 5, 8 ]

		const defaultEmbed = new MessageEmbed()
			.setColor('#73cfff')
			.setTitle(`Pengaturan Default ${msg.guild.name}`)
			.addFields(
				{ name: '🔴 Durasi Fokus', value: `${defaultValue[0]} menit`, inline: true },
				{ name: '🔵 Durasi Istirahat', value: `${defaultValue[1]} menit`, inline: true },
				{ name: '🔄 Jumlah Pengulangan', value: `${defaultValue[2]/2} kali`, inline: true }
			)
			.setDescription('> tekan reaction di bawah untuk mengubah pengaturan default server, tekan ✅ jika sudah selesai')
			.setFooter(`Initial channel: ${vChannel.name}`)

		const embed = await msg.channel.send(defaultEmbed)
		const embedReact = [ '🔴', '🔵', '🔄', '✅']
		for (const react of embedReact) {
			embed.react(react)
		}

		let isAwaitReact = true
		while (isAwaitReact) {
			const filter = (reaction, user) => embedReact.some(react => react === reaction.emoji.name) && user.id == msg.author.id
			const reaction = await embed.awaitReactions(filter, { max: 1 }).then(collected => collected.first())

			if (reaction.emoji.name === '✅') {
				isAwaitReact = false
				updatePomodDB(msg.guild.id, { id: vChannel.id, name: vChannel.name, settings: defaultValue })
				msg.channel.send('Pengaturan server berhasil')
				break
			}

			const editIndex = embedReact.findIndex(react => react === reaction.emoji.name)
			const reactString = [ 'Durasi Fokus', 'Durasi Istirahat', 'Jumlah Pengulangan' ]
			const setLimit = [ 10, 5, 2 ]

			const minLimit = setLimit[editIndex]

			const qTxt2 = `Masukkan **${reactString[editIndex]}** default untuk server ini`
			let newVal = eval(await awaitSingleMessage(msg, filterNumber, qTxt2))
			let unit = 'menit'
			if (editIndex === 2)  {
				unit = 'kali'
				newVal *= 2
			}
			const type = reactString[editIndex].split(' ')[1]
			if (newVal < minLimit) {
				msg.channel.send(`Nilai minimal ${type} adalah ${minLimit} ${unit}`)
				msg.channel.send('React kembali embed untuk mengubah pengaturan')
				continue
			}

			defaultValue[editIndex] = newVal
			const newField = {
				name: `${embedReact[editIndex]} ${reactString[editIndex]}`,
				value: `${newVal} ${unit}`,
				inline: true
			}
			defaultEmbed.spliceFields(editIndex, 1, newField)
			embed.edit(defaultEmbed)
			console.log(newField)

			const qTxt3 = `ubah nilai default lain? **(ketik: Ya/Tidak)**`
			const input3 = await awaitSingleMessage(msg, filterCondition, qTxt3)
			const isEditAgain = input3.toLowerCase() === 'ya'


			if (!isEditAgain) {
				isAwaitReact = false
				updatePomodDB(msg.guild.id, { id: vChannel.id, name: vChannel.name, settings: defaultValue })
				msg.channel.send('Pengaturan Server Berhasil')
			} else {
				msg.channel.send('Kamu dapat mereact kembali embed untuk mengubah nilai default lain')
			}
		}
	}
}

async function awaitSingleMessage(msg, filter, questionTxt) {
	let channels = await msg.client.processOn.get(msg.author.id)
	if (!channels) channels = []
	msg.client.processOn.set(msg.author.id, [ ...channels, msg.channel.id ])

	const questionMsg = await msg.channel.send(questionTxt)
	const input = await msg.channel.awaitMessages(filter, { max: 1 }).then(collected => Promise.resolve(collected.first()))

	questionMsg.delete()
	let newChannels = await msg.client.processOn.get(msg.author.id)
	msg.client.processOn.set(msg.author.id, newChannels.filter(c => c !== msg.channel.id))

	if (input.content.toLowerCase() === 'exit') return msg.channel.send('**Proses Dihentikan**')
	input.delete()
	return Promise.resolve(input.content)
}