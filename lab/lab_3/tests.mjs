/**
 * Модуль: Тестирование очередей
 * Содержит все тесты и вспомогательные классы (DateBirth, Person)
 * @module QueueTests
 */

// Импортируем реализации очередей
import LinkedListQueue from './queue-linked-list.mjs';
import StackQueue from './queue-stack.mjs';

/**
 * Класс для представления даты рождения
 * @class DateBirth
 */
class DateBirth {
    /**
     * Создает экземпляр даты
     * @param {number} day - День (1-31)
     * @param {number} month - Месяц (1-12)
     * @param {number} year - Год
     */
    constructor(day, month, year) {
        this.day = day;
        this.month = month;
        this.year = year;
    }

    /**
     * Преобразует дату в строку формата ДД.ММ.ГГГГ
     * @returns {string} Строковое представление даты
     */
    toString() {
        return `${this.day.toString().padStart(2, '0')}.${this.month.toString().padStart(2, '0')}.${this.year}`;
    }

    /**
     * Вычисляет возраст на указанную дату
     * @param {Date} [currentDate=new Date(2024, 0, 1)] - Текущая дата
     * @returns {number} Возраст в годах
     */
    getAge(currentDate = new Date(2024, 0, 1)) {
        let age = currentDate.getFullYear() - this.year;
        if (currentDate.getMonth() + 1 < this.month ||
            (currentDate.getMonth() + 1 === this.month && currentDate.getDate() < this.day)) {
            age--;
        }
        return age;
    }
}

/**
 * Класс для представления человека с ФИО и датой рождения
 * @class Person
 */
class Person {
    /**
     * Создает экземпляр человека
     * @param {string} lastName - Фамилия
     * @param {string} firstName - Имя
     * @param {string} patronymic - Отчество
     * @param {DateBirth} birthDate - Дата рождения
     */
    constructor(lastName, firstName, patronymic, birthDate) {
        this.lastName = lastName;
        this.firstName = firstName;
        this.patronymic = patronymic;
        this.birthDate = birthDate;
    }

    /**
     * Преобразует объект человека в строку
     * @returns {string} Строковое представление
     */
    toString() {
        return `${this.lastName} ${this.firstName} ${this.patronymic}, ${this.birthDate.toString()}`;
    }

    /**
     * Возвращает возраст человека
     * @returns {number} Возраст в годах
     */
    getAge() {
        return this.birthDate.getAge();
    }
}

// ====================== ТЕСТЫ ======================

/**
 * Тест 1: Заполнение контейнера 1000 целыми числами
 * @param {function(): (LinkedListQueue<number>|StackQueue<number>)} queueFactory - Фабрика очередей
 * @param {string} queueName - Название очереди для вывода
 */
function testNumbers(queueFactory, queueName) {
    console.log(`\n=== ТЕСТ 1: 1000 целых чисел (${queueName}) ===`);
    const queue = queueFactory();

    // Заполнение числами от -1000 до 1000
    for (let i = 0; i < 1000; i++) {
        const num = Math.floor(Math.random() * 2001) - 1000;
        queue.enqueue(num);
    }

    // Подсчет статистики с использованием итератора
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let count = 0;

    queue.forEach(item => {
        sum += item;
        min = Math.min(min, item);
        max = Math.max(max, item);
        count++;
    });

    const average = sum / count;

    console.log(`Количество элементов: ${count}`);
    console.log(`Сумма: ${sum}`);
    console.log(`Среднее: ${average.toFixed(2)}`);
    console.log(`Минимум: ${min}`);
    console.log(`Максимум: ${max}`);
    console.log(`Проверка isEmpty(): ${queue.isEmpty() ? 'пусто' : 'не пусто'}`);
    console.log(`Проверка size(): ${queue.size()}`);
}

/**
 * Тест 2: Проверка операций вставки и изъятия на 10 строковых элементах
 * @param {function(): (LinkedListQueue<string>|StackQueue<string>)} queueFactory - Фабрика очередей
 * @param {string} queueName - Название очереди для вывода
 */
function testStrings(queueFactory, queueName) {
    console.log(`\n=== ТЕСТ 2: 10 строковых элементов (${queueName}) ===`);
    const queue = queueFactory();
    const strings = [
        "роза", "лилия", "тюльпан", "ромашка", "пион",
        "орхидея", "ирис", "хризантема", "гортензия", "лаванда"
    ];

    console.log("Добавление элементов (enqueue):");
    strings.forEach((str) => {
        queue.enqueue(str);
        console.log(`  Добавлен: "${str}" (размер: ${queue.size()})`);
    });

    console.log("\nИзвлечение элементов (dequeue):");
    while (!queue.isEmpty()) {
        const item = queue.dequeue();
        console.log(`  Извлечен: "${item}" (осталось: ${queue.size()})`);
    }

    console.log(`Очередь пуста: ${queue.isEmpty()}`);
}

