document.addEventListener("DOMContentLoaded", () => {

  app.initialized().then(client => {
    window.client = client;
    client.events.on('app.activated', () => {

      document.getElementById("encrypt").addEventListener("click", () => {
        const message = document.getElementById("message").value;
        const expiration = parseInt(document.getElementById("expiration").value);
        const one_time = document.getElementById("one_time").checked;
        console.log(message, expiration, one_time);

        client.request.invoke('encryptMessage', { message, expiration, one_time })
          .then(data => {
            console.log('invoke success', data);
            const { decodeKey, yopassId } = data.response;
            const secretUrl = `https://yopass.se/#/s/${yopassId}`;
            const remark = one_time ? "This is a one-time secret valid until " : "This secret is valid until ";
            const expiredTime = new Date();
            expiredTime.setSeconds(expiredTime.getSeconds() + expiration)

            client.interface.trigger("setValue", {
              id: "editor",
              text: `
                <strong dir="ltr">Secret message: </strong><a href="${secretUrl}">Click here to view the message</a>
                <br />
                <strong dir="ltr">Decrypt key: </strong><i>${decodeKey}</i>
                <br />
                <p><i>${remark + expiredTime.toISOString()}</i></p>
              `,
            });
            client.instance.close();
          })
          .catch(err => {
            console.log('invoke fail', err);
            client.interface.trigger("showNotify", {
              type: "danger",
              message: err.message
            });
          });
      });
    });
  });
});
