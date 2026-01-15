// Shared app state and DOM-related helpers
const API = "http://localhost:3001/api";
let currentUser = "", selectedUser = "", allUsers = [];

function selectChat(username) {
    selectedUser = username;
    const u = allUsers.find(x => x.username === username) || {};
    const nameEl = document.getElementById('activeChatName');
    const avatarEl = document.getElementById('activeChatAvatar');
    const statusEl = document.getElementById('activeChatStatus');
    if(nameEl) nameEl.innerText = username;
    if(avatarEl) avatarEl.src = u.avatar || 'https://via.placeholder.com/48';
    if(statusEl) statusEl.innerText = u.isOnline ? 'Active Now' : 'Offline';
    if(window.socket) socket.emit('get_private_messages', { sender: currentUser, receiver: username });
}

function filterUsers() {
    const q = (document.getElementById('userSearch').value || '').toLowerCase();
    UI.renderUserList(allUsers.filter(u => u.username.toLowerCase().includes(q)));
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    if (input && input.value && selectedUser) {
        socket.emit('send_message', { text: input.value, sender: currentUser, receiver: selectedUser });
        input.value = '';
    }
}

async function uploadFile(file) {
    if (!file) return;
    // reuse media helper if available
    if (typeof uploadMedia === 'function') {
        uploadMedia(file, 'file');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await fetch(`${API}/upload/media`, { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
            socket.emit('send_message', { sender: currentUser, receiver: selectedUser, fileUrl: data.url, fileName: file.name });
        }
    } catch (e) { console.error(e); alert('Upload failed'); }
}

function react(id, emoji) { socket.emit('add_reaction', { messageId: id, emoji, username: currentUser }); }

function toggleMsgMenu(e, id) {
    e.stopPropagation();
    const el = document.getElementById(`menu-${id}`);
    if (!el) return;
    el.style.display = (el.style.display === 'block') ? 'none' : 'block';
}

function deleteMessage(id) {
    socket.emit('delete_message', { messageId: id, username: currentUser });
    const wrap = document.getElementById(`msgwrap-${id}`);
    if (wrap) wrap.remove();
}

function startEditMessage(id) {
    const bubble = document.getElementById(`bubble-${id}`);
    if (!bubble) return;
    const textDiv = bubble.querySelector('.bubble-text');
    const old = textDiv ? textDiv.innerText : '';
    const input = document.createElement('input');
    input.type = 'text'; input.value = old; input.style.width = '100%'; input.style.padding = '8px';
    const saveBtn = document.createElement('button'); saveBtn.innerText = 'Save'; saveBtn.style.marginLeft = '8px';
    const cancelBtn = document.createElement('button'); cancelBtn.innerText = 'Cancel'; cancelBtn.style.marginLeft = '6px';

    const holder = document.createElement('div'); holder.style.display = 'flex'; holder.style.gap = '8px'; holder.appendChild(input); holder.appendChild(saveBtn); holder.appendChild(cancelBtn);

    bubble.innerHTML = ''; bubble.appendChild(holder);

    saveBtn.onclick = () => {
        const newText = input.value;
        socket.emit('edit_message', { messageId: id, text: newText, username: currentUser });
        bubble.innerHTML = `<div class="bubble-text">${newText}</div>`;
    };
    cancelBtn.onclick = () => { bubble.innerHTML = `<div class="bubble-text">${old}</div>`; };
}

function openProfile(){
    const avatar = document.getElementById('activeChatAvatar').src;
    const name = document.getElementById('activeChatName').innerText;
    document.getElementById('modalAvatar').src = avatar;
    document.getElementById('modalName').innerText = name;
    document.getElementById('profile-modal').style.display = 'flex';
}
function closeProfile(){ document.getElementById('profile-modal').style.display = 'none'; }

// hide open menus on click away
document.addEventListener('click', ()=>{
    document.querySelectorAll('.msg-menu').forEach(m=> m.style.display = 'none');
});

function logout() { window.location.reload(); }
