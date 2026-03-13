const fs = require('fs');
const { createCanvas } = require('canvas');

// ==============================================
// КОНСТАНТЫ
// ==============================================
const M = 10; // Порог для переключения на сортировку вставками

// ==============================================
// ЧАСТЬ 1 - СЛУЧАЙНЫЙ МАССИВ
// ==============================================

/*** Массив размеров тестируемых массивов.*/
const arr1 = [1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000];

// Счётчики для части 1
let quickSort1Calls = 0;
let quickSort1MaxDepth = 0;
let quickSort1CurrentDepth = 0;
let quickSort1Swaps = 0; // Счетчик обменов

/**
 * Быстрая сортировка (сортировка Хоара)
 */
function quickSort1(a, l, r) {
    quickSort1Calls++;
    quickSort1CurrentDepth++;
    if (quickSort1CurrentDepth > quickSort1MaxDepth) {
        quickSort1MaxDepth = quickSort1CurrentDepth;
    }

    if (l < r) {
        const q = partition1(a, l, r);
        quickSort1(a, l, q);
        quickSort1(a, q + 1, r);
    }

    quickSort1CurrentDepth--;
    return a;
}

/**
 * Разделение массива относительно опорного элемента
 */
function partition1(a, l, r) {
    const v = a[Math.floor((l + r) / 2)];
    let i = l;
    let j = r;

    while (i <= j) {
        while (a[i] < v) i++;
        while (a[j] > v) j--;

        if (i >= j) break;

        [a[i], a[j]] = [a[j], a[i]];
        quickSort1Swaps++; // Увеличиваем счетчик обменов
        i++;
        j--;
    }
    return j;
}

/** Объект для хранения результатов замеров по каждому размеру N. */
const results1 = {
    time: {},
    depth: {},
    swaps: {},
    calls: {}
};

// Инициализация массивов результатов для каждого N
for (const N of arr1) {
    results1.time[N] = [];
    results1.depth[N] = [];
    results1.swaps[N] = [];
    results1.calls[N] = [];
}

console.log('ЧАСТЬ 1: Тесты для всех значений N из списка:', arr1.join(', '), '\n');

// Основной цикл тестирования
for (const N of arr1) {
    console.log(`=== Тест для N = ${N} ===`);

    for (let test = 1; test <= 20; test++) {
        const vectorToSort = [];
        for (let i = 0; i < N; i++) {
            vectorToSort[i] = Math.random() * 2 - 1;
        }

        // Сброс счётчиков перед тестом
        quickSort1Calls = 0;
        quickSort1MaxDepth = 0;
        quickSort1CurrentDepth = 0;
        quickSort1Swaps = 0;

        const start = performance.now();
        quickSort1(vectorToSort, 0, vectorToSort.length - 1);
        const end = performance.now();

        const timeMs = end - start;
        const timeSec = timeMs / 1000;

        console.log(`  Тест ${test}: время=${timeSec.toFixed(4)}с, вызовов=${quickSort1Calls}, глубина=${quickSort1MaxDepth}, обменов=${quickSort1Swaps}`);

        // Сохраняем все метрики
        results1.time[N].push(timeMs);
        results1.depth[N].push(quickSort1MaxDepth);
        results1.swaps[N].push(quickSort1Swaps);
        results1.calls[N].push(quickSort1Calls);
    }
    console.log('');
}

/** Сохраняем все результаты в CSV файл.*/
let csvContent1 = 'N,Test,Time_ms,Depth,Swaps,Calls\n';
for (const N of arr1) {
    for (let i = 0; i < results1.time[N].length; i++) {
        csvContent1 += `${N},${i + 1},${results1.time[N][i].toFixed(3)},${results1.depth[N][i]},${results1.swaps[N][i]},${results1.calls[N][i]}\n`;
    }
}
fs.writeFileSync('results_complete.csv', csvContent1);
console.log('Результаты сохранены в results_complete.csv\n');

// Выводим статистику
console.log('\nN\tМинимальное\tМаксимальное\tСреднее (время)');
console.log('-'.repeat(60));

for (const N of arr1) {
    const times = results1.time[N];
    const min = Math.min(...times);
    const max = Math.max(...times);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`${N}\t${min.toFixed(3)} мс\t\t${max.toFixed(3)} мс\t\t${avg.toFixed(3)} мс`);
}

// ==============================================
// ФУНКЦИИ ДЛЯ ПОСТРОЕНИЯ ГРАФИКОВ
// ==============================================

