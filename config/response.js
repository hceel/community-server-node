const response = {
    true: (code, message, data) => {
        return {
            isSuccess: true,
            code : code,
            message: message,
            result: data
        }
    },
    false: (code, message) => {
        return {
            isSuccess: false,
            code : code,
            message: message
        }
    },
};

module.exports = response;