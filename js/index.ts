const canvas: HTMLCanvasElement = document.getElementById(
    "canvas",
)! as HTMLCanvasElement;
const obj_input = document.getElementById("obj")! as HTMLInputElement;

async function updateModelObject(e: Event) {
    const files = obj_input.files;
    if (!files) return;
    if (files.length < 1) return;
    if (!files.item(0)) return;

    const file = files.item(0)!;
    const text = await file.text();

    let parsed = await parseObj(text);
    vertecies = parsed.v;
    faces = parsed.f;
}
async function parseObj(text: string) {
    const vertices: Point3D[] = [];
    const faces: number[][] = [];
    text.split("\n").forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === "v") {
            vertices.push({
                x: parseFloat(parts[1]!),
                y: parseFloat(parts[2]!),
                z: parseFloat(parts[3]!),
            });
        } else if (parts[0] === "f") {
            const face: number[] = [];
            for (let i = 1; i < parts.length; i++) {
                face.push(parseInt(parts[i]!.split("/")[0]!) - 1);
            }
            faces.push(face);
        }
    });
    return { v: vertices, f: faces };
}
obj_input.addEventListener("change", updateModelObject);

function scroll_handle(e: WheelEvent) {
    const zoom_factor = 0.8;
    if (e.deltaY > 0) {
        camera_pos = translate3d(camera_pos, { z: zoom_factor });
    } else if (e.deltaY < 0) {
        camera_pos = translate3d(camera_pos, { z: -zoom_factor });
    }
}
function keyboard_handle(e: KeyboardEvent) {
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

var camera_pos: Point3D = { x: 0, y: 0, z: 2 };

const ctx = canvas.getContext("2d", {
    alpha: false,
}) as CanvasRenderingContext2D;

const [w, h] = [canvas.width, canvas.height];

function clear() {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, w, h);
}

interface Point {
    x: number;
    y: number;
}
interface Point3D {
    x: number;
    y: number;
    z: number;
}

function draw_point({ x, y }: Point) {
    const size = 10;
    ctx.fillStyle = "black";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

function draw_line({ x, y }: Point, { x: x1, y: y1 }: Point) {
    const size = 2;

    ctx.strokeStyle = "black";
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

function to_screen({ x, y, z }: Point3D): Point {
    return {
        x: x / z,
        y: y / z,
    };
}

function vect_to_screen({ x, y }: Point): Point {
    // -1..1 -> 0..2 -> 0..1 -> 0..w ou y
    return {
        x: ((x + 1) / 2) * w,
        y: (1 - (y + 1) / 2) * h, // canvas desenha y de baixo pra cima
    };
}

function rotate_z({ x, y, z }: Point3D, angle: number): Point3D {
    // https://en.wikipedia.org/wiki/Rotation_matrix
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - z * sin,
        y,
        z: x * sin + z * cos,
    };
}

function translate3d(
    { x, y, z }: Point3D,
    { x: dx = 0, y: dy = 0, z: dz = 0 },
): Point3D {
    return {
        x: x + dx,
        y: y + dy,
        z: z + dz,
    };
}
function translate({ x, y }: Point, { x: dx = 0, y: dy = 0 }: Point): Point {
    return {
        x: x + dx,
        y: y + dy,
    };
}

let dt = 0;

var vertecies: Point3D[] = [
    { x: 0.5, y: 0.5, z: -0.5 }, // 0
    { x: -0.5, y: 0.5, z: -0.5 }, // 1
    { x: -0.5, y: 0.5, z: 0.5 }, // 2
    { x: 0.5, y: 0.5, z: 0.5 }, // 3

    { x: 0.5, y: -0.5, z: -0.5 }, // 4
    { x: 0.5, y: -0.5, z: 0.5 }, // 5
    { x: -0.5, y: -0.5, z: 0.5 }, // 6
    { x: -0.5, y: -0.5, z: -0.5 }, // 7
];

var faces = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [0, 4],
    [5, 3],
    [2, 6],
    [1, 7],
];

function render_vertecies() {
    const fps = 180;
    dt = 1 / fps;

    let ds = 0;
    setInterval(() => {
        clear();
        ds += 1 * dt;
        for (let i = 0; i < vertecies.length; i++) {
            if (!vertecies[i]) {
                continue;
            }
            let point_0 = translate3d(rotate_z(vertecies[i]!, ds), {
                x: 0,
                y: 0,
                z: 2,
            });
            draw_point(vect_to_screen(to_screen(point_0)));
        }
    }, 1000 / fps);
}

function render_lines() {
    const fps = 240;
    dt = 1 / fps;

    let ds = 0;
    setInterval(() => {
        clear();
        ds += 2 * dt;
        for (const face of faces) {
            // 0 1 2 3
            // ^-^-^-^ -> 0
            for (let i = 0; i < face.length; i++) {
                const vertice = face[i]!;
                const next_vertice = face[(i + 1) % face.length]!;

                let point_0 = translate3d(
                    rotate_z(vertecies[vertice]!, ds),
                    camera_pos,
                );
                let point_1 = translate3d(
                    rotate_z(vertecies[next_vertice]!, ds),
                    camera_pos,
                );
                draw_line(
                    vect_to_screen(to_screen(point_0)),
                    vect_to_screen(to_screen(point_1)),
                );
            }
        }
        // draw_point(vect_to_screen(to_screen(point_0)));
    }, 1000 / fps);
}

// !!! ONE RENDER AT A TIME, RACE CONDITION ADVISED.
// render_vertecies();
render_lines();
