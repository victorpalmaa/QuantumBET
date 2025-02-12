document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createEventForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Evita o comportamento padrão do formulário

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const quotaValue = document.getElementById('quotaValue').value;
        const betStart = document.getElementById('betStart').value;
        const betEnd = document.getElementById('betEnd').value;
        const eventDate = document.getElementById('eventDate').value;

        const responseMessage = document.getElementById('responseMessage');
        responseMessage.textContent = ''; // Limpa a mensagem anterior

        console.log('Form data:', { title, description, quotaValue, betStart, betEnd, eventDate });

        // Validação de data
        const currentDate = new Date(); 
        const eventDateObj = new Date(eventDate); 
        
        if (eventDateObj < currentDate) {
            responseMessage.style.color = 'red';
            responseMessage.textContent = 'Erro: A data do evento não pode ser no passado.';
            console.log('Erro: A data do evento já passou.');
            return;
        }

        try {
            const token = localStorage.getItem('token'); // Obtém o token JWT do localStorage
            console.log('Token:', token);

            if (!token) {
                responseMessage.style.color = 'red';
                responseMessage.textContent = 'Erro: Usuário não autenticado.';
                console.log('Erro: Token não encontrado.');
                return;
            }

            const response = await fetch('http://localhost:3000/addNewEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Envia o token no cabeçalho
                },
                body: JSON.stringify({
                    title,
                    description,
                    event_date: eventDate,
                    quota_value: quotaValue,
                    bet_start: betStart,
                    bet_end: betEnd
                }),
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                responseMessage.style.color = 'green';
                responseMessage.textContent = 'Evento criado com sucesso!';
                console.log('Evento criado com sucesso!');
            } else {
                const error = await response.text();
                responseMessage.style.color = 'red';
                responseMessage.textContent = `Erro: ${error}`;
                console.error('Erro no servidor:', error);
            }
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            responseMessage.style.color = 'red';
            responseMessage.textContent = 'Erro ao conectar com o servidor.';
        }
    });
});
