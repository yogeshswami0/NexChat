const socket = io("http://localhost:3001");

// incoming single message
socket.on("receive_message", (data) => {
    if (data.sender !== currentUser) {
        const s = document.getElementById('notif-sound'); if (s && s.src) s.play();
    }
    UI.appendMessage(data);
});

// load conversation messages
socket.on('load_messages', (msgs) => {
    const container = document.getElementById('message-container');
    if (container) container.innerHTML = '';
    (msgs || []).forEach(m => UI.appendMessage(m));
});

// user list
socket.on("get_user_list", (users) => {
    allUsers = users;
    UI.renderUserList(users);
});

// reaction updates
socket.on("reaction_updated", (data) => {
    UI.updateReactions(data.messageId, data.reactions);
});

// message edited by someone (or self)
socket.on('message_edited', ({ messageId, text }) => {
    const bubble = document.getElementById(`bubble-${messageId}`);
    if (bubble) {
        const textDiv = bubble.querySelector('.bubble-text');
        if (textDiv) textDiv.innerText = text;
        else bubble.insertAdjacentHTML('afterbegin', `<div class="bubble-text">${text}</div>`);
    }
});

// message deleted
socket.on('message_deleted', ({ messageId }) => {
    const wrap = document.getElementById(`msgwrap-${messageId}`);
    if (wrap) wrap.remove();
});