const config = require("./quotebot-config.js");

const Eris = require("eris");
var axios = require("axios");

var discord = new Eris(config.discord_token);
var timer;

function getQuote(dest) {
	axios.get("https://discordianquotes.com/random")
	.then((response) => {
		var quote = response.data.match(/<div class="quote"[^>]+>([^>]+)<\/div/)[1];
		discord.createMessage(dest, quote);
	})
	.catch((e) => {
		console.log(":err_axios " + e);
	});
}

function getQuoteAndRequeue(dest) {
	var delay_next = (Math.round(Math.random() * (config.rand_max_time - config.rand_min_time)) + config.rand_min_time) * 1000;
	getQuote(dest);
	timer = setTimeout(function () { getQuoteAndRequeue(dest); } , delay_next);
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