function setupCanvas(width, height, title) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 40);

    return { canvas, ctx };
}

function drawAxes(ctx, padding, width, height, xValues, maxY, yLabel) {
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;
    const xStep = graphWidth / (xValues.length - 1);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    ctx.font = '14px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText('Размер массива (N)', width / 2, height - 20);

    ctx.save();
    ctx.translate(25, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    for (let i = 0; i < xValues.length; i++) {
        const x = padding.left + (i * xStep);
        const N = xValues[i];

        ctx.beginPath();
        ctx.moveTo(x, height - padding.bottom);
        ctx.lineTo(x, height - padding.bottom + 8);
        ctx.stroke();

        ctx.font = '10px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.fillText(N.toString(), x, height - padding.bottom + 20);
    }

    const yStep = graphHeight / 5;
    for (let i = 0; i <= 5; i++) {
        const y = height - padding.bottom - (i * yStep);
        const value = (i * maxY / 5).toFixed(1);

        ctx.beginPath();
        ctx.moveTo(padding.left - 8, y);
        ctx.lineTo(padding.left, y);
        ctx.stroke();

        ctx.font = '10px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'right';
        ctx.fillText(value, padding.left - 12, y + 4);
    }

    return { graphWidth, graphHeight, xStep };
}

function drawLine(ctx, data, color, params) {
    const { padding, xStep, xValues, maxY, graphHeight, height } = params;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (let i = 0; i < data.length; i++) {
        const xIndex = xValues.indexOf(data[i].N);
        if (xIndex === -1) continue;

        const x = padding.left + (xIndex * xStep);
        const y = height - padding.bottom - (data[i].value / maxY * graphHeight);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    ctx.fillStyle = color;
    for (let i = 0; i < data.length; i++) {
        const xIndex = xValues.indexOf(data[i].N);
        if (xIndex === -1) continue;

        const x = padding.left + (xIndex * xStep);
        const y = height - padding.bottom - (data[i].value / maxY * graphHeight);

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawLegend(ctx, items, x, y) {
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    items.forEach((item, index) => {
        const legendY = y + index * 25;

        ctx.fillStyle = item.color;
        ctx.fillRect(x, legendY - 8, 20, 12);

        ctx.fillStyle = '#333333';
        ctx.fillText(item.text, x + 30, legendY);
    });
}

// ==============================================
// ГРАФИК 1: Время выполнения (мин, макс, среднее)
// ==============================================

function createTimeChart() {
    const minData = [];
    const maxData = [];
    const avgData = [];

    for (const N of arr1) {
        const times = results1.time[N];
        minData.push({ N, value: Math.min(...times) });
        maxData.push({ N, value: Math.max(...times) });
        avgData.push({ N, value: times.reduce((a, b) => a + b, 0) / times.length });
    }

    const width = 1000;
    const height = 600;
    const padding = { left: 80, right: 50, top: 60, bottom: 60 };
    const maxY = Math.max(...maxData.map(d => d.value)) * 1.1;

    const { canvas, ctx } = setupCanvas(width, height, 'Совмещенный график времени выполнения');

    const axisParams = drawAxes(ctx, padding, width, height, arr1, maxY, 'Время (мс)');
    const lineParams = { ...axisParams, padding, xValues: arr1, maxY, height };

    drawLine(ctx, minData, '#4CAF50', lineParams);
    drawLine(ctx, maxData, '#F44336', lineParams);
    drawLine(ctx, avgData, '#2196F3', lineParams);

    drawLegend(ctx, [
        { color: '#4CAF50', text: 'Наилучшее время' },
        { color: '#F44336', text: 'Наихудшее время' },
        { color: '#2196F3', text: 'Среднее время' }
    ], padding.left + 20, padding.top + 30);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('chart1_time.png', buffer);
    console.log('✅ График 1 сохранен: chart1_time.png');
}

// ==============================================
// ГРАФИК 2: Глубина рекурсии (мин, макс, среднее)
// ==============================================

function createDepthChart() {
    const minData = [];
    const maxData = [];
    const avgData = [];

    for (const N of arr1) {
        const depths = results1.depth[N];
        minData.push({ N, value: Math.min(...depths) });
        maxData.push({ N, value: Math.max(...depths) });
        avgData.push({ N, value: depths.reduce((a, b) => a + b, 0) / depths.length });
    }

    const width = 1000;
    const height = 600;
    const padding = { left: 80, right: 50, top: 60, bottom: 60 };
    const maxY = Math.max(...maxData.map(d => d.value)) * 1.1;

    const { canvas, ctx } = setupCanvas(width, height, 'Совмещенный график глубины рекурсии');

    const axisParams = drawAxes(ctx, padding, width, height, arr1, maxY, 'Глубина рекурсии');
    const lineParams = { ...axisParams, padding, xValues: arr1, maxY, height };

    drawLine(ctx, minData, '#4CAF50', lineParams);
    drawLine(ctx, maxData, '#F44336', lineParams);
    drawLine(ctx, avgData, '#2196F3', lineParams);

    drawLegend(ctx, [
        { color: '#4CAF50', text: 'Наилучшая глубина' },
        { color: '#F44336', text: 'Наихудшая глубина' },
        { color: '#2196F3', text: 'Средняя глубина' }
    ], padding.left + 20, padding.top + 30);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('chart2_depth.png', buffer);
    console.log('✅ График 2 сохранен: chart2_depth.png');
}

// ==============================================
// ГРАФИК 3: Количество обменов (мин, макс, среднее)
// ==============================================

function createSwapsChart() {
    const minData = [];
    const maxData = [];
    const avgData = [];

    for (const N of arr1) {
        const swaps = results1.swaps[N];
        minData.push({ N, value: Math.min(...swaps) });
        maxData.push({ N, value: Math.max(...swaps) });
        avgData.push({ N, value: swaps.reduce((a, b) => a + b, 0) / swaps.length });
    }

    const width = 1000;
    const height = 600;
    const padding = { left: 80, right: 50, top: 60, bottom: 60 };
    const maxY = Math.max(...maxData.map(d => d.value)) * 1.1;

    const { canvas, ctx } = setupCanvas(width, height, 'Совмещенный график количества обменов');

    const axisParams = drawAxes(ctx, padding, width, height, arr1, maxY, 'Количество обменов');
    const lineParams = { ...axisParams, padding, xValues: arr1, maxY, height };

    drawLine(ctx, minData, '#4CAF50', lineParams);
    drawLine(ctx, maxData, '#F44336', lineParams);
    drawLine(ctx, avgData, '#2196F3', lineParams);

    drawLegend(ctx, [
        { color: '#4CAF50', text: 'Наименьшее количество обменов' },
        { color: '#F44336', text: 'Наибольшее количество обменов' },
        { color: '#2196F3', text: 'Среднее количество обменов' }
    ], padding.left + 20, padding.top + 30);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('chart3_swaps.png', buffer);
    console.log('✅ График 3 сохранен: chart3_swaps.png');
}

// ==============================================
// ГРАФИК 4: Количество вызовов (мин, макс, среднее)
// ==============================================

function createCallsChart() {
    const minData = [];
    const maxData = [];
    const avgData = [];

    for (const N of arr1) {
        const calls = results1.calls[N];
        minData.push({ N, value: Math.min(...calls) });
        maxData.push({ N, value: Math.max(...calls) });
        avgData.push({ N, value: calls.reduce((a, b) => a + b, 0) / calls.length });
    }

    const width = 1000;
    const height = 600;
    const padding = { left: 80, right: 50, top: 60, bottom: 60 };
    const maxY = Math.max(...maxData.map(d => d.value)) * 1.1;

    const { canvas, ctx } = setupCanvas(width, height, 'Совмещенный график количества вызовов рекурсивной функции');

    const axisParams = drawAxes(ctx, padding, width, height, arr1, maxY, 'Количество вызовов');
    const lineParams = { ...axisParams, padding, xValues: arr1, maxY, height };

    drawLine(ctx, minData, '#4CAF50', lineParams);
    drawLine(ctx, maxData, '#F44336', lineParams);
    drawLine(ctx, avgData, '#2196F3', lineParams);

    drawLegend(ctx, [
        { color: '#4CAF50', text: 'Наименьшее количество вызовов' },
        { color: '#F44336', text: 'Наибольшее количество вызовов' },
        { color: '#2196F3', text: 'Среднее количество вызовов' }
    ], padding.left + 20, padding.top + 30);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('chart4_calls.png', buffer);
    console.log('✅ График 4 сохранен: chart4_calls.png');
}

// Создаем все 4 графика
console.log('\n' + '='.repeat(50));
console.log('📊 СОЗДАНИЕ ГРАФИКОВ ДЛЯ ЧАСТИ 1');
console.log('='.repeat(50));

createTimeChart();
createDepthChart();
createSwapsChart();
createCallsChart();

// ==============================================
// ВЫВОД МАКСИМАЛЬНОГО ВРЕМЕНИ ДЛЯ КАЖДОГО РАЗМЕРА
// ==============================================

console.log('\n' + '='.repeat(50));
console.log('📊 МАКСИМАЛЬНОЕ ВРЕМЯ СОРТИРОВКИ ПО РАЗМЕРАМ');
console.log('='.repeat(50));

const maxTimes1 = [];
for (const N of arr1) {
    const maxTime = Math.max(...results1.time[N]);
    maxTimes1.push(maxTime);
    console.log(`N = ${N}: ${maxTime.toFixed(3)} мс`);
}

let maxCsvContent1 = 'N,MaxTime_ms\n';
for (let i = 0; i < arr1.length; i++) {
    maxCsvContent1 += `${arr1[i]},${maxTimes1[i].toFixed(3)}\n`;
}
fs.writeFileSync('max_times.csv', maxCsvContent1);
console.log('\n✅ Максимальное время сохранено в max_times.csv');

// Дополнительно: находим константу C для O(n log n) по максимальным значениям
console.log('\n📈 Анализ сложности O(n log n):');
let C1 = 0;
for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] >= 16000) {
        const ratio = maxTimes1[i] / (arr1[i] * Math.log2(arr1[i]));
        if (ratio > C1) C1 = ratio;
        console.log(`N=${arr1[i]}, отношение = ${ratio.toExponential(4)}`);
    }
}
C1 = C1 * 1.2;
console.log(`\nКонстанта C для O(n log n): ${C1.toExponential(4)}`);

// ==============================================
// ВТОРОЙ ГРАФИК: Наихудшее время vs O(n log n)
// ==============================================

console.log('\n' + '='.repeat(50));
console.log('📊 ПОСТРОЕНИЕ ГРАФИКА СЛОЖНОСТИ O(n log n)');
console.log('='.repeat(50));

const worstTimes1 = [];
for (const N of arr1) {
    const maxTime = Math.max(...results1.time[N]);
    worstTimes1.push(maxTime);
}

let C_theory1 = 0;
for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] >= 16000) {
        const ratio = worstTimes1[i] / (arr1[i] * Math.log2(arr1[i]));
        if (ratio > C_theory1) C_theory1 = ratio;
        console.log(`N=${arr1[i]}, отношение = ${ratio.toExponential(4)}`);
    }
}
C_theory1 = C_theory1 * 1.4;
console.log(`\nПодобрана константа C_theory = ${C_theory1.toExponential(4)}`);

