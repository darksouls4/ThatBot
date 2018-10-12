const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const Discord = require('discord.js');
const config = require("./config.json");
const db = require('quick.db');
const cooldown = require("./cooldown.js");

const client = new Discord.Client();
client.prefix = config.prefix;

client.on("ready", () => {
  console.log("Bot iniciado!\n\nUsers: " + client.users.size + "\nServidores: " + client.guilds.size);
  client.user.setActivity(`${client.users.size} users`, {type: "Watching"});
});

client.on("message", async message => {
  let msg = message.content.toLowerCase();
  if (message.author.bot) return undefined;
  let user = message.author;
  
  let xp = await db.fetch(`xp_${user.id}`);
  if (xp === null) xp = 0;
  
  if (!cooldown.is(user.id)) {
    cooldown.add(user.id);
    var add = Math.floor(Math.random() * 15) + 10;
    db.add(`xp_${user.id}`, add);
    setTimeout(() => {
      cooldown.remove(user.id);
    }, 1000 * 60);
  }
  

  if (message.content.indexOf(client.prefix) !== 0) return;
  const args = message.content.slice(client.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  try {
    let commands = require(`./commands/${command}.js`);
    commands.run(client, message, args);
  } catch (e) {
    console.log(e);
  } finally {}

});

client.on("guildMemberAdd", async member => {
  client.channels.get('471615619016425503').send(`New member: **${member.user.username}** (${member.guild.name})`);
});

client.on("guildMemberRemove", async member => {
  client.channels.get('471615619016425503').send(`Bye member: **${member.user.username}** (${member.guild.name})`);
});

client.on("guildCreate", async guild => {
  client.channels.get('471615619016425503').send(`New server: **${guild.name}** (Owner: ${guild.owner.user.username})(Members: ${guild.memberCount})`);
});

client.on("guildDelete", async guild => {
  client.channels.get('471615619016425503').send(`Bye server: **${guild.name}**`);
});

client.login(process.env.TOKEN);
