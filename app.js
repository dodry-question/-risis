/* ========================================= */
/* 0. РЕНДЕР И НАВИГАЦИЯ (Базовые функции)   */
/* ========================================= */

// Функция плавного скролла и навигации
function scrollToSection(id) {
    const articleSection = document.getElementById('crisis-article');
    const targetElement = document.getElementById(id);
    
    // 1. Если мы находимся внутри статьи (главные секции скрыты)
    if (!articleSection.classList.contains('hidden')) {
        closeArticle(false);
        history.pushState(null, 'Главная', '/');
    }

    // 2. Делаем плавный скролл
    setTimeout(() => {
        if (targetElement) {
            const headerOffset = document.querySelector('.sticky-header').offsetHeight || 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }, 50);

    // 3. Закрываем мобильное меню (Бургер)
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

    container.innerHTML = '<div class="timeline-line"></div>';
    
    crisesData.forEach(crisis => {
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        dot.setAttribute('data-year', crisis.year);
        dot.setAttribute('title', crisis.title);
        dot.onclick = () => openArticle(crisis.id);
        container.appendChild(dot);
    });
}

// Рендер Словаря
function renderGlossary() {
    const container = document.getElementById('glossary-container');
    if (!container || typeof glossaryData === 'undefined') return;

    container.innerHTML = glossaryData.map(item => `
        <div class="glossary-card glass-panel">
            <h4>${item.term}</h4>
            <p style="font-size: 0.95rem;">${item.definition}</p>
        </div>
    `).join('');
}

/* ========================================= */
/* 1. ФУНКЦИИ СТАТЬИ И СИМУЛЯТОРА            */
/* ========================================= */

// Функция открытия статьи
// Функция открытия статьи
function openArticle(id, addToHistory = true) {
    const crisis = crisesData.find(c => c.id === id);
    if (!crisis) return;

    if (addToHistory) {
        history.pushState({ id: id }, crisis.title, `/${id}`);
    }

    const articleContainer = document.getElementById('article-content');
    const storyHTML = crisis.story.map(p => `<p class="story-block">${p}</p>`).join('');

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

    // Генерируем HTML для ВСЕХ вопросов из массива
    let interactHTML = '';
    if (crisis.interactiveQuestions) {
        crisis.interactiveQuestions.forEach((q, qIndex) => {
            interactHTML += `
                <div class="interactive-box glass-panel" style="margin-bottom: 20px;">
                    <h3 style="color: #ffeb3b; font-size: 1.1rem; text-align: left;">Вопрос ${qIndex + 1}: ${q.question}</h3>
                    <div class="options">
                        <button id="btn-${id}-${qIndex}-0" class="glass-btn" onclick="window.showResult('${id}', ${qIndex}, 0)">${q.options[0].text}</button>
                        <button id="btn-${id}-${qIndex}-1" class="glass-btn" onclick="window.showResult('${id}', ${qIndex}, 1)">${q.options[1].text}</button>
                    </div>
                    <div id="result-${id}-${qIndex}" class="result-box hidden"></div>
                </div>
            `;
        });
    }

    articleContainer.innerHTML = `
        <img src="${crisis.imageUrl}" class="article-cover" alt="${crisis.title}">
        <h1 class="article-title">${crisis.title} (${crisis.year})</h1>
        <h3 style="color: #ccc; margin-top: 0;">${crisis.subtitle}</h3>
        <div class="loss-stat">⚠️ Ущерб: ${crisis.losses}</div>
        
        ${causesHTML}
        ${storyHTML}
        ${consequencesHTML}
        
        <h2 style="margin-top: 50px;">Проверка знаний</h2>
        ${interactHTML}
    `;

    document.querySelectorAll('.main-section').forEach(sec => sec.classList.add('hidden'));
    const articleSection = document.getElementById('crisis-article');
    articleSection.classList.remove('hidden');
    articleSection.classList.add('fade-in');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Вывод результата симулятора с подсветкой
window.showResult = function(crisisId, qIndex, optionIndex) {
    const crisis = crisesData.find(c => c.id === crisisId);
    if (!crisis) return;
    
    const question = crisis.interactiveQuestions[qIndex];
    const selectedOption = question.options[optionIndex];
    const resultBox = document.getElementById(`result-${crisisId}-${qIndex}`);
    
    // Находим обе кнопки этого конкретного вопроса
    const btn0 = document.getElementById(`btn-${crisisId}-${qIndex}-0`);
    const btn1 = document.getElementById(`btn-${crisisId}-${qIndex}-1`);

    // Сбрасываем цвета у обеих кнопок (чтобы можно было перевыбрать)
    btn0.classList.remove('correct-answer', 'wrong-answer');
    btn1.classList.remove('correct-answer', 'wrong-answer');

    // Применяем нужный класс к нажатой кнопке
    const clickedBtn = optionIndex === 0 ? btn0 : btn1;
    if (selectedOption.isCorrect) {
        clickedBtn.classList.add('correct-answer');
    } else {
        clickedBtn.classList.add('wrong-answer');
    }

    // Показываем текст результата
    if (resultBox) {
        // Добавляем иконку в зависимости от правильности
        const icon = selectedOption.isCorrect ? "✅ " : "❌ ";
        resultBox.innerHTML = `<b>${icon}</b> ` + selectedOption.result;
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
/* 2. ИНИЦИАЛИЗАЦИЯ И ИНТЕРАКТИВ (МОДАЛКА)   */
/* ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Мобильное меню (Бургер) ---
    const burgerBtn = document.getElementById('burger-btn');
    const navLinks = document.getElementById('nav-links');

    if (burgerBtn && navLinks) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // --- Рендер контента ---
    if (typeof renderTheory === 'function') renderTheory();
    if (typeof renderTimeline === 'function') renderTimeline();
    if (typeof renderGlossary === 'function') renderGlossary();

    // --- Роутер (чистые ссылки) ---
    const path = window.location.pathname.replace(/^\/+/g, '');
    const validCrisisIds = typeof crisesData !== 'undefined' ? crisesData.map(c => c.id) : [];

    if (path && validCrisisIds.includes(path)) {
        openArticle(path, false);
    }

    // --- Машина времени (Модальное окно) ---
    const timeMachineBtn = document.getElementById('btn-time-machine');
    const timeMachineModal = document.getElementById('time-machine-modal');
    const closeTmBtn = document.getElementById('close-time-machine');
    const calcBtn = document.getElementById('tm-calculate');
    const resultBox = document.getElementById('tm-result');

    if (timeMachineBtn && timeMachineModal) {
        // Открытие
        timeMachineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            timeMachineModal.classList.remove('hidden');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (burgerBtn) burgerBtn.classList.remove('active');
            }
        });

        // Закрытие по крестику
        closeTmBtn.addEventListener('click', () => {
            timeMachineModal.classList.add('hidden');
            resultBox.classList.add('hidden');
        });

        // Закрытие по клику вне окна
        timeMachineModal.addEventListener('click', (e) => {
            if (e.target === timeMachineModal) {
                timeMachineModal.classList.add('hidden');
                resultBox.classList.add('hidden');
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
                    resultText = `Вы держали <b>${amount}</b> рублей под подушкой. После дефолта 17 августа их покупательная способность упала в 4 раза (эквивалент <b>${left1998} руб.</b>). Импортный телевизор, о котором вы мечтали, стал недоступен.`;
                    break;
                case "2000":
                    resultText = `На <b>$${amount}</b> вы купили акции стартапа Pets.com. Через 268 дней компания обанкротилась. Ваш баланс: <b>$0</b>. Вы стали гордым обладателем красивых, но бесполезных бумажек.`;
                    break;
                case "2008":
                    let left2008 = (amount * 0.5).toFixed(2);
                    resultText = `Вы купили дом, вложив <b>$${amount}</b>. После краха пузыря и банкротства Lehman Brothers ваш дом обесценился вдвое (<b>$${left2008}</b>), а банк грозится его забрать.`;
                    break;
            }

            resultBox.innerHTML = resultText;
            resultBox.classList.remove('hidden');
        });
    }
});