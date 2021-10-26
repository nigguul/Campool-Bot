const Discord = require('discord.js');
const client = new Discord.Client()
const GuildManager = require('./src/components/GuildManager.js')
const config = require("./config.json")
const disbut = require('discord-buttons');
disbut(client);

var guildsManager = {};


const getApp = (guild) => {
  const app = client.api.applications(client.user.id)
  if (guild) {
    app.guilds(guild)
  }
  return app
}

const getClient = (client) => {
  return client
}

client.on('ready', () => {
    console.log(`Estou online`)


    client.guilds.cache.mapValues(async (guild) => {
      let membros = guild.memberCount;
      client.user.setActivity(`os ${membros} membros do CAMPOOL CUP`, { type: "LISTENING" })

      guildsManager[guild.id] = new GuildManager(guild);
      console.log(`${guild.name} - ${guild.id}`)

      const commands = await getApp(guild.id).commands.get()
      
      await getApp(guild.id).commands.post({
        data: {
          name: "scrim",
          type: 1,
          description: "Marque scrim!",
          options: [
            {
              name: "rank",
              description: "Selecione um rank",
              type: 3,
              required: true,
              choices: [
                  {
                    name: "Ferro",
                    value: "rank_ferro"
                  },
                  {
                    name: "Bronze",
                    value: "rank_bronze"
                  },
                  {
                    name: "Prata",
                    value: "rank_prata"
                  },
                  {
                    name: "Ouro",
                    value: "rank_ouro"
                  },
                  {
                    name: "Platina",
                    value: "rank_platina"
                  },
                  {
                    name: "Diamante",
                    value: "rank_diamante"
                  },
                  {
                    name: "Imortal",
                    value: "rank_imortal"
                  },
                  {
                    name: "Radiante",
                    value: "rank_radiante"
                  },
              ]
            },
            {
              name: "modelo",
              description: "Modelo do scrim",
              type: 3,
              required: true,
              choices: [
                {
                  name: "md1",
                  value: "md1"
                },
                {
                  name: "md3",
                  value: "md3"
                },
                {
                  name: "md5",
                  value: "md5"
                }
              ],
            },
            {
              name: "horario",
              description: "Horario",
              type: 3,
              required: true
            },
            {
              name: "dia",
              description: "dia",
              type: 3,
              required: true
            },
            {
              name: 'mapa',
              type: 3, 
              description: 'Mapa a ser jogado',
              required: false,
              choices: [
                {
                  name: 'Ascent',
                  value: 'ascent',
                },
                {
                  name: 'Bind',
                  value: 'bind',
                },
                {
                  name: 'Split',
                  value: 'split',
                },
                {
                  name: 'Icebox',
                  value: 'icebox',
                },
                {
                  name: 'Breeze',
                  value: 'breeze',
                },
              ],
            }
          ],
          name: 'anuncio',
          type: 1,
          description: 'Envie anuncio.',
          options: [
            {
              name: "titulo",
              description: "Titulo",
              type: 3,
              required: true
            },
            {
              name: "mensagem",
              description: "Mensagem",
              type: 3,
              required: true
            },
          ],
          name: 'time',
          description: 'Funcionalidades do time',
          options: [
            {
              name: 'add',
              description: 'Adicionar membro',
              type: 1,
              options: [
                {
                  name: 'membro',
                  description: 'Membro á ser adicionado',
                  type: 6,
                  required: true
                }
              ]
            },
            {
              name: 'rem',
              description: 'Remover membro',
              type: 1,
              options: [
                {
                  name: 'membro',
                  description: 'Membro á ser removido',
                  type: 6,
                  required: true
                }
              ]
            },
            {
              name: 'nome',
              description: 'Alterar nome do time',
              type: 1,
              options: [{
                name: 'novo-nome',
                description: 'Novo nome a ser aplicado',
                type: 3,
                required: true
              }]
            },
            {
              name: 'deletar',
              description: 'Excluir time',
              type: 1,
              options: [{
                name: 'confirmação',
                description: 'Confirmação para excluir time',
                type: 5,
                required: true
              }]
            },
          ],
          name: "fa",
          description: "Anuncie que você está FreeAgent",
          type: 1,
          options: [
            {
              name: 'rank',
              description: 'Digite seu rank',
              type: 3,
              required: true,
              choices: [
                {
                  name: "Ferro",
                  value: "rank_ferro"
                },
                {
                  name: "Bronze",
                  value: "rank_bronze"
                },
                {
                  name: "Prata",
                  value: "rank_prata"
                },
                {
                  name: "Ouro",
                  value: "rank_ouro"
                },
                {
                  name: "Platina",
                  value: "rank_platina"
                },
                {
                  name: "Diamante",
                  value: "rank_diamante"
                },
                {
                  name: "Imortal",
                  value: "rank_imortal"
                },
                {
                  name: "Radiante",
                  value: "rank_radiante"
                },
              ]
            },
            {
              name: 'agentes',
              description: 'Agentes que você joga',
              type: 3,
              required: true,
            },
            {
              name: 'horario-disponivel',
              description: 'Horario disponivel',
              type: 3,
              required: true,
            },
            {
              name: 'oque-busca',
              description: 'Digite o que busca do time',
              type: 3, 
              required: false,
            }
          ],
        },
      }).catch(console.error)
    })
  
    console.log(`Totalizando ${client.guilds.cache.keyArray().length} servidores.`)
});

client.on('guildCreate', (guild) => {
  console.log("[N] New guild " + guild.id);
  guildsManager[guild.id] = new GuildManager(guild)
})

client.on('guildDelete', (guild) => {
  console.log("[Q] Quitting from guild " + guild.id);
  guildsManager[guild.id].exitGuild();
})

client.on('message', (message) => {
  if (message.author.bot) return;
  if (message.channel.type == "dm") return;
  guildsManager[message.guild.id].throwMsg(message);
})

client.on('raw', (dados) => {
  try {
    guildsManager[dados.d.guild_id].throwReaction(dados);
    if (dados.t == "MESSAGE_REACTION_REMOVE" || dados.t == "MESSAGE_REACTION_ADD") {
      if (dados.d.user_id == client.user.id) return;
      guildsManager[dados.d.guild_id].throwReaction(dados);
    }
  } catch (err) {
  }
})

client.on('clickButton', (button) => {
  guildsManager[button.guild.id].throwInteraction(button);
})

client.on('clickMenu', (menu) => {
  guildsManager[menu.guild.id].throwMenus(menu);
})

client.ws.on('INTERACTION_CREATE', async (info) => {
  if (info.data.component_type == 2 || info.data.component_type == 3) return
  const cliente = getClient(client)

  guildsManager[info.guild_id].throwCommandsInteraction(info, cliente);
})

client.login(config['token']);