"use strict";
const canvas = document.getElementById("canvas");
canvas.width = 900;
canvas.height = 900;
const ctx = canvas.getContext("2d");
// console.log(canvas, ctx);
const [w, h] = [canvas.width, canvas.height];
console.debug(w, h);
function clear() {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, w, h);
}
function draw_point({ x, y }) {
    const size = 10;
    ctx.fillStyle = "black";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
}
function to_screen({ x, y, z }) {
    return {
        x: x / z,
        y: y / z,
    };
}
function vect_to_screen({ x, y }) {
    // -1..1 -> 0..2 -> 0..1 -> 0..w ou y
    return {
        x: ((x + 1) / 2) * w,
        y: (1 - (y + 1) / 2) * h, // canvas desenha y de baixo pra cima
    };
}
function rotate_z({ x, y, z }, angle) {
    // https://en.wikipedia.org/wiki/Rotation_matrix
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - z * sin,
        y,
        z: x * sin + z * cos,
    };
}
function translate3d({ x, y, z }, { x: dx = 0, y: dy = 0, z: dz = 0 }) {
    return {
        x: x + dx,
        y: y + dy,
        z: z + dz,
    };
}
function translate({ x, y }, { x: dx = 0, y: dy = 0 }) {
    return {
        x: x + dx,
        y: y + dy,
    };
}
let dt = 0;
function render_vertecies() {
    const fps = 240;
    dt = 1 / fps;
    let vertecies = [
        { x: 0.5, y: 0.5, z: -0.5 },
        { x: 0.5, y: -0.5, z: -0.5 },
        { x: -0.5, y: 0.5, z: -0.5 },
        { x: -0.5, y: -0.5, z: -0.5 },
        { x: 0.5, y: 0.5, z: 0.5 },
        { x: 0.5, y: -0.5, z: 0.5 },
        { x: -0.5, y: 0.5, z: 0.5 },
        { x: -0.5, y: -0.5, z: 0.5 },
    ];
    let ds = 0;
    setInterval(() => {
        clear();
        ds += 1 * dt;
        for (let i = 0; i < vertecies.length; i++) {
            if (!vertecies[i]) {
                continue;
            }
            // vertecies[i] = translate3d(vertecies[i]!, {
            //     x: 0,
            //     y: 0,
            //     z: 10 * dt,
            // });
            // vertecies[i] = rotate_z(vertecies[i]!, 1 * dt);
            draw_point(vect_to_screen(to_screen(translate3d(rotate_z(vertecies[i], ds), {
                x: 0,
                y: 0,
                z: 500 * dt,
            }))));
        }
    }, 1000 / fps);
}
render_vertecies();
//# sourceMappingURL=index.js.map