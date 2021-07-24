const { getPomodDB, updatePomodDB } = require('../db') 

let prefix = process.env.PREFIX

module.exports = {
	name: 'limit',
	description: 'Mengatur user limit pada channel pomodoro',
	aliases: [ 'ul', 'lim', 'userlimit' ],
	usages: [ `${prefix} limit <jumlah>` ],
	examples: [ `${prefix} limit 2`, `${prefix} ul 10`, `${prefix} lim 0 \`(unlimited)\`` ],
  execute(msg, args) {
		const config = msg.client.pomodoro.get(msg.member.voice.channelID)
    const input = parseInt(args[0])
    if (input < 0 || input > 99 || isNaN(input)) return msg.channel.send('input tidak valid')
    
    const { settings, host, channel } = config

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
  }
}