/**
 * Тест 3: Заполнение 100 структур Person и фильтрация по возрасту
 * @param {function(): (LinkedListQueue<Person>|StackQueue<Person>)} queueFactory - Фабрика очередей
 * @param {string} queueName - Название очереди для вывода
 */
function testPersons(queueFactory, queueName) {
    console.log(`\n=== ТЕСТ 3: 100 структур Person (${queueName}) ===`);

    // Наборы для генерации
    const lastNames = ["Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов",
        "Попов", "Васильев", "Михайлов", "Федоров", "Морозов"];
    const firstNames = ["Александр", "Дмитрий", "Максим", "Сергей", "Андрей",
        "Алексей", "Артем", "Илья", "Кирилл", "Михаил"];
    const patronymics = ["Александрович", "Дмитриевич", "Максимович", "Сергеевич",
        "Андреевич", "Алексеевич", "Артемович", "Ильич",
        "Кириллович", "Михайлович"];

    /**
     * Функция генерации случайной даты (от 01.01.1980 до 01.01.2020)
     * @returns {DateBirth} Случайная дата
     */
    function randomDate() {
        const start = new Date(1980, 0, 1).getTime();
        const end = new Date(2020, 0, 1).getTime();
        const date = new Date(start + Math.random() * (end - start));
        return new DateBirth(date.getDate(), date.getMonth() + 1, date.getFullYear());
    }

    // Заполнение контейнера 100 структурами
    const queue = queueFactory();
    for (let i = 0; i < 100; i++) {
        const person = new Person(
            lastNames[Math.floor(Math.random() * lastNames.length)],
            firstNames[Math.floor(Math.random() * firstNames.length)],
            patronymics[Math.floor(Math.random() * patronymics.length)],
            randomDate()
        );
        queue.enqueue(person);
    }

    // Фильтрация: люди младше 20 лет и старше 30 лет
    const younger20 = queueFactory();
    const older30 = queueFactory();

    queue.forEach(person => {
        const age = person.getAge();
        if (age < 20) {
            younger20.enqueue(person);
        } else if (age > 30) {
            older30.enqueue(person);
        }
    });

    console.log(`Всего людей: ${queue.size()}`);
    console.log(`Младше 20 лет: ${younger20.size()}`);
    console.log(`Старше 30 лет: ${older30.size()}`);

    // Проверка корректности фильтрации
    let incorrectYounger = 0;
    younger20.forEach(person => {
        if (person.getAge() >= 20) incorrectYounger++;
    });

    let incorrectOlder = 0;
    older30.forEach(person => {
        if (person.getAge() <= 30) incorrectOlder++;
    });

    console.log(`Некорректных в younger20: ${incorrectYounger}`);
    console.log(`Некорректных в older30: ${incorrectOlder}`);
}

/**
 * Тест 4: Инвертирование содержимого
 * (только операторы изъятия и вставки, без итератора)
 * @param {function(): (LinkedListQueue<number>|StackQueue<number>)} queueFactory - Фабрика очередей
 * @param {string} queueName - Название очереди для вывода
 */
function testInversion(queueFactory, queueName) {
    console.log(`\n=== ТЕСТ 4: Инвертирование содержимого (${queueName}) ===`);

    // Создаем отсортированную по возрастанию очередь
    const queue = queueFactory();
    for (let i = 1; i <= 10; i++) {
        queue.enqueue(i);
    }

    console.log("Исходная очередь (по возрастанию):", queue.toArray().join(", "));

    // Инвертируем, используя только enqueue и dequeue (без итератора)
    queue.invert();

    console.log("После инвертирования (по убыванию):   ", queue.toArray().join(", "));
}

/**
 * Тест 5: Сравнение двух реализаций очереди
 * (скорость вставки и изъятия на 10000 элементов)
 * @param {number} count - Количество элементов для теста
 */
