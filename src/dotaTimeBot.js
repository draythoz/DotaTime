const Discord = require('discord.js');
const {prefix, token}= require('../token-config.json')
const client = new Discord.Client();

var dotamatch = false;
var gametime = 0;
var interval;
var messageloop = 30;
var roshTracker = false;
var roshTime = 0;
var catchDelete = false;
var flagDelete = false;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
  })
  
  client.on('message', msg => {
    if (msg.content.search(/dm exit/i) > -1)
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
      //Parse the time
      var timeInd = msg.content.search(/start/i);
      var timeStr = msg.content.substring(timeInd + 6);
      var timeInt = parseInt(timeStr);

      if (isNaN(timeInt))
      {
          timeInt = 0;
      }

      msg.channel.send("Dota match initiated with time "+timeInt.toString() +"s", {tts: false});
      
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
      var timeStr = msg.content.substring(msg.content.search(/time set/i) + 8);
      
      if (timeStr.includes(":"))
      {
        console.log("timeStr includes :")
        timeInt = getSecondsFromGametime(timeStr);
      }
      var timeInt = parseInt(timeStr);
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
    else if (msg.content.startsWith(`${prefix} rosh`))
    {
      roshTracker = true;
      roshTime = gametime;
      msg.channel.send("Rosh taken at " + getGameTimeReadable(roshTime));
    }
    else if (msg.content.startsWith(`${prefix} time`))
    {
      msg.channel.send("gametime is " + getGameTimeReadable(gametime));
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
    if (gametime == 420)
    {
      channel.send("Tier 1 Items", {tts: true});
    }
    if (gametime == 900)
    {
      channel.send("Tier 2 Items", {tts: true});
    }
    if (gametime == 1500)
    {
      channel.send("Tier 3 Items", {tts: true});
    }
    if (gametime == 2400)
    {
      channel.send("Tier 4 Items", {tts: true});
    }
    if (gametime == 3600)
    {
      channel.send("Tier 5 Items", {tts: true});
    }
    if (roshTracker)
    {
    //   if (gametime - roshTime == 230)  //gametime - roshtime == 270   ???
    //   {
    //     channel.send("aegis expiring in 30 seconds", {tts: true});
    //   }
      if (gametime - roshTime == 270)
      {
        channel.send("aegis expiring in 30 seconds", {tts: true});
      }
      if (gametime - roshTime == 300)
      {
        channel.send("aegis expiring", {tts: true});
      }
      if (gametime - roshTime == 450)
      {
        channel.send("30 til Rosh Could Spawn", {tts: true});
      }
      if (gametime - roshTime == 480)
      {
        channel.send("Rosh Could Spawn", {tts: true});
        roshTracker = false;
      }
    }
    gametime++;
    return;
  }

  function getGameTimeReadableFromSeconds(seconds)
  {
      timeMinutes = Math.floor(Math.abs(seconds) / 60);
      timeSeconds = Math.abs(seconds) % 60;

      return `${timeMinutes}:${timeSeconds}`;
  }

  function getSecondsFromGametime(timeStr)
  {
      console.log(`getSecondsFromGametime passed timeStr = ${timeStr}`)
    if (timeStr.includes(":"))
    {
       var colonIndex = timeStr.indexOf(":");
       var timeMinutesStr = (timeStr.substring(0, timeStr.length - colonIndex)).trim();
       var timeSecondsStr = (timeStr.substring(colonIndex + 1, colonIndex + 3)).trim();
        console.log(`timeMinutesStr = ${timeMinutesStr}`);
        console.log(`timeSecondsStr = ${timeSecondsStr}`);
       timeMinutes = parseInt(timeMinutesStr);
       timeSeconds = parseInt(timeSecondsStr);
       console.log(`timeMinutes = ${timeMinutes}`);
       console.log(`timeSeconds = ${timeSeconds}`);
    }

    var seconds = (timeMinutes * 60) + timeSeconds
    return seconds;
  }

//   function getSecondsFromGametime(timeMinutes, timeSeconds)
//   {
//     var seconds = (timeMinutes * 60) + timeSeconds
//     return seconds;
//   }
  
client.login(token);