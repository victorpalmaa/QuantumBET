document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            document.getElementById('message').textContent = errorText;
            return;
        }

        const data = await response.json();
        console.log('Resposta do login:', data); // Verifique a resposta do backend

        if (data.token) {
            localStorage.setItem('token', data.token);
            console.log('Token salvo no localStorage:', localStorage.getItem('token')); // Verifique se o token foi salvo corretamente
        } else {
            console.log('Token não encontrado na resposta');
            return;
        }

        // Redirecionar para a página inicial
        window.location.href = 'home.html'; // Substitua pelo caminho correto
    } catch (error) {
        document.getElementById('message').textContent = 'Erro ao fazer login. Tente novamente.';
        console.error('Erro no login:', error); // Adicionando log do erro
    }
});