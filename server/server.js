const yopass_api_url = 'https://api.yopass.se';

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
  },
  restDbQuery: async function (args) {
    const axios = require('axios');

    const { method, tenant, dbId, iparams } = args;
    const restdb_url = iparams.restdb_url + '/rest';
    const headers = {
      'x-api-key': iparams.restdb_apikey,
    };

    try {
      let response;
      switch (method) {
        case 'GET':
          const query = `?q={"tenant": "${tenant}"}`;
          response = await axios.get(restdb_url + '/fd-secrets' + query, { headers });
          break;
        case 'DELETE':
          response = await axios.delete(restdb_url + '/fd-secrets/' + dbId, { headers });
          break;
        default:
          throw new Error('Unsupport Method');
      }
      renderData(null, response.data);
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

  const response = await axios.post(yopass_api_url + '/secret', data);
  const yopassId = response.data.message;
  // const yopassId = decodeKey;
  console.log('Yopass.se:', yopassId);

  return { yopassId, decodeKey };
}

async function saveTransaction(yopassId, input) {
  const iparams = input.iparams;
  const axios = require('axios');
  const restdb_url = iparams.restdb_url + '/rest';
  const headers = {
    'x-api-key': iparams.restdb_apikey,
  };

  const { tenant, email, ticketId, expiration, one_time } = input;
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
