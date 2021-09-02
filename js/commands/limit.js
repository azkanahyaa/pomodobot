const { getPomodDB, updatePomodDB } = require('../db') 

const { prefix, errChnl } = require('../../config.js')

module.exports = {
	name: 'limit',
	description: 'Mengatur user limit pada channel pomodoro',
	aliases: [ 'ul', 'lim', 'userlimit' ],
	usages: [ `${prefix} limit <jumlah>` ],
	examples: [ `${prefix} limit 2`, `${prefix} ul 10`, `${prefix} lim 0 \`(unlimited)\`` ],
  execute(msg, args) {
    try {
      const config = msg.client.pomodoro.get(msg.member.voice.channelID)
      const input = parseInt(args[0])
      if (input < 0 || input > 99 || isNaN(input)) return msg.channel.send('input tidak valid')
      
      let { settings, host, channel } = config
  
      if (host.id !== msg.author.id) return msg.channel.send('Kamu bukan host dari channel ini')
      
      channel.setUserLimit(input)
      settings.limit = input
      msg.client.pomodoro.set(channel.id, { ...config, settings })
      getPomodDB(channel.guild.id).then(data => {
        const index = data.pomodoro.findIndex(item => item.channel === channel.id)
        data.pomodoro[index] = { ...data.pomodoro[index], settings }
        
        updatePomodDB(channel.guild.id, data)
      })
      msg.channel.send(`limit channel berhasil diubah ke ${input}`)

    } catch(err) {
			if (err.exit) {
				msg.channel.send(err.message)
			} else {
				console.log(err.stack)
		const errOutput = `${err.message}\n\`\`\`\n${err.stack}\n\`\`\``
				msg.client.guilds.fetch('810581510541410325').then(guild => {
          const c = guild.channels.cache.get(errChnl)
          c.send(errOutput)
        })
			}
		}
  }
}