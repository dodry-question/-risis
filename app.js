// Функция плавного скролла с учетом высоты Sticky Header
function scrollToSection(id) {
    const element = document.getElementById(id);
    const headerOffset = 80; // Высота фиксированного меню
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}

// 1. Отрисовка теоретического блока
function renderTheory() {
    const container = document.getElementById('theory-container');
    
    let causesHTML = theoryData.causes.map(cause => `<span class="cause-tag">${cause}</span>`).join('');
    let typesHTML = theoryData.types.map(type => `
        <li style="margin-bottom: 10px;">
            <strong style="color: var(--accent);">${type.name}:</strong> ${type.desc}
        </li>
    `).join('');
    
    container.innerHTML = `
        <div class="theory-card">
            <h3>${theoryData.title}</h3>
            <p>${theoryData.definition}</p>
            <div style="margin: 25px 0;">
                <h4 style="margin-bottom: 10px;">Классификация кризисов:</h4>
                <ul style="padding-left: 20px;">${typesHTML}</ul>
            </div>
            <h4>Главные триггеры:</h4>
            <div class="causes-list">${causesHTML}</div>
            <div style="margin-top: 25px; padding: 15px; background: #2a0808; border-left: 3px solid var(--accent);">
                <i>${theoryData.socialImpact}</i>
            </div>
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

// 3. НОВАЯ ФУНКЦИЯ: Отрисовка словаря терминов
function renderGlossary() {
    const container = document.getElementById('glossary-container');
    container.innerHTML = glossaryData.map(item => `
        <div class="glossary-card">
            <h4>${item.term}</h4>
            <p>${item.definition}</p>
        </div>
    `).join('');
}

// 4. Открытие конкретного кризиса (с картинкой и классом анимации)
function openArticle(id) {
    const crisis = crisesData.find(c => c.id === id);
    if (!crisis) return;

    const articleContainer = document.getElementById('article-content');
    
    // Формируем текст абзацев
    const storyHTML = crisis.story.map(p => `<p class="story-block">${p}</p>`).join('');

    // Встраиваем интерактивный блок
    const interactHTML = `
        <div class="interactive-box">
            <h3>Симулятор: ${crisis.interactiveQuestion.question}</h3>
            <div class="options">
                <button onclick="showResult('${id}', 0)">${crisis.interactiveQuestion.options[0].text}</button>
                <button onclick="showResult('${id}', 1)">${crisis.interactiveQuestion.options[1].text}</button>
            </div>
            <div id="result-${id}" class="result-box hidden"></div>
        </div>
    `;

    // ДОБАВЛЕНО: Вывод картинки imageUrl перед текстом
    articleContainer.innerHTML = `
        <img src="${crisis.imageUrl}" class="article-cover" alt="${crisis.title}">
        <h1 style="font-size: 3rem; margin-bottom: 5px;">${crisis.title} (${crisis.year})</h1>
        <h3 style="color: #888; margin-top: 0;">${crisis.subtitle}</h3>
        <div class="loss-stat">⚠️ Ущерб: ${crisis.losses}</div>
        ${storyHTML}
        ${interactHTML}
    `;

    // Скрываем все главные секции (через общий класс .main-section)
    document.querySelectorAll('.main-section').forEach(sec => sec.classList.add('hidden'));
    
    // Показываем статью и добавляем анимацию fade-in
    const articleSection = document.getElementById('crisis-article');
    articleSection.classList.remove('hidden');
    articleSection.classList.add('fade-in');
    
    // Прокручиваем наверх статьи (учитывая высоту шапки)
    window.scrollTo({ top: articleSection.offsetTop - 80, behavior: 'smooth' });
}

// 5. Логика для симулятора
function showResult(crisisId, optionIndex) {
    const crisis = crisesData.find(c => c.id === crisisId);
    const resultBox = document.getElementById(`result-${crisisId}`);
    
    resultBox.innerHTML = crisis.interactiveQuestion.options[optionIndex].result;
    resultBox.classList.remove('hidden');
}

// 6. Закрыть статью и вернуться на главный экран
function closeArticle() {
    const articleSection = document.getElementById('crisis-article');
    articleSection.classList.add('hidden');
    articleSection.classList.remove('fade-in');

    // Возвращаем видимость всем главным секциям
    document.querySelectorAll('.main-section').forEach(sec => sec.classList.remove('hidden'));
    
    // Плавно скроллим обратно к таймлайну
    scrollToSection('timeline');
}

// Инициализация при загрузке страницы
window.onload = () => {
    renderTheory();
    renderTimeline();
    renderGlossary(); // Рендерим новый словарь
};