class apiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = null, // Changed from [] to null for consistency
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = error; // Changed from null to error to reflect passed error
        this.message = message;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { apiError };
