document.getElementById('finishEventForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Previne o envio padrão do formulário

    const token = localStorage.getItem('token'); // Recupera o token do localStorage
    const eventId = document.getElementById('eventId').value; // ID do evento
    const eventStatus = document.getElementById('eventStatus').value === 'sim' ? 'yes' : 'no'; // Status do evento

    // Fazendo requisição para obter o perfil do usuário e verificar se é admin
    fetch('http://localhost:3000/getProfile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.completeName === "Admin_PI") {
            // Se o usuário for admin, finaliza o evento
            fetch('http://localhost:3000/finishEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    event_id: eventId,
                    admin_id: data.id, // Usando o ID do admin, caso necessário
                    winner: eventStatus, // Status do evento: 'yes' ou 'no'
                }),
            })
            .then(response => response.json())
            .then(result => {
                console.log('Resultado da finalização do evento:', result);
                document.getElementById('message').innerText = result.message || 'Evento finalizado com sucesso!';
            })
            .catch(error => {
                console.error('Erro ao finalizar o evento:', error);
                document.getElementById('message').innerText = 'Erro ao finalizar o evento.';
            });
        } else {
            // Caso não seja admin
            document.getElementById('message').innerText = 'Apenas administradores podem finalizar eventos.';
        }
    })
    .catch(error => {
        console.error('Erro ao verificar o perfil do usuário:', error);
        document.getElementById('message').innerText = 'Erro ao verificar perfil do usuário.';
    });
});
