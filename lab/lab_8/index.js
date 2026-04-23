const { createCanvas } = require('canvas');
const fs = require('fs');

// ------------------------- Бинарная куча (min-heap) -------------------------
class BinaryHeap {
    constructor() {
        this.heap = [];
    }

    insert(key) {
        this.heap.push(key);
        this._bubbleUp(this.heap.length - 1);
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.heap[parent] <= this.heap[index]) break;
            [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
            index = parent;
        }
    }

    findMin() {
        return this.heap.length === 0 ? null : this.heap[0];
    }

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

    _sinkDown(index) {
        const length = this.heap.length;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
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

    size() {
        return this.heap.length;
    }
}

// ------------------------- Куча Фибоначчи (min-heap) -------------------------
class FibonacciNode {
    constructor(key) {
        this.key = key;
        this.parent = null;
        this.child = null;
        this.left = this;
        this.right = this;
        this.degree = 0;
        this.mark = false;
    }
}

class FibonacciHeap {
    constructor() {
        this.minNode = null;
        this.size = 0;
    }

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

    _removeFromRootList(node) {
        if (node === this.minNode) {
            this.minNode = node.right;
        }
        node.left.right = node.right;
        node.right.left = node.left;
        node.left = node;
        node.right = node;
    }

    findMin() {
        return this.minNode ? this.minNode.key : null;
    }

    extractMin() {
        const minNode = this.minNode;
        if (minNode === null) return null;

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
            this._consolidate();
        }
        this.size--;
        return minNode.key;
    }

    _consolidate() {
        const maxDegree = Math.floor(Math.log2(this.size)) + 10;
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
        child.mark = false;
    }

    getSize() {
        return this.size;
    }
}

// ------------------------- Измерения -------------------------
function measureOneOperation(fn) {
    const start = process.hrtime.bigint();
    fn();
    const end = process.hrtime.bigint();
    return Number(end - start); // наносекунды
}

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
 * Тепловой разогрев (warm-up) для JIT-компилятора.
 * Выполняет 100 операций каждого типа, чтобы V8 оптимизировал код
 * перед основными замерами.
 */
function warmUp(heap, iterations = 100) {
    for (let i = 0; i < iterations; i++) {
        heap.findMin();
        if (heap.size() > 0) heap.extractMin();
        heap.insert(Math.random() * 1000000);
    }
}

function generateRandomArray(N) {
    const arr = [];
    for (let i = 0; i < N; i++) {
        arr.push(Math.random() * 1000000);
    }
    return arr;
}

