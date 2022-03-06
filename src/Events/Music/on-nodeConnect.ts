import { Node } from "erela.js";
import KetClient from "../../Main";

module.exports = class nodeConnectEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(node: Node) {
        console.log(`ERELA / ${node.options.identifier}`, `Conectado`, 32);
        return;
    }
}