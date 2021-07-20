const Discord = require('discord.js')       // importe l'API Discord

module.exports = {
    run: message => {       // envoie le message suivant ( un embed dans notre cas )
        message.channel.send(new Discord.MessageEmbed()
            .setTitle('Mon titre')      //définit le titre
            .setDescription('La description de mon embed')      // définit la description
            .setColor('RANDOM')     // définit la couleur de l'embed ( sur le bord ), remplace random par la couleur de ton choix ( en HEX )
            )
    },
    name: 'embed'       // nom de la commande
}

// pour plus d'option sur les embed : https://www.youtube.com/watch?v=PrRd4fqc_uc ou sur le doc de Discord : https://discord.js.org/#/docs/main/stable/class/MessageEmbed