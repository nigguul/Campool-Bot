const { MessageButton } = require("discord-buttons");

class Installer {
    constructor(guild, guildManager) {
        this.guild = guild
        this.guildManager = guildManager

        this.roles = [
            ['CAPITÃO','#00ff0c'],
            ['✔️','#651786'],
            ['VALORANT','#ff0000'],
            ['TFT','#fffa00'],
            ['LOL','#651786']
        ]

        this.category = [
            ['RECEPÇÃO','@everyone', '✔️'],
            ['CAMPEONATO','@everyone', '✔️'],
            ['TIMES','@everyone', '✔️']
        ]

        this.channels = [
            ['regras', '✔️','@everyone','RECEPÇÃO'],
            ['jogos', '@everyone','✔️','RECEPÇÃO'],
            ['campool', '@everyone','@everyone','RECEPÇÃO'],
            ['ranking-times', '@everyone', '✔️','CAMPEONATO'],
            ['ranking-mvp', '@everyone', '✔️','CAMPEONATO'],
            ['criar-times', '@everyone', '✔️','CAMPEONATO'],
            ['novos-times', '@everyone', '✔️','CAMPEONATO'],
            ['scrim', '@everyone', '✔️', 'CAMPEONATO'],
            ['free-agents', '@everyone', '✔️', 'CAMPEONATO'],
        ]

        this.sendChannels = [
            ['scrim', 'CAPITÃO']
        ]

        this.notSendChannels = [
            ['regras', '@everyone'],
            ['jogos', '✔️'],
            ['campool', '@everyone'],
            ['ranking-times', '✔️'],
            ['ranking-mvp', '✔️'],
            ['criar-times', '✔️'],
            ['novos-times', '✔️'],
            ['scrim', '✔️'],
            ['free-agents', '✔️']
        ]

        this.emojis = [
            ['https://i.imgur.com/io7wVUZ.jpg','valorant_logo'],
            ['https://i.imgur.com/mQRa9P4.png','lol_logo'],
            ['https://i.imgur.com/vN35NRn.png','tft_logo']
        ]
    }


    async install(callback){
        for (let i = 0; i < this.emojis.length; i++) {
            await this.guild.emojis.create(this.emojis[i][0], this.emojis[i][1])
        }

        for (let i = 0; i < this.roles.length; i++) {
            await this.guild.roles.create({
                data: {
                    name: this.roles[i][0],
                    color: this.roles[i][1],
                    hoist: true,
                    mentionable: true
                },
                reason: 'Criando cargos •'
            }).catch(console.error)
        }

        for (let i = 0; i < this.category.length; i++) {
            await this.guild.channels.create(this.category[i][0], {
                type: 'category',
                permissionOverwrites: [
                    {
                        id: this.guild.roles.cache.find(roles => roles.name == this.category[i][1]),
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: this.guild.roles.cache.find(roles => roles.name == this.category[i][2]),
                        allow: ['VIEW_CHANNEL'],
                    }
                ],
                reason: 'Criando categorias •'
            }).catch(console.error)
        }

        for (let i = 0; i < this.channels.length; i++){
            await this.guild.channels.create(this.channels[i][0], {
                type: 'text',
                parent: this.guild.channels.cache.find(rCat => rCat.name == this.channels[i][3]),
                permissionOverwrites: [
                    {
                        id: this.guild.roles.cache.find(roles => roles.name == this.channels[i][1]),
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: this.guild.roles.cache.find(roles => roles.name == this.channels[i][2]),
                        allow: ['VIEW_CHANNEL'],
                    },
                ],
                reason: 'Criando channels •'
            }).catch(console.error)
        }

        for (let i = 0; i < this.sendChannels.length; i++){
            let channel = this.guild.channels.cache.find(rChannel => rChannel.name == this.sendChannels[i][0])
            let role = this.guild.roles.cache.find(rRole => rRole.name == this.sendChannels[i][1])

            await channel.updateOverwrite(role, { SEND_MESSAGES: true })
        }

        for (let i = 0; i < this.notSendChannels.length; i++){
            let channel = this.guild.channels.cache.find(rChannel => rChannel.name == this.notSendChannels[i][0])
            let role = this.guild.roles.cache.find(rRole => rRole.name == this.notSendChannels[i][1])

            await channel.updateOverwrite(role, { SEND_MESSAGES: false })
        }

        this.infoGuild(this.guild.id)

        callback();
    }

    async infoGuild(guild){
        this.guildManager.guildInformation[guild].installed = true;
        this.guildManager.guildInformation[guild].channelRules = this.guild.channels.cache.find(rCat => rCat.name == 'regras').id,
        this.guildManager.guildInformation[guild].channelGames = this.guild.channels.cache.find(rCat => rCat.name == 'jogos').id,
        this.guildManager.guildInformation[guild].channelRankingTimes = this.guild.channels.cache.find(rCat => rCat.name == 'ranking-times').id,
        this.guildManager.guildInformation[guild].channelRankingMVP = this.guild.channels.cache.find(rCat => rCat.name == 'ranking-mvp').id,
        this.guildManager.guildInformation[guild].channelTimes = this.guild.channels.cache.find(rCat => rCat.name == 'criar-times').id,
        this.guildManager.guildInformation[guild].channelNovosTimes = this.guild.channels.cache.find(rCat => rCat.name == 'novos-times').id,
        this.guildManager.guildInformation[guild].channelScrim = this.guild.channels.cache.find(rCat => rCat.name == 'scrim').id,
        this.guildManager.guildInformation[guild].channelFA = this.guild.channels.cache.find(rCat => rCat.name == 'free-agents').id,

        await this.guildManager.writeJSON();

        await this.sendMsgChannels(guild);
    }

