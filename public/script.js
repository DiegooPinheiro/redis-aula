document.addEventListener('DOMContentLoaded', () => {
    const loadBtn = document.getElementById('loadBtn');
    const imageIdInput = document.getElementById('imageId');
    const btnText = document.querySelector('.btn-text');
    const loader = document.querySelector('.loader');
    
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const imageDisplay = document.getElementById('imageDisplay');
    const resultImage = document.getElementById('resultImage');
    
    const metricsPanel = document.getElementById('metricsPanel');
    const sourceCard = document.getElementById('sourceCard');
    const sourceValue = document.getElementById('sourceValue');
    const timeValue = document.getElementById('timeValue');
    
    const historyList = document.getElementById('historyList');

    loadBtn.addEventListener('click', async () => {
        const imgId = imageIdInput.value;
        if (!imgId || imgId < 1) return;

        // Set Loading State
        setLoading(true);
        resetDisplay();

        try {
            const response = await fetch(`/imagem/${imgId}`);
            if (!response.ok) throw new Error("Erro na rede ou servidor");

            const result = await response.json();
            
            // Render Result
            renderResult(result, imgId);
            
            // Add to History
            addToHistory(result, imgId);

        } catch (error) {
            console.error(error);
            alert("Erro ao carregar os dados. Verifique o console do navegador e se o servidor backend está rodando e conectado ao Redis.");
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        loadBtn.disabled = isLoading;
        if (isLoading) {
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
        } else {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    }

    function resetDisplay() {
        imagePlaceholder.classList.remove('hidden');
        imageDisplay.classList.add('hidden');
        metricsPanel.classList.add('hidden');
    }

    function renderResult(result, imgId) {
        // Hide placeholder, show image
        imagePlaceholder.classList.add('hidden');
        imageDisplay.classList.remove('hidden');
        metricsPanel.classList.remove('hidden');

        // Set Image (base64 string)
        resultImage.src = result.data.blob;
        
        // Update Metrics
        sourceValue.textContent = result.source === 'redis' ? 'REDIS (Cache)' : 'DATABASE LENTO';
        sourceCard.setAttribute('data-source', result.source);
        
        timeValue.textContent = `${result.timeTakenMs}ms`;
    }

    function addToHistory(result, imgId) {
        const li = document.createElement('li');
        
        const spanId = document.createElement('span');
        spanId.textContent = `Imagem #${imgId}`;
        
        const spanSource = document.createElement('span');
        spanSource.className = result.source === 'redis' ? 'history-span-redis' : 'history-span-db';
        spanSource.textContent = result.source === 'redis' ? 'REDIS HIT' : 'DB MISS';

        const spanTime = document.createElement('span');
        spanTime.className = 'history-span-time';
        spanTime.textContent = `${result.timeTakenMs}ms`;

        li.appendChild(spanId);
        li.appendChild(spanSource);
        li.appendChild(spanTime);
        
        historyList.prepend(li); // add to top
    }
});
