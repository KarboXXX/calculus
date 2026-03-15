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
    verticies = parsed.v;
    faces = parsed.f;
    console.log([faces, verticies]);
}
async function parseObj(text: string) {
    const vertices: Point3D[] = [];
    const faces: number[][] = [];
    text.split("\n").forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === "v") {
            const vert = new Point3D(
                parseFloat(parts[1]!),
                parseFloat(parts[2]!),
                parseFloat(parts[3]!),
            );

            vertices.push(vert);
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
        camera_pos = camera_pos.translate3d({ z: zoom_factor });
    } else if (e.deltaY < 0) {
        camera_pos = camera_pos.translate3d({ z: -zoom_factor });
    }
}
function keyboard_handle(e: KeyboardEvent) {
    const move_factor = 0.4;
    if (e.type == "keydown") {
        if (e.code == "KeyW")
            camera_pos = camera_pos.translate3d({ y: -move_factor });
        if (e.code == "KeyS")
            camera_pos = camera_pos.translate3d({ y: move_factor });
        if (e.code == "KeyD")
            camera_pos = camera_pos.translate3d({ x: -move_factor });
        if (e.code == "KeyA")
            camera_pos = camera_pos.translate3d({ x: move_factor });
    }
    if (e.type == "keyup") {
    }
}

document.addEventListener("wheel", scroll_handle);
document.addEventListener("keydown", keyboard_handle);
document.addEventListener("keyup", keyboard_handle);

canvas.width = 900;
canvas.height = 900;

interface IPoint {
    x: number;
    y: number;
}
interface IPoint3D {
    x: number;
    y: number;
    z: number;
}

class Point {
    public x: number = 0;
    public y: number = 0;

    constructor(vector: IPoint3D);
    constructor(x: number, y: number);
    constructor(arg0: number | IPoint3D, y?: number) {
        if (typeof arg0 === "object") {
            this.x = arg0.x;
            this.y = arg0.y;
        } else if (typeof arg0 === "number") {
            this.x = arg0;
            this.y = y ? y : 0;
        }
    }

    add(v: Point): Point {
        return new Point(this.x + v.x, this.y + v.y);
    }

    translate({ x: dx = 0, y: dy = 0 }: IPoint) {
        this.x = this.x + dx;
        this.y = this.y + dy;
        return this;
    }
}

class Point3D {
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    constructor(vector: IPoint3D);
    constructor(x: number, y: number, z: number);
    constructor(arg0: number | IPoint3D, y?: number, z?: number) {
        if (typeof arg0 === "object") {
            this.x = arg0.x;
            this.y = arg0.y;
            this.z = arg0.z;
        } else if (typeof arg0 === "number") {
            this.x = arg0;
            this.y = y ? y : 0;
            this.z = z ? z : 0;
        }
    }

    add(v: Point3D): Point3D {
        return new Point3D(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v: Point3D): Point3D {
        return new Point3D(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    rotate_z(angle: number) {
        // https://en.wikipedia.org/wiki/Rotation_matrix
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const x = this.x * cos - this.z * sin;
        const z = this.x * sin + this.z * cos;

        this.x = x;
        this.z = z;
        return this;
    }

    translate3d({ x: dx = 0, y: dy = 0, z: dz = 0 }) {
        this.x = this.x + dx;
        this.y = this.y + dy;
        this.z = this.z + dz;
        return this;
    }

    prod_vetorial({
        x: bx,
        y: by,
        z: bz,
    }: {
        x: number;
        y: number;
        z: number;
    }) {
        return {
            x: this.y * bz - this.z * by,
            y: this.z * bx - this.x * bz,
            z: this.x * by - this.y * bx,
        };
    }
    prod_scalar({ x: bx, y: by, z: bz }: { x: number; y: number; z: number }) {
        return this.x * bx + this.y * by + this.z * bz;
    }

    magnitude(): number {
        return Math.sqrt((this.x ^ 2) + (this.y ^ 2) + (this.z ^ 2));
    }

    normalized(): IPoint3D {
        const magn = this.magnitude();
        return {
            x: this.x / magn,
            y: this.y / magn,
            z: this.z / magn,
        };
    }
}

var camera_pos = new Point3D(0, 0, 2);

const ctx = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: false,
    desynchronized: false,
}) as CanvasRenderingContext2D;

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

function draw_point({ x, y }: Point) {
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

var verticies: Point3D[] = [];
var faces: number[][] = [];

function to_screen({ x, y, z }: IPoint3D): IPoint {
    return {
        x: x / z,
        y: y / z,
    };
}

function vect_to_screen({ x, y }: IPoint): IPoint {
    // -1..1 -> 0..2 -> 0..1 -> 0..w ou y
    return {
        x: ((x + 1) / 2) * w,
        y: (1 - (y + 1) / 2) * h, // canvas desenha y de baixo pra cima
    };
}

let ds = 5;
function* render_lines() {
    clear();
    for (const face of faces) {
        if (face.length < 3) continue;

        // calcular vetores normais e fazer back-face culling
        // const [vi0, vi1, vi2] = face.slice(0, 3)!;
        // const [v0, v1, v2] = [
        //     new Point3D(verticies[vi0!]!),
        //     new Point3D(verticies[vi1!]!),
        //     new Point3D(verticies[vi2!]!),
        // ];

        // const nv = v2.sub(v0).prod_vetorial(v1.sub(v0));

        const first_v = new Point3D(verticies[face[0]!]!);
        let p0 = first_v.rotate_z(ds).translate3d(camera_pos);
        let sp0 = vect_to_screen(to_screen(p0));
        if ((sp0.x > w || sp0.x < 0) && (sp0.y > h || sp0.y < 0)) continue;

        yield () => {
            ctx.beginPath();

            ctx.moveTo(sp0.x, sp0.y);

            for (let i = 0; i < face.length; i++) {
                const vert = new Point3D(verticies[face[i]!]!);
                const p = vert.rotate_z(ds).translate3d(camera_pos);
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

function draw_fps(fps: number) {
    ctx.font = "16px monospace";
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 30);
    ctx.shadowBlur = 0;
}

function render() {
    if (last_timestamp > 0) delta_time = (now - last_timestamp) / 1000;
    else delta_time = 1 / 60;
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
