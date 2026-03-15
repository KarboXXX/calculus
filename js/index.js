"use strict";
const canvas = document.getElementById("canvas");
const obj_input = document.getElementById("obj");
async function updateModelObject(e) {
    const files = obj_input.files;
    if (!files)
        return;
    if (files.length < 1)
        return;
    if (!files.item(0))
        return;
    const file = files.item(0);
    const text = await file.text();
    let parsed = await parseObj(text);
    verticies = parsed.v;
    faces = parsed.f;
    console.log([faces, verticies]);
}
async function parseObj(text) {
    const vertices = [];
    const faces = [];
    text.split("\n").forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === "v") {
            vertices.push({
                x: parseFloat(parts[1]),
                y: parseFloat(parts[2]),
                z: parseFloat(parts[3]),
            });
        }
        else if (parts[0] === "f") {
            const face = [];
            for (let i = 1; i < parts.length; i++) {
                face.push(parseInt(parts[i].split("/")[0]) - 1);
            }
            faces.push(face);
        }
    });
    return { v: vertices, f: faces };
}
obj_input.addEventListener("change", updateModelObject);
function scroll_handle(e) {
    const zoom_factor = 0.8;
    if (e.deltaY > 0) {
        camera_pos = translate3d(camera_pos, { z: zoom_factor });
    }
    else if (e.deltaY < 0) {
        camera_pos = translate3d(camera_pos, { z: -zoom_factor });
    }
}
function keyboard_handle(e) {
    const move_factor = 0.4;
    if (e.type == "keydown") {
        if (e.code == "KeyW")
            camera_pos = translate3d(camera_pos, { y: -move_factor });
        if (e.code == "KeyS")
            camera_pos = translate3d(camera_pos, { y: move_factor });
        if (e.code == "KeyD")
            camera_pos = translate3d(camera_pos, { x: -move_factor });
        if (e.code == "KeyA")
            camera_pos = translate3d(camera_pos, { x: move_factor });
    }
    if (e.type == "keyup") {
    }
}
document.addEventListener("wheel", scroll_handle);
document.addEventListener("keydown", keyboard_handle);
document.addEventListener("keyup", keyboard_handle);
canvas.width = 900;
canvas.height = 900;
var camera_pos = { x: 0, y: 0, z: 2 };
const ctx = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: false,
    desynchronized: false,
});
const [w, h] = [canvas.width, canvas.height];
fetch("default_cube.obj").then(async (r) => {
    const txt = await r.text();
    const { v, f } = await parseObj(txt);
    ((verticies = v), (faces = f));
});
function clear() {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, w, h);
}
function draw_point({ x, y }) {
    const size = 10;
    ctx.fillStyle = "black";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
}
// function draw_line({ x, y }: Point, { x: x1, y: y1 }: Point) {
//     const size = 1;
//     ctx.fillStyle = "black";
//     ctx.lineWidth = size;
//     ctx.beginPath();
//     ctx.moveTo(x, y);
//     ctx.lineTo(x1, y1);
//     ctx.stroke();
// }
let dt = 0;
var verticies = [];
var faces = [];
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
function prod_vetorial({ x: ax, y: ay, z: az }, { x: bx, y: by, z: bz }) {
    if (az && bz)
        return {
            x: ay * bz - az * by,
            y: az * bx - ax * bz,
            z: ax * by - ay * bx,
        };
    else
        return {
            x: ax * by - ay * bx,
            y: ay * bx - ax * by,
        };
}
function prod_scalar({ x: ax, y: ay, z: az }, { x: bx, y: by, z: bz }) {
    if (az && bz)
        return ax * bx + ay * by + az * bz;
    else
        return ax * bx + ay * by;
}
let ds = 0;
function* render_lines() {
    clear();
    for (const face of faces) {
        if (face.length < 3)
            continue;
        yield () => {
            ctx.beginPath();
            const first_v = verticies[face[0]];
            let p0 = translate3d(rotate_z(first_v, ds), camera_pos);
            let sp0 = vect_to_screen(to_screen(p0));
            ctx.moveTo(sp0.x, sp0.y);
            for (let i = 0; i < face.length; i++) {
                const vert = verticies[face[i]];
                const p = translate3d(rotate_z(vert, ds), camera_pos);
                const sp = vect_to_screen(to_screen(p));
                ctx.lineTo(sp.x, sp.y);
            }
            ctx.closePath();
            ctx.fillStyle = `rgba(0, 0, 0, 0.9)`;
            ctx.fill();
        };
    }
}
let last_timestamp = 0;
let delta_time = 0;
let now = 0;
let rotation_speed = 1.0;
let fps = 0;
function draw_fps(fps) {
    ctx.font = "16px monospace";
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 30);
    ctx.shadowBlur = 0;
}
function render() {
    if (last_timestamp > 0)
        delta_time = (now - last_timestamp) / 1000;
    else
        delta_time = 1 / 60;
    last_timestamp = now;
    ds += 0.8 * delta_time;
    ds %= 2 * Math.PI;
    for (const draw of render_lines()) {
        draw();
    }
    fps = 1 / delta_time;
    draw_fps(fps);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
//# sourceMappingURL=index.js.map