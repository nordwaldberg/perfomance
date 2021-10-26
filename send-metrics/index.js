let counter = new Counter();

counter.init('3d0ce866-84ac-4962-90b6-bdf203535f50', String(Math.random()).substr(2, 12), '.send-metrics');
counter.setAdditionalParams({
    env: 'production',
    platform: 'touch'
});

counter.send('connect', performance.timing.connectEnd - performance.timing.connectStart);
counter.send('ttfb', performance.timing.responseEnd - performance.timing.requestStart);

let timeStart = Date.now();

setTimeout(function () {
    counter.send('square', Date.now() - timeStart);
}, Math.random() * 1000 + 500);


let drawData = function () {
    let html = '> Uploaded! Thanks _';
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
        counter.send('load', Date.now() - timeStart);

        drawData();
    }, Math.random() * 1000);
}