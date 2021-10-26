function getUserBrowser(userAgent) {
    const Edge = userAgent.match(new RegExp(/Edg\/../));
    const Chrome = userAgent.match(new RegExp(/Chrome\/../));
    const Firefox = userAgent.match(new RegExp(/Firefox\/../));
    const Safari = userAgent.match(new RegExp(/Safari\/../));

    if (Edge) {
        return 'Microsoft Edge' + ' ' + Edge[0].split('/')[1];
    } else if (Chrome) {
        return 'Google Chrome' + ' ' + Chrome[0].split('/')[1];
    } else if (Firefox) {
        return 'Mozilla Firefox' + ' ' + Firefox[0].split('/')[1];
    } else if (Safari) {
        return 'Safari' + ' ' + Safari[0].split('/')[1];
    }
};

const requestID = String(Math.random()).substr(2, 8);
const userBrowser = getUserBrowser(navigator.userAgent);

document.querySelector('.main-text').innerHTML = `> Hello! Your request id: ${requestID}. Press to button _`

let counter = new Counter();

counter.init('ddcb5da9-8111-4653-9d8b-4a6ad6807f7b', requestID, '.send-metrics');
counter.setAdditionalParams({
    env: 'production',
    browser: userBrowser,
    operationSystem: navigator.platform,
});

counter.send('connect', performance.timing.connectEnd - performance.timing.connectStart);
counter.send('ttfb', performance.timing.responseEnd - performance.timing.requestStart);

let uploadData = function () {
    let html = `> Uploaded! Your request id: ${requestID}. Thanks _`;
    let genStart = Date.now();

    counter.send('generate', Date.now() - genStart);

    let drawStart = Date.now();

    document.querySelector('.main-text').innerHTML = html;

    requestAnimationFrame(function () {
        counter.send('draw', Date.now() - drawStart);
    });
};

document.querySelector('.upload-btn').onclick = function () {
    let timeStart = Date.now();

    setTimeout(function () {
        counter.send('upload', Date.now() - timeStart);

        uploadData();
    }, Math.random() * 1000);
}