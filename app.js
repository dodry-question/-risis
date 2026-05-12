/* ========================================= */
/* 0. РЕНДЕР И НАВИГАЦИЯ (Базовые функции)   */
/* ========================================= */

// Функция плавного скролла и навигации
function scrollToSection(id) {
    const articleSection = document.getElementById('crisis-article');
    const targetElement = document.getElementById(id);
    
    // 1. Если мы находимся внутри статьи (главные секции скрыты)
    if (!articleSection.classList.contains('hidden')) {
        // Вызываем функцию закрытия статьи (false - чтобы не плодить лишнюю историю в URL)
        closeArticle(false);
        // Так как мы перешли на главную, обновляем URL на корневой
        history.pushState(null, 'Главная', '/');
    }

    // 2. Делаем плавный скролл (через setTimeout, чтобы DOM успел показать скрытые секции)
    setTimeout(() => {
        if (targetElement) {
            // Используем расчет отступа, чтобы липкая шапка (Sticky Header) не перекрывала заголовки
            const headerOffset = document.querySelector('.sticky-header').offsetHeight || 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }, 50);

    // 3. Закрываем мобильное меню (Бургер), если оно открыто
    const navLinks = document.getElementById('nav-links');
    const burgerBtn = document.getElementById('burger-btn');
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (burgerBtn) burgerBtn.classList.remove('active');
    }
}

// Рендер теоретического блока
function renderTheory() {
    const container = document.getElementById('theory-container');
    if (!container || typeof theoryData === 'undefined') return;
    
    let causesHTML = theoryData.causes.map(cause => `<span class="cause-tag">${cause}</span>`).join('');
    let typesHTML = theoryData.types.map(type => `
        <li style="margin-bottom: 10px;">
            <strong style="color: var(--accent);">${type.name}:</strong> ${type.desc}
        </li>
    `).join('');
    
    // Добавил класс glass-panel, чтобы карточка тоже была с эффектом глассморфизма
    container.innerHTML = `
        <div class="theory-card glass-panel">
            <h3>${theoryData.title}</h3>
            <p>${theoryData.definition}</p>
            <div style="margin: 25px 0;">
                <h4 style="margin-bottom: 10px;">Классификация кризисов:</h4>
                <ul style="padding-left: 20px;">${typesHTML}</ul>
            </div>
            <h4>Главные триггеры:</h4>
            <div class="causes-list">${causesHTML}</div>
            <div style="margin-top: 25px; padding: 15px; background: rgba(42, 8, 8, 0.4); border-left: 3px solid var(--accent); border-radius: 8px;">
                <i style="font-size: 0.95rem;">${theoryData.socialImpact}</i>
            </div>
        </div>
    `;
}

// Рендер Таймлайна
function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container || typeof crisesData === 'undefined') return;

    // Сначала очищаем контейнер, оставляя только центральную линию
    container.innerHTML = '<div class="timeline-line"></div>';
    
    crisesData.forEach(crisis => {
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        dot.setAttribute('data-year', crisis.year);
        dot.setAttribute('title', crisis.title);
        // При клике открываем статью, передавая id кризиса
        dot.onclick = () => openArticle(crisis.id);
        container.appendChild(dot);
    });
}

// Рендер Словаря терминов
function renderGlossary() {
    const container = document.getElementById('glossary-container');
    if (!container || typeof glossaryData === 'undefined') return;

    // Выводим карточки словаря с эффектом glass-panel
    container.innerHTML = glossaryData.map(item => `
        <div class="glossary-card glass-panel">
            <h4>${item.term}</h4>
            <p style="font-size: 0.95rem;">${item.definition}</p>
        </div>
    `).join('');
}


/* ========================================= */
/* ОБНОВЛЕННЫЕ ФУНКЦИИ СТАТЬИ И СИМУЛЯТОРА   */
/* ========================================= */

