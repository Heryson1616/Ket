import KetClient from "../../Main";
import settings, { statusMsg } from "../../JSON/settings.json";
import { CommandInteraction, EmbedField, EmbedFooter, EmbedImage, Guild, GuildTextableChannel, Member, Message, Shard, TextableChannel, User } from "eris";
import { duration } from "moment";
import { CommandContextFunc } from "../Typings/Modules";

export default class CommandStructure {
    ket: KetClient;
    config: object;

    constructor(ket: KetClient, config) {
        this.config = {
            name: config.name || null,
            aliases: config.aliases || [],
            cooldown: config.cooldown || 3,
            permissions: config.permissions || {
                user: [],
                bot: [],
                onlyDevs: false
            },
            access: config.access || {
                DM: false,
                Threads: false
            },
            dontType: config.dontType || false,
            testCommand: config.testCommand || [],
            data: config.data || null
        }
        this.ket = ket;
    }
}

export class EmbedBuilder {
    fields: EmbedField[];
    author: object;
    description: string;
    color: number;
    file: object[];
    footer: EmbedFooter;
    image: EmbedImage;
    timestamp: Date;
    title: string;
    thumbnail: { url: string };
    url: string;

    constructor() {
        this.fields = [];
        this.author = null;
        this.description = null;
        this.color = null;
        this.file = null;
        this.footer = null;
        this.image = null;
        this.timestamp = null;
        this.title = null;
        this.thumbnail = null;
        this.url = null;
    }
    setAuthor(name: string, icon_url: string, url: string = null) {
        this.author = { name, icon_url, url };
        return this;
    }
    setTitle(title: string) {
        this.title = title;
        return this;
    }
    setDescription(description: string | number | void, code: string = null) {
        this.description = String(description).toString().substring(0, 3072)
        if (code) this.description = `\`\`\`${code}\n${this.description}\n\`\`\``;
        return this;
    }
    addField(name: string, value: string, inline: boolean = false, code: string = null) {
        if (!name || this.fields.length >= 25) return this;
        if (!value) return;
        value = value.toString().substring(0, 1024);
        if (code) value = `\`\`\`${code}\n${value}\`\`\``;
        this.fields.push({ name: name.toString().substring(0, 256), value: value, inline });
        return this;
    }
    addBlankField(inline: boolean = false) {
        this.addField('\u200B', '\u200B', inline);
        return this;
    }
    setColor(color: number | string) {
        const colors = {
            red: "#ff1500",
            orange: "#ff8c00",
            yellow: "#fdff00",
            green: "#25ff00",
            hardgreen: "#0d7200",
            blue: "#2391ff",
            hardblue: "#0025ff",
            hardpurple: "#4b0082",
            purple: "#9400d3",
            pink: "#ff007f",
        };
        if (colors[color]) this.color = parseInt((colors[color]).replace('#', ''), 16);
        else this.color = parseInt((String(color).replace('#', '')), 16)
        return this;
    }
    setImage(image, height = null, width = null) {
        this.image = {
            url: image
        };
        if (height) this.image.height = height;
        if (width) this.image.width = width;
        return this;
    }
    setTimestamp(timestamp = new Date()) {
        this.timestamp = timestamp;
        return this;
    }
    setUrl(url: string) {
        this.url = url;
        return this;
    }
    setFooter(text: string, iconUrl: string = null) {
        this.footer = {
            text: text.toString().substring(0, 2048),
            icon_url: iconUrl
        };
        return this;
    }
    setThumbnail(url: string) {
        this.thumbnail = { url };
        return this;
    }
    build() {
        return this;
    }
}