async function runTests() {
    const results = {
        BinaryHeap: { findMin: {}, extractMin: {}, insert: {} },
        FibonacciHeap: { findMin: {}, extractMin: {}, insert: {} }
    };

    const exponents = [3, 4, 5, 6, 7];
    const Ns = exponents.map(e => Math.pow(10, e));

    console.log('=' .repeat(60));
    console.log('НАЧАЛО ТЕСТИРОВАНИЯ КУЧ');
    console.log('=' .repeat(60));
    console.log('• Выполняется тепловой разогрев (100 операций) перед каждым тестом\n');

    for (let idx = 0; idx < Ns.length; idx++) {
        const N = Ns[idx];
        console.log(`\n📊 ТЕСТИРОВАНИЕ N = ${N} (${N.toLocaleString()} элементов)`);
        console.log('-'.repeat(50));

        const initialData = generateRandomArray(N);

        // ========== Бинарная куча ==========
        console.log('\n  🔷 Бинарная куча:');

        // --- findMin ---
        const bhFind = new BinaryHeap();
        for (let val of initialData) bhFind.insert(val);
        console.log('    🔥 Тепловой разогрев...');
        warmUp(bhFind, 100);
        let { avg, max } = measureOperations(() => bhFind.findMin(), 1000);
        results.BinaryHeap.findMin[N] = { avg, max };
        console.log(`    ✅ findMin    | среднее: ${avg.toFixed(1)} нс | максимум: ${max.toFixed(1)} нс`);

        // --- extractMin (копия) ---
        const bhExtract = new BinaryHeap();
        for (let val of initialData) bhExtract.insert(val);
        console.log('    🔥 Тепловой разогрев...');
        warmUp(bhExtract, 100);
        ({ avg, max } = measureOperations(() => {
            if (bhExtract.size() > 0) bhExtract.extractMin();
        }, 1000));
        results.BinaryHeap.extractMin[N] = { avg, max };
        console.log(`    ✅ extractMin | среднее: ${avg.toFixed(1)} нс | максимум: ${max.toFixed(1)} нс`);

        // --- insert (копия) ---
        const bhInsert = new BinaryHeap();
        for (let val of initialData) bhInsert.insert(val);
        console.log('    🔥 Тепловой разогрев...');
        warmUp(bhInsert, 100);
        const insertData = generateRandomArray(1000);
        let insertIdx = 0;
        ({ avg, max } = measureOperations(() => {
            bhInsert.insert(insertData[insertIdx % insertData.length]);
            insertIdx++;
        }, 1000));
        results.BinaryHeap.insert[N] = { avg, max };
        console.log(`    ✅ insert     | среднее: ${avg.toFixed(1)} нс | максимум: ${max.toFixed(1)} нс`);

        // ========== Куча Фибоначчи ==========
        console.log('\n  💚 Куча Фибоначчи:');

        // --- findMin ---
        const fhFind = new FibonacciHeap();
        for (let val of initialData) fhFind.insert(val);
        console.log('    🔥 Тепловой разогрев...');
        // Для Фибоначчи нужен специальный warm-up, т.к. нет метода size()
        for (let i = 0; i < 100; i++) {
            fhFind.findMin();
            if (fhFind.getSize() > 0) fhFind.extractMin();
            fhFind.insert(Math.random() * 1000000);
        }
        ({ avg, max } = measureOperations(() => fhFind.findMin(), 1000));
        results.FibonacciHeap.findMin[N] = { avg, max };
        console.log(`    ✅ findMin    | среднее: ${avg.toFixed(1)} нс | максимум: ${max.toFixed(1)} нс`);

        // --- extractMin ---
        const fhExtract = new FibonacciHeap();
        for (let val of initialData) fhExtract.insert(val);
        console.log('    🔥 Тепловой разогрев...');
        for (let i = 0; i < 100; i++) {
            fhExtract.findMin();
            if (fhExtract.getSize() > 0) fhExtract.extractMin();
            fhExtract.insert(Math.random() * 1000000);
        }
        ({ avg, max } = measureOperations(() => {
            if (fhExtract.getSize() > 0) fhExtract.extractMin();
        }, 1000));
        results.FibonacciHeap.extractMin[N] = { avg, max };
        console.log(`    ✅ extractMin | среднее: ${avg.toFixed(1)} нс | максимум: ${max.toFixed(1)} нс`);

        // --- insert ---
        const fhInsert = new FibonacciHeap();
        for (let val of initialData) fhInsert.insert(val);
        console.log('    🔥 Тепловой разогрев...');
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
        console.log(`    ✅ insert     | среднее: ${avg.toFixed(1)} нс | максимум: ${max.toFixed(1)} нс`);
    }

    return results;
}

// ------------------------- Построение графиков -------------------------
function formatTime(ns) {
    if (ns >= 1000000) return (ns / 1000000).toFixed(2) + ' мс';
    if (ns >= 1000) return (ns / 1000).toFixed(2) + ' мкс';
    return ns.toFixed(1) + ' нс';
}

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
    console.log(`  📄 Сохранён CSV: ${filename}`);
}

