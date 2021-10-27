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
};

function getDifferentItemsList(data, diff) {
    const list = [];

    data.forEach(item => {
        if(!list.includes(item.additional[diff])) {
            list.push(item.additional[diff]);
        }
    });

    return list;
};

function sessionActionInfo(id, page, time, OS, browser) {
    const action = {};

    action.sessionId = id;
    action.page = page;
    action.OS = OS;
    action.browser = browser;
    action.time = time;

    return action;
};

function showMetricByPeriod(data, dates, page, name) {
    console.log(`Values of '${name}' from ${dates[0]} to ${dates[dates.length - 1]}:`);

    let table = {};

    dates.forEach((date) => {
        table[date] = addMetricByDate(data, page, name, date);
    });

    console.table(table);
};

function showSession(data, page, date, sessionId) {
    console.log(`User ${sessionId} session from ${date}`);

    const session = data.filter(item => item.requestId === sessionId);

    const sessionTable = {};

    session.forEach(item => {
        const timestampArr = item.timestamp.split('T');
        const time = timestampArr[timestampArr.length - 1];
            sessionTable[item.name] =
                sessionActionInfo(sessionId, item.page, time, item.additional.operationSystem, item.additional.browser);
    });

    console.table(sessionTable);
};

function compareMetric(data, name, page, slice, date) {
    console.log(`'${name}' in different ${slice}s for ${date}`);

    const table = {};
    const browsers = getDifferentItemsList(data, slice);

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

function calcMetricsByDate(data, page, date) {
    console.log(`All metrics for ${date}:`);

    let table = {};
    table.connect = addMetricByDate(data, page, 'connect', date);
    table.ttfb = addMetricByDate(data, page, 'ttfb', date);
    table.fid = addMetricByDate(data, page, 'fid', date);
    table.upload = addMetricByDate(data, page, 'upload', date);

    console.table(table);
};

function metricDifferenceByDates(data, dateFrom, dateTo, page, name) {
    console.log(`Difference of ${name} from ${dateFrom} to ${dateTo}`);

    const metricValueByDateFrom = addMetricByDate(data, page, name, dateFrom);
    const metricValueByDateTo = addMetricByDate(data, page, name, dateTo);

    const difference = {};

    for (let field in metricValueByDateTo) {
        difference[field] = metricValueByDateTo[field] - metricValueByDateFrom[field];
    };

    difference.page = page;

    console.table(difference);
};


fetch('https://shri.yandex/hw/stat/data?counterId=ddcb5da9-8111-4653-9d8b-4a6ad6807f7b')
    .then(res => res.json())
    .then(result => {
        let data = prepareData(result);
        calcMetricsByDate(data, '.send-metrics', '2021-10-27');
        console.log(' ');
        showMetricByPeriod(data, ['2021-10-26', '2021-10-27'], '.send-metrics', 'connect');
        console.log(' ');
        metricDifferenceByDates(data, '2021-10-26', '2021-10-27', '.send-metrics', 'connect');
        console.log(' ');
        showSession(data, '.send-metrics', '2021-10-27', '85510856');
        console.log(' ');
        compareMetric(data, 'connect', '.send-metrics', 'browser', '2021-10-27');
        compareMetric(data, 'ttfb', '.send-metrics', 'browser', '2021-10-27');
        compareMetric(data, 'fid', '.send-metrics', 'browser', '2021-10-27');
        compareMetric(data, 'upload', '.send-metrics', 'browser', '2021-10-27');
    });