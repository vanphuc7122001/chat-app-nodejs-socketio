var formatTime = require("date-format");

const createMessage = (messageText, username) => {
  return {
    messageText,
    createAt: formatTime("dd/MM/yyyy - hh:mm:ss", new Date()),
    username,
  };
};

module.exports = {
  createMessage,
};
