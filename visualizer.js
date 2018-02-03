let useFirst = 1024         // How many frequencies to use (idk why but after ~200 every is 0)
let startAt = 0             // On what frequency to start 

let sumSize = 20            // How many frequencies to average at once

let barWmultiplayer = 1     // Bar width multiplayer

let HSLstep = .1             //Math.floor(Math.random()*360)
let HSLstart = 200
let HSLgrow = 5
let maxGlow = 50

/* Audio */
const stream = new Audio("http://188.116.8.133/cloudsdale")
stream.crossOrigin = "anonymous";
stream.controls = true;
stream.loop = false;
stream.autoplay = false;
stream.volume = .2
stream.play()
const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 32768; //2048;
analyser.smoothingTimeConstant = .7

let dataArray = new Uint8Array(analyser.frequencyBinCount);

const source = audioCtx.createMediaElementSource(stream);
source.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.getByteFrequencyData(dataArray);

dataArray = dataArray.map(() => 255)

/* canvas */

window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("render");
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext("2d");
    window.ctx = ctx

    const { width, height } = canvas

    ctx.fillStyle = "rgb(50,50,50)"
    ctx.fillRect(0,0,width, height)
    ctx.fillStyle = "#FFF"
    ctx.font = "72px Arial"
    ctx.fillText("Please wait...",width/2-252,height/2+36)

    let frame = 0

    function draw(milis) {
        requestAnimationFrame(draw)
        analyser.getByteFrequencyData(dataArray);
        frame++

        HSLstart += HSLgrow

        const sumOfAll = getSum(dataArray, 0, 200)
        const w = sumOfAll / 200
        
        ctx.fillStyle = `#000`
        ctx.fillRect(0,0,width, height)

        for (let i = startAt; i < useFirst; i += sumSize) {
            const sum = getSum(dataArray, i, sumSize)

            let barH = (sum / sumSize)/255 * height
            if(barH < 0) barH = 0

            const color = `hsl(${(((HSLstart+i)/200*360)*HSLstep) % 360}, 100%, 50%)`
            ctx.strokeStyle = color
            ctx.shadowColor = color
            ctx.shadowBlur =  w/200 * maxGlow

            const barW = (width) / (useFirst - startAt)*sumSize

            ctx.lineWidth = barW * barWmultiplayer

            let start = (barW)
            let x = (((i-startAt)/sumSize) * barW) + barW/2

            ctx.beginPath();
            ctx.moveTo(x, height);
            ctx.lineTo(x, height - barH);
            ctx.stroke();
        }
    }

    window.draw = draw
})

window.addEventListener("load", () => {
    window.draw()
})

function getSum(arr, start, amount) {
    return arr.slice(start, start+amount).reduce((a,b)=>a+b)
}