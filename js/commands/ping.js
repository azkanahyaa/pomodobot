module.exports = {
	name: 'ping',
	description: 'check ping',
	aliases: [  ],
  execute(msg, args) {
		msg.channel.send('Checking🔄').then(m => {
      const ping = m.createdTimestamp - msg.createdTimestamp;
      m.delete()
      msg.channel.send(`I'm back in **${ping} ms**☑️`)
    })
	}
}