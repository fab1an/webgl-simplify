import {checkState} from "../Preconditions";

export default class WSAppender {
    constructor(url) {
        this.url = url;
        this._connect();
        this.queue = [];
    }

    _connect() {
        checkState(!this.openConn);

        let conn = new WebSocket(this.url);
        conn.onopen = () => {
            this.openConn = conn;
            this.queue.forEach(msg => conn.send(msg))
            this.queue.clear();
        };
        conn.onerror = () => {
            conn.close();
        };
        conn.onclose = () => {
            delete this.openConn;
            setTimeout(() => this._connect(), 1000);
        };
    }

    output(tag, error, ...args) {
        let tags = []
        if (error) {
            tags.push("error");
        }
        let msg = {
            time: new Date().toISOString(),
            tags,
            origin: [tag],
            message: args.join(" ")
        }

        if (this.openConn.isPresent()) {
            this.openConn.get().send(JSON.stringify(msg))
        } else {
            this.queue.push(JSON.stringify(msg));
        }
    }
}
