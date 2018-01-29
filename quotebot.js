const config = require("./quotebot-config.js");

const Eris = require("eris");
const Entities = require("html-entities").AllHtmlEntities;
var axios = require("axios");

const entities = new Entities();
var discord = new Eris(config.discord_token);
var timer = null;
var rhymelock = 0;

function simpleRandInt(min, max) {
	return (Math.round(Math.random() * (max - min)) + min);
}

function getQuote(dest) {
	axios.get("https://discordianquotes.com/random")
	.then((response) => {
		var quote = entities.decode(response.data.match(/<div class="quote"[^>]+>([^>]+)<\/div/)[1]);
		discord.createMessage(dest, quote);
	})
	.catch((e) => {
		console.log(":err_axios " + e);
	});
}

function getRhymingQuote(dest, str) {
	console.log("Rhyming NYI. returning random instead.");
	getQuote(dest);
}

function getQuoteAndRequeue(dest) {
	let delay_next = simpleRandInt(config.rand_min_time, config.rand_max_time) * 1000;
	getQuote(dest);
	timer = setTimeout(function () { getQuoteAndRequeue(dest); } , delay_next);
}

discord.on("ready", () => {
	console.log(":quotebot online.");
	if (timer !== null) getQuoteAndRequeue(config.discord_channel);
});

discord.on("messageCreate", (msg) => {
	if (msg.channel.id === config.discord_channel && msg.author.id != discord.user.id) {
		if (msg.content.toLowerCase().indexOf(discord.user.username.toLowerCase()) !== -1) {
			if (simpleRandInt(0, 1000) >= config.response_ignore_chance) {
				if (simpleRandInt(0, 1000) < config.response_rhyme_chance) {
					getRhymingQuote(msg.channel.id, msg.content);
				} else {
					getQuote(msg.channel.id);
				}
			}
		} else if ((new Date()).getTime() > rhymelock && simpleRandInt(0, 1000) < config.rand_rhyme_chance) {
			getRhymingQuote(msg.channel.id, msg.content);
			rhymelock = (new Date()).getTime() + config.response_rhyme_timeout;
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