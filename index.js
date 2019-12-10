`use strict`
//Modules
const Discord = require('discord.js');
let unirest = require('unirest');
let music = require('musicmatch')({ apikey: "325994ded9689accf6ace2c047f25a34" });
let fetch = require('node-fetch');
const ud = require('urban-dictionary')

let appid = "7ac5fe320ab084caa7abd9b04e0271a8";
let apikey = "ec7b16e49d93689aec62649c6b758c60";
const color = 0xED203F;
let embed = new Discord.RichEmbed()
    .setTitle('Error')
    .setColor(color)
    .setDescription('Invalid command! use `=>help` for a list of commands!');

//Constants
const bot = new Discord.Client();
const token = 'NjIwOTgyNTM0NDY5MDU4NTY5.XXetYg.0U7Jo2kyji2rnnfWlcoQ8APQ8SM';
const PREFIX = '=>';

let tictactoe = `
>>> \`\`\`
   1 2 3
a |_|_|_|
b |_|_|_|
c |_|_|_|
\`\`\`
`;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

bot.on('ready', () => {
    console.log("+bot is online+");

    bot.on('message', msg => {
        let args = msg.content.substring(PREFIX.length).split(" ");
        if (msg.member.roles.find(r => r.name === '👑Founder👑') || msg.member.roles.find(r => r.name === 'staff')) {
            switch (args[0].toLowerCase()) {
                case 'clear':
                    clear(args, msg);
                    break;
                case 'role':
                    role(args, msg);

                    break;
            }
        }
        switch (args[0].toLowerCase()) {
            case 'ping':
                msg.reply('pong!');
                break;

            //gives the wheather of a location
            //=>wheather [place]
            case 'weather':
                weather(args, msg);
                break;

            // definitie can urban dictionary
            // =>define [term]
            case 'define':
                define(args, msg);
                break;

            // Random meme
            // =>meme
            case 'meme':
                rndmMeme(args, msg);
                break;

            //Give the lyrics
            //=>lyrics [song name],[artist]
            case 'lyrics':
                lyrics(args, msg);
                break;

            //gives game info
            //=>game [game titel]
            case 'game':
                gameInfo(args, msg);
                break;

            //give suggestions based on a game
            //=>suggest [game]
            case 'suggest':
                suggestGame(args, msg);
                break;

            case 'help':
                embed.setTitle("Commands").setColor(color).setDescription("\n   -__Random meme__  =>meme\n   -__define__ =>define [term]\n   -__game__ =>game [game titel]\n   -__suggest__ =>suggest [game]\n   -__wheather__  =>wheather [place]");
                msg.channel.send(embed);
                break;
        }

    })
});

function gameInfo(args, msg) {
    let game = args[1];
    for (let i = 2; i < args.length; i++) {
        game += "-" + args[i];
    }
    let mssg, titelGame;
    fetch(`https://api.rawg.io/api/games/${game}`).then(res => {
        return res.json();

    }).then(res => {
        if (res.detail != "Not found.") {
            //msg.channel.send({ files: [res.background_image] });
            titelGame = res.name;
            mssg = `${res.description_raw} \n\n__Rating__ : ${res.rating}/5 \n\n__Platforms__\n`;
            for (let i = 0; i < res.platforms.length - 1; i++) {
                mssg += `${res.platforms[i].platform.name}, `;
            }
            mssg += `${res.platforms[res.platforms.length - 1].platform.name}`;
            embed.setTitle(titelGame).setColor(color).setDescription(mssg).setImage(res.background_image);

        } else {
            titelGame = "Game not found";
            mssg = `  - Check the spelling`;
            embed.setTitle(titelGame).setColor(color).setDescription(mssg);
        }
        msg.channel.send(embed);
        embed.setImage();
    })
}

function suggestGame(args, msg) {
    let game1 = args[1];
    for (let i = 2; i < args.length; i++) {
        game1 += "-" + args[i];
    }
    console.log(game1);
    fetch(`https://api.rawg.io/api/games/${game1}`).then(res => {
        return res.json();

    }).then(res => {
        if (res.detail != "Not found.") {
            console.log("got here3 +" + res.slug + "+");
            fetch(`https://api.rawg.io/api/games/${res.slug}/suggested?page_size=5`).then(res2 => {
                return res2.json();
            }).then(res2 => {
                let mssg1 = "";
                for (let i = 0; i < res2.results.length; i++) {
                    mssg1 += `\n   -${res2.results[i].name}`;
                }

                embed.setTitle(`Recomended games based on ${res.name}`).setColor(color).setDescription(mssg1);
                msg.channel.send(embed);

            })
        } else {
            embed.setTitle("titelGame").setColor(color).setDescription("- Check the spelling");
            msg.channel.send(embed);
        }

    })
}

