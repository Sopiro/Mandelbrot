'use strict'

const WIDTH = 800;
const HEIGHT = 600;

let cvs;
let ctx;
let pre;

let maxIteration = 20;
let size = 4.0;
let centerX = -1;
let centerY = 0;

function drawMandelbrot()
{
    const pixels = new ImageData(WIDTH, HEIGHT);

    const halfSize = size / 2.0;

    for (let y = 0; y < HEIGHT; y++)
    {
        const my = map(y, 0, HEIGHT, centerY - halfSize, centerY + halfSize);
        for (let x = 0; x < WIDTH; x++)
        {
            const mx = map(x, 0, HEIGHT, centerX - halfSize, centerX + halfSize);

            let zx = 0;
            let zy = 0;

            let i = 0;

            while (i < maxIteration)
            {
                let zzx = zx * zx - zy * zy + mx;
                let zzy = 2 * zx * zy + my;

                zx = zzx;
                zy = zzy;

                if (zx * zx + zy * zy > 4) // Explode
                    break;

                i++;
            }

            let color = interpolateColor(0x00ffff, 0xff00ff, map(i, 0, maxIteration, 0.0, 1.0));

            if (i >= maxIteration) color = 0;

            const ptr = (x + y * WIDTH) * 4;
            pixels.data[ptr] = (color >> 16) & 0xff; // R
            pixels.data[ptr + 1] = (color >> 8) & 0xff; // G
            pixels.data[ptr + 2] = (color) & 0xff; // B
            pixels.data[ptr + 3] = 0xff; // A
        }
    }

    ctx.putImageData(pixels, 0, 0);
}

function map(v, a, b, min, max)
{
    const per = v / (b - a);
    return lerp(min, max, per);
}

function lerp(a, b, per)
{
    return a + (b - a) * per;
}

function interpolateColor(c1, c2, per)
{
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = (c1) & 0xff;
    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = (c2) & 0xff;

    return lerp(r1, r2, per) << 16 | lerp(g1, g2, per) << 8 | lerp(b1, b2, per);
}

function onMouseDown(e)
{
    const rect = cvs.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = (x / WIDTH * 2 - 1) * WIDTH / HEIGHT;
    const py = y / HEIGHT * 2 - 1;

    centerX += px * size / 2.0;
    centerY += py * size / 2.0;

    size *= e.button == 0 ? 0.8 : 1.2;

    drawMandelbrot();
}

window.onload = () =>
{
    cvs = document.getElementById("cvs");
    cvs.setAttribute("width", WIDTH);
    cvs.setAttribute("height", HEIGHT);

    ctx = cvs.getContext("2d");

    cvs.addEventListener("mousedown", onMouseDown);

    pre = document.getElementById("precision");

    maxIteration = map(pre.value, 0, 100, 10, 300);
    pre.addEventListener("change", () =>
    {
        maxIteration = map(pre.value, 0, 100, 10, 250);
        drawMandelbrot();
    })

    drawMandelbrot();
}