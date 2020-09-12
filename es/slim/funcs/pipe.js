function pipe(...funcs) {
    if (funcs.length === 0) {
        return (arg) => arg;
    }
    if (funcs.length === 1) {
        return funcs[0];
    }
    return funcs.reverse().reduce((a, b) => (...args) => a(b(...args)));
}
export default pipe;
//# sourceMappingURL=pipe.js.map