function lyrics(args, msg) {
    let title = args[1];
    for (let i = 2; i < args.length; i++) {
        title += " " + args[i];
    }
    console.log(title);
    music.trackSearch({ q: title, page: 1, page_size: 1, f_has_lyrics: 1 })
        .then(function (data) {
            let trackID = data.message.body.track_list[0].track.track_id;
            music.trackLyrics({ track_id: trackID })
                .then(function (data2) {
                    //msg.channel.send(">>> **" + data.message.body.track_list[0].track.track_name + "** by " + data.message.body.track_list[0].track.artist_name + " \n" + data2.message.body.lyrics.lyrics_body);
                    embed.setTitle(`${data.message.body.track_list[0].track.track_name} by ${data.message.body.track_list[0].track.artist_name}`).setColor(color).setDescription(data2.message.body.lyrics.lyrics_body);
                    msg.channel.send(embed);
                }).catch(function (err) {
                    console.log(err);
                })
        }).catch(function (err) {
            console.log(err);
        })
}

function define(args, msg) {
    let definition = args[1];
    for (let i = 2; i < args.length; i++) {
        definition += " " + args[i];
    }

    ud.term(definition).then((result) => {
        const entries = result.entries
        embed.setTitle(`${entries[0].word}`).setColor(color).setDescription(`${entries[0].definition} \n __Example__\n${entries[0].example}`);
        msg.channel.send(embed);
    }).catch((error) => {
        console.error(error.message)
        msg.channel.send(embed);
    })
}

function rndmMeme(args, msg) {
    let reqMeme = unirest("GET", "https://some-random-api.ml/meme");
    msg.channel.bulkDelete(1);
    reqMeme.headers({
        "x-rapidapi-host": "ronreiter-meme-generator.p.rapidapi.com",
        "x-rapidapi-key": "9d4d6195d1mshb1dcea69f7b154ep101d69jsn250af4fe72fa"
    });


    reqMeme.end(function (res) {
        if (res.error) throw new Error(res.error);

        embed.setTitle(res.body.caption).setColor(color).setImage(res.body.image).setDescription("");
        msg.channel.send(embed);
        embed.setImage();
    });
}

function weather(args, msg) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${args[1]}&APPID=${appid}`).then(res => {
        return res.json();
    }).then(res => {
        embed.setTitle('weather').setColor(color).setDescription("in **" + args[1] + "** it is " + res.weather[0].main);
        msg.channel.send(embed);
    })
}

function role(args, msg) {
    let rMember = msg.guild.member(msg.mentions.users.first()) || msg.guild.member.length(arg[0]);
    if (!rMember) return msg.reply(args[1] + " is not a user");
    let role = args[2];
    for (let i = 3; i < args.length; i++) {
        role += " " + args[i];
    }
    role = role.trim();
    if (!role) return msg.reply(" No role selected");
    let gRole = msg.guild.roles.find(`name`, role);
    if (!gRole) return msg.reply(role + " not found");

    if (rMember.roles.has(gRole.id));
    rMember.addRole(gRole.id);

    embed.setTitle('Role Update').setColor(color).setDescription(`Congrats to <@${rMember.id}> been given the role ${gRole.name}.`);
    msg.channel.send(embed);
}

function clear(args, msg) {
    if (!args[1]) return msg.reply('Missing amount')
    //msg.channel.bulkDelete(parseInt(args[1]) + 1);
    //console.log(msg.channel.name)
        let messages1 = [];
        let count = 0;
        let k;
        for (let a of bot.channels.array()) {
            if (a.name == msg.channel.name) {
                k = a
            }
        }
        k.fetchMessages()
                    .then((messages) => {
                        messages1 = messages.array();
                        
                        let minDate = new Date();
                        minDate.setDate(minDate.getDate() - 14);
    
                        for (let b of messages1) {
                            let myDate = new Date(b.createdTimestamp);
                            if (myDate > minDate) {
                                count++;
                            }
                        }
                    }).then(()=>{
                            if(count < parseInt(args[1]) + 1){
                                msg.channel.bulkDelete(count);
                                messaged(count, msg);
                                
                            }else{
                                msg.channel.bulkDelete(parseInt(args[1]) + 1);
                                messaged(args[1], msg);
                                
                            }
                            
                    })
                    .catch(console.error);
}




async function messaged(number, msg){
    embed.setTitle('Clear').setColor(color).setDescription(`Cleard ${number} messages.`);
    msg.channel.send(embed);
    await sleep(2000);
    msg.channel.bulkDelete(1);
}

bot.login(token);