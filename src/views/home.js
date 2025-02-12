document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = true; // Simula o estado de login (substitua com verificação real)
    const createEventButton = document.getElementById('createEventButton');
    const walletButton = document.getElementById('walletButton');
    const profileImage = document.getElementById('profileImage');
    const closeButton = document.querySelector('#closeButton');
    const userOptionsContainer = document.querySelector('#userOptionsContainer');

    // Verificar se o usuário está logado
    const token = localStorage.getItem('token'); // Recupera o token

    fetch('http://localhost:3000/getProfile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => response.text()) // Recebe a resposta como texto
    .then(text => {
        console.log('Resposta da API (texto):', text); // Log da resposta em texto
    
        
        try {
            const data = JSON.parse(text);
            console.log('Dados recebidos da API:', data); // Log dos dados recebidos
            if (data.completeName) {
                // Exibe o nome de usuário ao lado do ícone
                document.getElementById('profile-name').innerText = "Bem-vindo" + "  " +  data.completeName;
            } else {
                console.log('Nome completo não encontrado nos dados:', data);
            }

            if (data.completeName === "Admin") {
                adminButton.style.display = 'inline-block'; // Exibe o botão de admin
            } else {
                adminButton.style.display = 'none'; // Esconde o botão de admin
            }
        } catch (error) {
            console.error('Erro ao analisar JSON:', error);
        }
    })
    .catch(error => {
        console.error('Erro ao obter perfil:', error);
    });

    if (isLoggedIn) {
        // Exibir botão "Criar Eventos" e "Minha Wallet"
        createEventButton.style.display = 'inline-block';
        walletButton.style.display = 'inline-block';

        // Configurar imagem de perfil
        profileImage.src = 'no-profile-picture-icon.webp'; // Substitua pelo link da imagem do usuário logado
        profileImage.style.display = 'inline-block';
    }
});

const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const indicators = document.querySelectorAll('.carousel-indicators button');
    let currentIndex = 0;

    function moveToSlide(index) {
        track.style.transform = `translateX(-${index * 100}%)`;
        indicators.forEach((btn, i) => btn.classList.toggle('active', i === index));
        currentIndex = index;
    }

    function autoSlide() {
        const nextIndex = (currentIndex + 1) % slides.length;
        moveToSlide(nextIndex);
    }

    indicators.forEach((btn, index) => {
        btn.addEventListener('click', () => moveToSlide(index));
    });

    setInterval(autoSlide, 5000); // Troca automaticamente a cada 5 segundos

// Função para redirecionar para a página de criação de eventos
function goToCreateEvent() {
    window.location.href = 'createEvent.html';
}



closeButton.addEventListener('click', () => {
    userOptionsContainer.classList.remove('show');
});

// Função para alternar a visibilidade do container de opções do usuário
function toggleUserOptions() {
    const userOptionsContainer = document.getElementById('userOptionsContainer');

    // Alterna a visibilidade do container
    if (userOptionsContainer.style.display === 'none' || userOptionsContainer.style.display === '') {
        userOptionsContainer.style.display = 'block';
    } else {
        userOptionsContainer.style.display = 'none';
    }
}

function goToWallet() {
    window.location.href = 'wallet.html';
}

function goToAdminPage() {
    window.location.href = "admin.html"; 
}

function goToBettingPage() {
    window.location.href = 'bet.html'; // Redireciona para a página de apostas
}

// Função para buscar eventos
async function searchEvents() {
    const query = document.getElementById('searchInput').value;

    if (query) {
        alert(`Buscando eventos com: ${query}`);

        try {
            const response = await fetch(`http://localhost:3000/searchEvents?keyword=${query}`);
            const events = await response.json();

            console.log('Eventos encontrados:', events); // Log dos eventos encontrados

            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = ''; // Limpar os resultados anteriores

            if (events.length === 0) {
                resultsContainer.innerHTML = '<p>Nenhum evento encontrado.</p>';
            } else {
                events.forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('event');
                    eventElement.innerHTML = `
                        <div class="event-card">
                            <h3>${event.title}</h3>
                            <p>${event.description}</p>
                            <p><strong>Data:</strong> ${new Date(event.event_date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> ${event.status}</p>
                            <p><strong>Criado em:</strong> ${new Date(event.created_at).toLocaleDateString()}</p>
                            <p><strong>Atualizado em:</strong> ${new Date(event.updated_at).toLocaleDateString()}</p>
                            <button onclick="window.location.href='bet.html?eventId=${event.id}'">Apostar</button>
                            <button class="close-btn" onclick="removeCard(this)">Fechar</button>
                        </div>
                    `;
                    resultsContainer.appendChild(eventElement);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            alert('Erro ao buscar eventos.');
        }
    } else {
        alert('Por favor, insira um termo de busca.');
    }
}

// Função para remover um card
function removeCard(button) {
    const card = button.closest('.event-card'); 
    card.remove(); // Remove o card do DOM
}

function logout() {
    window.location.href = "login.html"; 
}


// Função para exibir detalhes do evento em um overlay
function showEventDetails(eventId, title, description, eventDate, status) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.innerHTML = `
        <div class="event-detail-card">
            <h2>Detalhes do Evento</h2>
            <p><strong>Título:</strong> ${title}</p>
            <p><strong>Descrição:</strong> ${description}</p>
            <p><strong>Data:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${status}</p>
            <button class="bet-button" onclick="window.location.href='bet.html?eventId=${eventId}'">Apostar</button>
            <button onclick="closeEventDetails()">Fechar</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Função para fechar o overlay de detalhes do evento
function closeEventDetails() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.remove();
    }
}
