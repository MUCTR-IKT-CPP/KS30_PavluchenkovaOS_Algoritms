const { createCanvas } = require('canvas');
const fs = require('fs');

/**
 * Класс узла бинарной кучи (min-heap)
 * Бинарная куча - структура данных, реализованная на основе массива,
 * где каждый родительский узел меньше или равен своим потомкам
 */
class BinaryHeap {
    constructor() {
        /** @type {Array} Массив для хранения элементов кучи */
        this.heap = [];
    }

    /**
     * Вставляет новый элемент в кучу
     * Операция выполняется за O(log n)
     * При вставке элемент помещается в конец массива,
     * затем "всплывает" до нужной позиции для восстановления свойства кучи
     * @param {number} key - Вставляемый ключ
     */
    insert(key) {
        this.heap.push(key);
        this._bubbleUp(this.heap.length - 1);
    }

    /**
     * Всплытие элемента (балансировка после вставки)
     * Больший элемент после вставки всплывает на позицию,
     * на которой ему логично находиться исходя из основного правила кучи
     * @param {number} index - Индекс элемента для всплытия
     * @private
     */
    _bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.heap[parent] <= this.heap[index]) break;
            [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
            index = parent;
        }
    }

    /**
     * Поиск минимального элемента в куче
     * В min-куче минимальный элемент всегда находится в корне (индекс 0)
     * Сложность операции O(1)
     * @returns {number|null} Минимальный элемент или null, если куча пуста
     */
    findMin() {
        return this.heap.length === 0 ? null : this.heap[0];
    }

    /**
     * Удаление минимального элемента из кучи
     * Операция выполняется за O(log n)
     * Корень заменяется последним элементом, который затем "тонет" до нужной позиции
     * @returns {number|null} Удаленный минимальный элемент или null, если куча пуста
     */
    extractMin() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return min;
    }

    /**
     * Утопление элемента (балансировка после удаления)
     * Меньший элемент во время упорядочивания тонет до той позиции,
     * на которой ему логично находиться исходя из основного правила кучи
     * @param {number} index - Индекс элемента для утопления
     * @private
     */
    _sinkDown(index) {
        const length = this.heap.length;
        while (true) {
            let left = 2 * index + 1;   // Левый потомок: 2 * i + 1
            let right = 2 * index + 2;  // Правый потомок: 2 * i + 2
            let swap = null;
            let element = this.heap[index];

            if (left < length && this.heap[left] < element) {
                swap = left;
            }
            if (right < length) {
                if ((swap === null && this.heap[right] < element) ||
                    (swap !== null && this.heap[right] < this.heap[left])) {
                    swap = right;
                }
            }
            if (swap === null) break;
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }

    /**
     * Возвращает количество элементов в куче
     * @returns {number} Размер кучи
     */
    size() {
        return this.heap.length;
    }
}

/**
 * Класс узла Фибоначчиевой кучи
 * Фибоначчиева куча - это биноминальная куча, у которой прощаются все операции,
 * кроме операции удаления. За счет сознательного ухудшения состояния кучи внутри нее,
 * мы предполагаем, что куча может иметь множество деревьев одинакового ранга
 */
class FibonacciNode {
    /**
     * Создает новый узел Фибоначчиевой кучи
     * Каждый узел знает о своем предыдущем и следующем брате,
     * а также о крайнем левом ребенке, что позволяет легко двигаться по куче
     * @param {number} key - Ключ узла
     */
    constructor(key) {
        this.key = key;           /** @type {number} Значение узла */
        this.child = null;       /** @type {FibonacciNode|null} Крайний левый ребенок */
        this.left = this;        /** @type {FibonacciNode} Предыдущий брат */
        this.right = this;       /** @type {FibonacciNode} Следующий брат */
        this.degree = 0;         /** @type {number} Количество детей */
    }
}

/**
 * Класс Фибоначчиевой кучи
 * Реализует структуру данных, позволяющую выполнять большинство операций
 * за амортизированное O(1), а удаление минимума - за O(log n)
 */
