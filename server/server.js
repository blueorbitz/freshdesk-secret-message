exports = {
  encryptMessage: async function (args) {
    try {
      console.log(args);
      const data = await sendMessage(args);
      await saveTransaction(data.yopassId, args);

      renderData(null, data);
    } catch (err) {
      console.error(err);
      renderData(err);
    }
  }
};

async function sendMessage(input) {
  const axios = require('axios');
  const openpgp = require('openpgp');

  const { encrypt, createMessage } = openpgp;
  const { message, expiration, one_time } = input;

  const decodeKey = Math.random().toString(36).substr(2, 6) + Math.random().toString(36).substr(2, 6);
  console.log('Generated Key', decodeKey);

  const encryptMessage = await encrypt({
    message: await createMessage({ text: message }),
    passwords: decodeKey,
  })
  console.log(encryptMessage);

  const data = {
    expiration,
    message: encryptMessage,
    one_time,
  };

  const response = await axios.post('https://api.yopass.se/secret', data);
  const yopassId = response.data.message;
  // const yopassId = decodeKey;
  console.log('Yopass.se:', yopassId);

  return { yopassId, decodeKey };
}

async function saveTransaction(yopassId, input) {
  const iparams = input.iparams;
  const axios = require('axios');
  const headers = {
    'x-api-key': iparams.restdb_apikey,
  };

  const { tenant, email, ticketId, expiration, one_time } = input;
  const restdb_url = 'https://x6540support-2ecd.restdb.io/rest';
  const response = await axios.post(restdb_url + '/fd-secrets', {
    tenant,
    yopassId,
    expiration,
    one_time,
    ticketId,
    createdAt: new Date(),
    createdBy: email,
  }, { headers });

  return response.data;
}
