const fs = require('fs')
const onlineBot = require("./server")
const Discord = require('discord.js')
const { awaitReminderMessage, startInterval } = require('./js/await/reminder.js')

const client = new Discord.Client()
client.commands = new Discord.Collection()

let prefix = ',p'


const commandFiles = fs.readdirSync('./js/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./js/commands/${file}`)
	client.commands.set(command.name, command)
}

client.on('ready', () => {
  console.log('Login success')
  client.user.setActivity(`Azka Mengoding`, { type: 'WATCHING' })
	startInterval(client)
})

client.on('message', msg => {

	if (msg.author.bot) return

  const content = msg.content
	awaitReminderMessage(msg, msg.guild.id)

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