const theoreticalData1 = [];
for (let i = 0; i < arr1.length; i++) {
    theoreticalData1.push({
        N: arr1[i],
        time: C_theory1 * arr1[i] * Math.log2(arr1[i])
    });
}

const worstData1 = [];
for (let i = 0; i < arr1.length; i++) {
    worstData1.push({ N: arr1[i], time: worstTimes1[i] });
}

const width = 1000;
const height = 600;
const padding = { left: 80, right: 50, top: 60, bottom: 60 };
const allYValues1 = [...worstTimes1, ...theoreticalData1.map(d => d.time)];
const maxY2 = Math.max(...allYValues1) * 1.2;

const canvas2 = createCanvas(width, height);
const ctx2 = canvas2.getContext('2d');

ctx2.fillStyle = '#ffffff';
ctx2.fillRect(0, 0, width, height);

const axisParams2 = drawAxes(ctx2, padding, width, height, arr1, maxY2, 'Время (мс)');
const lineParams2 = { ...axisParams2, padding, xValues: arr1, maxY: maxY2, height };

ctx2.font = 'bold 20px Arial';
ctx2.fillStyle = '#000000';
ctx2.textAlign = 'center';
ctx2.fillText('Сравнение наихудшего времени с O(n log n)', width / 2, 40);