class FibonacciHeap {
    constructor() {
        /** @type {FibonacciNode|null} Указатель на минимальный узел в куче */
        this.minNode = null;
        /** @type {number} Количество узлов в куче */
        this.size = 0;
    }

    /**
     * Вставка нового элемента в кучу Фибоначчи
     * При добавлении в дерево нового элемента просто добавляем в кучу дерево ранга 0,
     * перепроверяя только минимум в куче
     * Сложность: амортизированное O(1)
     * @param {number} key - Вставляемый ключ
     * @returns {FibonacciNode} Созданный узел
     */
    insert(key) {
        const node = new FibonacciNode(key);
        if (this.minNode === null) {
            this.minNode = node;
        } else {
            this._addToRootList(node);
            if (node.key < this.minNode.key) {
                this.minNode = node;
            }
        }
        this.size++;
        return node;
    }

    /**
     * Добавляет узел в корневой список
     * @param {FibonacciNode} node - Добавляемый узел
     * @private
     */
    _addToRootList(node) {
        if (this.minNode === null) {
            this.minNode = node;
            return;
        }
        const left = this.minNode.left;
        left.right = node;
        node.left = left;
        node.right = this.minNode;
        this.minNode.left = node;
    }

    /**
     * Удаляет узел из корневого списка
     * @param {FibonacciNode} node - Удаляемый узел
     * @private
     */
    _removeFromRootList(node) {
        if (node === this.minNode) {
            this.minNode = node.right;
        }
        node.left.right = node.right;
        node.right.left = node.left;
        node.left = node;
        node.right = node;
    }

    /**
     * Поиск минимального элемента
     * Сложность: O(1)
     * @returns {number|null} Значение минимального узла или null
     */
    findMin() {
        return this.minNode ? this.minNode.key : null;
    }

    /**
     * Удаление минимального элемента
     * Операция, которая проводит нормализацию дерева,
     * объединяя все созданные дубликаты деревьев
     * Сложность: амортизированное O(log n)
     * @returns {number|null} Значение удаленного минимального узла или null
     */
    extractMin() {
        const minNode = this.minNode;
        if (minNode === null) return null;

        // Все дети минимального узла становятся корневыми узлами
        if (minNode.child !== null) {
            let child = minNode.child;
            const start = child;
            do {
                const next = child.right;
                this._addToRootList(child);
                child.parent = null;
                child = next;
            } while (child !== start);
        }

        this._removeFromRootList(minNode);

        if (minNode === minNode.right) {
            this.minNode = null;
        } else {
            this.minNode = minNode.right;
            this._consolidate();  // Объединение деревьев одинакового ранга
        }
        this.size--;
        return minNode.key;
    }

    /**
     * Консолидация - нормализация кучи после удаления минимума
     * Объединяет деревья одинакового ранга для поддержания структуры
     * @private
     */
    _consolidate() {
        const maxDegree = Math.floor(Math.log2(this.size));
        const degreeTable = new Array(maxDegree).fill(null);

        const rootList = [];
        let current = this.minNode;
        if (current === null) return;
        do {
            rootList.push(current);
            current = current.right;
        } while (current !== this.minNode);

        for (let node of rootList) {
            let degree = node.degree;
            while (degreeTable[degree] !== null) {
                let other = degreeTable[degree];
                if (node.key > other.key) {
                    [node, other] = [other, node];
                }
                this._link(other, node);
                degreeTable[degree] = null;
                degree++;
            }
            degreeTable[degree] = node;
        }

        this.minNode = null;
        for (let node of degreeTable) {
            if (node !== null) {
                if (this.minNode === null) {
                    this.minNode = node;
                } else {
                    if (node.key < this.minNode.key) {
                        this.minNode = node;
                    }
                }
            }
        }
    }

    /**
     * Связывает два узла, делая один ребенком другого
     * @param {FibonacciNode} child - Узел, который станет ребенком
     * @param {FibonacciNode} parent - Родительский узел
     * @private
     */
    _link(child, parent) {
        this._removeFromRootList(child);
        child.parent = parent;
        if (parent.child === null) {
            parent.child = child;
            child.left = child;
            child.right = child;
        } else {
            const first = parent.child;
            const last = first.left;
            last.right = child;
            child.left = last;
            child.right = first;
            first.left = child;
        }
        parent.degree++;
    }

