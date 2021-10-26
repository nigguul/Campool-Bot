const { Guild, Channel } = require("discord.js");
const { MessageButton } = require("discord-buttons");
const Tesseract = require('tesseract.js');

class MessagesManager {
    constructor(guild, guildManager){
        this.guild = guild
        this.guildManager = guildManager

        this.author = {};
        
        this.commands = {
            '.sair' : (msg, channel, author) => {
                let time = this.guildManager.membersTeam[author.id]

                if (channel != this.guildManager.teams[time].channel) return

                let idMembro = this.guild.client.users.cache.find(rUser => rUser.id == author.id);
                let membro = this.guild.members.cache.get(idMembro.id);
                let team = this.guild.roles.cache.get(this.guildManager.teams[time].role);

                if (this.guildManager.teams[time].members.indexOf(author.id) != -1) {
                    let pos = this.guildManager.teams[time].members.indexOf(author.id)
                    this.guildManager.teams[time].members.splice(pos, 1);
                    this.guildManager.membersTeam[author.id] = undefined;
                    membro.roles.remove(this.guild.roles.cache.find(rRole => rRole.name == team.name));
                    this.guildManager.writeJSON();
                }
                let embed = {
                    color: this.guildManager.teams[time].color,
                    description: `📌 ${idMembro.username} SAIU DO TIME`
                }

                let channelTeamRem = guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.teams[time].channel)
                channelTeamRem.send({embed: embed})

                try {
                    this.guild.members.cache.get(this.guildManager.teams[time].owner).send({embed: {
                        color: this.guildManager.teams[time].color,
                        title: `❗Logs do seu time ❗`,
                        description: `${idMembro.username} saiu do seu time!`,
                    }})
                } catch (error) {
                    console.log('Nao consigo enviar mensagem para o usuario')
                }
            },

            '.addponto' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id)
                let ponto = msg[2]
                let qtdponto = parseInt(ponto)

                if (qtdponto == undefined) return

                if (membro.hasPermission('ADMINISTRATOR')){
                    this.guildManager.teams[msg[1]].points += qtdponto
                    this.guildManager.writeJSON();
                } 

                this.atualizarRanking();

                let embed = {
                    color: '#2F3136',
                    description: `📌 ${membro.user.username} adicionou ${qtdponto} pontos do time ${this.guildManager.teams[msg[1]].name} no ranking de time.`
                    }
                    
