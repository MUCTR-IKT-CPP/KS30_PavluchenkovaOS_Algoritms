const readline = require('readline');
/**
 * Интерфейс для чтения входных данных из стандартного потока
 * @constant
 * @type {readline.Interface}
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
/**
 * Хранилище строк входных данных
 * @type {string[]}
 */
let lines = [];
/**
 * Обработчик строк входных данных
 * @event line
 * @param {string} line - Строка из входного потока
 * @returns {void}
 */
rl.on('line', (line) => {
    if (line.trim() === '') return;
    lines.push(line.trim());
});
/**
 * Основная функция решения задачи
 * @event close
 * @returns {void}
 */
rl.on('close', () => {
    // Парсинг входных данных
    const input = lines.join(' ').split(/\s+/);

    /**
     * Количество камней
     * @type {number}
     */
    const n = parseInt(input[0]);

    /**
     * Массив весов камней
     * @type {number[]}
     */
    const weights = input.slice(1, 1 + n).map(Number);

    /*** Общая сумма весов всех камней*/
    const totalSum = weights.reduce((sum, w) => sum + w, 0);
    /**
     * Вместимость рюкзака (половина от общей суммы)
     * Алгоритм ищет максимальный вес, не превышающий эту величину
     * @type {number}
     */
    const capacity = Math.floor(totalSum / 2);

    /**
     * Массив динамического программирования
     * dp[w] = true, если можно набрать вес w из доступных камней
     * @type {boolean[]}
     */
    const dp = new Array(capacity + 1).fill(false);
    dp[0] = true;  // Вес 0 всегда можно набрать

    /**
     * Основной цикл динамического программирования (восходящий метод)
     * @param {number} i - Индекс текущего камня
     * @param {number} weight - Вес текущего камня
     */
    for (let i = 0; i < n; i++) {
        const weight = weights[i];
        // Идём от больших весов к меньшим, чтобы избежать повторного использования камня
        for (let w = capacity; w >= weight; w--) {
            if (dp[w - weight]) {
                dp[w] = true;
            }
        }
    }

    /**
     * Поиск максимального достижимого веса
     * Начинаем с capacity и идём вниз до первого true
     * @type {number}
     */
    let maxWeight = 0;
    for (let w = capacity; w >= 0; w--) {
        if (dp[w]) {
            maxWeight = w;
            break;
        }
    }
    /**
     * Результат — минимальная разность между двумя кучами
     * @type {number}
     */
    const result = totalSum - 2 * maxWeight;
    console.log(result);
});