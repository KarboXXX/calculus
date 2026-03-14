const canvas: HTMLCanvasElement = document.getElementById(
    "canvas",
) as HTMLCanvasElement;

canvas.width = 900;
canvas.height = 900;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// console.log(canvas, ctx);
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
    { x: dx = 0, y: dy = 0, z: dz = 0 }: Point3D,
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

const vertecies: Point3D[] = [
    { x: 0.5, y: 0.5, z: -0.5 }, // 0
    { x: -0.5, y: 0.5, z: -0.5 }, // 1
    { x: -0.5, y: 0.5, z: 0.5 }, // 2
    { x: 0.5, y: 0.5, z: 0.5 }, // 3

    { x: 0.5, y: -0.5, z: -0.5 }, // 4
    { x: 0.5, y: -0.5, z: 0.5 }, // 5
    { x: -0.5, y: -0.5, z: 0.5 }, // 6
    { x: -0.5, y: -0.5, z: -0.5 }, // 7
];

const faces = [
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
        ds += 0.8 * dt;
        for (const face of faces) {
            // 0 1 2 3
            // ^-^-^-^ -> 0
            for (let i = 0; i < face.length; i++) {
                const vertice = face[i]!;
                const next_vertice = face[(i + 1) % face.length]!;

                let point_0 = translate3d(rotate_z(vertecies[vertice]!, ds), {
                    x: 0,
                    y: 0,
                    z: 2,
                });
                let point_1 = translate3d(
                    rotate_z(vertecies[next_vertice]!, ds),
                    {
                        x: 0,
                        y: 0,
                        z: 2,
                    },
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
