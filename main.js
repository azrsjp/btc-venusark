(function () {

    var vaImage = new Image();
    var vaPath = "va.png";
    vaImage.src = vaPath;

    var currentRate = 0;
    var vaVisible = false;
    var btcMax = 1450000;
    var btcMin = 1430000;

    var socket = new WebSocket("wss://ws-api.coincheck.com/")
    socket.onopen = function () {
        socket.send(JSON.stringify({ type: "subscribe", channel: "btc_jpy-trades" }));
    };
    socket.onmessage = function (msg) {
        vaVisible = true;

        var response = JSON.parse(msg.data);
        currentRate = response[2];
    }

    var unit = 20,
        canvas, context, canvas2, context2,
        height, width, xAxis, yAxis,
        draw;

    function init() {
        canvas = document.getElementById("sineCanvas");

        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;

        context = canvas.getContext("2d");

        height = canvas.height;
        width = canvas.width;

        xAxis = Math.floor(height / 2);
        yAxis = 0;

        draw();
    }

    function draw() {
        context.clearRect(0, 0, width, height);

        drawVA();
        drawWave('#10c2cd', 1, 6, 0);

        draw.seconds = draw.seconds + .009;
        draw.t = draw.seconds * Math.PI;
        setTimeout(draw, 35);
    };
    draw.seconds = 0;
    draw.t = 0;

    function drawVA() {
        if (!vaVisible) {
            return;
        }
        
        var percentage = (parseInt(currentRate) - btcMin) / (btcMax - btcMin);
        var sinkingRate = 1 - Math.max(Math.min(percentage, 1), 0);
        console.log("Sinking rate: ", sinkingRate.toFixed(5));
        console.log("yen/btc: ", currentRate);

        var scale = (vaImage.width / document.documentElement.clientWidth) > 0.8 ? document.documentElement.clientWidth * 0.8 / vaImage.width : 1;
        var sink = sinkingRate * vaImage.height * scale * 0.75;
        var x = (document.documentElement.clientWidth - vaImage.width * scale) * 0.5;
        var y = (document.documentElement.clientHeight) * 0.5 - vaImage.height * scale * 0.85 + sink;
        context.drawImage(vaImage, x, y, vaImage.width * scale, vaImage.height * scale);
    }

    function drawWave(color, alpha, zoom, delay) {
        context.fillStyle = color;
        context.globalAlpha = alpha;

        context.beginPath();
        drawSine(draw.t / 0.5, zoom, delay);
        context.lineTo(width + 10, height);
        context.lineTo(0, height);
        context.closePath();
        context.fill();
    }

    function drawSine(t, zoom, delay) {
        var x = t;
        var y = Math.sin(x) / zoom;
        context.moveTo(yAxis, unit * y + xAxis);

        for (i = yAxis; i <= width + 10; i += 10) {
            x = t + (-yAxis + i) / unit / zoom;
            y = Math.sin(x - delay) / 3;
            context.lineTo(i, unit * y + xAxis);
        }
    }

    init();

})();