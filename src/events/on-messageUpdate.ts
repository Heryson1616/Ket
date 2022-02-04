import { Message } from "eris";
import KetClient from "../KetClient";
import db from "../components/db";
const KetUtils = new (require('../components/Core/KetUtils'))();

module.exports = class MessageUpdateEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(newMessage: any, oldMessage: Message) {
        if ((String(oldMessage?.content).trim() === String(newMessage?.content).trim() && !newMessage.editedTimestamp) || newMessage.author?.bot) return;
        const guild = await db.servers.find(newMessage.guildID)

        if (newMessage.channel.id !== guild.globalchat) return this.ket.emit("messageCreate", newMessage);

        const user = await db.users.find(newMessage.author.id),
            msgData = await db.globalchat.find(newMessage.id);

        if (user?.banned || !msgData) return;

        if (Date.now() > newMessage.timestamp + (15 * 1000 * 60) || Number(msgData.editcount) >= this.ket.config.globalchat.editLimit) return;

        msgData.messages.forEach(async data => {
            let msgID = data.split('|')[0],
                guildData = await db.servers.find(data.split('|')[1]),
                channel: any = this.ket.guilds.get(guildData.id).channels.get(guildData.globalchat),
                webhook = this.ket.webhooks.get(channel.id);

            if (!webhook) {
                webhook = await channel.getWebhooks();
                webhook = Array(webhook).filter(w => w.name === 'Ket Global Chat' && w.user.id === this.ket.user.id)[0];
                if (!webhook) return;
            }
            this.ket.editWebhookMessage(webhook.id, webhook.token, msgID, {
                content: KetUtils.msgFilter(newMessage.cleanContent),
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            }).catch(() => { })
        })

        await db.globalchat.update(msgData.id, { editcount: 'sql editcount + 1' })

    }
}