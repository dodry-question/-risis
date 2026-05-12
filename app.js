// Функция плавного скролла
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// 1. Отрисовка теоретического блока
function renderTheory() {
    const container = document.getElementById('theory-container');
    let causesHTML = theoryData.causes.map(cause => `<span class="cause-tag">${cause}</span>`).join('');
    
    container.innerHTML = `
        <div class="theory-card">
            <h3>${theoryData.title}</h3>
            <p>${theoryData.definition}</p>
            <p><em>"${theoryData.quote}"</em></p>
            <h4>Главные триггеры:</h4>
            <div class="causes-list">${causesHTML}</div>
        </div>
    `;
}

// 2. Отрисовка Таймлайна
function renderTimeline() {
    const container = document.getElementById('timeline-container');
    crisesData.forEach(crisis => {
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        dot.setAttribute('data-year', crisis.year);
        dot.title = crisis.title;
        dot.onclick = () => openArticle(crisis.id);
        container.appendChild(dot);
    });
}

// 3. Открытие конкретного кризиса
function openArticle(id) {
    const crisis = crisesData.find(c => c.id === id);
    if (!crisis) return;

    const articleContainer = document.getElementById('article-content');
    
    // Формируем текст абзацев
    const storyHTML = crisis.story.map(p => `<p class="story-block">${p}</p>`).join('');

    // Встраиваем интерактивный блок "А что бы сделали вы?"
    const interactHTML = `
        <div class="interactive-box" id="interact-${id}">
            <h3>Симулятор: ${crisis.interactiveQuestion.question}</h3>
            <div class="options">
                <button onclick="showResult('${id}', 0)">${crisis.interactiveQuestion.options[0].text}</button>
                <button onclick="showResult('${id}', 1)">${crisis.interactiveQuestion.options[1].text}</button>
            </div>
            <div id="result-${id}" class="result-box hidden"></div>
        </div>
    `;

    articleContainer.innerHTML = `
        <h1 style="font-size: 3rem; margin-bottom: 5px;">${crisis.title} (${crisis.year})</h1>
        <h3 style="color: #888; margin-top: 0;">${crisis.subtitle}</h3>
        <div class="loss-stat">⚠️ Ущерб: ${crisis.losses}</div>
        ${storyHTML}
        ${interactHTML}
    `;

    document.getElementById('timeline').classList.add('hidden');
    document.getElementById('theory').classList.add('hidden');
    document.querySelector('.hero').classList.add('hidden');
    
    const articleSection = document.getElementById('crisis-article');
    articleSection.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// 4. Логика для симулятора
function showResult(crisisId, optionIndex) {
    const crisis = crisesData.find(c => c.id === crisisId);
    const resultBox = document.getElementById(`result-${crisisId}`);
    
    resultBox.innerHTML = crisis.interactiveQuestion.options[optionIndex].result;
    resultBox.classList.remove('hidden');
}

// 5. Закрыть статью и вернуться
function closeArticle() {
    document.getElementById('crisis-article').classList.add('hidden');
    document.getElementById('timeline').classList.remove('hidden');
    document.getElementById('theory').classList.remove('hidden');
    document.querySelector('.hero').classList.remove('hidden');
    scrollToSection('timeline');
}

// Инициализация сайта
window.onload = () => {
    renderTheory();
    renderTimeline();
};