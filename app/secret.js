document.addEventListener("DOMContentLoaded", () => {

  app.initialized().then(client => {
    window.client = client;
    client.events.on('app.activated', () => {

      document.getElementById("encrypt").addEventListener("click", () => {
        const message = document.getElementById("message").value;

        client.request.invoke('encryptMessage', { message })
          .then(data => {
            console.log('invoke success', data);
            const { decodeKey, yopassId } = data.response;
            const secretUrl = `https://yopass.se/#/s/${yopassId}`;
            client.interface.trigger("setValue", {
              id: "editor",
              text: `
                <strong dir="ltr">Secret message: </strong><a href="${secretUrl}">Click here to view the message</a>
                <br />
                <strong dir="ltr">Decrypt key: </strong><i>${decodeKey}</i>
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

function showMain() {
  document.getElementById("main").style.display = "flex";
  document.getElementById("output").style.display = "none";
}

function showOutput() {
  document.getElementById("main").style.display = "none";
  document.getElementById("output").style.display = "flex";
}