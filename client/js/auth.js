function toggleAuth(mode){
    const inBox = document.getElementById('signInBox');
    const upBox = document.getElementById('signUpBox');
    const tabIn = document.getElementById('tabSignIn');
    const tabUp = document.getElementById('tabSignUp');
    if(mode === 'in'){
        inBox.style.display = 'block'; upBox.style.display = 'none';
        tabIn.classList.add('active'); tabUp.classList.remove('active');
    } else {
        inBox.style.display = 'none'; upBox.style.display = 'block';
        tabIn.classList.remove('active'); tabUp.classList.add('active');
    }
}

async function register(){
    const username = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const avatar = document.getElementById('regAvatar').value || 'https://via.placeholder.com/150';
    try{
        const res = await fetch(`${API}/auth/register`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ username, email, password, avatar })
        });
        if(res.ok){
            alert('Account created — please sign in');
            toggleAuth('in');
            document.getElementById('loginEmail').value = email;
        } else {
            const d = await res.json(); alert(d.message || 'Register failed');
        }
    }catch(e){ console.error(e); alert('Register error'); }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try{
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(res.ok) {
            currentUser = data.username;
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('main-app').style.display = 'flex';
            document.getElementById('navMyName').innerText = data.username;
            document.getElementById('navMyAvatar').src = data.avatar;
            socket.emit("register_user", data.username);
        } else {
            alert(data.message || 'Login failed');
        }
    }catch(e){ console.error(e); alert('Login error'); }
}