const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

/**
 * Класс, представляющий взвешенный граф
 * Поддерживает неориентированные и ориентированные графы
 * @class Graph
 */
class Graph {
    /**
     * Создает экземпляр графа
     * @param {number} vertices - Количество вершин в графе
     * @param {Array<{from: number, to: number, weight: number}>} edges - Массив ребер графа
     * @param {boolean} [isDirected=false] - Ориентированный ли граф
     */
    constructor(vertices, edges, isDirected = false) {
        this.vertices = vertices;
        this.edges = edges;
        this.isDirected = isDirected;
    }

    /**
     * ПОЛУЧЕНИЕ МАТРИЦЫ СМЕЖНОСТИ
     * Алгоритм из лекции:
     * 1. Если матрица уже вычислена - возвращаем из кэша
     * 2. Создаем квадратную матрицу размером vertices × vertices, заполняем нулями
     * 3. Для каждого ребра графа:
     *    - Устанавливаем matrix[from][to] = вес ребра
     *    - Если граф неориентированный и from != to, устанавливаем matrix[to][from] = вес
     * 4. Сохраняем результат в кэш и возвращаем
     *
     * @returns {Array<Array<number>>} Матрица смежности размера vertices × vertices
     */
    getAdjacencyMatrix() {
        if (this._adjacencyMatrix) return this._adjacencyMatrix;

        const matrix = Array(this.vertices).fill().map(() => Array(this.vertices).fill(0));
        for (const edge of this.edges) {
            matrix[edge.from][edge.to] = edge.weight || 1;
            if (!this.isDirected && edge.from !== edge.to) {
                matrix[edge.to][edge.from] = edge.weight || 1;
            }
        }
        this._adjacencyMatrix = matrix;
        return matrix;
    }

    /**
     * ПОЛУЧЕНИЕ СПИСКА СМЕЖНОСТИ
     * Алгоритм из лекции:
     * 1. Если список уже вычислен - возвращаем из кэша
     * 2. Создаем массив списков размером vertices
     * 3. Для каждого ребра:
     *    - Добавляем в список from запись {to, weight}
     *    - Если неориентированный: добавляем в список to запись {to: from, weight}
     * 4. Сохраняем результат в кэш и возвращаем
     *
     * @returns {Array<Array<{to: number, weight: number}>>} Список смежности
     */
    getAdjacencyList() {
        if (this._adjacencyList) return this._adjacencyList;

        const list = Array(this.vertices).fill().map(() => []);
        for (const edge of this.edges) {
            list[edge.from].push({ to: edge.to, weight: edge.weight || 1 });
            if (!this.isDirected && edge.from !== edge.to) {
                list[edge.to].push({ to: edge.from, weight: edge.weight || 1 });
            }
        }
        this._adjacencyList = list;
        return list;
    }

    /**
     * ФОРМИРОВАНИЕ CSV-СТРОКИ МАТРИЦЫ СМЕЖНОСТИ
     * @returns {string} Строка в формате CSV
     */
    getAdjacencyMatrixCSV() {
        const matrix = this.getAdjacencyMatrix();
        let csv = "";

        csv += "Вершины";
        for (let i = 0; i < this.vertices; i++) {
            csv += `,${i + 1}`;
        }
        csv += "\n";

        for (let i = 0; i < this.vertices; i++) {
            csv += `${i + 1}`;
            for (let j = 0; j < this.vertices; j++) {
                csv += `,${matrix[i][j]}`;
            }
            csv += "\n";
        }

        return csv;
    }

    /**
     * СОХРАНЕНИЕ МАТРИЦЫ СМЕЖНОСТИ В CSV-ФАЙЛ
     */
    saveAdjacencyMatrixToCSV(filename) {
        const csv = this.getAdjacencyMatrixCSV();
        fs.writeFileSync(filename, csv, 'utf8');
        console.log(` Матрица смежности сохранена в файл: ${filename}`);
    }
}

/**
 * DSU (Disjoint Set Union) - СИСТЕМА НЕПЕРЕСЕКАЮЩИХСЯ МНОЖЕСТВ
 * Используется для оптимизации алгоритма Краскала
 * @class DSU
 */
