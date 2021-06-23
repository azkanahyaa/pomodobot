let prefix = process.env.PREFIX

module.exports = {
	name: 'ping',
	description: 'Menampilkan Kecepatan Respon bot.',
	usage: [ `${prefix} ping` ],
  execute(msg, args) {
		msg.channel.send('Checking🔄').then(m => {
      const ping = m.createdTimestamp - msg.createdTimestamp;
      m.delete()
      msg.channel.send(`Aru balik secepat **${ping} ms** nih<:aru_Woaah:766703813427593216>`)
    })
	}
}