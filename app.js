// Логика Гамбургер-меню
const burgerBtn = document.getElementById('burger-btn');
const navLinks = document.getElementById('nav-links');

burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Плавный скролл с закрытием мобильного меню
function scrollToSection(id) {
    const element = document.getElementById(id);
    const headerOffset = document.querySelector('.sticky-header').offsetHeight;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });

    // Если открыто мобильное меню - закрываем его
    if (navLinks.classList.contains('active')) {
        burgerBtn.classList.remove('active');
        navLinks.classList.remove('active');
    }
}

// Отрисовка теоретического блока
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
            <div style="margin-top: 25px; padding: 15px; background: #2a0808; border-left: 3px solid var(--accent); border-radius: 4px;">
                <i style="font-size: 0.95rem;">${theoryData.socialImpact}</i>
            </div>
        </div>
    `;
}

// Отрисовка Таймлайна (теперь с поддержкой вертикального вида на мобилках)
function renderTimeline() {
    const container = document.getElementById('timeline-container');
    crisesData.forEach(crisis => {
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        dot.setAttribute('data-year', crisis.year);
        dot.setAttribute('title', crisis.title); // Выводится через CSS на телефонах
        dot.onclick = () => openArticle(crisis.id);
        container.appendChild(dot);
    });
}

// Отрисовка словаря терминов
function renderGlossary() {
    const container = document.getElementById('glossary-container');
    container.innerHTML = glossaryData.map(item => `
        <div class="glossary-card">
            <h4>${item.term}</h4>
            <p style="font-size: 0.95rem;">${item.definition}</p>
        </div>
    `).join('');
}

// Открытие конкретного кризиса
function openArticle(id) {
    const crisis = crisesData.find(c => c.id === id);
    if (!crisis) return;

    const articleContainer = document.getElementById('article-content');
    const storyHTML = crisis.story.map(p => `<p class="story-block">${p}</p>`).join('');

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

    // Обратите внимание: убрал жесткий font-size, добавил класс .article-title для адаптива
    articleContainer.innerHTML = `
        <img src="${crisis.imageUrl}" class="article-cover" alt="${crisis.title}">
        <h1 class="article-title">${crisis.title} (${crisis.year})</h1>
        <h3 style="color: #888; margin-top: 0; font-size: clamp(1rem, 3vw, 1.2rem);">${crisis.subtitle}</h3>
        <div class="loss-stat">⚠️ Ущерб: ${crisis.losses}</div>
        ${storyHTML}
        ${interactHTML}
    `;

    document.querySelectorAll('.main-section').forEach(sec => sec.classList.add('hidden'));
    
    const articleSection = document.getElementById('crisis-article');
    articleSection.classList.remove('hidden');
    articleSection.classList.add('fade-in');
    
    const headerOffset = document.querySelector('.sticky-header').offsetHeight;
    window.scrollTo({ top: articleSection.offsetTop - headerOffset, behavior: 'smooth' });
}

// Логика для симулятора
function showResult(crisisId, optionIndex) {
    const crisis = crisesData.find(c => c.id === crisisId);
    const resultBox = document.getElementById(`result-${crisisId}`);
    
    resultBox.innerHTML = crisis.interactiveQuestion.options[optionIndex].result;
    resultBox.classList.remove('hidden');
}

// Закрыть статью и вернуться
function closeArticle() {
    const articleSection = document.getElementById('crisis-article');
    articleSection.classList.add('hidden');
    articleSection.classList.remove('fade-in');

    document.querySelectorAll('.main-section').forEach(sec => sec.classList.remove('hidden'));
    scrollToSection('timeline');
}

window.onload = () => {
    renderTheory();
    renderTimeline();
    renderGlossary();
};