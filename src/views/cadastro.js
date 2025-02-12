document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const completeName = document.getElementById('completeName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const birthdateInput = document.getElementById('birthdate').value;
    const messageDiv = document.getElementById('message');

    // Validação de idade
    if (!isOfAge(birthdateInput)) {
        messageDiv.textContent = "Você precisa ter pelo menos 18 anos para se registrar.";
        messageDiv.style.color = "red";
        return;
    }

    // Verifique se as senhas coincidem
    if (password !== confirmPassword) {
        messageDiv.textContent = "As senhas não coincidem.";
        messageDiv.style.color = "red";
        return;
    }

    
    try {
        console.log("Enviando dados para a API...");
        const response = await fetch('http://localhost:3000/register', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completeName: completeName,
                email: email,
                password: password,
                birthdate: birthdateInput 
            })
        });

        console.log("Resposta recebida da API:", response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta da API:", errorText);
            throw new Error(errorText);
        }

        const data = await response.text();
        messageDiv.textContent = "Registro realizado com sucesso!";
        messageDiv.style.color = "green";
        console.log("Registro bem-sucedido:", data);

        
        window.location.href = 'http://127.0.0.2:5500/src/views/login.html';
    } catch (error) {
        console.error("Erro ao registrar:", error);
        messageDiv.textContent = error.message;
        messageDiv.style.color = "red";
    }
});

function isOfAge(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);

    // Calcula a idade
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Ajusta a idade se o mês/dia de aniversário ainda não chegou este ano
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
    }

    return age >= 18;
}