class DSU {
    /**
     * Создает DSU для n элементов
     * Алгоритм из лекции:
     * 1. Инициализируем parent[i] = i (каждая вершина - корень своего множества)
     * 2. Инициализируем rank[i] = 0 (высота дерева)
     *
     * @param {number} n - Количество элементов
     */
    constructor(n) {
        /** @type {Array<number>} Массив родительских вершин */
        this.parent = Array(n);
        /** @type {Array<number>} Ранг (высота) дерева для эвристики объединения */
        this.rank = Array(n);
        for (let i = 0; i < n; i++) {
            this.parent[i] = i;
            this.rank[i] = 0;
        }
    }

    /**
     * ПОИСК КОРНЯ МНОЖЕСТВА (find)
     * Алгоритм из лекции с сжатием пути:
     * 1. Если parent[v] === v - вершина является корнем, возвращаем v
     * 2. Иначе рекурсивно ищем корень для parent[v]
     * 3. Сжатие пути: parent[v] = найденный корень
     *
     * @param {number} v - Вершина, для которой ищем корень
     * @returns {number} Корень множества, содержащего v
     */
    find(v) {
        if (this.parent[v] !== v) {
            this.parent[v] = this.find(this.parent[v]);
        }
        return this.parent[v];
    }

    /**
     * ОБЪЕДИНЕНИЕ ДВУХ МНОЖЕСТВ (union)
     * Алгоритм из лекции с ранговой эвристикой:
     * 1. Находим корни обоих множеств
     * 2. Если корни совпадают - вершины уже в одном множестве, возвращаем false
     * 3. Присоединяем дерево с меньшим рангом к дереву с большим рангом
     * 4. Если ранги равны - присоединяем второе к первому и увеличиваем ранг
     * 5. Возвращаем true (объединение выполнено)
     *
     * @param {number} v1 - Первая вершина
     * @param {number} v2 - Вторая вершина
     * @returns {boolean} true - если множества были объединены, false - если уже в одном
     */
    union(v1, v2) {
        const root1 = this.find(v1);
        const root2 = this.find(v2);

        if (root1 === root2) return false;

        if (this.rank[root1] < this.rank[root2]) {
            this.parent[root1] = root2;
        } else if (this.rank[root1] > this.rank[root2]) {
            this.parent[root2] = root1;
        } else {
            this.parent[root2] = root1;
            this.rank[root1]++;
        }
        return true;
    }
}

/**
 * ОЧЕРЕДЬ С ПРИОРИТЕТОМ (min-heap)
 * Используется для эффективного извлечения ребра с минимальным весом
 * @class PriorityQueue
 */
class PriorityQueue {
    /**
     * Создает пустую очередь с приоритетом
     */
    constructor() {
        /** @type {Array<{from: number, to: number, weight: number}>} Бинарная куча */
        this.heap = [];
    }

