const tmi = require('tmi.js');
const fs  = require("fs");
const {resolve} = require("path");
const rp = require('request-promise');
const uwufy = require('uwufy');

const commandList = [
    "onlyfans", "of",
    "bonk","lewd","horny",
    "stats", "leaderbonk", "leaderboard",
    "gn",
    "jptime", "japantime",
    "uid", "genshin",
    "lurk",
    "voice",
    "boost",
    "rollitem",
    "bonkyplay", "play",
    "islilypartneredyet",
    "mods",
    "raid", "host",
    //"bingo", "bingos,"
    "uwufy"
];

const itemsPhasmo = [
    "Spirit Box", "Ghost Book", "Photo Camera", "EMF Reader", "Video Camera", "UV Flashlight", "Flashlight", "Candle", "Crucifix", "Glow Stick", "Head Mounted Camera", "Infrared Light Sensor", "Lighter", "Motion Sensor", "Parabolic Microphone", "Salt", "Sanity Pills", "Smudge Sticks", "Sound Sensor", "Strong Flashlight", "Thermometer", "Tripod"
];

// Define configuration options
const opts = {
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: "bonky_bot",
        password: process.env['twitch_chat_key']
    },
    channels: [
        "tomjschwanke"
    ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (channel, user, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    if(msg.substring(0,1) != '!') {
        return;              // Only react to correct prefix
    }

    // Remove whitespace from chat message
    const args = msg.toLowerCase().slice(1).split(' ');
    const command = args.shift().toLowerCase();

    if(!commandList.includes(command)) {
        return;
    }

    if(!isCooledDown(channel.replace('#', ''), user.username, 60) && !isAuthorized(channel, user) && command != 'boost' && command != 'bingo') {
        return;
    }
    saveCooldown(channel.replace('#', ''), user.username);

    switch(command) {
        case 'onlyfans':
        case 'of':
            addBonk(user.username, channel.replace('#',''));
            client.say(channel, `You are horny! Bonk for you @${user.username} BOP`); // ; @${username} has been bonked ${getBonks(user.username, channel.replace('#',''))} times`);
            break;
        case 'boost':
            addBonk(user.username, channel.replace('#',''));
            client.say(channel, `Bonk for @${user.username} BOP`); // ; @${user.username} has been bonked ${getBonks(user.username, channel.replace('#',''))} times`);
            break;
        case 'bonk':
        case 'lewd':
        case 'horny':
            switch(args[0]) {
                case 'me':
                    addBonk(user.username, channel.replace('#',''));
                    console.log(getBonks(user.username, channel.replace('#','')));
                    client.say(channel, `Bonk for @${user.username} BOP`); // ; @${user.username} has been bonked ${getBonks(user.username, channel.replace('#',''))} times`);
                    break;
                case 'chat':
                case 'everyone':
                case 'everybody':
                case 'everyshrimp':
                    if(isAuthorized(channel, user)) {
                        client.say(channel, `Bonking everyone in chat BOP BOP BOP`);
                        bonkEveryone(channel);
                    }else {
                        client.say(channel, `Only Mods can bonk all of chat at once`);
                    }
                    break;
                case 'bonky_bot':
                case '@bonky_bot':
                    addBonk(user.username, channel.replace('#',''));
                    client.say(channel, `Can't bonk myself, bonk for @${user.username} instead BOP`); // ; @${user.username} has been bonked ${getBonks(user.username, channel.replace('#',''))} times`);
                    break;
                case 'random':
                case 'someone':
                case 'someshrimp':
                    getRandomChatter(channel)
                        .then(chatter => {
                            addBonk(chatter.name, channel.replace('#',''));
                            client.say(channel, `Random bonk for @${chatter} BOP`); // ; @${chatter} has been bonked ${getBonks(chatter, channel.replace('#',''))} times`);
                        })
                    break;
                default:
                    if(!args[0] == '') {
                        verifyChatter(channel, args[0].replace('@',''))
                            .then(result => {
                                if(result) {
                                    addBonk(args[0].replace('@', ''), channel.replace('#',''));
                                    client.say(channel, `Bonk for @${args[0].replace('@','')} BOP`); // ; @${args[0].replace('@','')} has been bonked ${getBonks(args[0].replace('@',''), channel.replace('#',''))} times`);
                                }else {
                                    client.say(channel, `The specified user is not in chat and can't be bonked`);
                                }
                            })
                    }else {
                        client.say(channel, `BOP BOP BOP`);
                    }
                    break;
            }
            break;
        case 'stats':
            switch(args[0]) {
                case '':
                case undefined:
                    bonkLeader(channel.replace('#',''));
                    break;
                case 'me':
                    bonkStats(user.username, channel.replace('#',''));
                    break;
                case 'bonky_bot':
                case '@bonky_bot':
                    client.say(channel, `I don't have any bonks, bonk for @${user.username} instead BOP`);
                    addBonk(user.username, channel.replace('#',''));
                    break;
                default:
                    bonkStats(args[0].replace('@', ''), channel.replace('#',''));
                    break;
            }
            break;
        case 'leaderbonk':
        case 'leaderboard':
            bonkLeader(channel.replace('#',''));
            break;
        case 'gn':
            client.say(channel, `Goodnight everyshrimp, have some nice dreams!`);
            break;
        case 'jptime':
        case 'japantime':
            japantime(channel);
            break;
        case 'uid':
        case 'genshin':
            client.say(channel, `Lilys Genshin UID: 704503344 (EU)`);
            break;
        case 'lurk':
            // client.say(channel, `The lurk command is not implemented yet, pls bother @Shylily about it Kappa`);
            client.say(channel, `@${user.username} has descended into the depths of the oceans. Even though you may not see some shrimps, they are still there shrimpPat`);
            break;
        case 'voice':
            client.say(channel, `Yes, that's her real voice. Lily is not using a voice changer :)`);
            break;
        case 'rollitem':
            if(isAuthorized(channel, user)) {
                client.say(channel, `Random item: ${randomFromArray(itemsPhasmo)}`);
            }
            break;
        case 'play':
        case 'bonkyplay':
            if(user.username == 'tomjschwanke') {
                client.say(channel, `!play`);
            }
            break;
        case 'islilypartneredyet':
            requestPartnerStatus(channel)
                .then(data => {
                    client.say(channel, data.partner ? `Unfortunately not (yet) :(` : `YES, FINALLY PogChamp`)
                })
            break;
        case 'mods':
            if(isModOnline(channel, 'bonky_bot')) {
                client.say(channel, `Phasmo mods made by @xbloodyslicer, they can be found in Discord: https://discord.gg/9Vw3kPJ`);
            }else {
                client.say(channel, `Phasmo mods made by @xbloodyslicer, they can be found in Discord`);
                client.say(channel, `!discord`);
            }
            break;
        case 'bingo':
            switch(args[0]) {
                case "Phasmo":
                case "phasmo":
                case "Phasmophobia":
                case "phasmophobia":
                    client.say(channel, `Phasmo bingo: https://tomjschwanke.de/short/lilyphasmobingo/`);
                    break;
                case "Marbles":
                case "marbles":
                case "Marble":
                case "marble":
                    client.say(channel, `Marble bingo: https://tomjschwanke.de/short/marblebingo/`);
                    break;
                default:
                    client.say(channel, `Usage: !bingo [game] Available bingos: Phasmo, Marbles`);
                    break;
            }
            break;
        case 'bingos':
            client.say(channel, `Usage: !bingo [game] Available bingos: Phasmo, Marbles`);
            break;
        case 'raid':
            client.say(channel, `Lily Raid shylilPat Lily Raid shylilPat Lily Raid shylilPat Lily Raid shylilPat Lily Raid shylilPat Lily Raid shylilPat Lily Raid shylilPat Lily Raid shylilPat Lily Raid shylilPat Lily Raid shylilPat`);
            break;
        case `host`:
            client.say(channel, `We are in host mode, you will need to switch to the hosted channel to participate in chat :)`)
            break;
        case 'uwufy':
            client.say(channel, uwufy(msg.substr(7)));
            break;
    }
}

function requestPartnerStatus(channel, _attempts) {
    return rp({
        uri: `https://islilypartneredyet.xyz/raw`,
        json: true
    })
        .then(data =>  {
            return data;
        })
        .catch(err => {
            if(_attempts < 3) {
                return requestPartnerStatus(channel, _attempts);
            }
            client.say(channel, `bonky_bot out, there was an error`);
            throw err;
        })
}

function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function isCooledDown(channel, username, seconds) {
    var jsonString = "";
    try {
        jsonString = fs.readFileSync(resolve(__dirname, 'bonks.json'), "utf8");
    } catch {
        console.log("Error reading bonks.json", err);
        return false;
    }
    try {
        var json = JSON.parse(jsonString);
        var lastAction = 0;
        if(!json.hasOwnProperty('channels')) {
            json.channels = {};
        }
        if(!json.channels.hasOwnProperty(channel)) {
            json.channels[channel] = {};
        }
        if(!json.channels[channel].hasOwnProperty('users')) {
            json.channels[channel].users = {};
        }
        if(!json.channels[channel].users.hasOwnProperty(username)) {
            json.channels[channel].users[username] = {};
        }
        if(!json.channels[channel].users[username].hasOwnProperty('lastAction')) {
            json.channels[channel].users[username].lastAction = 0;
        }
        if(json.channels[channel].users[username].hasOwnProperty('lastAction')) {
            try  {
                lastAction = json.channels[channel].users[username].lastAction;
            }catch {
            }
        }
        fs.writeFileSync(resolve(__dirname, 'bonks.json'), JSON.stringify( json ), "utf8");
        return (Date.now() - lastAction > (seconds * 1000));
    }catch(err) {
        console.log("Error reading bonks.json", err);
        return false;
    }
}

function saveCooldown(channel, username) {
    if(username != '') {
        try {
            var jsonString = fs.readFileSync(resolve(__dirname, 'bonks.json'), "utf8");

            try {
                var json = JSON.parse(jsonString);
                if(!json.hasOwnProperty('channels')) {
                    json.channels = {};
                }
                if(!json.channels.hasOwnProperty(channel)) {
                    json.channels[channel] = {};
                }
                if(!json.channels[channel].hasOwnProperty('users')) {
                    json.channels[channel].users = {};
                }
                if(!json.channels[channel].users.hasOwnProperty(username)) {
                    json.channels[channel].users[username] = {};
                }
                json.channels[channel].users[username].lastAction = Date.now();

                try {
                    fs.writeFileSync(resolve(__dirname, 'bonks.json'), JSON.stringify( json ), "utf8");
                }catch(err) {
                    console.log("Error saving cooldown", err);
                }
            } catch(err) {
                console.log("JSON error", err);
            }
        }catch(err) {
            console.log("error reading cooldown", err)
        }
    }
}

function bonkEveryone(channel) {
    getChatters(channel)
        .then(chatters => {
            chatters.forEach(chatter => {
                addBonk(chatter, channel.replace('#', ''));
            })
        })
}

async function verifyChatter(channel, username) {
    var chatters = await getChatters(channel);
    return chatters.includes(username);
}

function getRandomChatter(channel) {
    return getChatters(channel)
        .then(chatters => {
            return chatters.length === 0 ?
                null :
                chatters[Math.floor(Math.random() * chatters.length)];
        })
}

function getChatters(channel) {
    return getAllChatters(channel)
        .then(data => {
            var chatters = data.filter(chatter => chatter.name.toLowerCase() != 'bonky_bot').map(chatter => chatter.name);
            return chatters.length === 0 ?
                null :
                chatters;
        });
}

function isModOnline(channel, username) {
    // This will only return true if the mod is online in chat aka in the chat list
    return getModsOnline(channel)
        .then(mods => {
            return mods.includes(username);
        })
}

function getModsOnline(channel) {
    return getAllChatters(channel)
        .then(chatters => {
            var mods = chatters.filter(chatter => chatter.type == 'moderators' || chatter.type == 'broadcaster').map(chatter => chatter.name);
            return mods;
        })
}

function getAllChatters(channel, _attempts) {
    return rp({
        uri: `https://tmi.twitch.tv/group/user/${channel.replace('#','')}/chatters`,
        json: true
    })
        .then(data =>  {
            return Object.entries(data.chatters)
                .reduce((p, [ type, list ]) => p.concat(list.map(name => {
                    return {name, type};
                })), []);
        })
        .catch(err => {
            if(_attempts < 3) {
                return getChatters(channel, _attempts + 1);
            }
            client.say(channel, `bonky_bot out, there was an error`);
            throw err;
        })
}

function japantime(channel) {
    let jp_date_string = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
    let date_jp = new Date(jp_date_string);
    let hours = ("0" + date_jp.getHours()).slice(-2);
    let minutes = ("0" + date_jp.getMinutes()).slice(-2);
    let date_hh_mm = hours + ":" + minutes;
    console.log(date_hh_mm);
    client.say(channel, `Japan time: ${date_hh_mm} (UTC+9)`)
}

function bonkLeader(channel) {
    fs.readFile(resolve(__dirname, 'bonks.json'), "utf8", (err, jsonString) => {
        if(err) {
            console.log("Error reading bonks.json");
            client.say(channel, `Error reading bonk stats`);
            return;
        }
        try {
            var json = JSON.parse(jsonString);
            if(json.channels.hasOwnProperty(channel) && json.channels[channel].hasOwnProperty("users") &&
                Object.keys(json.channels[channel].users).length > 0) {

                var top3 = Object.keys(json.channels[channel].users).sort(function(a, b) {
                    if(json.channels[channel].users[a].bonks == undefined) {
                        return 1;
                    }else if(json.channels[channel].users[b].bonks == undefined) {
                        return -1;
                    }else {
                        return json.channels[channel].users[b].bonks - json.channels[channel].users[a].bonks;
                    }
                }).slice(0, 3);

                var message = `Horny leaderbonk: 1. @${top3[0]}`;
                if(top3.length > 1) {
                    message += ` 2. @${top3[1]}`;
                }
                if(top3.length > 2) {
                    message += ` 3. @${top3[2]}`;
                }
                client.say(channel, message);
            }else {
                client.say(channel, `No records exist yet, start bonking`)
            }
        }catch {
            console.log("Error parsing bonks.json");
            client.say(channel, `Error parsing bonkfile`);
        }
    })
}

function getBonks(username, channel) {
    if(username != '') {
        fs.readFile(resolve(__dirname, 'bonks.json'), "utf8", (err, jsonString) => {
            if(err) {
                console.log("Error reading bonkfile");
                return undefined;
            }
            try {
                var json = JSON.parse(jsonString);
                try {
                    var bonks = json.channels[channel].users[username].bonks;
                }catch {
                    var bonks = 0;
                }
                return bonks;
            }catch(err) {
                console.log("Error reading bonks.json", err);
                return undefined;
            }
        })
    }
}

function bonkStats(username, channel) {
    if(username != '') {
        fs.readFile(resolve(__dirname, 'bonks.json'), "utf8", (err, jsonString) => {
            if(err) {
                console.log("Error reading bonks.json", err);
                client.say(channel, `Error getting bonk stats for ${username}`);
                return;
            }
            try {
                var json = JSON.parse(jsonString);
                try  {
                    var bonks = json.channels[channel].users[username].bonks;
                }catch {
                    var bonks = 0;
                }
                client.say(channel, `@${username} has been bonked ${bonks} times`)
            }catch(err) {
                console.log("Error reading bonks.json", err);
                client.say(channel, `Error reading bonk stats for @${username}`);
            }
        })
    }
}

function addBonk(username, channel) {
    if(username != '') {
        try {
            var jsonString = fs.readFileSync(resolve(__dirname, 'bonks.json'), "utf8");
            try {
                var json = JSON.parse(jsonString);
                if(!json.hasOwnProperty('channels')) {
                    json.channels = {};
                }
                if(!json.channels.hasOwnProperty(channel)) {
                    json.channels[channel] = {};
                }
                if(!json.channels[channel].hasOwnProperty('users')) {
                    json.channels[channel].users = {};
                }
                if(!json.channels[channel].users.hasOwnProperty(username)) {
                    json.channels[channel].users[username] = {};
                }
                if(!json.channels[channel].users[username].hasOwnProperty('bonks')) {
                    json.channels[channel].users[username].bonks = 1;
                }else {
                    json.channels[channel].users[username].bonks++;
                }try {
                    fs.writeFileSync(resolve(__dirname, 'bonks.json'), JSON.stringify( json ), "utf8");
                }catch {
                    console.log("Error writing bonkfile");
                }
            } catch(err) {
                console.log("JSON error", err);
                bonkError(channel, username);
            }
        }catch {
            console.log("Error reading bonkfile");
        }
    }
}

function isAuthorized(channel, user) {
    if(user.mod || user.username == channel.replace('#','')) {
        return true;
    }else {
        return false;
    }
}

function bonkError(channel, username) {
    //client.say(channel, `Error saving bonks, @${username} got lucky!`);
}

function initStorage() {
    var json = {}
    fs.writeFileSync(resolve(__dirname, 'bonks.json'), JSON.stringify( json ), "utf8");
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
    /*
    for(const target in opts.channels) {
      client.say(target, `Bonkybot started and ready to bonk`);
    }
    */
    //client.action(`shylily`, `Bonkybot started and ready to bonk BOP`);

}
