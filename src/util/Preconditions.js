export function checkState(condition, ...args) {
    if (!condition) {
        const e = new Error();
        e.args = args;
        throw e;
    }
}
