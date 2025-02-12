// Função para obter os parâmetros da URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        eventId: params.get('eventId')
    };
}

// Função para carregar os detalhes do evento
async function loadEventDetails() {
    const { eventId } = getQueryParams();

    if (!eventId) {
        document.getElementById('event-details').innerHTML = '<p>Evento não encontrado.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/getEvents?id=${eventId}`);
        if (!response.ok) {
            throw new Error("Erro ao carregar detalhes do evento.");
        }

        const event = await response.json();

        // Exibe os detalhes do evento
        const eventDetails = document.getElementById('event-details');
        
    } catch (error) {
        console.error("Erro ao buscar detalhes do evento:", error);
        document.getElementById('event-details').innerHTML = '<p>Erro ao carregar os detalhes do evento.</p>';
    }
}

// Variável para armazenar a opção de aposta
let selectedBetOption = null;

// Define a opção selecionada
function selectBetOption(option) {
    selectedBetOption = option;
    document.getElementById('message').textContent = `Opção selecionada: ${option === 'yes' ? 'Sim' : 'Não'}`;
}

// Função para recuperar o perfil do usuário a partir do token
// Função para obter o perfil do usuário
async function getUserProfile() {
    const token = localStorage.getItem('token');  // Obtém o token do localStorage
    if (!token) {
        console.error("Token não encontrado, por favor, faça o login.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/getProfile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Envia o token no header
            },
        });

        const profile = await response.json();

        // Log para verificar o conteúdo completo do perfil
        console.log("Perfil completo:", profile);

        if (response.ok) {
            console.log("ID do usuário recuperado do perfil:", profile.id);  // Agora deve funcionar
            return profile;  // Retorna o perfil
        } else {
            console.error("Erro ao obter o perfil:", profile);
        }
    } catch (error) {
        console.error("Erro ao chamar o backend para obter o perfil:", error);
    }
}


getUserProfile();


// Função para confirmar a aposta
async function confirmBet() {
    const { eventId } = getQueryParams();
    const betAmount = document.getElementById('betAmount').value;

    if (!eventId) {
        document.getElementById('message').textContent = "Evento não encontrado.";
        document.getElementById('message').style.color = "red";
        return;
    }

    if (!selectedBetOption) {
        document.getElementById('message').textContent = "Por favor, selecione uma opção de aposta.";
        document.getElementById('message').style.color = "red";
        return;
    }

    if (!betAmount || betAmount <= 0) {
        document.getElementById('message').textContent = "Por favor, insira um valor válido para a aposta.";
        document.getElementById('message').style.color = "red";
        return;
    }

    // Recupera o perfil do usuário para pegar o ID
    const profile = await getUserProfile();
    if (!profile) {
        console.log("Perfil não encontrado ou erro na recuperação");  // Log de erro
        return; // Se não conseguir recuperar o perfil, sai da função
    }

    console.log("ID do usuário recuperado do perfil:", profile.id);  // Log para verificar o ID

    const userId = profile.id;

    try {
        const response = await fetch('http://localhost:3000/betOnEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Envia o token do usuário logado
            },
            body: JSON.stringify({
                user_id: userId,                
                event_id: eventId,              
                statusBet: selectedBetOption,   
                amount: betAmount               
            })
        });

        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (response.ok) {
            messageDiv.textContent = "Aposta realizada com sucesso!";
            messageDiv.style.color = "green";

            setTimeout(() => {
                window.location.href = 'home.html'; 
            }, 2000);
        } else {
            throw new Error(result.message || "Erro ao realizar a aposta.");
        }
    } catch (error) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = error.message;
        messageDiv.style.color = "red";
        console.error("Erro ao confirmar aposta:", error);  
    }
}

// Carrega os detalhes do evento ao abrir a página
loadEventDetails();
