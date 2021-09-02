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
client.reminder = new Discord.Collection()

const { prefix, token } = require('./config.js')

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
		let option = {
			type: 'voice',
			parent: newState.channel.parent,
			position: newState.channel.parent.children.length + 1,
			bitrate: 16000
		}
		if (settings.silent === 3) option.permissionOverwrites = [
			{
				id: msg.guild.roles.everyone.id,
				deny: ['SPEAK']
			}
		]
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

console.log(newSettings.silent, oldState.selfMute, newState.selfMute)
	if (oldState.selfMute !== newState.selfMute && newSettings.silent === 2) {
		if (oldState.selfMute === true && channel.name.startsWith('🔴 Fokus') ) {
			config.embed.channel.send('Hallo <@' + newState.member +'>, yang lain sedang fokus di <#' + channel.id + '> nih. Jangan sampai mengganggu yang lain ya <:aru_mau_itu:790277212275867698>').then(m => {
				setTimeout(() => {
					m.delete()
				}, 60000)
			})
		}
	} 
	
	if (Array.from(oldState.channel.members).length < 1) {
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
client.login(token)