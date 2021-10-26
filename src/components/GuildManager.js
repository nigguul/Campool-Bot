const EmojiManager = require('./EmojiManager.js')
const Installer = require('./Installer.js')
const FormChannel = require('./FormChannel.js')
const MessagesManager = require('./MessageManager.js')
const InteractionManager = require('./InteractionManager.js')

const fs = require('fs');

class ServidorMain {
    constructor(guild) {
      this.guild = guild;
      this.jsonPath = `src/GuildInfo/${guild.id}`;

      this.membersTeam = {};
      this.creationChannels = {};
      this.teams = {};
      this.teamOwners = {};
      this.guildInformation = {};
      this.rankingPlayers = {};

      this.guildInformation[guild.id] = {
        installed: false,
        channelRules: '',
        channelGames: '',
        channelRankingTimes: '',
        channelRankingMVP: '',
        channelTimes: '',
        channelNovosTimes: '',
        channelScrim: '',
        channelFA: '',
      }

      this.checkFolder();

      if (this.guildInformation[guild.id].installed == false){
        this.checkInstall(this.guild, () => {
          this.setup();
        });
      } else {
        this.setup();
      }
    }

    setup() {

      this.messagesManager= new MessagesManager(this.guild, this);

      this.interactionManager= new InteractionManager(this.guild, this);

      this.roleEveryone = this.guild.roles.cache.find(roles => roles.name == '@everyone');

      let games = this.guildInformation[this.guild.id].channelGames
      
      this.emojiManager = new EmojiManager(this.guild, games, this);

      this.interactionManager.on("newTeamReq", (member) => {
        this.guild.channels.create('form-criacao-time', {
          type: 'text',
          parent: this.guild.channels.cache.find(rCat => rCat.name == "TIMES3"),
          permissionOverwrites: [
              {
                  id: member.id,
                  allow: ['VIEW_CHANNEL'],
              },
              {
                  id: this.roleEveryone,
                  deny: ['VIEW_CHANNEL'],
              },
          ],
        }).then((channel) => {
          this.creationChannels[channel.id] = new FormChannel(this.guild, member, channel, [
            "\n Qual o nome do time? \n \n Ex: Campool Team",
            "\n Qual a TAG do time? **OBS: MAXÍMO 4 CARACTERES.** \n \n Ex: CPM",
            "MessageMenu",
            "\n Seu time tem logo? Caso sim envie ou mande ele aqui. \n \n Caso não tenha logo, digite → não ←",
          ]);

          this.creationChannels[channel.id].onEnd = (data) => {
            let tag = data[1]

            if (tag.length > 4) {
              return
            } else {
              tag = tag.toUpperCase();
            }

            if (this.teams[data[1]] != undefined){
              this.guild.members.cache.get(member.id).send({embed: {
                color: '#c21313',
                title: `❗ NOTIFICAÇÃO ❗`,
                description: `Tag utilizada na criação de time em uso. \n\n Tag utilizada - ${tag}`,
              }})
              return;
            }
              
            if (this.teamOwners[member.id] != undefined) {
              this.guild.members.cache.get(member.id).send({embed: {
                color: '#c21313',
                title: `❗ NOTIFICAÇÃO ❗`,
                description: `Você ja possui time. \n\n Seu time - ${this.teams[this.teamOwners[member.id]].name}`,
              }})
              return;
            }
              
            if (this.membersTeam[member.id] != undefined) {
              this.guild.members.cache.get(member.id).send({embed: {
                color: '#c21313',
                title: `❗ NOTIFICAÇÃO ❗`,
                description: `Você ja está em um time. \n\n Seu time - ${this.teams[this.membersTeam[member.id]].name}`,
              }})
              return;
            }

            this.guild.roles.create({
              data:{
                name: tag,
                color: data[2]
              },
              reason: `Time criado com o nome ${data[0]}, TAG ${tag}, com o capitao ${member.user.username} e a cor ${data[2]}`
            }).then(() => {
              let logo = data[3]
              logo.toLowerCase();

              if (logo == "não" || logo == "nao" || logo.startsWith('https://') == false){
                data[3] = "https://i.imgur.com/bqb8Trs.png"
              }

              let roleTeam = this.guild.roles.cache.find(rTeam => rTeam.name == tag)
              let roleCapitain = this.guild.roles.cache.find(rTeam => rTeam.name == 'CAPITÃO')
              
              member.roles.add(roleTeam);
              member.roles.add(roleCapitain);
              
              let channelNewTeam = this.guild.channels.cache.find(channel => channel.id == this.guildInformation[this.guild.id].channelNovosTimes)
              channelNewTeam.send({embed: {
                  color: data[2],
                  title: "CAMPOOL",
                  description: "Novo time criado!",
                  thumbnail: {url: data[3]},
                  fields: [{
                      name: "⠀",
                      value: `Nome do time: **${data[0]}** \n \n Tag do time: **${tag}** \n \n Capitão do time: **${member.user}** \n \n Sejam bem vindos!`
                    },
                  ],
                  timestamp: new Date(),
                }
              })

              this.guild.channels.create(tag, {
                type: 'text',
                parent: this.guild.channels.cache.find(rCat => rCat.name == "TIMES3"),
                permissionOverwrites: [
                    {
                        id: this.roleEveryone,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: roleTeam,
                        allow: ['VIEW_CHANNEL'],
                    }
                ],
              }).then(() => {
                tag = tag.toString()
                this.channelTagTeam = tag.toLowerCase()
                this.channelTeam = this.guild.channels.cache.find(channel => channel.name == this.channelTagTeam)

                this.messagesManager.onNewTeam(this.channelTeam,({embed: {
                    color: '#2F3136',
                    title: "Recepção",
                    description: `Sejam bem vindo ${data[0]} ao ${this.guild.name}`,
                    fields: [{
                      name: "⠀",
                      value: `Obrigado por participar do nosso servidor! \
                      Desejamos muita sorte e competitividade em nossos campeonatos! \
                      ${this.guild.name} agradeçe o carinho ♥. \
                      \n\n ${member.user} como você é o capitão você tem acesso á alguns comandos: \
                      \n\n /time add - Adicionar membro no time.\ 
                      \n /time rem - Remover membro do time.\
                      \n\n /time deletar - Deletar o time. \ 
                      \n\n Todos os membros possuem os seguintes comandos: \
                      \n\n .pontos - Saber quantos pontos seu time possui.\
                      \n\n .infotime - Informações do time`
                    }]
                  }
                }))

                this.teams[tag] = {
                  name: data[0],
                  owner: member.id,
                  members: [],
                  channel: this.channelTeam.id,
                  role: roleTeam.id,
                  color: data[2],
                  rank: undefined,
                  points: 0
                }

                this.membersTeam[member.id] = tag;

                this.teamOwners[member.id] = tag;

                this.writeJSON();

                this.messagesManager.atualizarRanking();
              }) 
            });

            this.creationChannels[channel.id] = undefined;
          }
        });
      })
    }