    async sendMsgChannels(guild){
        let channelRankTimes = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.guildInformation[guild].channelRankingTimes)
        await channelRankTimes.send({embed: {
            color: "#2F3136",
            title: this.guild.name,
            description: "Aguardando Rankeamento dos Times",
            timestamp: new Date(),
          }
        })

        let channelRankMVP = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.guildInformation[guild].channelRankingMVP)

        await channelRankMVP.send({embed: {
            color: "#2F3136",
            title: this.guild.name,
            description: "Aguardando Rankeamento dos MVPs",
            timestamp: new Date(),
          }
        })

        let channelTeam = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.guildInformation[guild].channelTimes)

        let embed = {
            color: "#2F3136",
            title: this.guild.name,
            fields: [
                {
                    name: '🎖️**TIME**🎖️',
                    value: '\n Você possuiu um time? \n \n Aproveite e crie ele no nosso discord, para realizar a criação basta você cliclar no botão! \
                    Após isso basta responder as informações para mim! \
                    \n\n **Lembre-se** que o **CAPITÃO** do time deve criar!',
                }],
            }

        let botao = new MessageButton()
            .setStyle('blurple')
            .setLabel('CRIAR TIME!')
            .setID('Criar-time');
            
        channelTeam.send({embed: embed, buttons: botao})

        let regras = new MessageButton()
            .setStyle('red')
            .setLabel('ACEITAR REGRAS!')
            .setID('regras');
        
        let channelTreino = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.guildInformation[guild].channelScrim)
        await channelTreino.send({embed: {
            color: "#2F3136",
            title: this.guild.name,
            fields: [
                {
                    name: '🖲️**SCRIM/TREINO**🖲️',
                    value: 'Utilize o comando /scrim',
            }],
        }})

        let fa = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.guildInformation[guild].channelFA)
        await fa.send({embed: {
            color: "#2F3136",
            title: this.guild.name,
            fields: [
                {
                    name: '🖲️**FREE AGENTS**🖲️',
                    value: 'Utilize o comando /fa',
            }],
        }})

        let channelJogos = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.guildInformation[guild].channelGames)
        
        let emojiValorant = this.guild.emojis.cache.find(emoji => emoji.name == 'valorant_logo')
        let emojiLOL = this.guild.emojis.cache.find(emoji => emoji.name == 'lol_logo')
        let emojiTFT = this.guild.emojis.cache.find(emoji => emoji.name == 'tft_logo')

        let valorant = new MessageButton()
            .setStyle('grey')
            .setLabel('Valorant') 
            .setID('vlr')
            .setEmoji(`${emojiValorant.id}`)
        let lol = new MessageButton()
            .setStyle('grey')
            .setLabel('League Of Legends') 
            .setID('lol')
            .setEmoji(`${emojiLOL.id}`)
        let tft = new MessageButton()
            .setStyle('grey')
            .setLabel('TFT') 
            .setID('tft')
            .setEmoji(`${emojiTFT.id}`)


        await channelJogos.send({embed: {
            color: "#2F3136",
            title: this.guild.name,
            fields: [{
                name: '🎟️JOGOS🎟️',
                value: `Clicle no botão respectivos ao jogos que você joga, para receber seus cargos! \n \n\
                ${emojiValorant} VALORANT \n \n \
                ${emojiLOL} League Of Legends \n \n \
                ${emojiTFT} TeamFight Tactics`
            }]
        }, buttons: [valorant, lol, tft]})

        let channelRules = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.guildInformation[guild].channelRules)

        await channelRules.send({embed: {
            color: "#2F3136",
            title: this.guild.name,
            fields: [{
                name: '❗**REGRAS**❗',
                value: `Reaja ao emoji para receber o cargo para ter acesso ao servidor! Lembre-se que você estará concordando com as regras do servidor!`
            }]
        }, buttons: regras})

        let channelCAMPOOL = this.guild.channels.cache.find(rChannel => rChannel.name == "campool")


        let battle = new MessageButton()
            .setStyle('url')
            .setURL('https://battlefy.com/campool-cup') 
            .setLabel('Battlefy')
            .setEmoji('881251615376568370');
        let tt = new MessageButton()
            .setStyle('url')
            .setURL('https://twitter.com/ECampool') 
            .setLabel('Twitter')
            .setEmoji('708058097205248110');

        await channelCAMPOOL.send('Redes Sociais *CAMPOOL* \n \n Link do discord = https://discord.gg/wnUmu9mkrN ||@everyone||', {buttons: [battle, tt]})
    }
}

module.exports = Installer;