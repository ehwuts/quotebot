const config = require("./quotebot-config.js");

const download = require('download');
const Eris = require("eris");

var discord = new Eris(config.discord_token);
var timer;

function getQuote(dest) {
	
}

function getQuoteAndRequeue(dest) {
	var delay_next = Math.round(Math.random() * (config.rand_max_time - config.rand_min_time)) + config.rand_min_time;
	getQuote(dest);
	timer = setTimeout(getQuoteAndRequeue, delay_next);
}


discord.on("ready", () => {
	console.log(":quotebot online.");
	getQuoteAndRequeue(config.discord_channel);
});

discord.on("messageCreate", (msg) => {
	if (msg.channel.id === config.discord_channel && msg.author.id != discord.user.id) {
		if (msg.content.toLowerCase() === "!quote") {
			getQuote(msg.channel.id);
		}
	}
});

discord.connect();

discord.on("error", (e) => { 
	console.log(":err " + e.message); 
});

discord.on("disconnect", () => {
	timer.unref(); 
});