/**
 * Модуль: Очередь на основе односвязного списка
 * Реализует модель: "Первый пришел - первый ушел"
 * @module QueueLinkedList
 */

// ====================== ЭЛЕМЕНТ СПИСКА ======================

/**
 * Узел односвязного списка
 * Структура: поле значения + поле указателя на следующий
 * @class Node
 * @template T
 */
class Node {
    /**
     * Создает узел списка
     * @param {T} data - Данные, хранящиеся в узле
     */
    constructor(data) {
        /** @type {T} Данные узла */
        this.data = data;
        /** @type {Node<T> | null} Указатель на следующий узел */
        this.next = null;
    }
}

// ====================== ИТЕРАТОР ======================

/**
 * Итератор для очереди на основе односвязного списка
 * @class QueueIterator
 * @template T
 * @implements {Iterator<T>}
 */
class QueueIterator {
    /**
     * Создает итератор
     * @param {Node<T> | null} head - Начальный узел для итерации
     */
    constructor(head) {
        /** @type {Node<T> | null} Текущий узел при переборе */
        this.current = head;
    }

    /**
     * Возвращает следующий элемент в итерации
     * @returns {IteratorResult<T>} Результат итерации
     */
    next() {
        if (this.current === null) {
            return { done: true, value: undefined };
        }
        const value = this.current.data;
        this.current = this.current.next;
        return { value, done: false };
    }

    /**
     * Возвращает сам итератор (для совместимости с for...of)
     * @returns {Iterator<T>}
     */
    [Symbol.iterator]() {
        return this;
    }
}

// ====================== ОЧЕРЕДЬ ======================

/**
 * Очередь на основе односвязного списка
 * @template T
 * @class LinkedListQueue
 */
class LinkedListQueue {
    /**
     * Создает пустую очередь
     */
    constructor() {
        /** @type {Node<T> | null} Указатель на первый элемент */
        this.head = null;
        /** @type {Node<T> | null} Указатель на последний элемент */
        this.tail = null;
        /** @type {number} Счетчик элементов */
        this.count = 0;
    }

    /**
     * ВСТАВКА В ОЧЕРЕДЬ (enqueue)
     * Алгоритм из лекции:
     * 1. Получаем новое значение
     * 2. Создаем новый элемент с полями значения и указателя
     * 3. Присваиваем значение
     * 4. У текущего последнего элемента указатель на следующий ставим на новый
     * 5. Обновляем указатель на последний элемент
     *
     * @param {T} data - Добавляемое значение
     * @returns {LinkedListQueue<T>} Текущая очередь (для цепочки вызовов)
     */
    enqueue(data) {
        const newNode = new Node(data);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.count++;
        return this;
    }

    /**
     * УДАЛЕНИЕ ИЗ ОЧЕРЕДИ (dequeue)
     * Алгоритм из лекции:
     * 1. Берем первый элемент
     * 2. Сохраняем значение
     * 3. Записываем указатель на следующий в указатель на первый
     * 4. Удаляем элемент
     * 5. Возвращаем сохраненное значение
     *
     * @returns {T | undefined} Удаленное значение или undefined если очередь пуста
     */
    dequeue() {
        if (this.isEmpty()) {
            return undefined;
        }

        const removedNode = this.head;
        const value = removedNode.data;

        this.head = this.head.next;
        this.count--;

        if (this.isEmpty()) {
            this.tail = null;
        }

        return value;
    }

    /**
     * Просмотр первого элемента без удаления
     * @returns {T | undefined} Значение первого элемента или undefined если очередь пуста
     */
    peek() {
        return this.isEmpty() ? undefined : this.head.data;
    }

    /**
     * Проверка очереди на пустоту
     * @returns {boolean} true если очередь пуста, иначе false
     */
    isEmpty() {
        return this.count === 0;
    }

    /**
     * Возвращает количество элементов в очереди
     * @returns {number} Количество элементов
     */
    size() {
        return this.count;
    }

    /**
     * Очищает очередь
     */
    clear() {
        this.head = null;
        this.tail = null;
        this.count = 0;
    }

    /**
     * Преобразует очередь в массив
     * @returns {Array<T>} Массив элементов очереди
     */
    toArray() {
        const result = [];
        let current = this.head;
        while (current !== null) {
            result.push(current.data);
            current = current.next;
        }
        return result;
    }

    /**
     * Возвращает итератор для обхода элементов
     * @returns {Iterator<T>} Итератор
     */
    [Symbol.iterator]() {
        return new QueueIterator(this.head);
    }

    /**
     * Выполняет указанную функцию для каждого элемента очереди
     * @param {function(T, number): void} callback - Функция для выполнения
     * @param {T} callback.item - Текущий элемент
     * @param {number} callback.index - Индекс элемента
     */
    forEach(callback) {
        let index = 0;
        for (const item of this) {
            callback(item, index++);
        }
    }

    /**
     * Инвертирование содержимого (только через enqueue/dequeue)
     * @returns {LinkedListQueue<T>} Текущая очередь
     */
    invert() {
        if (this.size() <= 1) return this;

        const temp = [];
        while (!this.isEmpty()) {
            temp.push(this.dequeue());
        }
        for (let i = temp.length - 1; i >= 0; i--) {
            this.enqueue(temp[i]);
        }
        return this;
    }
}

export default LinkedListQueue;