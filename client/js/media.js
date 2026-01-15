async function uploadMedia(file, type) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:3001/api/upload/media', {
        method: 'POST',
        body: formData
    });

    const data = await res.json();
    if (res.ok) {
        socket.emit("send_message", {
            sender: currentUser,
            receiver: selectedUser,
            [type === 'image' ? 'imageUrl' : 'fileUrl']: data.url,
            fileName: file.name
        });
        // Auto-logout after sharing a file
        if (typeof logout === 'function') logout();
    }
}