    /**
     * ДОБАВЛЕНИЕ ЭЛЕМЕНТА В ОЧЕРЕДЬ (enqueue)
     * Алгоритм:
     * 1. Добавляем элемент в конец массива
     * 2. Выполняем всплытие (bubbleUp) для восстановления свойства кучи
     *
     * @param {{from: number, to: number, weight: number}} edge - Добавляемое ребро
     */
    enqueue(edge) {
        this.heap.push(edge);
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * ВСПЛЫТИЕ ЭЛЕМЕНТА (восстановление свойства кучи снизу вверх)
     * Алгоритм:
     * 1. Пока индекс > 0:
     * 2.   Вычисляем индекс родителя: Math.floor((index - 1) / 2)
     * 3.   Если вес родителя <= веса текущего - завершаем
     * 4.   Меняем местами текущий элемент с родительским
     * 5.   Перемещаемся на уровень вверх
     *
     * @private
     * @param {number} index - Индекс элемента для всплытия
     */
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].weight <= this.heap[index].weight) break;
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    /**
     * ИЗВЛЕЧЕНИЕ МИНИМАЛЬНОГО ЭЛЕМЕНТА (dequeue)
     * Алгоритм:
     * 1. Если куча пуста - возвращаем null
     * 2. Сохраняем минимальный элемент (корень)
     * 3. Перемещаем последний элемент в корень
     * 4. Выполняем погружение (sinkDown) для восстановления свойства кучи
     * 5. Возвращаем сохраненный минимальный элемент
     *
     * @returns {{from: number, to: number, weight: number} | null} Минимальное ребро или null
     */
    dequeue() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return min;
    }

    /**
     * ПОГРУЖЕНИЕ ЭЛЕМЕНТА (восстановление свойства кучи сверху вниз)
     * Алгоритм:
     * 1. Пока есть дочерние элементы:
     * 2.   Находим индексы левого и правого ребенка
     * 3.   Определяем, с кем нужно поменяться (меньший вес)
     * 4.   Если обмена нет - завершаем
     * 5.   Меняем местами текущий элемент с найденным ребенком
     *
     * @private
     * @param {number} index - Индекс элемента для погружения
     */
    sinkDown(index) {
        const length = this.heap.length;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let swap = null;
            let element = this.heap[index];

            if (leftChildIndex < length && this.heap[leftChildIndex].weight < element.weight) {
                swap = leftChildIndex;
            }

            if (rightChildIndex < length) {
                if ((swap === null && this.heap[rightChildIndex].weight < element.weight) ||
                    (swap !== null && this.heap[rightChildIndex].weight < this.heap[leftChildIndex].weight)) {
                    swap = rightChildIndex;
                }
            }

            if (swap === null) break;
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }

    /**
     * ПРОВЕРКА ПУСТОТЫ ОЧЕРЕДИ
     * @returns {boolean} true - если очередь пуста
     */
    isEmpty() {
        return this.heap.length === 0;
    }
}


/**
 * АЛГОРИТМ КРАСКАЛА ДЛЯ ПОСТРОЕНИЯ МИНИМАЛЬНОГО ОСТОВНОГО ДЕРЕВА (MST)
 * Алгоритм из лекции:
 * 1. Помещаем все ребра в очередь с приоритетом (сортировка по весу)
 * 2. Счетчик = 0
 * 3. До тех пор пока счетчик не достигнет размера графа - 1:
 *    - Рассматриваем ребро с минимальным весом
 *    - Проверяем через DSU, не существует ли уже путь между вершинами
 *    - Если пути нет - добавляем ребро в MST и объединяем множества
 * 4. Возвращаем построенное MST
 * @class KruskalMST
 */
class KruskalMST {
    /**
     * Создает экземпляр алгоритма для заданного графа
     * @param {Graph} graph - Исходный граф
     */
    constructor(graph) {
        /** @type {Graph} Исходный граф */
        this.graph = graph;
        /** @type {Array<{from: number, to: number, weight: number}>} Ребра MST */
        this.mstEdges = [];
        /** @type {number} Суммарный вес MST */
        this.totalWeight = 0;
        /** @type {number} Время выполнения в миллисекундах */
        this.executionTime = 0;
    }

    /**
     * ПОСТРОЕНИЕ МИНИМАЛЬНОГО ОСТОВНОГО ДЕРЕВА
     * Алгоритм из лекции с оптимизацией через DSU (улучшение из лекции):
     * 1. Засекаем начальное время
     * 2. Помещаем все ребра в очередь с приоритетом
     * 3. Инициализируем DSU для всех вершин
     * 4. Пока не добавлено (n-1) ребер и есть ребра в очереди:
     *    - Извлекаем ребро с минимальным весом
     *    - Если find(u) != find(v) (вершины в разных компонентах):
     *      - Добавляем ребро в MST
     *      - Выполняем union(u, v)
     * 5. Засекаем конечное время
     * 6. Возвращаем результат
     *
     * @returns {{edges: Array, totalWeight: number, edgesCount: number, executionTime: number}}
     */
    findMST() {
        const startTime = process.hrtime.bigint();

        const pq = new PriorityQueue();
        for (const edge of this.graph.edges) {
            pq.enqueue(edge);
        }

        const dsu = new DSU(this.graph.vertices);
        this.mstEdges = [];
        this.totalWeight = 0;
        let counter = 0;

        while (counter < this.graph.vertices - 1 && !pq.isEmpty()) {
            const edge = pq.dequeue();

            if (dsu.union(edge.from, edge.to)) {
                this.mstEdges.push(edge);
                this.totalWeight += edge.weight;
                counter++;
            }
        }

        const endTime = process.hrtime.bigint();
        this.executionTime = Number(endTime - startTime) / 1e6;

        return {
            edges: this.mstEdges,
            totalWeight: this.totalWeight,
            edgesCount: this.mstEdges.length,
            executionTime: this.executionTime
        };
    }

