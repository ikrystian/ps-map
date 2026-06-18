(function() {
    // Flag to prevent recursive error logging loops if the logging fetch itself fails
    let isLogging = false;

    function logToServer(type, message, url, line, col, error) {
        if (isLogging) return;
        isLogging = true;

        const payload = {
            type: type,
            message: message,
            url: url || window.location.href,
            line: line || null,
            col: col || null,
            stack: error && error.stack ? error.stack : null,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        fetch('/api/log-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            keepalive: true
        }).catch(err => {
            // Silently fail if server is down or unreachable to prevent user disruption
        }).finally(() => {
            isLogging = false;
        });
    }

    // Intercept console.error
    const originalConsoleError = console.error;
    console.error = function(...args) {
        // Output to original console so developers can still see it in DevTools
        originalConsoleError.apply(console, args);

        const message = args.map(arg => {
            if (arg instanceof Error) {
                return arg.message + '\n' + arg.stack;
            } else if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return String(arg);
                }
            } else {
                return String(arg);
            }
        }).join(' ');

        logToServer('console.error', message);
    };

    // Intercept uncaught exceptions
    window.addEventListener('error', function(event) {
        logToServer(
            'uncaught-exception',
            event.message,
            event.filename,
            event.lineno,
            event.colno,
            event.error
        );
    });

    // Intercept unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        let message = 'Unhandled promise rejection';
        let error = null;
        if (event.reason) {
            if (event.reason instanceof Error) {
                message = event.reason.message;
                error = event.reason;
            } else if (typeof event.reason === 'object') {
                try {
                    message = JSON.stringify(event.reason);
                } catch (e) {
                    message = String(event.reason);
                }
            } else {
                message = String(event.reason);
            }
        }
        logToServer('unhandled-rejection', message, null, null, null, error);
    });
})();