// Функция открытия статьи
function openArticle(id, addToHistory = true) {
    const crisis = crisesData.find(c => c.id === id);
    if (!crisis) return;

    if (addToHistory) {
        history.pushState({ id: id }, crisis.title, `/${id}`);
    }

    const articleContainer = document.getElementById('article-content');
    
    // Формируем текст абзацев (ГРАФИКИ УДАЛЕНЫ)
    const storyHTML = crisis.story.map(p => `<p class="story-block">${p}</p>`).join('');

    // Формируем новые блоки Причин и Последствий
    const causesHTML = `
        <div class="causes-box glass-panel">
            <h4 style="color: var(--accent); margin-top:0; font-size: 1.2rem;">⚡ Причины кризиса:</h4>
            <ul>${crisis.causes.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
    `;

    const consequencesHTML = `
        <div class="consequences-box glass-panel">
            <h4 style="color: #4caf50; margin-top:0; font-size: 1.2rem;">🌊 Последствия:</h4>
            <ul>${crisis.consequences.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
    `;

    const interactHTML = `
        <div class="interactive-box glass-panel">
            <h3>Симулятор: ${crisis.interactiveQuestion.question}</h3>
            <div class="options">
                <button class="glass-btn" onclick="showResult('${id}', 0)">${crisis.interactiveQuestion.options[0].text}</button>
                <button class="glass-btn" onclick="showResult('${id}', 1)">${crisis.interactiveQuestion.options[1].text}</button>
            </div>
            <div id="result-${id}" class="result-box hidden"></div>
        </div>
    `;

    // Собираем страницу в правильном порядке
    articleContainer.innerHTML = `
        <img src="${crisis.imageUrl}" class="article-cover" alt="${crisis.title}">
        <h1 class="article-title">${crisis.title} (${crisis.year})</h1>
        <h3 style="color: #ccc; margin-top: 0;">${crisis.subtitle}</h3>
        <div class="loss-stat">⚠️ Ущерб: ${crisis.losses}</div>
        
        ${causesHTML}
        ${storyHTML}
        ${consequencesHTML}
        
        ${interactHTML}
    `;

    // Скрытие главной и показ статьи
    document.querySelectorAll('.main-section').forEach(sec => sec.classList.add('hidden'));
    const articleSection = document.getElementById('crisis-article');
    articleSection.classList.remove('hidden');
    articleSection.classList.add('fade-in');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ГЛОБАЛЬНАЯ функция симулятора (привязана к объекту window, чтобы кнопки в HTML ее "видели")
window.showResult = function(crisisId, optionIndex) {
    const crisis = crisesData.find(c => c.id === crisisId);
    if (!crisis) return;
    
    const resultBox = document.getElementById(`result-${crisisId}`);
    if (resultBox) {
        resultBox.innerHTML = crisis.interactiveQuestion.options[optionIndex].result;
        resultBox.classList.remove('hidden');
    }
};

// Функция возврата на главную
function closeArticle(addToHistory = true) {
    if (addToHistory) {
        history.pushState(null, 'Главная', '/');
    }
    const articleSection = document.getElementById('crisis-article');
    articleSection.classList.add('hidden');
    articleSection.classList.remove('fade-in');

    document.querySelectorAll('.main-section').forEach(sec => sec.classList.remove('hidden'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Обработка кнопок браузера "Вперед/Назад"
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.id) {
        openArticle(event.state.id, false);
    } else {
        closeArticle(false);
    }
});


/* ========================================= */
/* 2. ИНТЕРАКТИВ: ЖИВЫЕ ГРАФИКИ (Observer)   */
/* ========================================= */

function initScrollCharts() {
    const paths = document.querySelectorAll('.crash-path');
    
    // Подготавливаем линии (скрываем их через dashoffset)
    paths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length; // Скрыто
    });

    // Настраиваем Observer (срабатывает, когда график на 50% в зоне видимости)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Запускаем анимацию (рисуем линию)
                const path = entry.target.querySelector('.crash-path');
                if (path) path.style.strokeDashoffset = '0';
                observer.unobserve(entry.target); // Рисуем 1 раз
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.scroll-chart-container').forEach(container => {
        observer.observe(container);
    });
}


/* ========================================= */
/* 3. ИНТЕРАКТИВ: МАШИНА ВРЕМЕНИ (Модалка)   */
/* ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация Роутера при первой загрузке
    const path = window.location.pathname.replace('/', '');
    const validCrisisIds = crisesData.map(c => c.id);
    
    if (path && validCrisisIds.includes(path)) {
        openArticle(path, false);
    } else {
        // Рендерим главную, если нет пути
        renderTheory();
        renderTimeline();
        renderGlossary();
    }

    // 2. Логика Модального окна
    const timeMachineBtn = document.getElementById('btn-time-machine');
    const timeMachineModal = document.getElementById('time-machine-modal');
    const closeTmBtn = document.getElementById('close-time-machine');
    const calcBtn = document.getElementById('tm-calculate');
    const resultBox = document.getElementById('tm-result');

    // Открытие модалки (с учетом мобильного меню)
    timeMachineBtn.addEventListener('click', (e) => {
        e.preventDefault();
        timeMachineModal.classList.remove('hidden');
        // Закрываем бургер меню, если открыто
        const navLinks = document.getElementById('nav-links');
        const burgerBtn = document.getElementById('burger-btn');
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            burgerBtn.classList.remove('active');
        }
    });

    // Закрытие модалки
    closeTmBtn.addEventListener('click', () => {
        timeMachineModal.classList.add('hidden');
        resultBox.classList.add('hidden');
    });

    // Закрытие по клику вне контента
    timeMachineModal.addEventListener('click', (e) => {
        if (e.target === timeMachineModal) {
            timeMachineModal.classList.add('hidden');
        }
    });

    // Логика Калькулятора
    calcBtn.addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('tm-amount').value);
        const era = document.getElementById('tm-era').value;
        
        if (isNaN(amount) || amount <= 0) {
            resultBox.innerHTML = "Пожалуйста, введите корректную сумму.";
            resultBox.classList.remove('hidden');
            return;
        }

        let resultText = "";
        
        switch(era) {
            case "1929":
                let left1929 = (amount * 0.1).toFixed(2);
                resultText = `Вложенные <b>$${amount}</b> в акции перед "Черным четвергом" превратились бы в <b>$${left1929}</b> к 1932 году (потеря 90%). На эти деньги вы смогли бы купить лишь пару ящиков консервов для выживания в "Гувервилле".`;
                break;
            case "1998":
                let left1998 = (amount / 4).toFixed(2);
                resultText = `Вы держали <b>${amount} рублей</b> под подушкой. После дефолта 17 августа и девальвации их покупательная способность упала в 4 раза (эквивалент <b>${left1998} руб.</b>). Импортный телевизор, о котором вы мечтали, стал вам недоступен.`;
                break;
            case "2000":
                resultText = `На <b>$${amount}</b> вы купили акции модного стартапа Pets.com. Через 268 дней компания обанкротилась. Ваш баланс: <b>$0</b>. Вы стали гордым обладателем красивых, но бесполезных бумажек.`;
                break;
            case "2008":
                let left2008 = (amount * 0.5).toFixed(2);
                resultText = `Вы купили дом, вложив <b>$${amount}</b>. После краха ипотечного пузыря и банкротства Lehman Brothers ваш дом обесценился вдвое (<b>$${left2008}</b>), а банк грозится его забрать из-за роста плавающей ставки.`;
                break;
        }

        resultBox.innerHTML = resultText;
        resultBox.classList.remove('hidden');
    });
});