ctx2.strokeStyle = '#cccccc';
ctx2.lineWidth = 0.5;
for (let i = 1; i <= 4; i++) {
    const y = padding.top + (i * (height - padding.top - padding.bottom) / 5);
    ctx2.beginPath();
    ctx2.moveTo(padding.left, y);
    ctx2.lineTo(width - padding.right, y);
    ctx2.stroke();
}

drawLine(ctx2, worstData1.map(d => ({ N: d.N, value: d.time })), '#F44336', lineParams2);
drawLine(ctx2, theoreticalData1.map(d => ({ N: d.N, value: d.time })), '#2196F3', lineParams2);

const legendX = padding.left + 20;
const legendY = padding.top + 30;

ctx2.fillStyle = '#F44336';
ctx2.fillRect(legendX, legendY - 8, 20, 12);
ctx2.font = '12px Arial';
ctx2.fillStyle = '#333333';
ctx2.fillText('Наихудшее время (фактическое)', legendX + 30, legendY);

ctx2.fillStyle = '#2196F3';
ctx2.fillRect(legendX, legendY + 17, 20, 12);
ctx2.fillStyle = '#333333';
ctx2.fillText(`O(n log n) с C = ${C_theory1.toExponential(4)}`, legendX + 30, legendY + 25);

ctx2.font = '11px Arial';
ctx2.fillStyle = '#666666';
ctx2.textAlign = 'center';
ctx2.fillText('Константа подобрана так, чтобы кривая была выше для N > 1000', width / 2, height - 15);

