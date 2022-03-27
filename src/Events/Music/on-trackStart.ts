import { Player, Track } from "erela.js";
import { Message } from "eris";
import Event from "../../Components/Classes/Event";

module.exports = class trackStart extends Event {
    public type = 1;
    public dir = __filename;

    async on(player: Player, track: Track) {
        let msg = await this.ket.send({ ctx: player.textChannel, content: 'Iniciando música' }) as Message;
        await sleep(track.duration);
        msg.delete().catch(() => { });

        return;
    }
}