    throwMsg(msg) {
          this.messagesManager.throwMessages(msg);

          if (this.creationChannels[msg.channel.id] != undefined) {
            var message = msg
            const getLink = (msg.attachments.map(rLink => rLink.url))
            var link = getLink.join("")

            if (link == '') {
              message = msg.content
            } else {
              message = link
            }

            this.creationChannels[msg.channel.id].throwMessage(message);
            return;
          }
      }

    throwReaction(data) {
      this.emojiManager.throwData(data);
    }

    throwInteraction(data) {
      this.interactionManager.throwInfo(data);
    }

    async throwMenus(data) {
      let form = this.creationChannels[data.channel.id];
      if (form != undefined) {
        await data.reply.defer()
        form.throwMessage(data.values[0]);
      }
    }

    throwCommandsInteraction(data, client) {
      this.interactionManager.throwCommands(data, client)
    }

    checkInstall(guild, cb) {
      this.installer = new Installer(guild, this);
      this.installer.install(cb)
    }

    exitGuild(){
      if (fs.existsSync(this.jsonPath)) {
        fs.rmSync(this.jsonPath, { recursive: true, force: true })
      }
    }

    checkFolder() {
      if (fs.existsSync(this.jsonPath)) {
        this.loadJSON();
      } else {
        fs.mkdirSync(this.jsonPath);
        this.writeJSON();
      }
    }

    loadJSON() {
      let teamsData = fs.readFileSync(this.jsonPath + '/teams.json');
      this.teams = JSON.parse(teamsData);

      let teamOwners = fs.readFileSync(this.jsonPath + '/teamOwners.json');
      this.teamOwners = JSON.parse(teamOwners);

      let membersTeam = fs.readFileSync(this.jsonPath + '/membersTeam.json');
      this.membersTeam = JSON.parse(membersTeam);

      let guildInformation = fs.readFileSync(this.jsonPath + '/guildInformation.json');
      this.guildInformation = JSON.parse(guildInformation);

      let rankingPlayers = fs.readFileSync(this.jsonPath + '/rankingPlayers.json');
      this.rankingPlayers = JSON.parse(rankingPlayers);
    }

    writeJSON() {
      fs.writeFileSync(this.jsonPath + '/teams.json', JSON.stringify(this.teams));
      fs.writeFileSync(this.jsonPath + '/teamOwners.json', JSON.stringify(this.teamOwners));
      fs.writeFileSync(this.jsonPath + '/membersTeam.json', JSON.stringify(this.membersTeam));
      fs.writeFileSync(this.jsonPath + '/guildInformation.json', JSON.stringify(this.guildInformation));
      fs.writeFileSync(this.jsonPath + '/rankingPlayers.json', JSON.stringify(this.rankingPlayers));
    }
}



module.exports = ServidorMain;