    /**
     * ВЫВОД MST В КОНСОЛЬ
     * Выводит количество ребер, общий вес, время выполнения и список ребер
     */
    printMST() {
        console.log(`\n  Минимальное остовное дерево (Алгоритм Краскала):`);
        console.log(`  Ребер в MST: ${this.mstEdges.length}`);
        console.log(`  Общий вес: ${this.totalWeight}`);
        console.log(`  Время выполнения: ${this.executionTime.toFixed(3)} мс`);
        console.log(`  Список ребер MST (from -> to, вес):`);

        const displayCount = Math.min(20, this.mstEdges.length);
        for (let i = 0; i < displayCount; i++) {
            const edge = this.mstEdges[i];
            console.log(`    ${edge.from + 1} -> ${edge.to + 1}, вес: ${edge.weight}`);
        }
        if (this.mstEdges.length > 20) {
            console.log(`    ... и еще ${this.mstEdges.length - 20} ребер`);
        }
    }

    /**
     * СОХРАНЕНИЕ MST В CSV-ФАЙЛ
     * @param {string} filename - Имя файла для сохранения
     */
    saveMSTToCSV(filename) {
        let csv = "from,to,weight\n";
        for (const edge of this.mstEdges) {
            csv += `${edge.from + 1},${edge.to + 1},${edge.weight}\n`;
        }
        fs.writeFileSync(filename, csv, 'utf8');
        console.log(`  📁 MST сохранен в файл: ${filename}`);
    }
}

/**
 * ГЕНЕРАТОР СЛУЧАЙНЫХ ГРАФОВ С ЗАДАННЫМИ ПАРАМЕТРАМИ
 * @class GraphGenerator
 */
class GraphGenerator {
    /**
     * Создает генератор графов
     * @param {{isDirected: boolean, maxDegree: number|null, maxInDegree: number|null, maxOutDegree: number|null}} params - Параметры генерации*/
    constructor(params) {

        this.params = params;
    }

    /**
     * ПРОВЕРКА СВЯЗНОСТИ ГРАФА (BFS)
     * Алгоритм из лекции:
     * 1. Строим список смежности
     * 2. Запускаем BFS от вершины 0
     * 3. Считаем количество посещенных вершин
     * 4. Возвращаем true, если все вершины посещены
     *
     * @param {number} vertices - Количество вершин
     * @param {Array} edges - Массив ребер
     * @returns {boolean} true - если граф связный
     */
    isGraphConnected(vertices, edges) {
        if (vertices === 0) return true;

        const adjacencyList = Array(vertices).fill().map(() => []);
        for (const edge of edges) {
            adjacencyList[edge.from].push(edge.to);
            if (!this.params.isDirected && edge.from !== edge.to) {
                adjacencyList[edge.to].push(edge.from);
            }
        }

        const visited = Array(vertices).fill(false);
        const queue = [0];
        visited[0] = true;
        let visitedCount = 1;

        while (queue.length > 0) {
            const current = queue.shift();
            for (const neighbor of adjacencyList[current]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    visitedCount++;
                    queue.push(neighbor);
                }
            }
        }

