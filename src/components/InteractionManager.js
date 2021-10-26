const { Guild, Channel } = require("discord.js");
const { MessageButton } = require("discord-buttons");


class InteractionManager {
    constructor(guild, guildManager){
        this.guild = guild
        this.guildManager = guildManager

        this.events = {};

        this.ranks = {
            'rank_ferro' : 'Ferro',
            'rank_bronze' : 'Bronze',
            'rank_prata' : 'Prata',
            'rank_ouro' : 'Ouro',
            'rank_platina' : 'Platina',
            'rank_diamante' : 'Diamante',
            'rank_imortal' : 'Imortal',
            'rank_radiante' : 'Radiante',
        }

        this.url = {
            'rank_ferro' : 'https://i.imgur.com/pO8MIKR.png',
            'rank_bronze' : 'https://i.imgur.com/eZeP9hB.png',
            'rank_prata' : 'https://i.imgur.com/708n1VU.png',
            'rank_ouro' : 'https://i.imgur.com/JpjSFwN.png',
            'rank_platina' : 'https://i.imgur.com/sHJOlNu.png',
            'rank_diamante' : 'https://i.imgur.com/KmYcEox.png',
            'rank_imortal' : 'https://i.imgur.com/VQVWm7Z.png',
            'rank_radiante' : 'https://i.imgur.com/8lWKrFX.png',
        }

        this.roles = {
            'regras' : '✔️',
            'vlr' : 'VALORANT',
            'lol' : 'LOL',
            'tft' : 'TFT',
        }

        this.buttonsCommands = {
            'Criar-time' : (data, clicker) => {
                let membro = this.guild.members.cache.get(clicker)
                this.events["newTeamReq"](membro);
            },
            'scrim' : async (data, clicker) => {
                let team = this.guildManager.membersTeam[data.clicker.id]

                if (team == undefined) {
                    this.guild.members.cache.get(data.clicker.id).send({embed: {
                        color: '#2F3136',
                        description: `Você precisa ser capitão ou membro de um time!.`,
                    }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));

                    return;

                    
                }

                if (data.id == data.clicker.id || this.guildManager.teams[team].members.indexOf(data.clicker.id) != -1 || this.guildManager.membersTeam[data.id] == this.guildManager.teamOwners[data.clicker.id]) {
                    this.guild.members.cache.get(data.clicker.id).send({embed: {
                        color: '#2F3136',
                        description: `Você não pode aceitar seu proprio scrim ou do seu time.`,
                    }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                    return
                } 

                if (data.id != data.clicker.id) {
                    if (this.guildManager.membersTeam[data.clicker.id] != this.guildManager.membersTeam[data.id]) {
                        await this.guild.channels.cache.get(this.guildManager.teams[this.guildManager.membersTeam[data.id]].channel).send({embed: {
                            color: '#2F3136',
                            title: 'SCRIM ACEITO!',
                            description: `Sua solicitação de scrim foi aceitada pelo time ${this.guildManager.teams[this.guildManager.membersTeam[data.clicker.id]].name} \
                            caso queira realizar o scrim converse com eles ou procure <@${data.clicker.id}>`
                        }})
                        
                        await this.guild.channels.cache.get(this.guildManager.teams[this.guildManager.membersTeam[data.clicker.id]].channel).send({embed: {
                            color: '#2F3136',
                            title: 'SOLICITAÇÃO DE SCRIM ENVIADA!',
                            description: `Sua solicitação de scrim foi enviada para o time ${this.guildManager.teams[this.guildManager.membersTeam[data.id]].name} \
                            caso queira conversar com algum membro procure o <@${data.id}>`
                        }})
                        await data.reply.delete();
                    }
                }
                
            },
            'fa' : async (data, clicker) => {
                if (data.clicker.id == data.id) {
                    this.guild.members.cache.get(data.clicker.id).send({embed: {
                        color: '#2F3136',
                        description: 'Você nâo pode aceitar seu proprio formulario de free agent.'
                    }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                    return
                }

                if (this.guildManager.teamOwners[data.clicker.id] == undefined){
                    this.guild.members.cache.get(data.clicker.id).send({embed: {
                        color: '#2F3136',
                        description: 'Você precisa ser capitão de um time.'
                    }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                    return
                }
                
                if (this.guildManager.teamOwners[data.clicker.id] != undefined) {
                    await this.guild.members.cache.get(data.id).send({embed: {
                        color: '#2F3136',
                        title: 'SISTEMA FREE AGENT',
                        description: `Sua solicitação de free agent foi aceita pelo time ${this.guildManager.teams[this.guildManager.teamOwners[data.clicker.id]].name} e o capitão é o <@${data.clicker.id}>`
                    }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                    await this.guild.channels.cache.get(this.guildManager.teams[this.guildManager.membersTeam[data.clicker.id]].channel).send({embed: {
                        color: '#2F3136',
                        title: 'SISTEMA FREE AGENT',
                        description: `Você aceitou a solicitação de free agent do <@${data.id}>, entre em contato com ele ou adicione ele no time!`
                    }})
                    await data.reply.delete();
                    return
                }
                
            }
        }

        this.slashCommands = {
            'scrim' : async (info, client) => {
                if (info.channel_id != this.guildManager.guildInformation[this.guild.id].channelScrim) {
                    this.guild.members.cache.get(info.member.user.id).send({embed: {
                        color: '#2F3136',
                        description: `Este comando deve ser utilizado no canal "SCRIM" no discord!`
                    }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                    return
                }
                let team = info.member.user.id 
        
                if (this.guildManager.membersTeam[info.member.user.id] == undefined) {
                    this.guild.members.cache.get(info.member.user.id).send({embed: {
                        color: '#2F3136',
                        description: 'Você não possui time! Você precisa ser capitão ou membro de um time.'
                    }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                    return
                }   

                let mapa
                
                /*if (info.data.options[4].value == undefined){
                    mapa = 'Não selecionado.'
                } else if (info.data.options[4].value != undefined) {
                    mapa = info.data.options[4].value
                }*/

                let embed = {
                    color: 0x2F3136,
                    title: 'SCRIM',
                    description: `<@${info.member.user.id}> esta procurando um scrim, descrição do scrim :`,
                    thumbnail: {url: this.url[info.data.options[0].value]},
                    fields: [
                        {
                            name: 'RANK',
                            value: `${this.ranks[info.data.options[0].value]}`,
                            inline: true
                        },
                        {
                            name: 'MODELO',
                            value: `${info.data.options[1].value}`,
                            inline: true
                        },
                        {
                            name: 'HORARIO',
                            value: `${info.data.options[2].value}`,
                            inline: true
                        },
                        {
                            name: 'DIA',
                            value: `${info.data.options[3].value}`,
                            inline: true
                        },
                        /*{
                            name: 'MAPA',
                            value: `${mapa}`,
                            inline: true,
                        }*/
                    ],
                    timestamp: new Date(),
                }
        
                await client.api.interactions(info.id, info.token).callback.post({data: {
                    type: 4,
                    data: {
                        embeds: [ embed ],
                        components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: "ACEITAR",
                                    style: 3,
                                    custom_id: `${team}`
                                }
                            ] 
                        }]
                    }
                }})
            },
            'anuncio' : async (info, client) => {
                let member = this.guild.members.cache.get(info.member.user.id)

                if (member.hasPermission('ADMINISTRATOR')) {

                    let embed = {
                        color: 0x2F3136,
                        title: info.data.options[0].value,
                        description: `${info.data.options[1].value}`,
                        timestamp: new Date(),
                    }

                    await client.api.interactions(info.id, info.token).callback.post({data: {
                        type: 4,
                        data: {
                        embeds: [ embed ],
                        }
                    }})
                }
            },
            'time' : async (info, client) => {
                try {
                    let team = this.guildManager.teamOwners[info.member.user.id]
                    if (team == undefined) {
                        this.guild.members.cache.get(info.member.user.id).send({embed: {
                            color: 0x2F3136,
                            description: `Você não é capitão de um time.`,
                        }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                        return
                    }
    
                    let channelTeam = this.guildManager.teams[team].channel
    
                    if (info.channel_id != channelTeam) {
                        this.guild.members.cache.get(info.member.user.id).send({embed: {
                            color: 0x2F3136,
                            description: `Você deve utilizar esse comando no canal do seu time!`,
                        }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                        return
                    }
    
                    if (this.guildManager.teams[team].owner != info.member.user.id) {
                        this.guild.members.cache.get(info.member.user.id).send({embed: {
                            color: 0x2F3136,
                            description: `Você não é o capitão do seu time`,
                        }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                        return
                    }
    
                    if (info.channel_id == channelTeam && info.data.options[0].name == 'add') {
    
                        if (this.guildManager.teams[team].members.length >= 6) {
                            let embed = {
                                color: 0x2F3136,
                                title: "⛔ TIME CHEIO ⛔",
                                description: `Remova alguem para adicionar uma nova pessoa.`,
                            }
            
                            await client.api.interactions(info.id, info.token).callback.post({data: {
                                type: 4,
                                data: {
                                embeds: [ embed ],
                                }
                            }})
                            return
                        } 
                        
                        let idMembro = info.data.options[0].options[0].value
                        let membro = this.guild.members.cache.get(idMembro)
    
                        if (this.guildManager.membersTeam[idMembro] == undefined){   
                            this.guildManager.teams[team].members.push(idMembro);
                            this.guildManager.membersTeam[idMembro] = team;
        
                            this.guildManager.writeJSON();
        
                            let role = this.guild.roles.cache.find(rRole => rRole.id == this.guildManager.teams[team].role)
                            
                            if (role != undefined) {
                                membro.roles.add(this.guild.roles.cache.find(rRole => rRole.name == team));
                            }
        
                            let embed = {
                                color: 0x2F3136,
                                title: "✅ MEMBRO ADICIONADO ✅",
                                description: `${membro.user.username} adicionado!`,
                            }
            
                            await client.api.interactions(info.id, info.token).callback.post({data: {
                                type: 4,
                                data: {
                                embeds: [ embed ],
                                }
                            }})
                        } else if (this.guildManager.membersTeam[idMembro] != undefined) {
                            let embed = {
                                color: 0x2F3136,
                                title: "🟡 MEMBRO COM TIME! 🟡",
                                description: `${membro.user.username} está no time ${this.guildManager.teams[this.guildManager.membersTeam[idMembro]].name}.!`,
                            }   
            
                            await client.api.interactions(info.id, info.token).callback.post({data: {
                                type: 4,
                                data: {
                                embeds: [ embed ],
                                }
                            }})
                            return
                        }
                        this.guild.members.cache.get(idMembro).send({embed: {
                            color: 0x2F3136,
                            title: "❗ NOTIFICAÇÃO ❗",
                            description: `<@${idMembro}> foi adicionado no time ${this.guildManager.teams[team].name}, caso queira sair digite .sair no chat do time na categoria "TIMES"`,
                        }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                    }
    
                    if (info.channel_id == channelTeam && info.data.options[0].name == 'rem') {
                        let idMembro = info.data.options[0].options[0].value
                        let membro = this.guild.members.cache.get(idMembro)
    
                        if (this.guildManager.teams[team].members.indexOf(idMembro) == -1) {
                            let embed = {
                                color: 0x2F3136,
                                title: "🔵 INFO MEMBRO 🔵",
                                description: `Talvez ele não deve estar no time ... 😅 `,
                            }
                            await client.api.interactions(info.id, info.token).callback.post({data: {
                                type: 4,
                                data: {
                                embeds: [ embed ],
                                }
                            }})
                            return
                        }
    
                        if (this.guildManager.membersTeam[idMembro] == team){
    
                            let posMember = this.guildManager.teams[team].members.indexOf(idMembro);
                            this.guildManager.teams[team].members.splice(posMember, 1);
                            this.guildManager.membersTeam[idMembro] = undefined;
    
                            this.guildManager.writeJSON();
    
                            let role = this.guild.roles.cache.find(rRole => rRole.id == this.guildManager.teams[team].role)
                            if (role != undefined) {
                                membro.roles.remove(this.guild.roles.cache.find(rRole => rRole.name == team));
                            }
    
                            let embed = {
                                color: 0x2F3136,
                                title: "❌ MEMBRO REMOVIDO ❌",
                                description: `${membro.user.username} removido!`,
                            }
                            
                            await client.api.interactions(info.id, info.token).callback.post({data: {
                                type: 4,
                                data: {
                                embeds: [ embed ],
                                }
                            }})
                        }
                    }
    
                    if (info.data.options[0].name == 'nome') {
                        if (info.channel_id != this.guildManager.teams[team].channel || this.guildManager.teams[team].owner != info.member.user.id) {
                            this.guild.members.cache.get(info.member.user.id).send({embed: {
                                color: 0x2F3136,
                                title: "❗ NOTIFICAÇÃO ❗",
                                description: `Comando não pode ser executado, isso pode acontecer por que você enviou o comando no canal diferente do seu time ou você não é capitao da equipe!`,
                            }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                            return
                        }

                        //this.guildManager.teams[team].name = info.data
                    }

                    if (info.data.options[0].name == 'deletar') {
                        /*if (membro.hasPermission("ADMINISTRATOR")) {
                            for (let i = 0; i < this.guildManager.teams[team].members.length; i++) {
                                await delete this.guildManager.membersTeam[this.guildManager.teams[team].members[i]];
                                this.guildManager.writeJSON();
                            }
                            membro.roles.remove(this.guild.roles.cache.find(rName => rName.name == 'CAPITÃO'))
                            
                            delete this.guildManager.teamOwners[this.guildManager.teams[team].owner]
                            delete this.guildManager.membersTeam[this.guildManager.teams[team].owner]
                            delete this.guildManager.teams[team]

                            this.guildManager.writeJSON();
                        }*/

                        if (info.channel_id != this.guildManager.teams[team].channel || this.guildManager.teams[team].owner != info.member.user.id) {
                            this.guild.members.cache.get(info.member.user.id).send({embed: {
                                color: 0x2F3136,
                                title: "❗ NOTIFICAÇÃO ❗",
                                description: `Comando não pode ser executado, isso pode acontecer por que você enviou o comando no canal diferente do seu time ou você não é capitao da equipe!`,
                            }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                            return
                        }
        
                        if (info.member.user.id == this.guildManager.teams[team].owner && info.data.options[0].options[0].value == true){
                            let channel = this.guild.channels.cache.find(rChannel => rChannel.id == this.guildManager.teams[team].channel)
                            let role = this.guild.roles.cache.find(rRole => rRole.id == this.guildManager.teams[team].role)
                            let membro = this.guild.members.cache.get(this.guildManager.teams[team].owner)


                            if (channel != undefined) {
                                channel.delete();
                            }
    
                            if (role != undefined) {
                                role.delete();
                            }

                            for (let i = 0; i < this.guildManager.teams[team].members.length; i++) {
                                await delete this.guildManager.membersTeam[this.guildManager.teams[team].members[i]];
                                this.guildManager.writeJSON();
                            }
                            membro.roles.remove(this.guild.roles.cache.find(rName => rName.name == 'CAPITÃO'))
                            
                            delete this.guildManager.teamOwners[this.guildManager.teams[team].owner]
                            delete this.guildManager.membersTeam[this.guildManager.teams[team].owner]
                            delete this.guildManager.teams[team]

                            this.guildManager.writeJSON();
        
                            this.guildManager.messagesManager.atualizarRanking();
                        } else if (info.data.options[0].options[0].value == false) return
                    }
                } catch (err) {
                }
            },
            'del' : (info, channel) => {
                return
            },
            'fa' : async (info, client) => {
                if (this.guildManager.membersTeam[info.member.user.id] != undefined) {
                    this.guild.members.cache.get(info.member.user.id).send({embed: {
                        color: 0x2F3136,
                        description: `Você está no time ${this.guildManager.teams[this.guildManager.membersTeam[info.member.user.id]].name} saia dele para ficar free agent.`,
                    }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                    return
                }

                if (info.channel_id != 884590198409809990){
                    this.guild.members.cache.get(info.member.user.id).send({embed: {
                        color: 0x2F3136,
                        description: 'Canal errado para o uso do comando! Envie no canal Free agents',
                    }}).catch(() => console.log("Nao posso enviar mensagem para o membro"));
                    
                    return
                }

                let rank = info.data.options[0].value
                let agentes = info.data.options[1].value
                let horarioDisponivel = info.data.options[2].value
                var sobre = info.data.options[3]

                if (sobre == undefined) {
                    sobre = 'Não declarado.'
                } else {
                    sobre = info.data.options[3].value
                }

                let embed = {
                    color: 0x2F3136,
                    title: 'FREE AGENT',
                    description: `<@${info.member.user.id}> está F/A à procura de um time, infomações dele abaixo:`,
                    thumbnail: {url: this.url[rank]},
                    fields: [
                        {
                            name: 'Rank',
                            value: this.ranks[rank], 
                            inline: true, 
                        },
                        {
                            name: 'Agentes',
                            value: agentes,
                            inline: true,
                        },
                        {
                            name: 'Horario disponível',
                            value: horarioDisponivel,
                            inline: true,
                        },
                        {
                            name: 'O que busca',
                            value: sobre,
                            inline: true,
                        }
                    ]
                }
                await client.api.interactions(info.id, info.token).callback.post({data: {
                    type: 4,
                    data: {
                    embeds: [ embed ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: "CONVIDAR PARA O TIME",
                                    style: 3,
                                    custom_id: `${info.member.user.id}`
                                }
                            ] 
                        }]
                    }
                }})
            }    
        }
    }
    async throwInfo(data) {
        try {
            await data.reply.defer()
            if (this.roles[data.id] != undefined) { 
                this.addRoleMember(data.clicker.id, this.roles[data.id])
                return
            }

            if (data.channel.id == this.guildManager.guildInformation[this.guild.id].channelScrim) {
                this.buttonsCommands['scrim'](data, data.clicker.id)
            }
            
            if (data.channel.id == 884590198409809990){
                this.buttonsCommands['fa'](data, data.clicker.id)
            }

            this.buttonsCommands[data.id](data, data.clicker.id)

        } catch (err) {
        }
    }

    async throwCommands(info, client) {
        try {
            console.log(info)
            this.slashCommands[info.data.name](info, client)
        } catch (err) {
        }
    }
    
    on(event, callback) {
        this.events[event] = callback;
    }

    addRoleMember(member, role) {
        let membro = this.guild.members.cache.get(member)
        
        if (membro.roles.cache.find(rRole => rRole.name == role) == undefined){
            membro.roles.add(this.guild.roles.cache.find(gRole => gRole.name == role));
        } else {
            membro.roles.remove(this.guild.roles.cache.find(gRole => gRole.name == role));
        }
    }
}




module.exports = InteractionManager;