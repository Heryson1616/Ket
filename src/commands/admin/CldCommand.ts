export { };
import Eris from "eris";
const
    { exec } = require('child_process'),
    { inspect } = require('util'),
    { CommandStructure, EmbedBuilder } = require('../../components/Commands/CommandStructure');

module.exports = class CldCommand extends CommandStructure {
    constructor(ket: Eris.Client) {
        super(ket, {
            name: 'cld',
            aliases: [],
            category: 'admin',
            cooldown: 1,
            permissions: {
                user: [],
                bot: [],
                onlyDevs: true
            },
            access: {
                DM: true,
                Threads: true
            },
            dontType: false,
            testCommand: ['node -v'],
            slashData: null
        })
    }
    async execute({ context, args }) {
        let embed: typeof EmbedBuilder;

        try {
            await exec(args.join(' '), (_a: string, b: string) => {
                embed = new EmbedBuilder()
                    .setTitle('Só sucexo bb')
                    .setColor('green')
                    .setDescription(b, 'bash');
                this.ket.say({ context, content: { embeds: [embed.build()] } })
            })
        } catch (e) {
            embed = new EmbedBuilder()
                .setTitle('Ih deu merda viado')
                .setColor('red')
                .setDescription(inspect(e), 'bash');
            this.ket.say({ context, content: { embeds: [embed.build()] } })
        }
    }
}