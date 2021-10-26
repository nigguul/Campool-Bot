const { MessageMenu, MessageMenuOption } = require("discord-buttons");


class FormChannel {
    constructor(guild, member, channel, questions){
        this.guild = guild;
        this.channel = channel;
        this.questions = questions;
        this.maxMessages = questions.length;
        this.messageIndex = 0;
        this.timeout = undefined;
        this.member = member;

        this.data = [];
        this.onEnd = null;
        
        this.sendQuestion(0)
    }

    checkChannel(channelID) {
        let channel = this.guild.channels.cache.get(channelID);
        return channel != undefined;
    }
    
    throwMessage(msg) {
        this.data.push(msg);

        if (this.timeout != undefined) clearTimeout(this.timeout);

        this.messageIndex++;

        if (this.messageIndex == 3) {
            this.channel.updateOverwrite(this.member, { SEND_MESSAGES: true })
        }

        if (this.messageIndex == this.maxMessages) {
            if (this.channel != undefined) {
                try {
                    if (this.checkChannel(this.channel.id)) {
                        this.channel.delete();
                    }
                } catch (err) {
                }
            }
            this.onEnd(this.data);
        } else if (this.data.length == 2){
            this.sendMenu()
        } else {
            this.sendQuestion(this.messageIndex)
        }
    }

    sendQuestion(index) {
        let embed = {
            color: '#2F3136',
            title: "FORMULÁRIO",
            description: "Você está realizando um formulário, siga os passos á seguir.\n \n Lembrando que você tem **10** minutos para realiza-lo \n\n",
            fields: [
                {
                    name: `${index + 1} Pergunta`,
                    value: this.questions[index]
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Aguandando resposta',
                icon_url: 'https://www.blogson.com.br/wp-content/uploads/2017/10/loading-gif-transparent-10.gif',
            },
        }

        this.channel.send({embed: embed}).then(() => {
            this.timeout = setTimeout(() => {
                if (this.channel != undefined){
                    if (this.checkChannel(this.channel.id)) {
                        this.channel.delete();
                    }
                }
            }, 600 * 1000)
        })

        this.channel.send(`||<@${this.member.id}>||`)
    }

    sendMenu() {
        let vermelho = new MessageMenuOption()
            .setLabel('Vermelho')
            .setEmoji('🔴')
            .setValue('#FF0000')
        let branco = new MessageMenuOption()
            .setLabel('Branco')
            .setEmoji('⚪')
            .setValue('#FFFFFF')
        let preto = new MessageMenuOption()
            .setLabel('Preto')
            .setEmoji('⚫')
            .setValue('#000000')
        let azul = new MessageMenuOption()
            .setLabel('Azul')
            .setEmoji('🔵')
            .setValue('#00609D')
        let marrom = new MessageMenuOption()
            .setLabel('Marrom')
            .setEmoji('🟤')
            .setValue('#2D1100')
        let roxo = new MessageMenuOption()
            .setLabel('Roxo')
            .setEmoji('🟣')
            .setValue('#8000FF')
        let verde = new MessageMenuOption()
            .setLabel('Verde')
            .setEmoji('🟢')
            .setValue('#00ff00')
        let amarelo = new MessageMenuOption()
            .setLabel('Amarelo')
            .setEmoji('🟡')
            .setValue('#ffff00')
        let laranja = new MessageMenuOption()
            .setLabel('Laranja')
            .setEmoji('🟠')
            .setValue('#FF7C00')
            
        let CoresSelect = new MessageMenu()
            .setID('corTime')
            .setPlaceholder('Escolha a cor seu time.')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions(vermelho, branco, preto, azul, marrom, roxo, amarelo, verde, laranja)

        this.channel.send('Escolha a cor do seu time!', CoresSelect);

        this.channel.updateOverwrite(this.member, { SEND_MESSAGES: false })
    }
}

module.exports = FormChannel;