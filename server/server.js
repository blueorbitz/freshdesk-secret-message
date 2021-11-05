

exports = {
  encryptMessage: async function (args) {
    try {
      const axios = require('axios');
      const openpgp = require('openpgp');

      const { encrypt, createMessage } = openpgp;
      const { message } = args;

      const decodeKey = Math.random().toString(36).substr(2, 6) + Math.random().toString(36).substr(2, 6);
      console.log('Generated Key', decodeKey);

      const encryptMessage = await encrypt({
        message: await createMessage({ text: message }),
        passwords: decodeKey,
      })
      console.log(encryptMessage);

      const data = {
        expiration: 3600,
        message: encryptMessage,
        one_time: true,
      };

      const response = await axios.post('https://api.yopass.se/secret', data);
      const yopassId = response.data.message;
      console.log('Yopass.se:', yopassId);

      renderData(null, { yopassId, decodeKey });
    } catch (err) {
      renderData(err);
    }
  }
};
