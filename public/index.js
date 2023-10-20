let socket = io();

let currentRecipient = null;
let offset = 0;
let indicator = new Set();


socket.on('connect_error', (error) => {
  if (error.message === 'unauthorized') {
    window.location.href = '/login';
  }
});

socket.on('left', () => {
  window.location.href = '/login'
})

//LOGOUT
function handleLogout() {
  fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      window.location.href = "/login";
    } else {
      console.error('Logout request failed:', response.statusText);
    }
  })
  .catch(error => {
    console.error('An error occurred during logout:', error);
  });
}


//THEME CHANGE

const html = document.querySelector('html');
const themeToggle = document.getElementsByClassName('theme')[0];

themeToggle.addEventListener('click', () => {
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});

//CONTACT SWITCH

function ContactsSwitch() {
  const indicatorDiv = document.getElementById('indicator');
  indicatorDiv.classList.remove('visible');
  indicator.clear();
  indicatorDiv.innerHTML = '';
  document.title = `Messanger`;

  const chat = document.getElementById('chat-pane');
  chat.classList.toggle('toggle');
  const contacts = document.getElementById('contacts-pane');
  contacts.classList.toggle('toggle');

}

//MESSAGE INDICATOR
function displayNew(data) {
  const indicatorDiv = document.getElementById('indicator');

  if (!indicator.has(data)) {
    indicator.add(data);
    indicatorDiv.innerHTML = '';
    indicatorDiv.innerHTML = indicator.size;
    document.title = `Messanger (${indicator.size})`;
    indicatorDiv.classList.add('blink');
    setTimeout(() => {
      indicatorDiv.classList.remove('blink');
    }, 2000);
  }
}


//APP INIT WITH FETCHCONTACTS
fetchContacts();


//------------------------CONTACTS-----------------------------

async function fetchContacts() {
  try {
    const response = await fetch('/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const fetchedContacts = await response.json();
      contacts = fetchedContacts; // Update the contacts map with the fetched data
      // Clear the previous content and display the fetched contacts
      const contactListContainer = document.getElementById('contact-list');
      contactListContainer.innerHTML = ''; // Clear the previous content

      fetchedContacts.forEach((contact) => {
        const contactDiv = document.createElement('div');
        const contactNameSpan = document.createElement('span');
        const currentChatContainer = document.getElementById('current-chat');
        contactNameSpan.textContent = contact.username;
        contactDiv.id = contact.contact_id;
        contactDiv.classList.add('contact');

        // Add the double-click event listener to the contactDiv
        contactDiv.addEventListener('dblclick', () => {
        // Update the currentRecipient variable with the contact_id of the double-clicked contact
        
        updateUnread(currentRecipient);
        currentRecipient = contact.contact_id;
        offset = 0;

        InputState(); //call to MESSAGES/SEND MESSAGE 
        fetchMessages(); //call to MESSAGES/FETCH
        


        updateUnread(currentRecipient);
        currentChatContainer.innerHTML = ''; //call to MESSAGE/FETCH
        
        document.getElementById('recipient-username').textContent = contact.username;
        ContactsSwitch()
        
        });
        
        
        const removeButton = document.createElement('button');
        removeButton.textContent = '-';
        removeButton.addEventListener('click', () => {  
          if (contact.contact_id === currentRecipient) {
            currentRecipient = null;
            document.getElementById('recipient-username').textContent = ''
            currentChatContainer.innerHTML = '';
          }
          InputState(); //call to MESSAGES/SEND MESSAGE
          updateUnread(contact.contact_id);


          removeFromContacts(contact.contact_id);
        });

        contactDiv.appendChild(contactNameSpan);
        contactDiv.appendChild(removeButton);
        contactListContainer.appendChild(contactDiv);

      });
      fetchUnread();
    } else {
      console.error('Failed to fetch contacts:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error occurred while fetching contacts:', error);

  }
}

//SEARCH

document.getElementById('find-button').addEventListener('click', async () => {
  const search = document.getElementById('search-bar').value;

  try { 

    const response = await fetch('contacts/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ search })
    });

    if (response.ok) {
      const searchResults = await response.json();

      const menuResultsContainer = document.getElementById('menu-results');
      menuResultsContainer.innerHTML = ''; // Clear the previous content
      

      searchResults.forEach((user) => {
        const unknownId = `unknown-${user.id}`;
        const reciveUnknown = document.getElementById(unknownId);
              
        if (!reciveUnknown && !contacts.some((contact) => contact.contact_id === user.id)) { 

          const listItem = document.createElement('div');
          listItem.textContent = user.username; // Display the username
          listItem.classList.add('result-item');
          const addButton = document.createElement('button');
          addButton.textContent = '+';
          addButton.addEventListener('click', () => {
            // Handle the click event to add the user to the contact list
            addToContactList(user.id);
            listItem.remove();
          });
      
          listItem.appendChild(addButton);
          menuResultsContainer.appendChild(listItem);
        }
      });
      document.getElementById('clear-button').addEventListener('click', () => {
        menuResultsContainer.innerHTML = '';
        const searchInput = document.getElementById('search-bar');
        searchInput.value = '';

      });

    } else {
      console.error('Request failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
});

//ADD

async function addToContactList(user) {
  try {
    const response = await fetch('/contacts/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactId: user,       
      }),
    });

    if (response.ok) {
      fetchContacts();
    } else {
      console.error('Failed to add contact:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error occurred while adding contact:', error);
  }
}

//REMOVE

async function removeFromContacts(contactId) {
  try {
    const response = await fetch('contacts/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contactId }),
    });

    if (response.ok) {
      fetchContacts();
    } else {
      console.error('Failed to remove contact:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error occurred while removing contact:', error);
  }
}

//------------------------MESSAGES-----------------------------



//FETCH MESSAGES
const currentChatContainer = document.getElementById('current-chat');
currentChatContainer.addEventListener('scroll', async () => {
  if (currentChatContainer.scrollTop === 0) {
    offset += 10;
    await fetchMessages(offset);
  }
});


async function fetchMessages() {

  try {
    const recipient = currentRecipient;


    const response = await fetch('/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient, offset }),
    });

    if (response.ok) {
      const currentChatContainer = document.getElementById('current-chat');

      const messages = await response.json();

      messages.forEach((message) => {
        const chatDiv = document.createElement('div');
        chatDiv.textContent = message.content;
      
        if (message.sender !== recipient) {
          chatDiv.classList.add('chat-own');
        } else {
          chatDiv.classList.add('chat-recipient');
        }
      
        currentChatContainer.prepend(chatDiv);
      });
      

    } else {
      // Error fetching messages, handle the error
      console.error('Failed to fetch messages:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error occurred while fetching messages', error);
  }
}


//SEND MESSAGE
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send');

function InputState() {
  if (currentRecipient == null) {
    messageInput.placeholder = 'Choose recipient from contacts...';
    messageInput.disabled = true;
    sendButton.disabled = true;
  } else {
    messageInput.placeholder = 'Type your message...';
    messageInput.disabled = false;
    sendButton.disabled = false;
  }
}
InputState();

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const content = messageInput.value;

  const messageData = {
    recipient: currentRecipient,
    content: content,
  
  };
  messageInput.value = '';

  try {
    const response = await fetch('/message/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (response.ok) {
      offset += 1;
      const currentChat = document.getElementById('current-chat');
      const chatDiv = document.createElement('div');
      chatDiv.classList.add('chat-own'); // Add the class "chat-own" to the chat div
      
      chatDiv.textContent = content;
      
      currentChat.append(chatDiv);
      chatDiv.scrollIntoView();
      socket.emit('sendMessage', messageData);

    } else {
      // Error sending the message, handle the error
      console.error('Failed to send message:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error occurred while sending message:', error);
  }
});


