"use strict";
function reverse(input) {
    return typeof input === 'string'
        ? input.split('').reverse().join('')
        : Array.prototype.slice.call(input, 0).reverse();
}
//# sourceMappingURL=reverse.js.map