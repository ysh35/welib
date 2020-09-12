function throttle(func, limit = 100) {
    let timer;
    let lastRan;
    return function () {
        // @ts-ignore
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        }
        else {
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (Date.now() - lastRan >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}
export default throttle;
//# sourceMappingURL=throttle.js.map