function testPerformance(count = 10000) {
    console.log(`\n=== ТЕСТ 5: СРАВНЕНИЕ ПРОИЗВОДИТЕЛЬНОСТИ (${count} элементов) ===`);

    // Тест LinkedListQueue
    console.log("\n1. Очередь на односвязном списке:");
    const llQueue = new LinkedListQueue();

    // Вставка
    const llStartEnqueue = Date.now();
    for (let i = 0; i < count; i++) {
        llQueue.enqueue(i);
    }
    const llEnqueueTime = Date.now() - llStartEnqueue;

    // Извлечение
    const llStartDequeue = Date.now();
    while (!llQueue.isEmpty()) {
        llQueue.dequeue();
    }
    const llDequeueTime = Date.now() - llStartDequeue;

    console.log(`  Вставка (enqueue): ${llEnqueueTime} мс`);
    console.log(`  Извлечение (dequeue): ${llDequeueTime} мс`);

    // Тест StackQueue
    console.log("\n2. Очередь на двух стеках:");
    const sqQueue = new StackQueue();

    // Вставка
    const sqStartEnqueue = Date.now();
    for (let i = 0; i < count; i++) {
        sqQueue.enqueue(i);
    }
    const sqEnqueueTime = Date.now() - sqStartEnqueue;

    // Извлечение
    const sqStartDequeue = Date.now();
    while (!sqQueue.isEmpty()) {
        sqQueue.dequeue();
    }
    const sqDequeueTime = Date.now() - sqStartDequeue;

    console.log(`  Вставка (enqueue): ${sqEnqueueTime} мс`);
    console.log(`  Извлечение (dequeue): ${sqDequeueTime} мс`);

    // Сравнение
    console.log("\n=== ИТОГОВОЕ СРАВНЕНИЕ ===");
    console.log(`Очередь на списке: Вставка=${llEnqueueTime}мс, Извлечение=${llDequeueTime}мс`);
    console.log(`Очередь на стеках: Вставка=${sqEnqueueTime}мс, Извлечение=${sqDequeueTime}мс`);

    // Анализ использования памяти
    console.log("\n=== СРАВНЕНИЕ ИСПОЛЬЗОВАНИЯ ПАМЯТИ ===");
    console.log("Очередь на списке: каждый элемент хранит data + указатель next (2 ссылки)");
    console.log("Очередь на стеках: каждый элемент хранится в массиве (1 ссылка), но требуется 2 массива");
}

/**
 * Демонстрация работы итератора
 */
function demonstrateIterator() {
    console.log("\n" + "=".repeat(70));
    console.log("ДЕМОНСТРАЦИЯ РАБОТЫ ИТЕРАТОРА");
    console.log("=".repeat(70));

    // Демонстрация для очереди на списке
    console.log("\n--- Очередь на односвязном списке (LinkedListQueue) ---");
    const listQueue = new LinkedListQueue();
    [10, 20, 30, 40, 50].forEach(n => listQueue.enqueue(n));

    console.log("1. Итерация через for...of (использует итератор):");
    for (const item of listQueue) {
        console.log(`   Элемент: ${item}`);
    }

    console.log("\n2. Итерация через forEach (на основе итератора):");
    listQueue.forEach((item, index) => {
        console.log(`   [${index}]: ${item}`);
    });

    console.log("\n3. Проверка базовых операций:");
    console.log(`   peek(): ${listQueue.peek()}`);
    console.log(`   size(): ${listQueue.size()}`);
    console.log(`   isEmpty(): ${listQueue.isEmpty()}`);

    // Демонстрация для очереди на двух стеках
    console.log("\n--- Очередь на двух стеках (StackQueue) ---");
    const stackQueue = new StackQueue();
    [10, 20, 30, 40, 50].forEach(n => stackQueue.enqueue(n));

    console.log("1. Итерация через for...of (использует итератор):");
    for (const item of stackQueue) {
        console.log(`   Элемент: ${item}`);
    }

    console.log("\n2. Итерация через forEach (на основе итератора):");
    stackQueue.forEach((item, index) => {
        console.log(`   [${index}]: ${item}`);
    });

    console.log("\n3. Проверка базовых операций:");
    console.log(`   peek(): ${stackQueue.peek()}`);
    console.log(`   size(): ${stackQueue.size()}`);
    console.log(`   isEmpty(): ${stackQueue.isEmpty()}`);
}

// ====================== ЗАПУСК ВСЕХ ТЕСТОВ ======================

/**
 * Запускает все тесты для обеих реализаций
 */
function runAllTests() {
    console.log("=".repeat(70));
    console.log("ТЕСТИРОВАНИЕ ОЧЕРЕДИ НА ОДНОСВЯЗНОМ СПИСКЕ");
    console.log("=".repeat(70));

    testNumbers(() => new LinkedListQueue(), "Очередь на списке");
    testStrings(() => new LinkedListQueue(), "Очередь на списке");
    testPersons(() => new LinkedListQueue(), "Очередь на списке");
    testInversion(() => new LinkedListQueue(), "Очередь на списке");

    console.log("\n" + "=".repeat(70));
    console.log("ТЕСТИРОВАНИЕ ОЧЕРЕДИ НА ДВУХ СТЕКАХ");
    console.log("=".repeat(70));

    testNumbers(() => new StackQueue(), "Очередь на стеках");
    testStrings(() => new StackQueue(), "Очередь на стеках");
    testPersons(() => new StackQueue(), "Очередь на стеках");
    testInversion(() => new StackQueue(), "Очередь на стеках");

    // Сравнение производительности на 10000 элементов
    testPerformance(10000);

    demonstrateIterator();
}

// Экспортируем всё необходимое
export {
    // Классы
    LinkedListQueue,
    StackQueue,
    DateBirth,
    Person,

    // Тесты
    testNumbers,
    testStrings,
    testPersons,
    testInversion,
    testPerformance,
    demonstrateIterator,
    runAllTests
};