function plotCombinedGraph(data, title, filename, ylabel) {
    const width = 1000;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Фон
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Сетка
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
        const y = 80 + (height - 130) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(width - 60, y);
        ctx.stroke();
    }

    // Оси
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.lineTo(80, height - 60);
    ctx.lineTo(width - 60, height - 60);
    ctx.stroke();

    // Подписи осей (русский)
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('Количество элементов N (логарифмическая шкала)', width / 2 - 200, height - 25);

    ctx.save();
    ctx.translate(35, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(ylabel, -20, 0);
    ctx.restore();

    // Заголовок
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#2C3E50';
    ctx.fillText(title, width / 2 - 180, 45);

    // Цвета для операций
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

    // Рисуем линии и точки для каждой операции
    for (let [op, color] of Object.entries(colors)) {
        // Линия
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

        // Точки
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

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    console.log(`  🖼️  Сохранён график: ${filename}`);
}

// ------------------------- Главная функция -------------------------
async function main() {
    console.log('\n🚀 ЗАПУСК ТЕСТОВ');
    console.log('=' .repeat(60));
    console.log('Особенности тестирования:');
    console.log('  • Тепловой разогрев (100 операций) перед каждым замером');
    console.log('  • 1000 итераций для каждой операции');
    console.log('  • extractMin тестируется на отдельной копии кучи');
    console.log('  • insert тестируется на отдельной копии кучи');
    console.log('=' .repeat(60));

    const results = await runTests();

    // Подготовка данных для графиков
    const sortedN = Object.keys(results.BinaryHeap.findMin).sort((a, b) => Number(a) - Number(b));

    // Данные для бинарной кучи (среднее)
    const binaryAvgData = { findMin: {}, extractMin: {}, insert: {} };
    // Данные для бинарной кучи (максимум)
    const binaryMaxData = { findMin: {}, extractMin: {}, insert: {} };
    // Данные для кучи Фибоначчи (среднее)
    const fibAvgData = { findMin: {}, extractMin: {}, insert: {} };
    // Данные для кучи Фибоначчи (максимум)
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

    console.log('\n\n📁 СОХРАНЕНИЕ РЕЗУЛЬТАТОВ');
    console.log('=' .repeat(60));

    // Сохраняем CSV файлы
    console.log('\n📊 CSV файлы:');
    saveCSV('binary_heap_avg.csv', binaryAvgData, ['findMin', 'extractMin', 'insert']);
    saveCSV('binary_heap_max.csv', binaryMaxData, ['findMin', 'extractMin', 'insert']);
    saveCSV('fibonacci_heap_avg.csv', fibAvgData, ['findMin', 'extractMin', 'insert']);
    saveCSV('fibonacci_heap_max.csv', fibMaxData, ['findMin', 'extractMin', 'insert']);

    // Строим 4 графика
    console.log('\n📈 Построение графиков:');

    // График 1: Бинарная куча - среднее время
    plotCombinedGraph(
        binaryAvgData,
        'Бинарная куча - Среднее время операции (1000 замеров)',
        'binary_heap_average.png',
        'Время (логарифмическая шкала)'
    );

    // График 2: Бинарная куча - максимальное время
    plotCombinedGraph(
        binaryMaxData,
        'Бинарная куча - Максимальное время одной операции',
        'binary_heap_maximum.png',
        'Время (логарифмическая шкала)'
    );

    // График 3: Куча Фибоначчи - среднее время
    plotCombinedGraph(
        fibAvgData,
        'Куча Фибоначчи - Среднее время операции (1000 замеров)',
        'fibonacci_heap_average.png',
        'Время (логарифмическая шкала)'
    );

    // График 4: Куча Фибоначчи - максимальное время
    plotCombinedGraph(
        fibMaxData,
        'Куча Фибоначчи - Максимальное время одной операции',
        'fibonacci_heap_maximum.png',
        'Время (логарифмическая шкала)'
    );

    console.log('\n' + '=' .repeat(60));
    console.log('✅ ВСЕ ТЕСТЫ УСПЕШНО ЗАВЕРШЕНЫ');
    console.log('=' .repeat(60));
    console.log('\n📋 ИТОГОВЫЕ ФАЙЛЫ:');
    console.log('  CSV:');
    console.log('    • binary_heap_avg.csv       - среднее время (бинарная куча)');
    console.log('    • binary_heap_max.csv       - максимальное время (бинарная куча)');
    console.log('    • fibonacci_heap_avg.csv    - среднее время (Фибоначчи)');
    console.log('    • fibonacci_heap_max.csv    - максимальное время (Фибоначчи)');
    console.log('  Графики:');
    console.log('    • binary_heap_average.png   - бинарная куча (среднее)');
    console.log('    • binary_heap_maximum.png   - бинарная куча (максимум)');
    console.log('    • fibonacci_heap_average.png - Фибоначчи (среднее)');
    console.log('    • fibonacci_heap_maximum.png - Фибоначчи (максимум)');
    console.log('\n💡 Примечания:');
    console.log('  • extractMin тестировался на отдельной копии кучи');
    console.log('  • insert тестировался на отдельной копии кучи');
    console.log('  • Выполнен тепловой разогрев JIT-компилятора (100 операций)\n');
}

main().catch(console.error);