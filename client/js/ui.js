const UI = {
    appendMessage: (data) => {
        const container = document.getElementById('message-container');
        const isMe = data.sender === currentUser;
        const msgId = data._id || ('m_' + Math.random().toString(36).slice(2,9));

        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isMe ? 'me' : 'other'}`;
        wrapper.style.alignSelf = isMe ? 'flex-end' : 'flex-start';
        wrapper.id = `msgwrap-${msgId}`;

        const reactions = ['❤️','👍','😂','🔥','✨'];
        let emojiHtml = `<div class="emoji-bar">`;
        reactions.forEach(e => { emojiHtml += `<span onclick="react('${msgId}', '${e}')">${e}</span>`; });
        emojiHtml += `</div>`;

        const menuHtml = `
            <button class="msg-menu-btn" onclick="toggleMsgMenu(event, '${msgId}')">⋯</button>
            <div class="msg-menu" id="menu-${msgId}">
                <button onclick="startEditMessage('${msgId}')">Edit</button>
                <button onclick="deleteMessage('${msgId}')">Delete</button>
            </div>
        `;

        wrapper.innerHTML = `
            ${emojiHtml}
            ${menuHtml}
            <div class="bubble" id="bubble-${msgId}">
                ${data.imageUrl ? `<img src="${data.imageUrl}" style="max-width:100%; border-radius:12px; margin-bottom:8px;">` : ''}
                ${data.fileUrl ? `<a href="${data.fileUrl}" target="_blank" style="color:inherit; text-decoration:none; display:flex; align-items:center; gap:8px;">📄 ${data.fileName}</a>` : ''}
                <div class="bubble-text">${data.text || ''}</div>
                <small style="display:block; text-align:right; font-size:10px; margin-top:5px; opacity:0.7;">${new Date(data.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
            </div>
            <div id="reacts-${msgId}" style="font-size:12px; margin-top:4px;">${(data.reactions || []).map(r => r.emoji).join('')}</div>
        `;

        container.appendChild(wrapper);
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    },

    renderUserList: (users) => {
        const list = document.getElementById('user-list');
        list.innerHTML = users.map(u => `
            <li class="user-item" onclick="selectChat('${u.username}')">
                <img src="${u.avatar}" class="avatar-main" style="width:40px; height:40px; border-radius:12px;">
                <div><b>${u.username}</b><br><small>${u.isOnline ? 'Online' : 'Offline'}</small></div>
            </li>
        `).join('');
    }
};
// update reactions helper
UI.updateReactions = (messageId, reactions) => {
    const div = document.getElementById(`reacts-${messageId}`);
    if (div) div.innerHTML = (reactions || []).map(r => r.emoji).join('');
};