    /**
     * Возвращает количество элементов в куче
     * @returns {number} Размер кучи
     */
    getSize() {
        return this.size;
    }
}

/**
 * Измеряет время выполнения одной операции
 * @param {Function} fn - Измеряемая функция
 * @returns {number} Время выполнения в наносекундах
 */
function measureOneOperation(fn) {
    const start = process.hrtime.bigint();
    fn();
    const end = process.hrtime.bigint();
    return Number(end - start);
}

/**
 * Выполняет множественные измерения операции и вычисляет статистику
 * @param {Function} fn - Измеряемая функция
 * @param {number} iterations - Количество измерений
 * @returns {Object} Объект с средним и максимальным временем
 */
function measureOperations(fn, iterations = 1000) {
    const times = [];
    for (let i = 0; i < iterations; i++) {
        times.push(measureOneOperation(fn));
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    return { avg, max };
}

/**
 * Прогрев кучи перед измерениями для стабилизации
 * @param {Object} heap - Куча для прогрева
 * @param {number} iterations - Количество итераций прогрева
 */
function warmUp(heap, iterations = 100) {
    for (let i = 0; i < iterations; i++) {
        heap.findMin();
        if (heap.size() > 0) heap.extractMin();
        heap.insert(Math.random() * 1000000);
    }
}

/**
 * Генерирует массив случайных чисел
 * @param {number} N - Размер массива
 * @returns {number[]} Массив случайных чисел
 */
function generateRandomArray(N) {
    const arr = [];
    for (let i = 0; i < N; i++) {
        arr.push(Math.random() * 1000000);
    }
    return arr;
}

/**
 * Запускает тестирование производительности куч
 * @returns {Promise<Object>} Результаты тестирования
 */
async function runTests() {
    const results = {
        BinaryHeap: { findMin: {}, extractMin: {}, insert: {} },
        FibonacciHeap: { findMin: {}, extractMin: {}, insert: {} }
    };

    const exponents = [3, 4, 5, 6, 7];
    const Ns = exponents.map(e => Math.pow(10, e));
    for (let idx = 0; idx < Ns.length; idx++) {
        const N = Ns[idx];
        console.log(`\nТЕСТИРОВАНИЕ N = ${N} (${N.toLocaleString()} элементов)`);
        console.log('-'.repeat(50));

        const initialData = generateRandomArray(N);

        // Тестирование бинарной кучи
        const bhFind = new BinaryHeap();
        for (let val of initialData) bhFind.insert(val);
        warmUp(bhFind, 100);
        let { avg, max } = measureOperations(() => bhFind.findMin(), 1000);
        results.BinaryHeap.findMin[N] = { avg, max };

        const bhExtract = new BinaryHeap();
        for (let val of initialData) bhExtract.insert(val);
        warmUp(bhExtract, 100);
        ({ avg, max } = measureOperations(() => {
            if (bhExtract.size() > 0) bhExtract.extractMin();
        }, 1000));
        results.BinaryHeap.extractMin[N] = { avg, max };

        const bhInsert = new BinaryHeap();
        for (let val of initialData) bhInsert.insert(val);
        warmUp(bhInsert, 100);
        const insertData = generateRandomArray(1000);
        let insertIdx = 0;
        ({ avg, max } = measureOperations(() => {
            bhInsert.insert(insertData[insertIdx % insertData.length]);
            insertIdx++;
        }, 1000));
        results.BinaryHeap.insert[N] = { avg, max };

        // Тестирование кучи Фибоначчи
        const fhFind = new FibonacciHeap();
        for (let val of initialData) fhFind.insert(val);
        for (let i = 0; i < 100; i++) {
            fhFind.findMin();
            if (fhFind.getSize() > 0) fhFind.extractMin();
            fhFind.insert(Math.random() * 1000000);
        }
        ({ avg, max } = measureOperations(() => fhFind.findMin(), 1000));
        results.FibonacciHeap.findMin[N] = { avg, max };

        const fhExtract = new FibonacciHeap();
        for (let val of initialData) fhExtract.insert(val);
        for (let i = 0; i < 100; i++) {
            fhExtract.findMin();
            if (fhExtract.getSize() > 0) fhExtract.extractMin();
            fhExtract.insert(Math.random() * 1000000);
        }
        ({ avg, max } = measureOperations(() => {
            if (fhExtract.getSize() > 0) fhExtract.extractMin();
        }, 1000));
        results.FibonacciHeap.extractMin[N] = { avg, max };

        const fhInsert = new FibonacciHeap();
        for (let val of initialData) fhInsert.insert(val);
        for (let i = 0; i < 100; i++) {
            fhInsert.findMin();
            if (fhInsert.getSize() > 0) fhInsert.extractMin();
            fhInsert.insert(Math.random() * 1000000);
        }
        insertIdx = 0;
        ({ avg, max } = measureOperations(() => {
            fhInsert.insert(insertData[insertIdx % insertData.length]);
            insertIdx++;
        }, 1000));
        results.FibonacciHeap.insert[N] = { avg, max };
    }

    return results;
}

/**
 * Форматирует время в наносекундах в читаемый вид
 * @param {number} ns - Время в наносекундах
 * @returns {string} Отформатированная строка времени
 */
function formatTime(ns) {
    if (ns >= 1000000) return (ns / 1000000).toFixed(2) + ' мс';
    if (ns >= 1000) return (ns / 1000).toFixed(2) + ' мкс';
    return ns.toFixed(1) + ' нс';
}

/**
 * Сохраняет данные в CSV файл
 * @param {string} filename - Имя файла
 * @param {Object} data - Данные для сохранения
 * @param {string[]} operationNames - Названия операций
 */
function saveCSV(filename, data, operationNames) {
    const sortedN = Object.keys(data[Object.keys(data)[0]]).sort((a, b) => Number(a) - Number(b));
    let csv = 'N,' + operationNames.join(',') + '\n';
    for (let N of sortedN) {
        let row = N;
        for (let op of operationNames) {
            row += ',' + data[op][N];
        }
        csv += row + '\n';
    }
    fs.writeFileSync(filename, csv);
    console.log(`Сохранён CSV: ${filename}`);
}

/**
 * Строит комбинированный график результатов тестирования
 * @param {Object} data - Данные для построения
 * @param {string} title - Заголовок графика
 * @param {string} filename - Имя выходного файла
 * @param {string} ylabel - Подпись оси Y
 */
function plotCombinedGraph(data, title, filename, ylabel) {
    const width = 1000;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Заполнение белым фоном
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Рисование сетки
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
        const y = 80 + (height - 130) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(width - 60, y);
        ctx.stroke();
    }

    // Рисование осей
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.lineTo(80, height - 60);
    ctx.lineTo(width - 60, height - 60);
    ctx.stroke();

    // Подписи осей
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('Количество элементов N ', width / 2 - 200, height - 25);
    ctx.save();
    ctx.translate(35, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(ylabel, -20, 0);
    ctx.restore();

    // Заголовок
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#2C3E50';
    ctx.fillText(title, width / 2 - 180, 45);

    // Цвета для различных типов операций
    const colors = {
        findMin: { line: '#27AE60', point: '#27AE60', name: 'Поиск минимума' },
        extractMin: { line: '#E74C3C', point: '#E74C3C', name: 'Удаление минимума' },
        insert: { line: '#3498DB', point: '#3498DB', name: 'Добавление элемента' }
    };

    const sortedN = Object.keys(data.findMin).map(Number).sort((a, b) => a - b);
    const allValues = [
        ...Object.values(data.findMin),
        ...Object.values(data.extractMin),
        ...Object.values(data.insert)
    ];
    const maxY = Math.max(...allValues) * 1.15;
    const minX = Math.min(...sortedN);
    const maxX = Math.max(...sortedN);

    const xScale = (width - 140) / (Math.log10(maxX) - Math.log10(minX));
    const yScale = (height - 140) / maxY;

    // Построение линий и точек для каждой операции
    for (let [op, color] of Object.entries(colors)) {
        ctx.beginPath();
        let first = true;
        for (let N of sortedN) {
            const x = 80 + Math.log10(N / minX) * xScale;
            const y = height - 60 - data[op][N] * yScale;
            if (first) {
                ctx.moveTo(x, y);
                first = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = color.line;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Точки на графике
        for (let N of sortedN) {
            const x = 80 + Math.log10(N / minX) * xScale;
            const y = height - 60 - data[op][N] * yScale;
            ctx.fillStyle = color.point;
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Подпись значения
            ctx.font = '11px Arial';
            ctx.fillStyle = '#555555';
            ctx.fillText(formatTime(data[op][N]), x + 8, y - 6);
        }
    }

    // Легенда
    const legendX = width - 200;
    let legendY = 100;
    ctx.font = '14px Arial';
    for (let [op, color] of Object.entries(colors)) {
        ctx.fillStyle = color.point;
        ctx.fillRect(legendX, legendY, 18, 18);
        ctx.fillStyle = '#000000';
        ctx.fillText(color.name, legendX + 25, legendY + 14);
        legendY += 30;
    }

    // Сохранение графика
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    console.log(`  Сохранён график: ${filename}`);
}

/**
 * Главная функция выполнения тестирования и построения графиков
 */
async function main() {
    console.log("Запуск тестирования производительности куч...");
    console.log("Исследуются бинарная куча и куча Фибоначчи");
    console.log("Операции: поиск минимума, удаление минимума, вставка элемента\n");

    const results = await runTests();
    const sortedN = Object.keys(results.BinaryHeap.findMin).sort((a, b) => Number(a) - Number(b));
    // Подготовка данных для построения графиков
    const binaryAvgData = { findMin: {}, extractMin: {}, insert: {} };
    const binaryMaxData = { findMin: {}, extractMin: {}, insert: {} };
    const fibAvgData = { findMin: {}, extractMin: {}, insert: {} };
    const fibMaxData = { findMin: {}, extractMin: {}, insert: {} };

    for (let N of sortedN) {
        binaryAvgData.findMin[N] = results.BinaryHeap.findMin[N].avg;
        binaryAvgData.extractMin[N] = results.BinaryHeap.extractMin[N].avg;
        binaryAvgData.insert[N] = results.BinaryHeap.insert[N].avg;

        binaryMaxData.findMin[N] = results.BinaryHeap.findMin[N].max;
        binaryMaxData.extractMin[N] = results.BinaryHeap.extractMin[N].max;
        binaryMaxData.insert[N] = results.BinaryHeap.insert[N].max;

        fibAvgData.findMin[N] = results.FibonacciHeap.findMin[N].avg;
        fibAvgData.extractMin[N] = results.FibonacciHeap.extractMin[N].avg;
        fibAvgData.insert[N] = results.FibonacciHeap.insert[N].avg;

        fibMaxData.findMin[N] = results.FibonacciHeap.findMin[N].max;
        fibMaxData.extractMin[N] = results.FibonacciHeap.extractMin[N].max;
        fibMaxData.insert[N] = results.FibonacciHeap.insert[N].max;
    }

    // Построение всех графиков
    console.log("\nПостроение графиков...");

    plotCombinedGraph(
        binaryAvgData,
        'Бинарная куча - Среднее время операции (1000 замеров)',
        'binary_heap_average.png',
        'Время (логарифмическая шкала)'
    );

    plotCombinedGraph(
        binaryMaxData,
        'Бинарная куча - Максимальное время одной операции',
        'binary_heap_maximum.png',
        'Время (логарифмическая шкала)'
    );

    plotCombinedGraph(
        fibAvgData,
        'Куча Фибоначчи - Среднее время операции (1000 замеров)',
        'fibonacci_heap_average.png',
        'Время (логарифмическая шкала)'
    );

    plotCombinedGraph(
        fibMaxData,
        'Куча Фибоначчи - Максимальное время одной операции',
        'fibonacci_heap_maximum.png',
        'Время (логарифмическая шкала)'
    );
}

main().catch(console.error);