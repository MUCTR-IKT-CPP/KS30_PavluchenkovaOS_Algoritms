const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

class Graph {

    constructor(vertices, edges, isDirected = false) {
        this.vertices = vertices;
        this.edges = edges;
        this.isDirected = isDirected;
        this._adjacencyMatrix = null;
        this._incidenceMatrix = null;
        this._adjacencyList = null;
    }

    getAdjacencyMatrix() {
        if (this._adjacencyMatrix) return this._adjacencyMatrix;

        const matrix = Array(this.vertices).fill().map(() => Array(this.vertices).fill(0));
        for (const edge of this.edges) {
            matrix[edge.from][edge.to] = 1;
            if (!this.isDirected && edge.from !== edge.to) {
                matrix[edge.to][edge.from] = 1;
            }
        }
        this._adjacencyMatrix = matrix;
        return matrix;
    }


    getIncidenceMatrix() {
        if (this._incidenceMatrix) return this._incidenceMatrix;

        const matrix = Array(this.vertices).fill().map(() => Array(this.edges.length).fill(0));
        for (let i = 0; i < this.edges.length; i++) {
            const edge = this.edges[i];
            if (this.isDirected) {
                matrix[edge.from][i] = 1;
                matrix[edge.to][i] = -1;
            } else {
                matrix[edge.from][i] = 1;
                matrix[edge.to][i] = 1;
                if (edge.from === edge.to) matrix[edge.from][i] = 2;
            }
        }
        this._incidenceMatrix = matrix;
        return matrix;
    }

    getAdjacencyList() {
        if (this._adjacencyList) return this._adjacencyList;

        const list = Array(this.vertices).fill().map(() => []);
        for (const edge of this.edges) {
            list[edge.from].push(edge.to);
            if (!this.isDirected && edge.from !== edge.to) {
                list[edge.to].push(edge.from);
            }
        }
        this._adjacencyList = list;
        return list;
    }


    getEdgesList() {
        return [...this.edges];
    }
}

class GraphGenerator {

    constructor(params) {
        this.params = params;
    }

    getMaxPossibleEdges(vertices) {
        if (this.params.isDirected) {
            return vertices * (vertices - 1);
        }
        return Math.floor(vertices * (vertices - 1) / 2);
    }

    checkDegreeConstraints(edges, vertices) {
        if (!this.params.isDirected && this.params.maxDegree !== null) {
            const degrees = Array(vertices).fill(0);
            for (const edge of edges) {
                degrees[edge.from]++;
                degrees[edge.to]++;
            }
            if (Math.max(...degrees) > this.params.maxDegree) return false;
        }

        if (this.params.isDirected) {
            const inDegrees = Array(vertices).fill(0);
            const outDegrees = Array(vertices).fill(0);
            for (const edge of edges) {
                outDegrees[edge.from]++;
                inDegrees[edge.to]++;
            }
            if (this.params.maxInDegree !== null && Math.max(...inDegrees) > this.params.maxInDegree) return false;
            if (this.params.maxOutDegree !== null && Math.max(...outDegrees) > this.params.maxOutDegree) return false;
        }

        return true;
    }

    generateEdges(vertices, targetEdges) {
        const edges = [];
        const edgeSet = new Set();
        let attempts = 0;
        const maxAttempts = vertices * vertices * 10;

        while (edges.length < targetEdges && attempts < maxAttempts) {
            let from = Math.floor(Math.random() * vertices);
            let to = Math.floor(Math.random() * vertices);
            if (from === to) {
                attempts++;
                continue;
            }

            if (!this.params.isDirected && from > to) {
                [from, to] = [to, from];
            }

            const key = `${from},${to}`;
            if (!edgeSet.has(key)) {
                edgeSet.add(key);
                edges.push({ from, to });
            }
            attempts++;
        }
        return edges;
    }


    generate() {
        const vertices = Math.floor(Math.random() * (this.params.maxVertices - this.params.minVertices + 1)) + this.params.minVertices;
        const maxPossible = this.getMaxPossibleEdges(vertices);
        const targetEdges = Math.min(
            Math.floor(Math.random() * (this.params.maxEdges - this.params.minEdges + 1)) + this.params.minEdges,
            maxPossible
        );

        let edges = [];
        let attempts = 0;
        const maxAttempts = 100;

        while (edges.length < targetEdges && attempts < maxAttempts) {
            edges = this.generateEdges(vertices, targetEdges);
            if (this.checkDegreeConstraints(edges, vertices)) break;
            edges = [];
            attempts++;
        }

        return new Graph(vertices, edges, this.params.isDirected);
    }