const buffer2 = canvas2.toBuffer('image/png');
fs.writeFileSync('chart_worst_vs_ologn.png', buffer2);
console.log('✅ График сравнения с O(n log n) сохранен: chart_worst_vs_ologn.png');

// ==============================================
// ФУНКЦИИ ДЛЯ ЧАСТИ 2 (объявляем ДО тестов)
// ==============================================

/**
 * Сортировка вставками для маленьких подмассивов
 */
function insertionSort(a, l, r) {
    for (let i = l + 1; i <= r; i++) {
        const current = a[i];
        let j = i - 1;
        while (j >= l && a[j] > current) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = current;
    }
}

/**
 * Находит индекс медианы из трёх элементов
 */
function medianOfThree(a, l, m, r) {
    if (a[l] > a[m]) {
        if (a[m] > a[r]) return m;
        else if (a[l] > a[r]) return r;
        else return l;
    } else {
        if (a[l] > a[r]) return l;
        else if (a[m] > a[r]) return r;
        else return m;
    }
}

/**
 * Разделение массива относительно опорного элемента
 */
function partition2(a, l, r) {
    const v = a[Math.floor((l + r) / 2)];
    let i = l;
    let j = r;

    while (i <= j) {
        while (a[i] < v) i++;
        while (a[j] > v) j--;

        if (i >= j) break;

        [a[i], a[j]] = [a[j], a[i]];
        i++;
        j--;
    }
    return j;
}

/**
 * Улучшенная быстрая сортировка
 */
function quickSort2(a, l = 0, r = a.length - 1) {
    quickSort2Calls++;
    quickSort2CurrentDepth++;
    if (quickSort2CurrentDepth > quickSort2MaxDepth) {
        quickSort2MaxDepth = quickSort2CurrentDepth;
    }

    if (r - l <= M) {
        insertionSort(a, l, r);
        quickSort2CurrentDepth--;
        return a;
    }

    const mid = Math.floor((l + r) / 2);
    const med = medianOfThree(a, l, mid, r);

    [a[med], a[mid]] = [a[mid], a[med]];

    const i = partition2(a, l, r);

    quickSort2(a, l, i);
    quickSort2(a, i + 1, r);

    quickSort2CurrentDepth--;
    return a;
}

// ==============================================
// ЧАСТЬ 2 - ОТСОРТИРОВАННЫЙ МАССИВ
// ==============================================

/*** Массив размеров тестируемых массивов.*/
const arr2 = [1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000];

/** Объект для хранения результатов замеров по каждому размеру N. */
const results2 = {};

/** Массив всех точек замеров для общего графика. */
const allPoints2 = [];

// Счётчики для части 2
let quickSort2Calls = 0;
let quickSort2MaxDepth = 0;
let quickSort2CurrentDepth = 0;

// Инициализация массива результатов для каждого N
for (const N of arr2) {
    results2[N] = [];
}

console.log('\nЧАСТЬ 2: Тесты для всех значений N из списка:', arr2.join(', '), '\n');

// Основной цикл тестирования
for (const N of arr2) {
    console.log(`=== Тест для N = ${N} ===`);

    for (let test = 1; test <= 20; test++) {
        const vectorToSort = [];
        for (let i = 0; i < N; i++) {
            vectorToSort[i] = i;
        }

        // Сброс счётчиков перед тестом
        quickSort2Calls = 0;
        quickSort2MaxDepth = 0;
        quickSort2CurrentDepth = 0;

        const start = performance.now();
        quickSort2(vectorToSort, 0, vectorToSort.length - 1);
        const end = performance.now();

        const timeMs = end - start;
        const timeSec = timeMs / 1000;

        console.log(`  Тест ${test}: время=${timeSec.toFixed(4)}с, вызовов=${quickSort2Calls}, глубина=${quickSort2MaxDepth}`);

        results2[N].push(timeMs);
        allPoints2.push({ N, time: timeMs });
    }
    console.log('');
}