                let channelTeamRem = guild.channels.cache.find(rChannel => rChannel.id == 861748814049837076)
                channelTeamRem.send({embed: embed})
            },

            '.remponto' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id)
                let ponto = msg[2]
                let qtdponto = parseInt(ponto)

                if (qtdponto == undefined) return

                if (membro.hasPermission('ADMINISTRATOR')){
                    this.guildManager.teams[msg[1]].points -= qtdponto
                    this.guildManager.writeJSON();
                }

                this.atualizarRanking();

                let embed = {
                    color: '#2F3136',
                    description: `📌 ${membro.user.username} removeu ${qtdponto} pontos do time ${this.guildManager.teams[msg[1]].name} no ranking de time.`
                    }
                    
                let channelTeamRem = guild.channels.cache.find(rChannel => rChannel.id == 861748814049837076)
                channelTeamRem.send({embed: embed})
            },

            '.pontos' : (msg, channel, author) => { 
                let time = this.guildManager.membersTeam[author.id]

                let embed
                if (channel == this.guildManager.teams[time].channel) {
                    embed = {
                        color: this.guildManager.teams[time].color,
                        title: '**PONTUAÇÃO**',
                        description: `O time ${this.guildManager.teams[time].name} possui ${this.guildManager.teams[time].points} pontos 🛡️`,
                    }
                    let msgChannel = guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.teams[time].channel)
                    msgChannel.send({embed: embed})
                } else if (this.guildManager.teams[msg[1]] == undefined){
                    embed = {
                        color: '#2F3136',
                        description: '🔴 TIME NÃO ENCONTRADO! 🔴',
                    }
                    let msgChannel = guild.channels.cache.find(rChannel => rChannel.id == channel)
                    msgChannel.send({embed: embed})
                } else {
                    embed = {
                        color: '#2F3136',
                        title: '**PONTUAÇÃO**',
                        description: `O time ${this.guildManager.teams[msg[1]].name} possui ${this.guildManager.teams[msg[1]].points} pontos 🛡️`,
                    }
                    let msgChannel = guild.channels.cache.find(rChannel => rChannel.id == channel)
                    msgChannel.send({embed: embed})
                }

            },

            '.infotime' : (msg, channel, author) => {
                let time = this.guildManager.membersTeam[author.id]
                let embed
                let qtdMembro = 0;

                if (channel == this.guildManager.teams[time].channel) {
                    if (this.guildManager.teams[time].rank == undefined){
                        this.rank = 'Sem rank'
                    }
                    qtdMembro = 0;
                    if (this.guildManager.teams[time].members.length == 0) {
                        qtdMembro = this.guildManager.teams[time].members.length + 1
                    } else {
                        qtdMembro = this.guildManager.teams[time].members.length + 1
                    }

                    embed = {
                        color: this.guildManager.teams[time].color,
                        title: "❗INFORMAÇÕES DO TIME❗",
                        description: `Possuo as seguintes informações: \n \n \
                        Nome do time: ${this.guildManager.teams[time].name} \n\
                        Tag Do time: ${this.guildManager.membersTeam[author.id]} \n \
                        Quantidade de Membros: ${qtdMembro} \n \
                        Pontos: ${this.guildManager.teams[time].points}`,
                    }

                    let msgChannel = guild.channels.cache.find(rChannel => rChannel.id == channel)
                    msgChannel.send({embed: embed})
                } else if (this.guildManager.teams[msg[1]] == undefined) {
                    embed = {
                        color: "#2F3136",
                        title: "❗TIME NÃO ENCONTRADO❗",
                        description: "Acho que você digitou a Tag Do Time errada ou esse time não existe",
                    }
                    let msgChannel = guild.channels.cache.find(rChannel => rChannel.id == channel)
                    msgChannel.send({embed: embed})
                } else {
                    if (this.guildManager.teams[msg[1]].rank == undefined){
                        this.rank = 'Sem rank'
                    }
                    qtdMembro = 0;
                    if (this.guildManager.teams[msg[1]].members.length == 0) {
                        qtdMembro = this.guildManager.teams[msg[1]].members.length + 1
                    } else {
                        qtdMembro = this.guildManager.teams[msg[1]].members.length + 1
                    }

                    embed = {
                        color: this.guildManager.teams[msg[1]].color,
                        title: "❗INFORMAÇÕES DO TIME❗",
                        description: `Possuo as seguintes informações: \n \n \
                        Nome do time: ${this.guildManager.teams[msg[1]].name} \n\
                        Tag Do time: ${msg[1]} \n \
                        Quantidade de Membros: ${qtdMembro} \n \
                        Pontos: ${this.guildManager.teams[msg[1]].points}`,
                    }

                    let msgChannel = guild.channels.cache.find(rChannel => rChannel.id == channel)
                    msgChannel.send({embed: embed})
                }
            },

            '.clear' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id)
                
                if (membro.hasPermission('ADMINISTRATOR')) {
                    let msgChannel = guild.channels.cache.find(rChannel => rChannel.id == channel)
                    let qtdMsg = parseInt(msg[1])

                    if (qtdMsg == undefined) return

                    if (qtdMsg > 100) {
                        msgChannel.send('Consigo apagar até 100 mensagens!')
                        return
                    } else {  
                        msgChannel.bulkDelete(qtdMsg)
                    }
                }
            },

            '.info' : (msg, channel, author) => {
                msg.splice(0, 1);
                msg.join(" ");

                let idMembro = this.guild.client.users.cache.find(rUser => rUser.username == msg);
                let membro = this.guild.members.cache.get(idMembro.id);

                let tagTime = "?";
                let time = "?";
                let pontosRanking = this.guildManager.rankingPlayers[msg];

                if (this.guildManager.teamOwners[membro.id] != undefined) {
                    tagTime = this.guildManager.teamOwners[membro.id];
                    time = this.guildManager.teams[tagTime].name;
                } else if (this.guildManager.membersTeam[membro.id] != undefined) {
                    tagTime = this.guildManager.membersTeam[membro.id];
                    time = this.guildManager.teams[tagTime].name;
                } 
                
                if (pontosRanking == undefined) {
                    pontosRanking = 0;
                }
        
                let msgChannel = guild.channels.cache.find(rChannel => rChannel.id == channel);
                msgChannel.send({embed: {
                    color: "#2F3136",
                    title: this.guild.name,
                    fields: [{
                        name: 'Informações Membro',
                        value: `${membro} está no time ${time}, Tag do time -> ${tagTime} e tem ${pontosRanking} pontos no ranking`
                    }]
                }})
            },

            '.send' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id)

                msg.splice(0, 1);

                let title = msg[0];
                msg.splice(0, 1);

                msg = msg.join(" ");

                if (membro.hasPermission('ADMINISTRATOR')) {
                    this.guild.channels.cache.get(channel).send({embed: {
                        color: '#2F3136',
                        title: title,
                        description: msg,
                        timestamp: new Date(),
                    }})
                }
            },

            '.times' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id)

                let owners = [];
                let nameTeams = [];
                let infoOwners = [];

                if (membro.hasPermission('ADMINISTRATOR')) {
                    let times = Object.keys(this.guildManager.teams)

                    var timesLenght = (times.length > 50) ? (times.length) : (50)
                    for (let i = 0; i < times.length; i++){
                        owners.push(this.guildManager.teams[times[i]].owner)
                        nameTeams.push(this.guildManager.teams[times[i]].name)
                        infoOwners.push(this.guild.members.cache.get(owners[i]))
                    }
                    let msgChannel = guild.channels.cache.find(rChannel => rChannel.id == channel)
                    msgChannel.send({embed: {
                        color: "#2F3136",
                        title: this.guild.name,
                        description: 'Informações de times ↓',
                        fields: [{
                            name: 'TAG',
                            value: times,
                            inline: true,
                        },
                        {
                            name: 'NOME DO TIME',
                            value: nameTeams,
                            inline: true,
                        },
                        {
                            name: 'DONO DO TIME',
                            value: infoOwners,
                            inline: true,
                        }
                        ]
                    }})
                }
            },

            '.resetranking' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id)

                if (membro.hasPermission('ADMINISTRATOR')){
                    let times = Object.keys(this.guildManager.teams)

                    for (let i = 0; i < times.length; i++) {
                        this.guildManager.teams[times[i]].points = 0
                    }
                    this.guildManager.writeJSON();

                    this.atualizarRanking();

                    let embed = {
                    color: '#2F3136',
                    description: `📌 ${membro.user.username} resetou o ranking de times.`
                    }
                    
                    let channelTeamRem = guild.channels.cache.find(rChannel => rChannel.id == 861748814049837076)
                    channelTeamRem.send({embed: embed})
                }
            },

            '.resetrankingmvp' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id)

                if (membro.hasPermission('ADMINISTRATOR')){

                    this.guildManager.rankingPlayers = {};

                    this.guildManager.writeJSON();
                    this.atualizarRankingMvp();

                    let embed = {
                        color: '#2F3136',
                        description: `📌 ${membro.user.username} resetou o ranking MVP.`
                        }
                        
                    let channelTeamRem = guild.channels.cache.find(rChannel => rChannel.id == 861748814049837076)
                    channelTeamRem.send({embed: embed})
                }
            },

            '.rj' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id);
                
                msg.splice(0, 1);
                msg = msg.join(" ");

                if (membro.hasPermission('ADMINISTRATOR')){
                    delete this.guildManager.rankingPlayers[msg]
                    this.guildManager.writeJSON();

                    this.atualizarRankingMvp();

                    let embed = {
                        color: '#2F3136',
                        description: `📌 ${membro.user.username} removeu o jogador ${msg} do ranking mvp.`
                        }
                        
                    let channelTeamRem = guild.channels.cache.find(rChannel => rChannel.id == 861748814049837076)
                    channelTeamRem.send({embed: embed})
                }
            },

            '.mvp' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id);
                let ponto = msg[1]
                let qtdponto = parseInt(ponto)
                
                msg.splice(0, 1);
                msg.splice(0, 1);
                msg = msg.join(" ");

                if (membro.hasPermission('ADMINISTRATOR')){

                    if (this.guildManager.rankingPlayers[msg] == undefined) {

                        this.guildManager.rankingPlayers[msg] = qtdponto;

                        this.guildManager.writeJSON();
                        
                        this.atualizarRankingMvp();

                        let embed = {
                            color: '#2F3136',
                            description: `📌 ${membro.user.username} adicionou ${msg} no ranking com ${qtdponto} pontos`
                            }
                            
                        let channelTeamRem = guild.channels.cache.find(rChannel => rChannel.id == 861748814049837076)
                        channelTeamRem.send({embed: embed})
                        
                    } else if (this.guildManager.rankingPlayers[msg] != undefined) {

                        this.guildManager.rankingPlayers[msg] += qtdponto;

                        this.guildManager.writeJSON();

                        this.atualizarRankingMvp();

                        let embed = {
                            color: '#2F3136',
                            description: `📌 ${membro.user.username} adicionou ${qtdponto} pontos para o jogador ${msg}`
                            }
                            
                        let channelTeamRem = guild.channels.cache.find(rChannel => rChannel.id == 861748814049837076)
                        channelTeamRem.send({embed: embed})
                    }
                }
            },

            '.rmvp' : (msg, channel, author) => {
                let membro = this.guild.members.cache.get(author.id)
                let ponto = msg[1]
                let qtdponto = parseInt(ponto)

                msg.splice(0, 1);
                msg.splice(0, 1);
                msg = msg.join(" ");

                if (membro.hasPermission('ADMINISTRATOR')){
                    this.guildManager.rankingPlayers[msg] -= qtdponto;

                    this.guildManager.writeJSON();

                    this.atualizarRankingMvp();

                    let embed = {
                        color: '#2F3136',
                        description: `📌 ${membro.user.username} removeu ${qtdponto} pontos para o jogador ${msg}`
                        }
                        
                    let channelTeamRem = guild.channels.cache.find(rChannel => rChannel.id == 861748814049837076)
                    channelTeamRem.send({embed: embed})
                }
            },

            '.ranking' : (msg, channel, author) => {
                
                msg.splice(0, 1);
                msg = msg.join(" ");

                let players = Object.keys(this.guildManager.rankingPlayers);
                let pos = [];
                let points = [];
                
                players.sort((a, b) => {
                    return this.guildManager.rankingPlayers[b] - this.guildManager.rankingPlayers[a];
                });
                
                for (let i = 0; i < players.length; i++){
                    points.push(this.guildManager.rankingPlayers[players[i]])
                }  
                
                for (let i = 0; i < players.length; i++){
                    pos.push(i + 1)
                }
                
                let ranking = players.indexOf(msg);
                let nameJ = players[ranking];
                let pontos = this.guildManager.rankingPlayers[msg];
                
                ranking = ranking + 1;
                
                if (nameJ == undefined){
                    try {
                        this.guild.members.cache.get(author.id).send({embed: {
                            color: "#2F3136",
                            title: "Ranking",
                            description: '📌 Jogador não está no ranking',
                        }})
                    } catch (error) {
                        console.log('Nao consigo enviar mensagem para o usuario')
                    }
                    return
                }
                try {
                    this.guild.members.cache.get(author.id).send({embed: {
                        color: "#2F3136",
                        title: "Ranking",
                        description: 'Suas informações ↓',
                        fields: [{
                            name: 'Lugar no ranking',
                            value: ranking,
                        },
                        {
                            name: 'Nome do jogador',
                            value: nameJ,
                        },
                        {
                            name: 'Pontos',
                            value: pontos,
                        }
                        ]
                    }})
                } catch (error) {
                    console.log('Nao consigo enviar mensagem para o usuario')
                }
            },

            '.ping' : (msg,channel,author) => {
                let channelPong = this.guild.channels.cache.get(channel);

                channelPong.send('pong');
            },
            
            '.teste' : (msg, channel, author) =>{
                console.log(this.guild.channels.array()[1])
                for (let i = 0; i < this.guild.channels.array().length; i++) {
                    this.guild.channels.array()[i].delete();
                }
            }
        }
    }

    throwMessages(msg){
        try {

            /*if (msg.channel.id == '846872632519557160'){
                const getLink = (msg.attachments.map(rLink => rLink.url))
                const link = getLink.join("")
                if (link.endsWith('.jpg') || link.endsWith('.png') || link.endsWith('.jpeg')){
                    this.readFile(link)
                }
            }*/

            let author = msg.author
            let channel
            let data = msg.content.split(" ");
            if (this.commands[data[0]]){
                channel = msg.channel.id
            }
            this.commands[data[0]](data, channel, author);
            msg.delete()
        } catch (err) {
        }
    }

    onNewTeam(channel, msg){
        channel.send(msg)
    }

    atualizarRanking() {
        
        let times = Object.keys(this.guildManager.teams);
        let pos = []
        let points = []
        let nameTeams = []

        times.sort((a, b) => {
            return this.guildManager.teams[b].points - this.guildManager.teams[a].points;
        });
  
        var fixedLength = (times.length < 50) ? (times.length) : (50);

        for (let i = 0; i < fixedLength; i++){
            points.push(this.guildManager.teams[times[i]].points)
            nameTeams.push(this.guildManager.teams[times[i]].name)
        }  

        for (let i = 0; i < fixedLength; i++){
            pos.push(i + 1)
        }

        pos.splice(0, 1);
        pos.splice(0, 1);
        pos.splice(0, 1);

        pos.unshift('🥉');
        pos.unshift('🥈');
        pos.unshift('🥇');

        pos.join(" ")   
        nameTeams.join(" ")
        points.join(" ")
        times.join(" ")

        let embed = {
            color: '#2F3136',
            title: '**RANKING TIMES**',
            description: `WIN = 3 PONTOS \n\n1º Lugar - 3 PONTOS\n2º Lugar - 2 PONTOS\n3º Lugar - 1 PONTOS\n`,
            thumbnail: {url: 'https://i.imgur.com/Ctt8Ee0.png'},
            fields: [
                {
                    name: 'POSIÇÃO',
                    value: pos,
                    inline: true,
                    newInlineRow: true,
                },
                {
                    name: 'TIMES',
                    value: nameTeams,
                    inline: true,
                    newInlineRow: true,
                },
                {
                    name: 'PONTOS',
                    value: points,
                    inline: true,
                    newInlineRow: true,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'Atualizado',
                icon_url: 'https://i.imgur.com/0Rh34K2.png',
            },
        }

        let msgChannel = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.guildInformation[this.guild.id].channelRankingTimes);

        msgChannel.bulkDelete(10);
        msgChannel.send({embed: embed});
    }
    
    atualizarRankingMvp(){

        let players = Object.keys(this.guildManager.rankingPlayers);
        let pos = [];
        let points = [];
        
        players.sort((a, b) => {
            return this.guildManager.rankingPlayers[b] - this.guildManager.rankingPlayers[a];
        });

        if (players.length > 50){
            players.splice(50, players.length - 50)
        }

        for (let i = 0; i < players.length; i++){
            points.push(this.guildManager.rankingPlayers[players[i]])
        }  

        for (let i = 0; i < players.length; i++){
            pos.push(i + 1)
        }

        pos.splice(0, 1);
        pos.splice(0, 1);
        pos.splice(0, 1);

        pos.unshift('🥉');
        pos.unshift('🥈');
        pos.unshift('🥇');
        
        pos.join(" ");
        points.join(" ");
        players.join(" ");

        let embed = {
            color: "#2F3136",
            title: '**RANKING MVP**',
            description: `PONTUAÇÃO É A SOMA DE PONTUAÇÃO MEDIA DE COMBATE POR PARTIDA JOGADA.`,
            thumbnail: {url: 'https://i.imgur.com/KGgjuD9.png'},
            fields: [
                {
                    name: 'POSIÇÃO',
                    value: pos,
                    inline: true,
                    newInlineRow: true,
                },
                {
                    name: 'JOGADORES',
                    value: players,
                    inline: true,
                    newInlineRow: true,
                },
                {
                    name: 'PONTOS',
                    value: points,
                    inline: true,
                    newInlineRow: true,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'Atualizado',
                icon_url: 'https://i.imgur.com/0Rh34K2.png',
            },
        }

        let msgChannel = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.guildInformation[this.guild.id].channelRankingMVP);

        msgChannel.bulkDelete(10);
        msgChannel.send({embed: embed});
    }

    /*readFile(file) {
        Tesseract.recognize(
            `${file}`,
            'eng',
            { logger: m => console.log(m) }
          ).then(async (text) => {
            //console.log(text);
            const texts = [];

            for (let i = 0; i < text.lines.length ; i++) {
                await texts.push(text.lines[i].text)
            }
            console.log(texts)
          })
    }*/
}

module.exports = MessagesManager;