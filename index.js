const fs = require('fs')
const onlineBot = require("./server")
const Discord = require('discord.js')
const { awaitReminderMessage, reminderInterval } = require('./js/await/reminder')
const { todoInterval } = require('./js/await/todo')
const { alarmInterval } = require('./js/await/alarm')
const { getPomodDB } = require('./js/db')

const client = new Discord.Client()
client.commands = new Discord.Collection()
client.isProcessOn = new Discord.Collection()
client.pomodoro = new Discord.Collection()
client.alarm = new Discord.Collection()

let prefix = process.env.PREFIX

const commandFiles = fs.readdirSync('./js/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./js/commands/${file}`)
	client.commands.set(command.name, command)
}

client.on('ready', () => {
  console.log('Login success')
  client.user.setActivity(`discord.gg/ruangbelajar`, { type: 'WATCHING' })
	reminderInterval(client)
	todoInterval(client)
	alarmInterval(client)
})

client.on('voiceStateUpdate', async (oldState, newState) => {
	const guildSettings = await getPomodDB(newState.guild.id)
	const { id, settings } = guildSettings

	if (!guildSettings) return
	if (newState.channelID === id) {		
		const option = {
			type: 'voice',
			parent: newState.channel.parent,
			position: newState.channel.parent.children.length + 1,
		}
		const channel = await newState.guild.channels.create(`🟡 Pomodoro #${Array.from(client.pomodoro).length + 1}`, option)

		newState.setChannel(channel)
		client.pomodoro.set(channel.id, { host: newState.member, settings: settings, channel: channel })
	}
	
	const channel = client.pomodoro.get(oldState.channelID)
	if (!channel) return
	if (Array.from(oldState.channel.members).length < 1) {
		oldState.channel.delete().then(() => {
			if (channel.interval) {
				clearInterval(channel.interval)
				msg.channel.send('Channel dihapus, pomodoro dihentikan')
			}
			client.pomodoro.delete(oldState.channelID)
		})
	}
})

client.on('message', msg => {

	if (msg.author.bot) return

	let isProcessOn = client.isProcessOn.get(msg.author.id)
  const content = msg.content
	awaitReminderMessage(msg, msg.guild.id)

	if (!isProcessOn) isProcessOn = false

  if (!content.toLowerCase().startsWith(prefix)) return

  const args = content.slice(prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()


  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) return
  
  if (command.args && !args.length) {
    return msg.channel.send('')
  }

  command.execute(msg, args)


})

onlineBot()
client.login(process.env.TOKEN)