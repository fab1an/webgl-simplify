// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!exists(console[method])) {
            console[method] = noop;
        }
    }
}());

export default class ConsoleAppender {
    output(tag, error, ...args) {
        if (error) {
            console.error(`[${tag}]`, ...args);
        } else {
            console.log(`[${tag}]`, ...args);
        }
    }
}
