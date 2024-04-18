document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox
  load_mailbox('inbox');
  document.querySelector("#compose-view").onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.getElementById("compose-recipients").value,
        subject: document.getElementById("compose-subject").value,
        body: document.getElementById("compose-body").value,
      })
    })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
      });
    setTimeout(function () { load_mailbox('sent') }, 500);
    return false;
  }
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#single_email").style.display = "none";

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#single_email").style.display = "none";
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      emails.forEach(email => {
        const element = document.createElement('div');
        element.classList.add('emails');
        if (email.read === true) { element.style.backgroundColor = "#CCCCCC"; }
        element.innerHTML = `<p class="sender">Sender:${email.sender}</p><p class="subject">Subject:${email.subject}</p><p class="timestamp">Timestamp:${email.timestamp}</p>`;
        element.addEventListener('click', function () { view_email(email.id); });
        document.querySelector('#emails-view').append(element);
      });
    });
}

function view_email(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#single_email").style.display = "block";
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      const h2Element = document.getElementById('user');
      const user = h2Element.textContent;
      const element = document.createElement('div');
      if (user != email.sender) {
        if (email.archived === false) {
          element.innerHTML =
            `<p><span style="font-weight: bold;">From:</span>${email.sender}</p>
          <p><span style="font-weight: bold;">To:</span>${email.recipients}</p>
          <p><span style="font-weight: bold;">Subject:</span>${email.subject}</p>
          <p><span style="font-weight: bold;">Timestamp:</span>${email.timestamp}</p>
        <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
        <button class="btn btn-sm btn-outline-primary" id="archive">Archive</button>
        <hr>
        <p>${email.body}</p>`;
          document.querySelector('#single_email').innerHTML = "";
          document.querySelector('#single_email').append(element);
          document.querySelector("#archive").addEventListener("click", () => {
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: true
              })
            });
            setTimeout(function () { load_mailbox('archive') }, 500);
          });
        }
        else {
          element.innerHTML =
            `<p><span style="font-weight: bold;">From:</span>${email.sender}</p>
          <p><span style="font-weight: bold;">To:</span>${email.recipients}</p>
          <p><span style="font-weight: bold;">Subject:</span>${email.subject}</p>
          <p><span style="font-weight: bold;">Timestamp:</span>${email.timestamp}</p>
          <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
          <button class="btn btn-sm btn-outline-primary" id="unarchive">Unarchive</button>
          <hr>
          <p>${email.body}</p>`;
          document.querySelector('#single_email').innerHTML = "";
          document.querySelector('#single_email').append(element);
          document.querySelector("#unarchive").addEventListener("click", () => {
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: false
              })
            });
            setTimeout(function () { load_mailbox('archive') }, 500);
          });
        }
      }
      else {
        element.innerHTML =
          `<p><span style="font-weight: bold;">From:</span>${email.sender}</p>
        <p><span style="font-weight: bold;">To:</span>${email.recipients}</p>
        <p><span style="font-weight: bold;">Subject:</span>${email.subject}</p>
        <p><span style="font-weight: bold;">Timestamp:</span>${email.timestamp}</p>
        <hr>
        <p>${email.body}</p>`;
        document.querySelector('#single_email').innerHTML = "";
        document.querySelector('#single_email').append(element);
      }
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      });
      document.querySelector("#reply").addEventListener("click", () => {
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'block';
        document.querySelector("#single_email").style.display = "none";
        // Clear out composition fields
        document.querySelector('#compose-recipients').value = `${email.sender}`;
        if (email.subject.substr(0, 3) != "Re:") {
          document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        } else { document.querySelector('#compose-subject').value = `${email.subject}`; }
        const time = new Date();
        document.querySelector('#compose-body').value = `On ${time} ${user} wrote:`;
      });
    });
}