/** Сохраняем все результаты в CSV файл.*/
let csvContent2 = 'N,Test,Time_ms\n';
for (const N of arr2) {
    results2[N].forEach((time, index) => {
        csvContent2 += `${N},${index + 1},${time.toFixed(3)}\n`;
    });
}
fs.writeFileSync('results_Sorted.csv', csvContent2);
console.log('Результаты сохранены в results_Sorted.csv\n');

// ==============================================
// ФУНКЦИЯ ДЛЯ ЧАСТИ 3 (объявляем ДО тестов)
// ==============================================

/**
 * Быстрая сортировка с разделением на три части (для одинаковых элементов)
 */
function quickSort3Way(a, l = 0, r = a.length - 1) {
    quickSort3Calls++;
    quickSort3CurrentDepth++;
    if (quickSort3CurrentDepth > quickSort3MaxDepth) {
        quickSort3MaxDepth = quickSort3CurrentDepth;
    }

    if (r <= l) {
        quickSort3CurrentDepth--;
        return;
    }

    const v = a[r];
    let i = l;
    let j = r - 1;
    let p = l - 1;
    let q = r;

    while (i <= j) {
        while (i <= j && a[i] < v) i++;
        while (i <= j && a[j] > v) j--;

        if (i > j) break;

        [a[i], a[j]] = [a[j], a[i]];

        if (a[i] === v) {
            p++;
            [a[p], a[i]] = [a[i], a[p]];
        }
        i++;

        if (a[j] === v) {
            q--;
            [a[q], a[j]] = [a[j], a[q]];
        }
        j--;
    }

    [a[i], a[r]] = [a[r], a[i]];

    let leftEqual = i - 1;
    let rightEqual = i + 1;

    for (let k = l; k <= p; k++) {
        [a[k], a[leftEqual]] = [a[leftEqual], a[k]];
        leftEqual--;
    }

    for (let k = r - 1; k >= q; k--) {
        [a[k], a[rightEqual]] = [a[rightEqual], a[k]];
        rightEqual++;
    }

    quickSort3Way(a, l, leftEqual);
    quickSort3Way(a, rightEqual, r);

    quickSort3CurrentDepth--;
}

// ==============================================
// ЧАСТЬ 3 - МАССИВ С ОДИНАКОВЫМИ ЭЛЕМЕНТАМИ
// ==============================================

/*** Массив размеров тестируемых массивов.*/
const arr3 = [1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000];

/** Объект для хранения результатов замеров по каждому размеру N. */
const results3 = {};

/** Массив всех точек замеров для общего графика. */
const allPoints3 = [];

// Счётчики для части 3
let quickSort3Calls = 0;
let quickSort3MaxDepth = 0;
let quickSort3CurrentDepth = 0;

// Инициализация массива результатов для каждого N
for (const N of arr3) {
    results3[N] = [];
}

console.log('\nЧАСТЬ 3: Тесты для всех значений N из списка:', arr3.join(', '), '\n');

// Основной цикл тестирования
for (const N of arr3) {
    console.log(`=== Тест для N = ${N} ===`);

    for (let test = 1; test <= 20; test++) {
        const vectorToSort = [];
        const constantValue = Math.random() * 1000;

        for (let i = 0; i < N; i++) {
            vectorToSort[i] = constantValue;
        }

        // Сброс счётчиков перед тестом
        quickSort3Calls = 0;
        quickSort3MaxDepth = 0;
        quickSort3CurrentDepth = 0;

        const start = performance.now();
        quickSort3Way(vectorToSort, 0, vectorToSort.length - 1);
        const end = performance.now();

        const timeMs = end - start;
        const timeSec = timeMs / 1000;

        console.log(`  Тест ${test}: время=${timeSec.toFixed(4)}с, вызовов=${quickSort3Calls}, глубина=${quickSort3MaxDepth}`);

        results3[N].push(timeMs);
        allPoints3.push({ N, time: timeMs });
    }
    console.log('');
}

/** Сохраняем все результаты в CSV файл.*/
let csvContent3 = 'N,Test,Time_ms\n';
for (const N of arr3) {
    results3[N].forEach((time, index) => {
        csvContent3 += `${N},${index + 1},${time.toFixed(3)}\n`;
    });
}
fs.writeFileSync('results_Identical.csv', csvContent3);
console.log('Результаты сохранены в results_Identical.csv\n');

