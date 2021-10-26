const { Role, Message } = require("discord.js");

class EmojiManager {
    constructor(guild, games, guildManager) {
        this.events = {};
        this.guild = guild;
        this.guildManager = guildManager;

       /* this.gamesRole = {
            'valorant_logo' : ['VALORANT'],
            'csgo_logo' : ['CSGO'],
            'r6_logo' : ['R6'],
            'lol_logo' : ['LOL'],
            'tft_logo' : ['TFT'],
        }

        this.channelHandler = { 
            [games]: (props) => {
                if (props.action == "MESSAGE_REACTION_ADD") {
                    this.addRolesToMember(props.member, this.gamesRole[props.emojiInfo.name])
                } else if (props.action == "MESSAGE_REACTION_REMOVE"){
                    this.removeRolesFromMember(props.member, this.gamesRole[props.emojiInfo.name])
                }
            },
        }*/
    }

    /*addRolesToMember(member, roles) {
        try {
            roles.forEach(role => {
                member.roles.add(this.guild.roles.cache.find(gRole => gRole.name == role))
            });
        } catch (err) {}
    }

    removeRolesFromMember(member, roles) {
        try {
            roles.forEach(role => {
                member.roles.remove(this.guild.roles.cache.find(gRole => gRole.name == role))
            });
        } catch (err) {}
    }*/
        

    throwData(info) {
        let member = this.guild.members.cache.get(info.d.user_id);

        try {
            this.channelHandler[info.d.channel_id]({
                member, 
                action: info.t, 
                emojiInfo: info.d.emoji
            })
        } catch (err) {

        }
    }

    /*on(event, callback) {
        this.events[event] = callback;
    }*/
}

module.exports = EmojiManager;