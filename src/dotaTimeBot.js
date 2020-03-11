const Discord = require('discord.js');
const {prefix, token}= require('../token-config.json')
const timeEventsJson = require('./timeEvents.json');
const commandHelpJson = require('./commandHelp.json');
const client = new Discord.Client();
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const useTTS = true; //silent mode for quiter testing

var dotamatch = false;
var gametime = 0;
var interval;
var messageloop = 30;
var roshTracker = false;
var catchDelete = false;
var flagDelete = false;
var timeEvents = {};


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    console.log(client.user.id);
  })
  
  client.on('message', msg => {
    const prefixRegex = new RegExp(`^(<@!?&?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(msg.content)) return;

    const channel = msg.channel;
    const [, matchedPrefix] = msg.content.match(prefixRegex);
    const args = msg.content.slice(matchedPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    //prefix command args[0] args[1] ... args[n]

    try
    {
      switch (command)
      {
        case 'ping':
          channel.send('Pong!');
          break;

        case 'prefix':
          msg.reply(`you can either ping me or use \`${prefix}\` as my prefix.`);
          break;

        case '?':
        case 'help':
        case 'readme':
          msg.author.send(getCommandHelp());
          break;

        case 'start':
          startMatch(channel, args[0]);
          break;

        case 'stop':
        case 'quit':
          stopMatch(channel);
          break;

        case 'aegis':
        case 'rosh':
        case 'roshan':
          startRoshanTimer(channel);
          break;
        
        case 'time':
          channel.send("gametime is " + getGameTimeReadableFromSeconds(gametime));
          break;
        
        case 'set':
          if (args[0] === 'time')
          {
            setMatchTime(channel, args[1]);
          } 
      }
    }    
    catch (err)  
    {
      console.log(err);
      channel.send("Command was unsuccessful.");
    }
  })

  function startMatch(channel, timeStr)
  {
    timeEvents = buildTimeDictionary(timeEventsJson);
    //Parse the time
    var timeInt = parseInt(timeStr);

    if (isNaN(timeInt))
    {
        timeInt = 0;
    }

    channel.send("Dota match initiated with time "+ timeInt.toString() +"s", {tts: false});
    
    dotamatch = true;
    gametime=timeInt;
    interval = setInterval(function()
    {
      evaluateGameState(channel);
    }, 1 * 999);
    flagDelete = true;
  }

  function stopMatch(channel)
  {
    timeEvents = {};
      roshTracker = false;
      if (dotamatch)
      {
        clearInterval(interval);
        channel.send("Dotamatch stopped",{tts: false});
        dotamatch = false;
      }
      else
      {
        channel.send("Error - No match in progress");
      }
      flagDelete = true;
  }

    //!dt set time 130
    //!dt set time 7:42
    //!dt command args[0] args[1]
  function setMatchTime(channel, timeStr) //args[1] should be the timeStr
  {      
      if (timeStr.includes(":"))
      {
        timeInt = getSecondsFromGametime(timeStr);
      }
      else
      {
        var timeInt = parseInt(timeStr);
      }

      if (isNaN(timeInt))
      {
        throw "Invalid Time Argument Passed to set time: " + timeStr
      }

      gametime=timeInt;
      if(dotamatch)
      {
        channel.send("Setting clock to " + timeInt.toString() +"s");
      }
      else
      {
        channel.send("Error - No match in progress");
      }
      flagDelete = true;
  }

  function startRoshanTimer(channel)
  {
    if (roshTracker == false)
      {
        addRoshTimeEvents(gametime);
        roshTracker = true
        setTimeout(
          function() {
            console.log("setting rosh track to false");
            roshTracker = false;
          }, 480 * 1000
        );
        channel.send("Rosh taken at " + getGameTimeReadableFromSeconds(gametime));
      }
      else
      {
        channel.send("Rosh has not respawned yet.");
      }
  }
  
  
  function evaluateGameState(channel){
    messageloop++;
    if (messageloop>=30)
    {
      messageloop = 0;
    }
    if (gametime % 300 == 270)
    {
      channel.send("30 seconds to bounties", {tts: (useTTS && true)});
    }
    if (gametime % 600 == 540)
    {
      channel.send("60 seconds to outpost XP", {tts: (useTTS && true)});
    }
    if (timeEvents[gametime] != null)
    {
      channel.send(timeEvents[gametime], {tts: (useTTS && true)});
    }
    
    gametime++;
    return;
  }

  function getGameTimeReadableFromSeconds(seconds)
  {
      timeMinutes = Math.floor(Math.abs(seconds) / 60);
      timeSeconds = Math.abs(seconds) % 60;

      if (timeSeconds < 10)
      {
        return `${timeMinutes}:0${timeSeconds}`;
      }
      return `${timeMinutes}:${timeSeconds}`;
  }

  function getSecondsFromGametime(timeStr)
  {
    timeStr = timeStr.trim();
    if (timeStr.includes(":"))
    {
       var colonIndex = timeStr.indexOf(":");
       var timeMinutesStr = (timeStr.substring(0, colonIndex)).trim();
       var timeSecondsStr = (timeStr.substring(colonIndex + 1, colonIndex + 3)).trim();
       timeMinutes = parseInt(timeMinutesStr);
       timeSeconds = parseInt(timeSecondsStr);
    }

    var seconds = (timeMinutes * 60) + timeSeconds
    return seconds;
  }

  function buildTimeDictionary(timeEventsJson)
  {
    var timeEventDictionary = {};

    for (var i = 0; i < timeEventsJson.timeEvents.length; i++) {
      timeEventMessage = timeEventsJson.timeEvents[i].message;
      timeEventDictionary[parseInt(timeEventsJson.timeEvents[i].time)] = timeEventMessage;
    }

    return timeEventDictionary;
  }

  function addTimeEvent(time, message)
  {
    if (timeEvents[time] == null)
    {
      timeEvents[time] = message;
    }
    else
    {
      timeEvents[time] = timeEvents[time] + `, ${message}`;
    }
  }

  function addRoshTimeEvents(roshTakenTime)
  {
    addTimeEvent(roshTakenTime + 270, "Aegis expiring in 30 seconds");
    addTimeEvent(roshTakenTime + 300, "Aegis expiring");
    addTimeEvent(roshTakenTime + 450, "30 until Rosh could spawn");
    addTimeEvent(roshTakenTime + 480, "Rosh could spawn");
  }

  function getCommandHelp()
  {
    var listOfCommands = ""
    for(var i = 0; i < commandHelpJson.commands.length; i++)
    {
        listOfCommands = listOfCommands + "Command: " + commandHelpJson.commands[i].command + "\n";
        listOfCommands = listOfCommands + "Description: " + commandHelpJson.commands[i].description + "\n";
        listOfCommands = listOfCommands + "Example Usage: " + commandHelpJson.commands[i].example + "\n\n";
    }

    return listOfCommands;
  }

client.login(token);