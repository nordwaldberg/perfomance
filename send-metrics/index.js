
const requestID = String(Math.random()).substr(2, 8);

document.querySelector('.main-text').innerHTML = `> Hello! Your request id: ${requestID}. Press to button _`

let counter = new Counter();

counter.init('677eaf86-5abb-4721-be38-ca28f8d244ef', requestID, '.send-metrics');
counter.setAdditionalParams({
    env: 'production',
    browser: navigator.userAgentData.brands[0].brand + ' ' + navigator.userAgentData.brands[0].version,
    operationSystem: navigator.userAgentData.platform,
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