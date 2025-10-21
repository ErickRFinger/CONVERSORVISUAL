document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('conversion-form');
    const resultContainer = document.getElementById('result');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(form);
        const response = await fetch('/api/converter', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            resultContainer.innerHTML = `<p>Conversão realizada com sucesso: ${result.filePath}</p>`;
        } else {
            resultContainer.innerHTML = '<p>Erro na conversão. Tente novamente.</p>';
        }
    });
});