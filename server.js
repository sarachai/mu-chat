const path = require('path');
const express = require('express');
const app = express();

const PORT = 8081;

const server = app.listen(PORT, () => {
	console.log(`Hei Chai, your chat server is running at http://localhost:${PORT}.`);
});

const io = require('socket.io').listen(server);

app.use('/', express.static(path.join(__dirname + '/public')));
app.use('/dist', express.static(path.join(__dirname + '/dist')));

const DEFAULT_NICKS = new Array('Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard', 'Squirtle', 'Wartortle', 'Blastoise', 'Caterpie', 'Metapod', 'Butterfree', 'Weedle', 'Kakuna', 'Beedrill', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Rattata', 'Raticate', 'Spearow', 'Fearow', 'Ekans', 'Arbok', 'Pikachu', 'Raichu', 'Sandshrew', 'Sandslash', 'Nidoran', 'Nidorina', 'Nidoqueen', 'Nidoran', 'Nidorino', 'Nidoking', 'Clefairy', 'Clefable', 'Vulpix', 'Ninetales', 'Jigglypuff', 'Wigglytuff', 'Zubat', 'Golbat', 'Oddish', 'Gloom', 'Vileplume', 'Paras', 'Parasect', 'Venonat', 'Venomoth', 'Diglett', 'Dugtrio', 'Meowth', 'Persian', 'Psyduck', 'Golduck', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Abra', 'Kadabra', 'Alakazam', 'Machop', 'Machoke', 'Machamp', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tentacool', 'Tentacruel', 'Geodude', 'Graveler', 'Golem', 'Ponyta', 'Rapidash', 'Slowpoke', 'Slowbro', 'Magnemite', 'Magneton', 'Farfetchd', 'Doduo', 'Dodrio', 'Seel', 'Dewgong', 'Grimer', 'Muk', 'Shellder', 'Cloyster', 'Gastly', 'Haunter', 'Gengar', 'Onix', 'Drowzee', 'Hypno', 'Krabby', 'Kingler', 'Voltorb', 'Electrode', 'Exeggcute', 'Exeggutor', 'Cubone', 'Marowak', 'Hitmonlee', 'Hitmonchan', 'Lickitung', 'Koffing', 'Weezing', 'Rhyhorn', 'Rhydon', 'Chansey', 'Tangela', 'Kangaskhan', 'Horsea', 'Seadra', 'Goldeen', 'Seaking', 'Staryu', 'Starmie', 'Mr. Mime', 'Scyther', 'Jynx', 'Electabuzz', 'Magmar', 'Pinsir', 'Tauros', 'Magikarp', 'Gyarados', 'Lapras', 'Ditto', 'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Porygon', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl', 'Snorlax', 'Articuno', 'Zapdos', 'Moltres', 'Dratini', 'Dragonair', 'Dragonite', 'Mewtwo', 'Mew');
let usedNicks = [];
let buddylist = new Map();
let messages = new Map();

io.sockets.on('connection', function(socket) {
	
	const socketId = socket.id;

	socket.on('clientConnection', function() {
		const defaultNick = generateDefaultNick();
		buddylist.set(socketId, { socketId: socketId, nick: defaultNick, isAway: false })

		io.sockets.emit('serverConnectionResponse', {socketId: socketId, nick: defaultNick, messageHistory: Array.from(messages)});
		io.sockets.emit('serverBuddylistUpdate', Array.from(buddylist));
	});

	socket.on('disconnect', function(){ 
		const disconnectedNick = buddylist.get(socketId).nick;
		buddylist.delete(socketId);

		io.sockets.emit('serverDisconnectionResponse', {socketId: socketId, nick: disconnectedNick});
		io.sockets.emit('serverBuddylistUpdate', Array.from(buddylist));
	});

	socket.on('clientMessage', function(message) {
		messages.set(message.id, message);

		io.sockets.emit('serverMessageResponse', message);
	});

	socket.on('clientLocalMessage', function(message) {
		messages.set(message.id, message);

		socket.emit('serverMessageResponse', message);
	});

	socket.on('clientMessageCancellation', function(messageId) {
		messages.delete(messageId);
		
		io.sockets.emit('serverMessageCancellationResponse', messageId);
	});

	socket.on('clientBroadcastMessage', function(message) {
		messages.set(message.id, message);

		socket.broadcast.emit('serverMessageResponse', message);
	});

	socket.on('clientIsAway', function(socketId) {
		let buddy = buddylist.get(socketId);

		// temp, there's sometimes orphan buddies when browser windows are kept open and server restarts.
		if (buddy) {
			buddy.isAway = true;
		}

		buddylist.set(socketId, buddy);
		io.sockets.emit('serverBuddylistUpdate', Array.from(buddylist));
	});

	socket.on('clientHasReturned', function(socketId) {
		let buddy = buddylist.get(socketId);

		// temp, there's sometimes orphan buddies when browser windows are kept open and server restarts.
		if (buddy) {
			buddy.isAway = false;
		}

		buddylist.set(socketId, buddy);
		io.sockets.emit('serverBuddylistUpdate', Array.from(buddylist));
	});

	socket.on('clientNickUpdateRequest', function(buddy) {
		const newNick = buddy.nick;

		if (usedNicks.indexOf(newNick) > -1) {
			socket.emit('serverNickTaken', newNick);
			return;
		}

		const socketId = buddy.socketId;
		const oldNick = buddylist.get(socketId).nick;

		usedNicks.splice(usedNicks.indexOf(oldNick), 1);
		usedNicks.push(newNick);
		buddylist.set(socketId, buddy);

		io.sockets.emit('serverNickUpdate', {socketId: socketId, oldNick: oldNick, newNick: newNick});
		io.sockets.emit('serverBuddylistUpdate', Array.from(buddylist));
	});

});

function generateDefaultNick() {
	let defaultNick = DEFAULT_NICKS[Math.floor(Math.random() * DEFAULT_NICKS.length)];
		
	const existingNickIndex = usedNicks.indexOf(defaultNick);
	if (existingNickIndex > -1) {
		defaultNick = `${defaultNick}-${Math.floor(Math.random() * Math.floor(1000))}`; // relatively dupe-safe ¯\_(ツ)_/¯
	}

	usedNicks.push(defaultNick);

	return defaultNick;
}