export function getEmoji(emoji: string) {
    let emojis = {
        autorizado: "<:autorizado:765952397595639828>",
        negado: "<:negado:765952453203984404>",
        cristal: "<a:cristal:789542971011104808>",
        carregando: "<a:carregando:765952420575444994>",
        axo: "<a:axo:904961545811951636>",
        sireneBlue: "<a:emergencia2:783149286342787102>",
        sireneRed: "<a:emergencia:770106111381864458>",
        online: '<:online:817023347396706324>',
        idle: '<:idle:817023347723730944>',
        offline: '<:offline:817024931619274762>'
    };
    const emojiFilter = String(emojis[emoji]).replace('<a:', '').replace('<:', '').replace('>', '').trim().split(':')
    const emojiObj = {
        name: emojiFilter[0],
        id: (emojiFilter[1] !== undefined) ? emojiFilter[1] : emojiFilter[0],
        mention: String(emojis[emoji]),
        reaction: (emojiFilter[1] !== undefined) ? `${emojiFilter[0]}:${emojiFilter[1]}` : `${emojiFilter[0]}`
    }
    return emojiObj;
}

export function getColor(color: string, toNumber = true) {
    const colors = {
        red: "#ff1500",
        orange: "#ff8c00",
        yellow: "#fdff00",
        green: "#25ff00",
        hardgreen: "#0d7200",
        blue: "#2391ff",
        hardblue: "#0025ff",
        hardpurple: "#4b0082",
        purple: "#9400d3",
        pink: "#ff007f",
    };
    if (colors[color]) {
        if (toNumber) return parseInt((colors[color]).replace('#', ''), 16);
        return colors[color];
    } else return parseInt((color.replace('#', '')), 16)
}

export class CommandContext {
    prisma: Prisma;
    config: any;
    env: Message<any> | CommandInteraction<any>;
    send: Function;
    user: any;
    server: any;
    args: any[];
    author: User;
    uID: string;
    member: Member;
    guild: Guild;
    gID: string;
    me: Member;
    shard: Shard;
    channel: TextableChannel | GuildTextableChannel;
    cID: string;
    command: any;
    commandName: string;
    t: Function;
}

export function getContext({ ket, prisma, message, interaction, user, server, args, command, commandName, t }: CommandContextFunc) {
    let ctx = message ? message : interaction;
    return {
        prisma: prisma,
        config: settings,
        env: message ? message : interaction,
        send: (args) => (args.ctx = ctx) && ket.send(args),
        user: user,
        server: server,
        args: args,
        author: (message ? message.author : ctx.member.user),
        uID: (message ? message.author : ctx.member.user).id,
        member: ctx.member,
        guild: ctx.channel.guild,
        gID: ctx.guildID,
        me: ctx.channel.guild.members.get(ket.user.id),
        shard: ctx.channel.guild.shard,
        channel: ctx.channel,
        cID: ctx.channel.id,
        command: command?.config,
        commandName: commandName,
        t: t
    } as CommandContext;
}

export async function infoEmbed(shardID: number, ket: KetClient) {
    let embed = {
        color: getColor('blue'),
        title: `${getEmoji('carregando').mention} **Bot Status** ${getEmoji('carregando').mention}`,
        description: 'Bot Uptime 🗓️: ' + (ket.startTime === 0 ? 'Iniciando...' : duration(Date.now() - ket.startTime).format('dd[d] hh[h] mm[m] ss[s]')).encode('fix'),
        fields: [
            { name: 'Users 👥:', value: ket.allUsersCount.encode('cs'), inline: true },
            { name: 'Servers 🌎:', value: String(ket.guilds.size).encode('cs'), inline: true },
            { name: 'RAM 🎞️:', value: String(Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB').encode('fix'), inline: true },
        ]
    };
    let status = {
        'ready': `Online ${getEmoji('online').mention}`,
        'connecting': `Conectando ${getEmoji('idle').mention}`,
        'disconnected': `Offline ${getEmoji('offline').mention}`
    }
    ket.shards.forEach(s =>
        embed.fields.push({
            name: `${getEmoji('cristal').mention} Shard ${s.id}`,
            value: `${status[s.status] || 'unknown'} ${(duration(Date.now() - ket.shardUptime.get(s.id))
                .format(" dd[d] hh[h] mm[m] ss[s]"))
                .encode('fix')}`,
            inline: true
        })
    );

    if (shardID === 0 && !ket.ready) return statusMsg.id = (await ket.send({
        ctx: statusMsg.channel, content: {
            embeds: [embed]
        }
    }) as Message<any>).id;
    if (statusMsg.channel && statusMsg.id) return ket.editMessage(statusMsg.channel, statusMsg.id, { embeds: [embed] });
}