        return visitedCount === vertices;
    }

    /**
     * ПРОВЕРКА МИНИМАЛЬНОЙ СТЕПЕНИ ВЕРШИН
     * @param {Array} edges - Массив ребер
     * @param {number} vertices - Количество вершин
     * @param {number} minDegree - Требуемая минимальная степень
     * @returns {boolean} true - если все вершины имеют степень >= minDegree
     */
    checkMinDegree(edges, vertices, minDegree) {
        const degrees = Array(vertices).fill(0);
        for (const edge of edges) {
            degrees[edge.from]++;
            if (!this.params.isDirected && edge.from !== edge.to) {
                degrees[edge.to]++;
            }
        }

        for (let i = 0; i < vertices; i++) {
            if (degrees[i] < minDegree) return false;
        }
        return true;
    }

    /**
     * ГЕНЕРАЦИЯ СВЯЗНОГО ГРАФА С ЗАДАННОЙ МИНИМАЛЬНОЙ СТЕПЕНЬЮ
     * Алгоритм:
     * 1. Строим остовное дерево (связность)
     * 2. Добавляем дополнительные ребра до достижения minDegree
     * 3. Проверяем условия и повторяем при необходимости
     *
     * @param {number} vertices - Количество вершин
     * @param {number} minDegree - Требуемая минимальная степень
     * @returns {Graph} Сгенерированный граф
     * @throws {Error} Если не удалось сгенерировать граф
     */
    generateConnectedGraphWithMinDegree(vertices, minDegree) {
        let attempts = 0;
        const maxAttempts = 500;

        while (attempts < maxAttempts) {
            const edges = [];
            const edgeSet = new Set();

            // Шаг 1: Строим остовное дерево для гарантии связности
            for (let i = 1; i < vertices; i++) {
                const parent = Math.floor(Math.random() * i);
                const weight = Math.floor(Math.random() * 20) + 1;
                const key = parent < i ? `${parent},${i}` : `${i},${parent}`;
                edgeSet.add(key);
                edges.push({ from: parent, to: i, weight });
            }

            let currentDegrees = Array(vertices).fill(0);
            for (const edge of edges) {
                currentDegrees[edge.from]++;
                currentDegrees[edge.to]++;
            }

            // Шаг 2: Добавляем ребра для достижения minDegree
            let additionalEdges = 0;
            const maxAdditionalEdges = vertices * minDegree * 5;

            while (!this.checkMinDegree(edges, vertices, minDegree) && additionalEdges < maxAdditionalEdges) {
                const verticesWithLowDegree = [];
                for (let i = 0; i < vertices; i++) {
                    if (currentDegrees[i] < minDegree) {
                        verticesWithLowDegree.push(i);
                    }
                }

                if (verticesWithLowDegree.length === 0) break;

                const from = verticesWithLowDegree[Math.floor(Math.random() * verticesWithLowDegree.length)];

                let found = false;
                const candidates = Array.from({length: vertices}, (_, i) => i);
                for (let i = candidates.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
                }

                for (const to of candidates) {
                    if (to === from) continue;
                    const key = from < to ? `${from},${to}` : `${to},${from}`;
                    if (!edgeSet.has(key)) {
                        const weight = Math.floor(Math.random() * 20) + 1;
                        edgeSet.add(key);
                        edges.push({ from, to, weight });
                        currentDegrees[from]++;
                        currentDegrees[to]++;
                        found = true;
                        break;
                    }
                }

                if (!found) break;
                additionalEdges++;
            }

            // Шаг 3: Проверяем условия
            if (this.checkMinDegree(edges, vertices, minDegree) &&
                this.isGraphConnected(vertices, edges)) {
                console.log(`  Сгенерирован граф: ${edges.length} ребер, мин. степень: ${Math.min(...currentDegrees)}`);
                return new Graph(vertices, edges, this.params.isDirected);
            }

            attempts++;
        }

        throw new Error(`Не удалось сгенерировать связный граф с ${vertices} вершинами и мин. степенью ${minDegree}`);
    }

}



