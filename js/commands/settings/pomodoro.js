const { updatePomodDB } = require('../../db')
const { MessageEmbed } = require('discord.js')

const errChnl = process.env.ERRORLOG

module.exports = {
	name: 'pomodoro',
  async execute(msg, args) {
		try {
			const hasPermit = msg.member.permissions.has('MANAGE_GUILD')
			if (!hasPermit) return msg.channel.send('Kamu harus memiliki permission `MANAGE_GUILD` untuk menggunakan command ini')

			const ynString = [ 'ya', 'tidak' ]
			
			const filterAuthor = m => msg.author.id === m.author.id
			const filterExit = m => m.content.toLowerCase() === 'exit'
			const filterNumber = m => filterAuthor(m) && ( filterExit(m)  || eval(m.content) !== isNaN )
			const filterID = m => filterAuthor(m) && ( filterExit(m)  || (eval(m.content) !== NaN && m.content.length === 18)) 

			const qTxt = 'Masukkan id Voice Channel untuk membuat channel pomodoro baru'

			const channelID = await awaitSingleMessage(msg, filterID, qTxt)
			const vChannel = await msg.guild.channels.cache.get(channelID)

			if (!vChannel) return msg.channel.send('Channel Tidak ditemukan')
			console.log(vChannel.name)

			let pmdData = {
				guildId: msg.guild.id,
				initialChnl: vChannel.id,
				settings: {
					duration: {
						focus: 25,
						sb: 5,
						lb: 15,
						lbInt: 2,
						loop: 4
					},
					limit: 0,
					silent: 0
				},
				pomodoro: []
			}

			let inputTemp = [ 25, 5, 15, 2, 4, 0, 1 ]
			const inputMin = [ 10, 5, 10, 2, 1, 0, 3 ]
			const inputMax = [ 360, 180, 360, 10, 30, 99, 2 ]

			setDefault()

			async function setDefault(embed) {
				const embedText = new MessageEmbed()
					.setColor('#73cfff')
					.setTitle(`Pengaturan Default ${msg.guild.name}`)
					.setDescription(`\`Initial channel: ${vChannel.name}\`\nMasukkan angka 1 - 7 sesuai pengaturan default yg ingin diubah:`)
					.addField('Pengaturan Default', `
					\`1️⃣. Fokus        :\` **${inputTemp[0]}** menit
					\`2️⃣. Jeda Pendek  :\` **${inputTemp[1]}** menit
					\`3️⃣. Jeda Panjang :\` **${inputTemp[2]}** menit
					\`4️⃣. Interval Jeda:\` **${inputTemp[3]}** putaran
					\`5️⃣. Pengulangan  :\` **${inputTemp[4]}** putaran
					\`6️⃣. Channel Limit:\` **${inputTemp[5]}** member
					\`7️⃣. Silent Level :\` level **${inputTemp[6]}**`)
				.setFooter('Klik reaction ✅ jika pengaturan sudah dirasa sesuai')
				
				if (!embed) {
					embed = await msg.channel.send(embedText)
				} else {
					embed.edit(embedText)
				}


				const embedReact = [ '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '✅' ]
				for (const r of embedReact) {
					embed.react(r)
				}

				const filterReaction = (r, user) => embedReact.some(er => er === r.emoji.name) && user.id === msg.author.id
				const editIndex = await embed.awaitReactions(filterReaction, { max: 1 }).then(collection => {
					const emoji = collection.first().emoji.name

					const selectedEmoji = embed.reactions.cache.get(emoji)
					selectedEmoji.users.remove(msg.author.id)
					const index = embedReact.indexOf(emoji)

					return Promise.resolve(index)
				})

				if (editIndex === 7) {
					const newSettings = {
						duration: {
							focus: inputTemp[0],
							sb: inputTemp[1],
							lb: inputTemp[2],
							lbInt: inputTemp[3],
							loop: inputTemp[4]
						},
						limit: inputTemp[5],
						silent: inputTemp[6]
					}

					pmdData.settings = newSettings
					updatePomodDB(msg.guild.id, pmdData)
					msg.channel.send('Berhasil Mengatur pengaturan pomodoro server')
					return
				}

				const qNewInput = `<@${msg.author.id}>, masukkan nilai default untuk pengaturan nomor ${editIndex + 1}`
				const newValue = parseInt(await awaitSingleMessage(msg, filterNumber, qNewInput))

				const minVal = inputMin[editIndex]
				const maxVal = inputMax[editIndex]

				if (newValue < minVal || newValue > maxVal) {
					msg.channel.send(`Nilai minimal untuk pengaturan tersebut adalah **${minVal}** dan nilai maximal untuk pengaturan tersebut adalah **${maxVal}**
					*Kamu dapat mereact kembali untuk mengubah pengaturan*`)
					 .then(m => setTimeout(() => m.delete(), 3000))
					setDefault(embed)
				} else {
					inputTemp[editIndex] = newValue
					msg.channel.send(`Berhasil diubah. *Kamu dapat mereact kembali untuk mengubah pengaturan lainnya*`)
					 .then(m => setTimeout(() => m.delete(), 3000))
					setDefault(embed)
				}
			}
		} catch(err) {
			if (err.exit) {
				msg.channel.send(err.message)
			} else {
				console.log(err.stack)
				const errOutput = `${err.message}\n\`\`\`\n${err.stack}\n\`\`\``
				msg.client.channels.fetch(errChnl).then(c => {
					c.send(errOutput)
				})
			}
		}
	}
}

async function awaitSingleMessage(msg, filter, questionTxt) {
	try {
		let channels = await msg.client.processOn.get(msg.author.id)
		if (!channels) channels = []
		msg.client.processOn.set(msg.author.id, [ ...channels, msg.channel.id ])
	
		const questionMsg = await msg.channel.send(questionTxt)
		const input = await msg.channel.awaitMessages(filter, { max: 1, idle: 600000 }).then(collected => {
			return Promise.resolve(collected.first())
		}).catch(err => {
			questionMsg.edit('Proses dihentikan setelah 10 menit tidak aktif')
		})
	
	
		questionMsg.delete()
		let newChannels = await msg.client.processOn.get(msg.author.id)
		msg.client.processOn.set(msg.author.id, newChannels.filter(c => c !== msg.channel.id))
	
		if (input.content.toLowerCase() === 'exit') return Promise.reject({ exit: true,  message: "**Proses dihentikan**"})
		input.delete()
		return Promise.resolve(input.content)
	} catch(err) {
		msg.client.channels.fetch(errChnl).then(c => {
			c.send(err.message)
		})
	}
}