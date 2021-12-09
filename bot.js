const tmi = require('tmi.js');
//const rp = require('request-promise');
const sqlite3 = require('sqlite3');

const channelList = [
    "tomjschwanke"
]

const commandList = [
    "bonk",
    "bonks",
    "leaderbonk",
]

const tmiOptions = {
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: "bonky_bot",
        password: process.env['twitch_chat_key']
    },
    channels: channelList
};

/*
const db = new sqlite3.Database('./bonks.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
  sqlOnConnectedHandler(error);
});
*/

const tmiClient = new tmi.client(tmiOptions);

tmiClient.on('message', tmiOnMessageHandler);
tmiClient.on('connected', tmiOnConnectedHandler);

tmiClient.connect();

function sqlOnConnectedHandler(error) {
    if(error) {
        //console.error('SQL connect error:\n' + error.stack);
        throw error;
    }else {
        console.log('SQL connected');
    }
}

function tmiOnConnectedHandler(address, port) {
    console.log(`* Connected to ${address}:${port}`);
}

function tmiOnMessageHandler(channel, flags, message, self) {
    if(self) { return; }
    if(!flags['message-type'] == 'chat') {  } // TODO: check if this is the right way
    const arguments = msg.toLowerCase().slice(1).split(' ');
    const command = arguments.shift().toLowerCase();
    if(!commandList.includes(command)) { return; }

    switch(command) {
        case 'bonk':
            bonk(channel, arguments, flags);
            break;
        case 'bonks':
            showBonks();
            break;
        case 'leaderbonk':
            // code here
            break;
    }
}

function bonk(channel, username) {
    // Responsible for getting into uniform format for storage API

}

function addBonks(channelId, userId) {
    // Storage API
    /* CREATE TABLE `bonky_bot`.`demo` ( `user-id` BIGINT NOT NULL , `bonks` BIGINT NOT      NULL , PRIMARY KEY (`user-id`)) ENGINE = InnoDB;
    */
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./bonks.db', sqlite3.OPEN_READWRITE |          sqlite.OPEN_CREATE, (error) => {
            if(error) {
                console.error('SQL connect error:\n' + error.stack);
                Promise.reject();
            }else {

            }
        });
    });
}

function showBonks(channel, username) {

}

function getBonks(channelId, userId) {

}

function getTop3(channel) {

}