    generateWithExactVertices(vertices, targetEdges) {
        const maxPossible = this.getMaxPossibleEdges(vertices);
        const finalEdges = Math.min(targetEdges, maxPossible);

        let edges = [];
        let attempts = 0;
        const maxAttempts = 100;

        while (edges.length < finalEdges && attempts < maxAttempts) {
            edges = this.generateEdges(vertices, finalEdges);
            if (this.checkDegreeConstraints(edges, vertices)) break;
            edges = [];
            attempts++;
        }

        return new Graph(vertices, edges, this.params.isDirected);
    }
}


function bfs(graph, start, end) {
    const adjList = graph.getAdjacencyList();
    const visited = new Array(graph.vertices).fill(false);
    const parent = new Array(graph.vertices).fill(-1);
    const queue = [start];
    visited[start] = true;

    while (queue.length > 0) {
        const current = queue.shift();

        if (current === end) {
            const path = [];
            let node = end;
            while (node !== -1) {
                path.unshift(node);
                node = parent[node];
            }
            return { found: true, pathLength: path.length - 1, path };
        }

        for (const neighbor of adjList[current]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                parent[neighbor] = current;
                queue.push(neighbor);
            }
        }
    }
    return { found: false, pathLength: -1, path: [] };
}


function dfs(graph, start, end) {
    const adjList = graph.getAdjacencyList();
    const visited = new Array(graph.vertices).fill(false);
    const parent = new Array(graph.vertices).fill(-1);
    const stack = [start];

    while (stack.length > 0) {
        const current = stack.pop();

        if (current === end) {
            const path = [];
            let node = end;
            while (node !== -1) {
                path.unshift(node);
                node = parent[node];
            }
            return { found: true, pathLength: path.length - 1, path };
        }

        if (!visited[current]) {
            visited[current] = true;
            for (const neighbor of adjList[current]) {
                if (!visited[neighbor] && parent[neighbor] === -1) {
                    parent[neighbor] = current;
                    stack.push(neighbor);
                }
            }
        }
    }
    return { found: false, pathLength: -1, path: [] };
}


function measureTime(algorithm, graph, start, end, iterations = 10) {
    let totalTime = 0;
    let result = null;
    for (let i = 0; i < iterations; i++) {
        const startTime = process.hrtime.bigint();
        result = algorithm(graph, start, end);
        const endTime = process.hrtime.bigint();
        totalTime += Number(endTime - startTime) / 1e6;
    }
    return {
        time: totalTime / iterations,
        found: result.found,
        pathLength: result.pathLength,
        path: result.path
    };
}