//RECIEVE MESSAGE

function receive (sender_id, sender_username) {

const contactDiv = document.getElementById(sender_id);
displayNew(sender_id); //call to add new element to unread set;

  if (contactDiv) {
    contactDiv.className = 'contact-unread';
  } else {
    const existingUnknown = document.getElementById(`unknown-${sender_id}`)
    if (!existingUnknown){
    const unknownList = document.getElementById('unknown-list');
    const unknownListItem = document.createElement('div');
    unknownListItem.id = `unknown-${sender_id}`;
  
    // Create the inner HTML content with the sender_username in a <span> element
    unknownListItem.innerHTML = `
      Unknown: <span style="font-weight: bold;">${sender_username}</span>
      <button id="accept">OK</button>
      <button id="decline">X</button>`;
  
    const acceptButton = unknownListItem.querySelector('#accept');
    acceptButton.addEventListener('click', () => {
      addToContactList(sender_id);
      unknownListItem.remove();
      currentRecipient = sender_id;
      currentChatContainer.innerHTML = ''
      document.getElementById('recipient-username').textContent = sender_username;
      fetchMessages();
      InputState();
      updateUnread(sender_id);
      ContactsSwitch();
    });
  
    const declineButton = unknownListItem.querySelector('#decline');
    declineButton.addEventListener('click', () => {
      unknownListItem.remove();
      updateUnread(sender_id);
    });
  
    unknownList.appendChild(unknownListItem);
    }
  }
}


//UNREAD

async function fetchUnread() {
  try {
    const response = await fetch('/message/unread', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const unread = await response.json();
      if (unread) {
        unread.forEach((unreadItem) => {
          
          receive(unreadItem.sender_id, unreadItem.sender_username);
        });
      }
    } else {
      console.error('Request failed:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return null;
  }
}

//UPDATE UNREAD

async function updateUnread(currentRecipient) {
  if (!currentRecipient) {
    return;
  }

  try {
    const response = await fetch('/message/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify( {currentRecipient} )
      
    });

    if (response.ok) {
      const contactDiv = document.getElementById(currentRecipient);
      contactDiv.classList.replace('contact-unread', 'contact');

    } else {
      console.error('Request failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

//------------------------SOCKET.IO-----------------------------

socket.on('receiveMessage', (eventData) => {

  if (currentRecipient === eventData.sender_id){
    offset += 1;

  const currentChat = document.getElementById('current-chat');
  const chatDiv = document.createElement('div');
  chatDiv.classList.add('chat-recipient');
  
  chatDiv.textContent = eventData.content;
  
  currentChat.append(chatDiv);
  chatDiv.scrollIntoView();
  } else {
    receive(eventData.sender_id, eventData.sender_username);
  }

});
