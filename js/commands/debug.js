const { prefix } = require('../../config.js')

module.exports = {
	name: 'debug',
	hidden: true,
  async execute(msg, args) {
		try {
			const devId = ['825727626311893052', '564144368198483969']
			const isDev = devId.some(id => id = msg.author.id)

			if (!isDev) return

			if (args[0] === 'pomodoro') {
				const { getPomodDB, updatePomodDB } = require('../db')

				getPomodDB(msg.guild.id).then(data => {
					updatePomodDB(msg.guild.id, { ...data, pomodoro: [] })
				})
			}

			const code = args.join(' ').split('```')[1]
			msg.channel.send('**PERINGATAN!!**\n **Command ini hanya dapat digunakan untuk keperluan genting**. Ketik `yakin` untuk melanjutkan')
			const filter = m => m.author.id === msg.author.id

			const confirm = await msg.channel.awaitMessages(filter, { max: 1 }).then(collection => collection.first())

			if (confirm.content !== 'yakin') return msg.channel.send('command dibatalkan')
			
			msg.channel.send('```\n' + code + '\n```')
			let count = 10
			const countMsg = await msg.channel.send('command akan dijalankan dalam ' + count + '\nketik `batal` untuk mengentikan')

			let countDown = setInterval(() => {
				count--
				countMsg.edit('command akan dijalankan dalam ' + count + '\nketik `batal` untuk mengentikan')

				if (count === 0) {
					clearInterval(countDown)
					eval(code)
					countMsg.edit('Kode telah dijalankan')
				}
			}, 1000)

			const cancel = await msg.channel.awaitMessages(filter, { max: 1 }).then(collection => {
				if (count === 0 || collection.first().content !== 'batal') return

				clearInterval(countDown)
				msg.channel.send('Kode dibatalkan')
			})
		} catch(err) {
			console.log(err)
		}
		
		
	}
}