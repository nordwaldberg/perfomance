function quantile(arr, q) {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
        return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
    } else {
        return Math.floor(sorted[base]);
    }
};

function prepareData(result) {
    return result.data.map(item => {
        item.date = item.timestamp.split('T')[0];

        return item;
    });
}

// TODO: реализовать
// показать значение метрики за несколько дней
function showMetricByPeriod(data, dates, page, name) {
    console.log(`Values of '${name}' from ${dates[0]} to ${dates[dates.length - 1]}:`);

    let table = {};

    dates.forEach((date) => {
        table[date] = addMetricByDate(data, page, name, date);
    });

    console.table(table);
};

// показать сессию пользователя
function showSession(data, page, date, sessionId) {
    console.log(`User ${sessionId} session from ${date}`);

    const session = data.filter(item => item.requestId === sessionId);

    const sessionTable = {};

    session.forEach(item => {
        const timestampArr = item.timestamp.split('T');
        const time = timestampArr[timestampArr.length - 1];
            sessionTable[item.name] = sessionActionInfo(sessionId, item.page, time);
    });

    console.table(sessionTable);
};

function sessionActionInfo(id, page, time) {
    const action = {};

    action.sessionId = id;
    action.page = page;
    action.time = time;

    return action;
}

// сравнить метрику в разных срезах
function compareMetric(data, name, page, slice, date) {
    console.log(`'${name}' in different ${slice} for ${date}`);

    const table = {};
    const browsers = getDifferentItemsList(data);

    browsers.forEach(browser => {
        table[browser] = addMetricByBrowser(data, name, browser, date, page);;
    });


    console.table(table);
};

function addMetricByBrowser(data, name, browser, date, page) {
    let sampleData = data
        .filter(item => item.page == page && item.name == name && item.date == date && item.additional.browser === browser)
        .map(item => item.value);

    let result = {};
    result.page = page;
    result.hits = sampleData.length;
    result.p25 = quantile(sampleData, 0.25);
    result.p50 = quantile(sampleData, 0.5);
    result.p75 = quantile(sampleData, 0.75);
    result.p95 = quantile(sampleData, 0.95);

    return result;
};

function getDifferentItemsList(data) {
    const list = [];

    data.forEach(item => {
        if(!list.includes(item.additional.browser)) {
            list.push(item.additional.browser);
        }
    });

    return list;
};

// любые другие сценарии, которые считаете полезными


// Пример
// добавить метрику за выбранный день
function addMetricByDate(data, page, name, date) {
    let sampleData = data
        .filter(item => item.page == page && item.name == name && item.date == date)
        .map(item => item.value);

    let result = {};
    result.page = page;
    result.hits = sampleData.length;
    result.p25 = quantile(sampleData, 0.25);
    result.p50 = quantile(sampleData, 0.5);
    result.p75 = quantile(sampleData, 0.75);
    result.p95 = quantile(sampleData, 0.95);

    return result;
};

// рассчитывает все метрики за день
function calcMetricsByDate(data, page, date) {
    console.log(`All metrics for ${date}:`);

    let table = {};
    table.connect = addMetricByDate(data, page, 'connect', date);
    table.ttfb = addMetricByDate(data, page, 'ttfb', date);
    table.upload = addMetricByDate(data, page, 'upload', date);
    table.generate = addMetricByDate(data, page, 'generate', date);
    table.draw = addMetricByDate(data, page, 'draw', date);

    console.table(table);
};

fetch('https://shri.yandex/hw/stat/data?counterId=ddcb5da9-8111-4653-9d8b-4a6ad6807f7b')
    .then(res => res.json())
    .then(result => {
        let data = prepareData(result);
        calcMetricsByDate(data, '.send-metrics', '2021-10-27');
        console.log(' ');
        showMetricByPeriod(data, ['2021-10-26', '2021-10-27'], '.send-metrics', 'connect');
        console.log(' ');
        showSession(data, '.send-metrics', '2021-10-27', '85510856');
        console.log(' ');
        compareMetric(data, 'connect', '.send-metrics', 'browsers', '2021-10-27');
        compareMetric(data, 'ttfb', '.send-metrics', 'browsers', '2021-10-27');
        compareMetric(data, 'upload', '.send-metrics', 'browsers', '2021-10-27');
        compareMetric(data, 'generate', '.send-metrics', 'browsers', '2021-10-27');
        compareMetric(data, 'draw', '.send-metrics', 'browsers', '2021-10-27');

        // добавить свои сценарии, реализовать функции выше
    });