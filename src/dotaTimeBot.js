const Discord = require('discord.js');
const {prefix, token}= require('../token-config.json')
const timeEventsJson = require('./timeEvents.json');
const commandHelpJson = require('./commandHelp.json');
const client = new Discord.Client();

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
  })
  
  client.on('message', msg => {
    if (msg.content.startsWith(`${prefix} exit`))
    {
      throw '';
    }
    if(catchDelete)
    {
      catchDelete = false;
      flagDelete = true;
    }
    if (msg.tts == true)
    {
      flagDelete = true;
    }
    //Ping Pong
    if (msg.content === `${prefix} ping`)
    {
      msg.channel.send("Pong");
    }

    if (msg.content.startsWith(`${prefix} help`) || msg.content.startsWith(`${prefix} ?`))
    {
      msg.author.send(getCommandHelp());
    }
    
    // Murph plays 3 heroes
    else if (((msg.content.search(/murph/i) > -1) || (msg.content.search(/supermurph/i) > -1)) && (msg.content.search(/pick/i) > -1))
    {
      msg.channel.send("Sniper, Viper, or Axe",{tts: true});
      flagDelete = true;
    }
    
    // Murph lags
    else if (((msg.content.search(/throw/i) > -1) || (msg.content.search(/die/i) > -1) || (msg.content.search(/feed/i) > -1)) && (msg.content.search(/murph/i) > -1))
    {
      msg.channel.send("Lag",{tts: true});
    }
    
    //Start a dota match
    else if (msg.content.startsWith(`${prefix} start`))
    {
      timeEvents = buildTimeDictionary(timeEventsJson);
      //Parse the time
      var timeInd = msg.content.search(/start/i);
      var timeStr = msg.content.substring(timeInd + 6);
      var timeInt = parseInt(timeStr);

      if (isNaN(timeInt))
      {
          timeInt = 0;
      }

      msg.channel.send("Dota match initiated with time "+ timeInt.toString() +"s", {tts: false});
      
      dotamatch = true;
      gametime=timeInt;
      interval = setInterval(function()
      {
        evaluateGameState(msg.channel);
      }, 1 * 999);
      flagDelete = true;
    }
    // Stop DotaMatch
    else if ( msg.content.startsWith(`${prefix} stop`))
    {
      timeEvents = {};
      roshTracker = false;
      if (dotamatch)
      {
        clearInterval(interval);
        msg.channel.send("Dotamatch stopped",{tts: false});
        dotamatch = false;
      }
      else
      {
        msg.channel.send("Error - No match in progress");
        console.log("path 2");
      }
      flagDelete = true;
    }
    // Set the time during a DotaMatch
    else if (msg.content.startsWith(`${prefix} set time`))
    {
      var timeStr = msg.content.substring(msg.content.search(/set time/i) + 8);
      
      if (timeStr.includes(":"))
      {
        timeInt = getSecondsFromGametime(timeStr);
      }
      else
      {
        var timeInt = parseInt(timeStr);
      }

      gametime=timeInt;
      if(dotamatch)
      {
        msg.channel.send("Setting clock to " + timeInt.toString() +"s");
      }
      else
      {
        msg.channel.send("Error - No match in progress");
        console.log("path 1");
      }
      flagDelete = true;
    }
    //start rosh trackers
    else if (msg.content.startsWith(`${prefix} rosh`))
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
        msg.channel.send("Rosh taken at " + getGameTimeReadableFromSeconds(gametime));
      }
      else
      {
        msg.channel.send("Rosh has not respawned yet.");
      }
    }
    else if (msg.content.startsWith(`${prefix} time`))
    {
      msg.channel.send("gametime is " + getGameTimeReadableFromSeconds(gametime));
    }
    if (flagDelete == true)
    {
      flagDelete = false;
      msg.delete(5000);
    }
  })
  
  function evaluateGameState(channel){
    messageloop++;
    if (messageloop>=30)
    {
      messageloop = 0;
    }
    if (gametime % 300 == 270)
    {
      channel.send("30 seconds to bounties", {tts: true});
    }
    if (gametime % 600 == 540)
    {
      channel.send("60 seconds to outpost XP", {tts: true});
    }
    if (timeEvents[gametime] != null)
    {
      channel.send(timeEvents[gametime], {tts: true});
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