// ==============================================
// ФУНКЦИИ ДЛЯ ЧАСТИ 4 (объявляем ДО тестов)
// ==============================================

/**
 * Создает массив, на котором быстрая сортировка с выбором среднего элемента
 * работает максимально долго (Θ(n²))
 */
function generateAntiQsortArray(n) {
    const a = [];
    for (let i = 0; i < n; i++) {
        a[i] = i + 1;
    }
    for (let i = 0; i < n; i++) {
        const j = Math.floor(i / 2);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Разделение массива (стандартное, с выбором среднего элемента)
 */
function partition4(a, l, r) {
    const v = a[Math.floor((l + r) / 2)];
    let i = l;
    let j = r;

    while (i <= j) {
        while (a[i] < v) i++;
        while (a[j] > v) j--;
        if (i >= j) break;
        [a[i], a[j]] = [a[j], a[i]];
        i++;
        j--;
    }
    return j;
}

/**
 * Итеративная быстрая сортировка (без рекурсии)
 */
function quickSort4(a, l = 0, r = a.length - 1) {
    // Стек для хранения границ подмассивов и глубины
    const stack = [{ l, r, depth: 1 }];
    let iterations = 0;

    while (stack.length > 0) {
        iterations++; // Считаем каждую итерацию (разделение)
        const { l, r, depth } = stack.pop();

        // Обновляем максимальную глубину
        if (depth > quickSort4MaxDepth) {
            quickSort4MaxDepth = depth;
        }

        if (l < r) {
            const q = partition4(a, l, r);

            // Сохраняем подмассивы в стек с увеличенной глубиной
            // Сначала больший, чтобы минимизировать стек
            if (q - l > r - q) {
                stack.push({ l, r: q, depth: depth + 1 });
                stack.push({ l: q + 1, r, depth: depth + 1 });
            } else {
                stack.push({ l: q + 1, r, depth: depth + 1 });
                stack.push({ l, r: q, depth: depth + 1 });
            }
        }
    }

    quickSort4Calls = iterations; // Сохраняем количество итераций
    return a;
}

// ==============================================
// ЧАСТЬ 4 - МАССИВ С МАКСИМАЛЬНЫМ КОЛИЧЕСТВОМ СРАВНЕНИЙ (antiQsort)
// ==============================================

/*** Массив размеров тестируемых массивов.*/
const arr4 = [1000, 2000, 4000];

/** Объект для хранения результатов замеров по каждому размеру N. */
const results4 = {};

/** Массив всех точек замеров для общего графика. */
const allPoints4 = [];

// Счётчики для части 4
let quickSort4Calls = 0;
let quickSort4MaxDepth = 0;

// Инициализация массива результатов для каждого N
for (const N of arr4) {
    results4[N] = [];
}

console.log('\nЧАСТЬ 4: Тесты для всех значений N из списка:', arr4.join(', '), '\n');

// Основной цикл тестирования (часть 4)
for (const N of arr4) {
    console.log(`=== Тест для N = ${N} ===`);

    for (let test = 1; test <= 20; test++) {
        const vectorToSort = generateAntiQsortArray(N);

        // Сброс счётчиков перед тестом
        quickSort4Calls = 0;
        quickSort4MaxDepth = 0;

        const start = performance.now();
        quickSort4(vectorToSort, 0, vectorToSort.length - 1);
        const end = performance.now();

        const timeMs = end - start;
        const timeSec = timeMs / 1000;

        console.log(`  Тест ${test}: время=${timeSec.toFixed(4)}с, вызовов=${quickSort4Calls}, глубина=${quickSort4MaxDepth}`);

        results4[N].push(timeMs);
        allPoints4.push({ N, time: timeMs });
    }
    console.log('');
}

/** Сохраняем все результаты в CSV файл.*/
let csvContent4 = 'N,Test,Time_ms\n';
for (const N of arr4) {
    results4[N].forEach((time, index) => {
        csvContent4 += `${N},${index + 1},${time.toFixed(3)}\n`;
    });
}
fs.writeFileSync('results_WorstCase.csv', csvContent4);
console.log('Результаты сохранены в results_WorstCase.csv\n');

// ==============================================
// ФУНКЦИИ ДЛЯ ЧАСТИ 5 (объявляем ДО тестов)
// ==============================================

/**
 * Создает массив, на котором быстрая сортировка с детерминированным выбором опорного элемента
 * (например, всегда последний элемент) работает максимально долго (Θ(n²))
 */
function generateDeterministicWorstCase(n) {
    const pairs = [];
    for (let i = 0; i < n; i++) {
        pairs.push({ val: 0, key: i });
    }

    let currentValue = n;

    function partitionPairs(arr, l, r) {
        const pivotIndex = r;
        const pivotVal = arr[pivotIndex].val;
        let i = l - 1;

        for (let j = l; j < r; j++) {
            if (arr[j].val <= pivotVal) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }

        [arr[i + 1], arr[r]] = [arr[r], arr[i + 1]];
        return i + 1;
    }

    const stack = [{ l: 0, r: n - 1 }];

    while (stack.length > 0) {
        const { l, r } = stack.pop();

        if (l < r) {
            const pivotIndex = r;
            pairs[pivotIndex].val = currentValue;
            currentValue--;

            const q = partitionPairs(pairs, l, r);

            stack.push({ l: q + 1, r: r });
            stack.push({ l: l, r: q - 1 });
        }
    }

    pairs.sort((a, b) => a.key - b.key);
    return pairs.map(p => p.val);
}

/**
 * Разделение массива (с выбором последнего элемента в качестве опорного)
 */
function partitionLast(a, l, r) {
    const v = a[r];
    let i = l - 1;

    for (let j = l; j < r; j++) {
        if (a[j] <= v) {
            i++;
            [a[i], a[j]] = [a[j], a[i]];
        }
    }

    [a[i + 1], a[r]] = [a[r], a[i + 1]];
    return i + 1;
}

/**
 * Итеративная быстрая сортировка (с выбором последнего элемента)
 */
function quickSortLast(a, l = 0, r = a.length - 1) {
    const stack = [{ l, r, depth: 1 }];
    let iterations = 0;

    while (stack.length > 0) {
        iterations++;
        const { l, r, depth } = stack.pop();

        if (depth > quickSort5MaxDepth) {
            quickSort5MaxDepth = depth;
        }

        if (l < r) {
            const q = partitionLast(a, l, r);

            // Сохраняем подмассивы в стек с увеличенной глубиной
            if (q - l > r - q) {
                stack.push({ l, r: q - 1, depth: depth + 1 });
                stack.push({ l: q + 1, r, depth: depth + 1 });
            } else {
                stack.push({ l: q + 1, r, depth: depth + 1 });
                stack.push({ l, r: q - 1, depth: depth + 1 });
            }
        }
    }

    quickSort5Calls = iterations;
    return a;
}

// ==============================================
// ЧАСТЬ 5 - ДЕТЕРМИНИРОВАННЫЙ ХУДШИЙ СЛУЧАЙ
// ==============================================

/*** Массив размеров тестируемых массивов.*/
const arr5 = [1000, 2000, 4000];

/** Объект для хранения результатов замеров по каждому размеру N. */
const results5 = {};

/** Массив всех точек замеров для общего графика. */
const allPoints5 = [];

// Счётчики для части 5
let quickSort5Calls = 0;
let quickSort5MaxDepth = 0;

// Инициализация массива результатов для каждого N
for (const N of arr5) {
    results5[N] = [];
}

console.log('\nЧАСТЬ 5: Тесты для всех значений N из списка:', arr5.join(', '), '\n');

// Основной цикл тестирования (часть 5)
for (const N of arr5) {
    console.log(`=== Тест для N = ${N} ===`);

    for (let test = 1; test <= 20; test++) {
        const vectorToSort = generateDeterministicWorstCase(N);

        // Сброс счётчиков перед тестом
        quickSort5Calls = 0;
        quickSort5MaxDepth = 0;

        const start = performance.now();
        quickSortLast(vectorToSort, 0, vectorToSort.length - 1);
        const end = performance.now();

        const timeMs = end - start;
        const timeSec = timeMs / 1000;

        console.log(`  Тест ${test}: время=${timeSec.toFixed(4)}с, вызовов=${quickSort5Calls}, глубина=${quickSort5MaxDepth}`);

        results5[N].push(timeMs);
        allPoints5.push({ N, time: timeMs });
    }
    console.log('');
}

/** Сохраняем все результаты в CSV файл.*/
let csvContent5 = 'N,Test,Time_ms\n';
for (const N of arr5) {
    results5[N].forEach((time, index) => {
        csvContent5 += `${N},${index + 1},${time.toFixed(3)}\n`;
    });
}
fs.writeFileSync('results_DeterministicWorstCase.csv', csvContent5);
console.log('Результаты сохранены в results_DeterministicWorstCase.csv\n');