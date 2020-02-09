# DotaTime
DotaTime is a discord bot that acts as a timer for your dota matches.  It keeps track of gametime based on the time passed, and announces key events such as bounty runes coming up or neutral item spawn times.

## Setup
In order to set up your bot, I suggest following this tutorial https://www.toptal.com/chatbot/how-to-make-a-discord-bot

You will need to create a file in your repo called "token-config.json"

```
{
    "prefix": "!dt",
	"token": "your bot token here"
}
```

After that your simply navigate to the folder containing "dotaTimeBot.js" and run the command "node ./dotaTimeBot.js"