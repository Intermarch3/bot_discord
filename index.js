// Initialisation
const Discord = require('discord.js'),
    client = new Discord.Client({
        fetchAllMembers: true,
        partials: ['MESSAGE', 'REACTION']
    }),
    config = require('./config.json'),
    fs = require('fs'),
    cooldown = new Set()

client.login(config.token)
client.commands = new Discord.Collection()
client.db = require('./db.json')


// toutes les ligne suivante permettent de comprendre les commandes et de executer le fichier qui correspond à la commande
fs.readdir('./commands', (err, files) => {
    if (err) throw err
    files.forEach(file => {
        if (!file.endsWith('.js')) return
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    })
})

client.on('message', message => {
    if (message.type !== 'DEFAULT' || message.author.bot) return

    if (!message.member.hasPermission('MANAGE_MESSAGES')) {
        const duration = config.cooldown[message.channel.id]
        if (duration) {
            const id = `${message.channel.id}_${message.author.id}`
            if (cooldown.has(id)) {
                message.delete()
                return message.channel.send('🚧 ANTI SPAM activé 🚧').then(sent => sent.delete({timeout: 1.5e3}))
            }
            cooldown.add(id)
            setTimeout(() => cooldown.delete(id), duration)
        }
        
    }

    const args = message.content.trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()
    if (!commandName.startsWith(config.prefix)) return
    const command = client.commands.get(commandName.slice(config.prefix.length))
    if (!command) return
    if(command.guildOnly && !message.guild) return message.channel.send('Cette commande peut être executer que dans un serveur.')
    command.run(message, args, client)
})
// fin de la compréhention global des commandes


// commande spécial

client.on('guildMemberAdd', member => {     // si un nouveau membre à rejoin
    member.guild.channels.cache.get(config.gretting.channel).send(`${member} a rejoint le serveur. Nous somme maintenant ${member.guild.memberCount} ! 🎉
    Pour accéder au reste du serveur, va lire le réglement dans le salon réglement.`)     
})

client.on('guildMemberRemove', member =>  {     // si un membre quitte le serveur
    member.guild.channels.cache.get(config.gretting.channel).send(`${member.user.tag} a quitté le serveur 😭`)     
})


// assignation de role avec une réaction
client.on('messageReactionAdd', (reaction, user) => {
    if (!reaction.message.guild || user.bot) return
    const reactionRoleElem = config.reactionRole[reaction.message.id]
    if (!reactionRoleElem) return
    const prop = reaction.emoji.id ? 'id' : 'name'
    const emoji = reactionRoleElem.emojis.find(emoji => emoji[prop] === reaction.emoji[prop])
    if (emoji) reaction.message.guild.member(user).roles.add(emoji.roles)
    else reaction.user.remove(user)
})

client.on('messageReactionRemove', (reaction, user) => {
    if (!reaction.message.guild || user.bot) return
    const reactionRoleElem = config.reactionRole[reaction.message.id]
    if (!reactionRoleElem || !reactionRoleElem.removable) return
    const prop = reaction.emoji.id ? 'id' : 'name'
    const emoji = reactionRoleElem.emojis.find(emoji => emoji[prop] === reaction.emoji[prop])
    if (emoji) reaction.message.guild.member(user).roles.remove(emoji.roles)
})

// réglage du role Mute quand création de nouveau salon
client.on('channelCreate', channel => {
    if (!channel.guild) return
    const muteRole = channel.guild.roles.cache.find(role => role.name === 'Muted')
    if (!muteRole) return
    channel.createOverwrite(muteRole, {
        SEND_MESSAGES: false,
        CONNECT: false,
        ADD_REACTIONS: false
    })
})
