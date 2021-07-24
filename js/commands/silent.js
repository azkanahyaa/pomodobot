const { getPomodDB, updatePomodDB } = require('../db') 

let prefix = process.env.PREFIX

module.exports = {
	name: 'silent',
	description: 'Mengatur level silent pada channel pomdoro\n`Level 1`: semua member bebas openmic saat fokus\n`Level 2`: member bisa openmic, namun akan mendapat mention dari bot\n`3. Level 3`: Member tidak bisa openmic saat fokus',
	aliases: [ 'sl', 'silentlevel' ],
	usages: [ `${prefix} sl <jumlah>` ],
	examples: [ `${prefix} silent 2`, `${prefix} sl 0` ],
  execute(msg, args) {
		const config = msg.client.pomodoro.get(msg.member.voice.channelID)
    const input = parseInt(args[0])
    if (input < 1 || input > 3 || isNaN(input)) return msg.channel.send('input tidak valid')
    
    const { settings, host, channel } = config

    if (host.id !== msg.author.id) return msg.channel.send('Kamu bukan host dari channel ini')
    
    settings.silent = input
    if (input === 1 || input === 2) {
      channel.update('832505201771675669', { 'SPEAK': true })
    } else if (input === 3) {
      channel.update('832505201771675669', { 'SPEAK': false })
    }
    msg.client.pomodoro.set(channel.id, { ...config, settings })
    getPomodDB(channel.guild.id).then(data => {
      const index = data.pomodoro.findIndex(item => item.channel === channel.id)
      data.pomodoro[index] = { ...data.pomodoro[index], settings }
      
      updatePomodDB(channel.guild.id, data)
    })
    msg.channel.send(`limit channel berhasil diubah ke ${input}`)
  }
}