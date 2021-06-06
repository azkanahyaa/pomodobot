const fs = require('fs')
const onlineBot = require("./server")
const Discord = require('discord.js')
const { awaitReminderMessage, reminderInterval } = require('./js/await/reminder')
const { todoInterval } = require('./js/await/todo')

const client = new Discord.Client()
client.commands = new Discord.Collection()
client.isProcessOn = new Discord.Collection()

let prefix = ',p'


const commandFiles = fs.readdirSync('./js/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./js/commands/${file}`)
	client.commands.set(command.name, command)
}

client.on('ready', () => {
  console.log('Login success')
  client.user.setActivity(`Azka Mengoding`, { type: 'WATCHING' })
	reminderInterval(client)
	todoInterval(client)
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

  console.log(client.commands) 

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) return
  
  if (command.args && !args.length) {
    return msg.channel.send('')
  }

  command.execute(msg, args)


})

onlineBot()
client.login(process.env.TOKEN2)