/**
 * ПОСТРОЕНИЕ ГРАФИКА ПРОИЗВОДИТЕЛЬНОСТИ
 * Создает линейный график зависимости времени выполнения от количества вершин
 *
 * @async
 * @param {Array<number>} vertexCounts - Массив количества вершин
 * @param {Array<number>} avgTimes - Массив средних времен выполнения
 * @param {Array<number>} minTimes - Массив минимальных времен выполнения
 * @param {Array<number>} maxTimes - Массив максимальных времен выполнения
 * @returns {Promise<void>}
 */
async function createPerformanceChart(vertexCounts, avgTimes, minTimes, maxTimes) {
    const width = 800;
    const height = 600;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const configuration = {
        type: 'line',
        data: {
            labels: vertexCounts.map(v => v.toString()),
            datasets: [
                {
                    label: 'Среднее время выполнения (мс)',
                    data: avgTimes,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.1
                },
                {
                    label: 'Минимальное время (мс)',
                    data: minTimes,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 1.5,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderDash: [5, 5],
                    tension: 0.1
                },
                {
                    label: 'Максимальное время (мс)',
                    data: maxTimes,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 1.5,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderDash: [5, 5],
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Зависимость времени выполнения алгоритма Краскала от количества вершин',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                subtitle: {
                    display: true,
                    text: 'Серия тестов (5-10 запусков для каждого размера графа)',
                    font: {
                        size: 12
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(3)} мс`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Количество вершин (N)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Время выполнения (миллисекунды)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    beginAtZero: true
                }
            },
            elements: {
                line: {
                    fill: false
                },
                point: {
                    hoverRadius: 8
                }
            }
        }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync('./performance_chart.png', imageBuffer);
}

/**
 * ОСНОВНАЯ ФУНКЦИЯ ВЫПОЛНЕНИЯ ТЕХНИЧЕСКОГО ЗАДАНИЯ
 * Генерирует графы с 10, 20, 50, 100 вершинами,
 * минимальными степенями [3, 4, 10, 20],
 * проводит серию тестов алгоритма Краскала,
 * сохраняет результаты и строит график
 *
 * @async
 * @returns {Promise<Array<Graph>>} Массив сгенерированных графов
 */
async function createGraphsForTask() {
    const vertexCounts = [10, 20, 50, 100];
    const minDegrees = [3, 4, 10, 20];
    const graphs = [];

    // Для хранения результатов замеров времени
    const avgTimes = [];
    const minTimes = [];
    const maxTimes = [];
    const allTestResults = [];

    const generator = new GraphGenerator({
        isDirected: false,
        maxDegree: null
    });

    console.log("=".repeat(60));
    console.log("Генерация графов согласно техническому заданию");
    console.log("=".repeat(60));

    if (!fs.existsSync('./matrices')) {
        fs.mkdirSync('./matrices');
    }

    if (!fs.existsSync('./mst_results')) {
        fs.mkdirSync('./mst_results');
    }

    for (let i = 0; i < vertexCounts.length; i++) {
        console.log(`\n[${i + 1}/4] Генерация графа с ${vertexCounts[i]} вершинами и мин. степенью ${minDegrees[i]}:`);
        console.log("-".repeat(40));

        try {
            const graph = generator.generateConnectedGraphWithMinDegree(vertexCounts[i], minDegrees[i]);
            graphs.push(graph);
            const degrees = Array(graph.vertices).fill(0);
            for (const edge of graph.edges) {
                degrees[edge.from]++;
                degrees[edge.to]++;
            }

            console.log(`  Степени вершин:`);
            console.log(`    - Минимальная: ${Math.min(...degrees)}`);
            console.log(`    - Максимальная: ${Math.max(...degrees)}`);
            console.log(`    - Средняя: ${(degrees.reduce((a,b) => a + b, 0) / graph.vertices).toFixed(2)}`);

            const weights = graph.edges.map(e => e.weight);
            console.log(`  Веса ребер:`);
            console.log(`    - Минимальный: ${Math.min(...weights)}`);
            console.log(`    - Максимальный: ${Math.max(...weights)}`);
            console.log(`    - Средний: ${(weights.reduce((a,b) => a + b, 0) / weights.length).toFixed(2)}`);

            const isConnected = generator.isGraphConnected(graph.vertices, graph.edges);
            console.log(`  Связность: ${isConnected ? "Граф связный" : "Граф НЕ связный"}`);

            const filename = `./matrices/graph_${graph.vertices}_vertices_min${minDegrees[i]}.csv`;
            graph.saveAdjacencyMatrixToCSV(filename);

            console.log(`\n  Запуск алгоритма Краскала для поиска MST...`);

            const testCount = graph.vertices <= 20 ? 10 : (graph.vertices <= 50 ? 7 : 5);
            console.log(`  Проводим серию из ${testCount} тестов...`);

            const testResults = [];
            let totalTime = 0;

            for (let test = 0; test < testCount; test++) {
                const kruskal = new KruskalMST(graph);
                const result = kruskal.findMST();
                testResults.push(result);
                totalTime += result.executionTime;
            }

            const avgTime = totalTime / testCount;
            const minTime = Math.min(...testResults.map(r => r.executionTime));
            const maxTime = Math.max(...testResults.map(r => r.executionTime));

            avgTimes.push(avgTime);
            minTimes.push(minTime);
            maxTimes.push(maxTime);
            allTestResults.push({
                vertices: graph.vertices,
                avgTime: avgTime,
                minTime: minTime,
                maxTime: maxTime,
                testCount: testCount,
                results: testResults.map(r => r.executionTime)
            });

            const bestResult = testResults.reduce((best, curr) =>
                curr.totalWeight < best.totalWeight ? curr : best, testResults[0]);

            console.log(`\n Результаты алгоритма Краскала (серия из ${testCount} тестов):`);
            console.log(`    - Среднее время выполнения: ${avgTime.toFixed(3)} мс`);
            console.log(`    - Минимальное время: ${minTime.toFixed(3)} мс`);
            console.log(`    - Максимальное время: ${maxTime.toFixed(3)} мс`);

            const finalKruskal = new KruskalMST(graph);
            finalKruskal.findMST();
            finalKruskal.printMST();

            const mstFilename = `./mst_results/mst_${graph.vertices}_vertices_min${minDegrees[i]}.csv`;
            finalKruskal.saveMSTToCSV(mstFilename);

        } catch (error) {
            console.error(`Ошибка при генерации: ${error.message}`);
        }
        console.log("-".repeat(40));
    }

    console.log("\nРЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:");
    console.log("=".repeat(80));
    console.log("│ N вершин │ Кол-во тестов │ Среднее время (мс) │ Мин. время │ Макс. время │");
    console.log("├──────────┼────────────────┼────────────────────┼────────────┼─────────────┤");
    for (let i = 0; i < vertexCounts.length; i++) {
        const testCount = vertexCounts[i] <= 20 ? 10 : (vertexCounts[i] <= 50 ? 7 : 5);
        console.log(`│ ${vertexCounts[i].toString().padStart(8)} │ ${testCount.toString().padStart(14)} │ ${avgTimes[i].toFixed(3).padStart(18)} │ ${minTimes[i].toFixed(3).padStart(10)} │ ${maxTimes[i].toFixed(3).padStart(11)} │`);
    }
    console.log("=".repeat(80));
    await createPerformanceChart(vertexCounts, avgTimes, minTimes, maxTimes);

    return graphs;
}

/**
 * ТОЧКА ВХОДА В ПРОГРАММУ
 * Запускает генерацию графов и тестирование алгоритма Краскала
 * @async
 */
async function main() {
    try {
        const graphs = await createGraphsForTask();

        if (graphs.length > 0) {
            console.log("\nИстатистика:");
            graphs.forEach((graph, idx) => {
                const degrees = Array(graph.vertices).fill(0);
                for (const edge of graph.edges) {
                    degrees[edge.from]++;
                    degrees[edge.to]++;
                }
                console.log(`  Граф ${idx + 1}: ${graph.vertices} вершин, ${graph.edges.length} ребер, мин.степень=${Math.min(...degrees)}`);
            });
        }

    } catch (error) {
        console.error('Ошибка при выполнении:', error);
    }
}

// Запуск генерации
main();