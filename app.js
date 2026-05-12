/* ========================================= */
/* 1. РОУТЕР (Чистые URL через History API)  */
/* ========================================= */

// Функция открытия статьи с изменением URL
function openArticle(id, addToHistory = true) {
    const crisis = crisesData.find(c => c.id === id);
    if (!crisis) return;

    if (addToHistory) {
        // Меняем URL без перезагрузки страницы (например: /dotcom-bubble)
        history.pushState({ id: id }, crisis.title, `/${id}`);
    }

    const articleContainer = document.getElementById('article-content');
    
    // Подготовка текста. Разделим его, чтобы вставить график в середину (Скроллтеллинг)
    let storyHTML = '';
    crisis.story.forEach((p, index) => {
        storyHTML += `<p class="story-block">${p}</p>`;
        // Вставляем график после второго абзаца
        if (index === 1) {
            storyHTML += `
                <div class="scroll-chart-container glass-panel">
                    <svg viewBox="0 0 500 200" preserveAspectRatio="none" style="width: 100%; height: 100%;">
                        <!-- SVG линия краха -->
                        <path class="crash-path" d="M0,50 Q100,40 150,60 T300,80 Q350,80 400,180 T500,190"></path>
                    </svg>
                </div>
            `;
        }
    });

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

    articleContainer.innerHTML = `
        <img src="${crisis.imageUrl}" class="article-cover" alt="${crisis.title}">
        <h1 class="article-title">${crisis.title} (${crisis.year})</h1>
        <h3 style="color: #ccc; margin-top: 0;">${crisis.subtitle}</h3>
        <div class="loss-stat">⚠️ Ущерб: ${crisis.losses}</div>
        ${storyHTML}
        ${interactHTML}
    `;

    // Скрытие главной и показ статьи
    document.querySelectorAll('.main-section').forEach(sec => sec.classList.add('hidden'));
    const articleSection = document.getElementById('crisis-article');
    articleSection.classList.remove('hidden');
    articleSection.classList.add('fade-in');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Инициализируем анимацию графиков
    initScrollCharts();
}

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