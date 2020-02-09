var Discord = require('discord.io');

const config = require('../token-config.json');

console.log(config.token);

var bot = new Discord.Client({
    token: "Njc1OTI5MjMyNTY3OTU5NTcy.Xj-SXg.svILdOO8K3aUhDQNbCBnCKWGPOk",
    autorun: true
});

bot.on('ready', function() {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

bot.on('message', function(user, userID, channelID, message, event) {
    if (message === "ping") {
        bot.sendMessage({
            to: channelID,
            message: "pong"
        });
    }
});