import { TRUSTED_BOTS, DEVS, guilds, DEFAULT_PREFIX, DEFAULT_LANG } from "../../JSON/settings.json";
import { getContext, getColor } from "../../Components/Commands/CommandStructure";
import { PostgresClient } from "../../Components/Typings/Database";
import { Message } from "eris";
import KetClient from "../../Main";
import KetUtils from "../../Components/Core/KetUtils";
import DMexec from "../../Packages/Home/_DMClient";
import getT from "../../Components/Core/LocalesStructure";

module.exports = class MessageCreateEvent {
    ket: KetClient;
    postgres: PostgresClient;
    KetUtils;
    constructor(ket: KetClient, postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
        this.KetUtils = new (KetUtils)(this.ket, this.postgres);
    }
    async on(message: Message<any>) {
        if (message.author?.bot && !TRUSTED_BOTS.includes(message.author.id)) return;
        if (!message.guildID || message.channel.type === 1 || message.channel.parentID === guilds.dmCategory)
            return DMexec(message, this.ket, message.channel.parentID === guilds.dmCategory);

        let server = await this.postgres.servers.find(message.guildID, true),
            user = await this.postgres.users.find(message.author.id),
            t = getT(user?.lang || DEFAULT_LANG),
            ctx = getContext({ ket: this.ket, postgres: this.postgres, message, server, user, t });

        if (user?.banned) return;
        if (server.banned) return ctx.guild.leave();
        if (server.globalchat && ctx.cID === server.globalchat) this.KetUtils.sendGlobalChat(ctx);

        const prefixRegex = new RegExp(`^(${String(user?.prefix || DEFAULT_PREFIX).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.ket.user.id}>)( )*`, 'gi')
        if (!message.content.match(prefixRegex)) return;
        let args: string[] = message.content.replace(prefixRegex, '').trim().split(/ /g),
            commandName: string | null = args.shift().toLowerCase(),
            command = this.ket.commands.get(commandName) || this.ket.commands.get(this.ket.aliases.get(commandName));

        if (!command && (command = await this.KetUtils.commandNotFound(ctx, commandName)) === false) return;
        ctx = getContext({ ket: this.ket, postgres: this.postgres, user, server, message, args, command, commandName, t })

        await this.KetUtils.checkCache(ctx);
        ctx.user = await this.KetUtils.checkUserGuildData(ctx);
        ctx.t = getT(ctx.user.lang);

        if (await this.KetUtils.checkPermissions({ ctx }) === false) return;
        if (ctx.command.permissions.onlyDevs && !DEVS.includes(ctx.uID)) return ctx.send({
            emoji: 'negado', content: {
                embeds: [{
                    color: getColor('red'),
                    description: t('events:isDev')
                }]
            }
        })

        await this.postgres.users.update(ctx.uID, { commands: user.commands + 1 });

        new Promise(async (res, rej) => {
            try {
                ctx.command.dontType ? null : await ctx.channel.sendTyping().catch(() => { });
                await command.execute(ctx);
                res(this.KetUtils.sendCommandLog(ctx));
            } catch (error) {
                res(this.KetUtils.CommandError(ctx, error));
            }
            return;
        })
        return;
    }
}