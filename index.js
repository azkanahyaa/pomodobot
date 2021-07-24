const fs = require('fs')
const onlineBot = require("./server")
const Discord = require('discord.js')
const { awaitReminderMessage, checkReminder } = require('./js/await/reminder')
const { todoInterval } = require('./js/await/todo')
const { backupPmd } = require('./js/await/pomodoro')
const { getPomodDB, updatePomodDB } = require('./js/db')

const client = new Discord.Client()
client.commands = new Discord.Collection()
client.processOn = new Discord.Collection()
client.pomodoro = new Discord.Collection()
client.inVoice = new Discord.Collection()

let prefix = process.env.PREFIX

const commandFiles = fs.readdirSync('./js/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./js/commands/${file}`)
	client.commands.set(command.name, command)
}

client.on('ready', () => {
  console.log('Login success')
  client.user.setActivity(`discord.gg/ruangbelajar`, { type: 'WATCHING' })
	checkReminder(client)
	todoInterval(client)
	backupPmd(client)
})

client.on('voiceStateUpdate', async (oldState, newState) => {
	const pomodData = await getPomodDB(newState.guild.id)
	const { initialChnl, settings, pomodoro } = pomodData

	if (!pomodData) return
	if (newState.channelID === initialChnl) {		
		const option = {
			type: 'voice',
			parent: newState.channel.parent,
			position: newState.channel.parent.children.length + 1,
			bitrate: 16000
		}
		const channel = await newState.guild.channels.create(`🟡 Pomodoro #${pomodoro.length + 1}`, option)

		newState.setChannel(channel)
		pomodData.pomodoro.push({ 
			host: newState.id, 
			channel: channel.id, 
			settings, 
			embed: null, 
			end: null
		})

		client.pomodoro.set(channel.id, { host: newState.member.user, settings: settings, channel: channel })
		updatePomodDB(newState.guild.id, pomodData)
	}
	
	const config = client.pomodoro.get(oldState.channelID)

	if (!config) return
	const { channel } = config
	const newSettings = config.settings

	if (oldState.selfMute !== newState.selfMute && newSettings.silent === 2) {
		if (newState === true) {
			newState.member.send('Hallo, yang lain sedang fokus di ' + channel.name + ' nih. Jangan sampai mengganggu yang lain ya <:aru_mau_itu:790277212275867698>')
		}
	} else if (Array.from(oldState.channel.members).length < 1) {
		oldState.channel.delete().then(() => {
			client.pomodoro.delete(oldState.channelID)
			pomodData.pomodoro = pomodoro.filter(p => p.channel !== oldState.channelID)
			updatePomodDB(oldState.guild.id, pomodData)
		})
	}
})

client.on('message', msg => {

	if (msg.author.bot) return

	let isProcessOn = client.processOn.get(msg.author.id)
  const content = msg.content
	if (msg.guild) awaitReminderMessage(msg, msg.guild.id)

	if (!isProcessOn) isProcessOn = []

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