async function main() {
    // Параметры генератора
    const generatorParams = {
        minVertices: 10,
        maxVertices: 100,
        minEdges: 20,
        maxEdges: 200,
        maxDegree: null,
        isDirected: false,
        maxInDegree: null,
        maxOutDegree: null
    };

    // Параметры тестирования (10 графов с возрастающим размером)
    const numGraphs = 10;
    const startVertices = 50;
    const endVertices = 500;
    const edgesMultiplier = 3;

    const generator = new GraphGenerator(generatorParams);
    const results = [];

    console.log('Генерация 10 графов с возрастающим количеством вершин и ребер...');
    const step = Math.floor((endVertices - startVertices) / (numGraphs - 1));
    const graphs = [];

    for (let i = 0; i < numGraphs; i++) {
        const vertices = startVertices + i * step;
        const edges = vertices * edgesMultiplier;
        graphs.push(generator.generateWithExactVertices(vertices, edges));
    }

    console.log('Выполнение поиска пути BFS и DFS...\n');
    console.log('Граф | Вершины | Ребра | BFS (мс) | DFS (мс) | BFS путь | DFS путь');
    console.log('-----|---------|-------|----------|----------|----------|----------');

    for (let i = 0; i < graphs.length; i++) {
        const graph = graphs[i];
        const start = Math.floor(Math.random() * graph.vertices);
        let end = Math.floor(Math.random() * graph.vertices);
        while (end === start && graph.vertices > 1) end = Math.floor(Math.random() * graph.vertices);

        const bfsResult = measureTime(bfs, graph, start, end);
        const dfsResult = measureTime(dfs, graph, start, end);

        results.push({
            graphNumber: i + 1,
            vertices: graph.vertices,
            edges: graph.edges.length,
            start, end,
            bfsTime: bfsResult.time,
            dfsTime: dfsResult.time,
            bfsFound: bfsResult.found,
            dfsFound: dfsResult.found,
            bfsPathLength: bfsResult.pathLength,
            dfsPathLength: dfsResult.pathLength,
            bfsPath: bfsResult.path,
            dfsPath: dfsResult.path
        });

        const bfsPathStr = bfsResult.found ? bfsResult.pathLength.toString() : 'нет';
        const dfsPathStr = dfsResult.found ? dfsResult.pathLength.toString() : 'нет';

        console.log(`${i+1}     | ${graph.vertices}     | ${graph.edges.length}    | ${bfsResult.time.toFixed(4)}  | ${dfsResult.time.toFixed(4)}  | ${bfsPathStr.padEnd(8)} | ${dfsPathStr.padEnd(8)}`);
    }

    // Создание графика
    console.log('\nСоздание графика...');
    const width = 1200;
    const height = 800;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const configuration = {
        type: 'line',
        data: {
            labels: results.map(r => `${r.graphNumber}\n${r.vertices}в/${r.edges}р`),
            datasets: [
                {
                    label: 'BFS (Поиск в ширину)',
                    data: results.map(r => r.bfsTime),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 3,
                    pointRadius: 6,
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'DFS (Поиск в глубину)',
                    data: results.map(r => r.dfsTime),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 3,
                    pointRadius: 6,
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Сравнение BFS и DFS при поиске пути',
                    font: { size: 16 }
                },
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Время выполнения (мс)' },
                    beginAtZero: true
                },
                x: {
                    title: { display: true, text: 'Граф (№ / вершины / ребра)' }
                }
            }
        }
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    if (!fs.existsSync('./graphs')) fs.mkdirSync('./graphs');
    fs.writeFileSync('./graphs/bfs_vs_dfs.png', image);

    // Анализ эффективности
    console.log('\n=== АНАЛИЗ ЭФФЕКТИВНОСТИ ===');
    const avgBfs = results.reduce((s, r) => s + r.bfsTime, 0) / results.length;
    const avgDfs = results.reduce((s, r) => s + r.dfsTime, 0) / results.length;

    console.log(`Среднее время BFS: ${avgBfs.toFixed(4)} мс`);
    console.log(`Среднее время DFS: ${avgDfs.toFixed(4)} мс`);

    if (avgBfs < avgDfs) {
        console.log(`BFS быстрее DFS на ${((avgDfs - avgBfs) / avgDfs * 100).toFixed(1)}%`);
    } else {
        console.log(`DFS быстрее BFS на ${((avgBfs - avgDfs) / avgBfs * 100).toFixed(1)}%`);
    }

    const bfsFoundCount = results.filter(r => r.bfsFound).length;
    const dfsFoundCount = results.filter(r => r.dfsFound).length;

    console.log(`\nBFS нашел путь: ${bfsFoundCount}/${numGraphs} (${(bfsFoundCount/numGraphs*100).toFixed(1)}%)`);
    console.log(`DFS нашел путь: ${dfsFoundCount}/${numGraphs} (${(dfsFoundCount/numGraphs*100).toFixed(1)}%)`);

    let bothFound = 0, bfsShorter = 0, equal = 0;
    for (const r of results) {
        if (r.bfsFound && r.dfsFound) {
            bothFound++;
            if (r.bfsPathLength < r.dfsPathLength) bfsShorter++;
            else if (r.bfsPathLength === r.dfsPathLength) equal++;
        }
    }

    if (bothFound > 0) {
        console.log(`\nСравнение длины путей (из ${bothFound} графов, где путь найден):`);
        console.log(`  BFS короче DFS: ${bfsShorter}/${bothFound} (${(bfsShorter/bothFound*100).toFixed(1)}%)`);
        console.log(`  Пути равны: ${equal}/${bothFound} (${(equal/bothFound*100).toFixed(1)}%)`);
        console.log(`  DFS короче BFS: ${bothFound - bfsShorter - equal}/${bothFound} (${((bothFound - bfsShorter - equal)/bothFound*100).toFixed(1)}%)`);
    }

    // Сохранение результатов
    const csv = 'Граф,Вершины,Ребра,Начало,Конец,BFS_время_мс,DFS_время_мс,BFS_путь_найден,DFS_путь_найден,BFS_длина_пути,DFS_длина_пути\n' +
        results.map(r => `${r.graphNumber},${r.vertices},${r.edges},${r.start},${r.end},${r.bfsTime.toFixed(6)},${r.dfsTime.toFixed(6)},${r.bfsFound},${r.dfsFound},${r.bfsPathLength},${r.dfsPathLength}`).join('\n');
    fs.writeFileSync('results.csv', csv);



}

main().catch(console.error);