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
    // center_model(verticies);
    console.log([faces, verticies]);
}
async function parseObj(text) {
    const vertices = [];
    const faces = [];
    text.split("\n").forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === "v") {
            const vert = new Point3D(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
            vertices.push(vert);
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
    // const zoom_factor = 1.1;
    // const forward = camera0.get_forward();
    // const right_vec = new Vector4(forward.x, 0, forward.z, 0);
    // if (e.deltaY > 0) {
    //     camera0.pos = camera0.pos.translate3d({ z: -zoom_factor });
    // } else if (e.deltaY < 0) {
    //     camera0.pos = camera0.pos.translate3d({ z: zoom_factor });
    // }
}
function keyboard_handle(e) {
    const move_factor = 30;
    if (e.type == "keydown") {
        if (e.code == "KeyW")
            camera0.pos = Camera.camera_move(camera0, "back", move_factor, delta_time).pos;
        if (e.code == "KeyS")
            camera0.pos = Camera.camera_move(camera0, "forward", move_factor, delta_time).pos;
        if (e.code == "KeyD")
            camera0.pos = Camera.camera_move(camera0, "right", move_factor, delta_time).pos;
        if (e.code == "KeyA")
            camera0.pos = Camera.camera_move(camera0, "left", move_factor, delta_time).pos;
    }
    if (e.type == "keyup") {
    }
}
var rotation_mode = false;
function mouse_handle(e) {
    const sensibility = 0.003;
    if (e.type == "pointerup")
        rotation_mode = false;
    if (e.type == "pointerdown")
        rotation_mode = true;
    if (e.type == "mousemove") {
        if (!rotation_mode)
            return;
        camera0.orientation = Camera.camera_rotate(camera0, e.movementX * sensibility, e.movementY * sensibility).orientation;
        // camera0.yaw += e.movementX * sensibility;
        // camera0.pitch += e.movementY * sensibility;
        // camera0.yaw = camera0.yaw % 360;
        // camera0.pitch = camera0.pitch % 360;
        // camera0.roll = camera0.roll % 360;
    }
}
document.addEventListener("keydown", keyboard_handle);
document.addEventListener("keyup", keyboard_handle);
document.addEventListener("wheel", scroll_handle);
document.addEventListener("mousemove", mouse_handle);
document.addEventListener("pointerdown", mouse_handle);
document.addEventListener("pointerup", mouse_handle);
canvas.width = 1200;
canvas.height = 900;
// class Point {
//     public x: number = 0;
//     public y: number = 0;
//     constructor(vector: IPoint3D);
//     constructor(x: number, y: number);
//     constructor(arg0: number | IPoint3D, y?: number) {
//         if (typeof arg0 === "object") {
//             this.x = arg0.x;
//             this.y = arg0.y;
//         } else if (typeof arg0 === "number") {
//             this.x = arg0;
//             this.y = y ? y : 0;
//         }
//     }
//     add(v: Point): Point {
//         return new Point(this.x + v.x, this.y + v.y);
//     }
//     translate({ x: dx = 0, y: dy = 0 }: IPoint) {
//         this.x = this.x + dx;
//         this.y = this.y + dy;
//         return this;
//     }
// }
class Point3D {
    x = 0;
    y = 0;
    z = 0;
    constructor(arg0, y, z) {
        if (typeof arg0 === "object") {
            this.x = arg0.x;
            this.y = arg0.y;
            this.z = arg0.z;
        }
        else if (typeof arg0 === "number") {
            this.x = arg0;
            this.y = y ? y : 0;
            this.z = z ? z : 0;
        }
    }
    add(delta) {
        return new Point3D(this.x + delta.x, this.y + delta.y, this.z + delta.z);
    }
    static add(v, delta) {
        return new Point3D(v.x + delta.x, v.y + delta.y, v.z + delta.z);
    }
    sub(v) {
        return new Point3D(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    negative() {
        return new Point3D(this.x * -1, this.y * -1, this.z * -1);
    }
    rotate_z(angle) {
        // https://en.wikipedia.org/wiki/Rotation_matrix
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const z = this.x * sin + this.y * cos;
        this.x = x;
        this.z = z;
        return this;
    }
    rotate_y(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.z * sin;
        const y = this.x * sin + this.z * cos;
        this.x = x;
        this.y = y;
        return this;
    }
    rotate_x(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const y = this.y * cos - this.z * sin;
        const z = this.y * sin + this.z * cos;
        this.y = y;
        this.z = z;
        return this;
    }
    translate3d({ x: dx = 0, y: dy = 0, z: dz = 0 }) {
        this.x = this.x + dx;
        this.y = this.y + dy;
        this.z = this.z + dz;
        return this;
    }
    cross({ x: bx, y: by, z: bz, }) {
        return new Point3D({
            x: this.y * bz - this.z * by,
            y: this.z * bx - this.x * bz,
            z: this.x * by - this.y * bx,
        });
    }
    dot({ x: bx, y: by, z: bz }) {
        return this.x * bx + this.y * by + this.z * bz;
    }
    static dot(v, { x: bx, y: by, z: bz }) {
        return v.x * bx + v.y * by + v.z * bz;
    }
    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
    static magnitude(v) {
        return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
    }
    normalized() {
        const magn = this.magnitude();
        return new Point3D({
            x: this.x / magn,
            y: this.y / magn,
            z: this.z / magn,
        });
    }
    static normalize(v) {
        const magnitude = v.magnitude();
        return new Point3D({
            x: v.x / magnitude,
            y: v.y / magnitude,
            z: v.z / magnitude,
        });
    }
    static scale(v, scale) {
        return new Point3D(v.x * scale, v.y * scale, v.z * scale);
    }
}
class Matrix4 {
    constructor(arr) {
        this.elements = arr;
    }
    static identity() {
        return new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
    elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; // identity
    static rotationYawPitch(yaw, pitch) {
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);
        // R = Ry * Rx
        return new Matrix4([
            cosY,
            sinY * sinP,
            sinY * cosP,
            0,
            0,
            cosP,
            -sinP,
            0,
            -sinY,
            cosY * sinP,
            cosY * cosP,
            0,
            0,
            0,
            0,
            1,
        ]);
    }
    multiplyVector(v) {
        const e = this.elements;
        const x = e[0] * v.x + e[1] * v.y + e[2] * v.z + e[3] * v.w;
        const y = e[4] * v.x + e[5] * v.y + e[6] * v.z + e[7] * v.w;
        const z = e[8] * v.x + e[9] * v.y + e[10] * v.z + e[11] * v.w;
        const w = e[12] * v.x + e[13] * v.y + e[14] * v.z + e[15] * v.w;
        return new Vector4(x, y, z, w);
    }
    multiply(other) {
        const a = this.elements;
        const b = other.elements;
        const result = new Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] =
                    a[i * 4 + 0] * b[0 * 4 + j] +
                        a[i * 4 + 1] * b[1 * 4 + j] +
                        a[i * 4 + 2] * b[2 * 4 + j] +
                        a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        return new Matrix4(result);
    }
    static translation(tx, ty, tz) {
        return new Matrix4([1, 0, 0, tx, 0, 1, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1]);
    }
    static rotationY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
    }
    static rotationX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
    }
    static rotationZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
    transform_point(p) {
        const e = this.elements;
        const x = p[0], y = p[1], z = p[2];
        const w = 1;
        return [
            e[0] * x + e[4] * y + e[8] * z + e[12] * w,
            e[1] * x + e[5] * y + e[9] * z + e[13] * w,
            e[2] * x + e[6] * y + e[10] * z + e[14] * w,
        ];
    }
}
class Vector4 {
    x;
    y;
    z;
    w;
    constructor(x, y, z, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    transform(matrix) {
        const m = matrix.elements;
        const x = m[0] * this.x + m[4] * this.y + m[8] * this.z + m[12] * this.w;
        const y = m[1] * this.x + m[5] * this.y + m[9] * this.z + m[13] * this.w;
        const z = m[2] * this.x + m[6] * this.y + m[10] * this.z + m[14] * this.w;
        const w = m[3] * this.x + m[7] * this.y + m[11] * this.z + m[15] * this.w;
        return new Vector4(x, y, z, w);
    }
    static add(v, delta) {
        return new Vector4(v.x + delta.x, v.y + delta.y, v.z + delta.z, v.z);
    }
    static get_basis(q) {
        const { x, y, z, w } = q;
        const right = new Point3D(1 - 2 * (y * y + z * z), 2 * (x * y + w * z), 2 * (x * z - w * y));
        const up = new Point3D(2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x));
        const forward = new Point3D(-(2 * (x * z + w * y)), -(2 * (y * z - w * x)), -(1 - 2 * (x * x + y * y)));
        return { right, up, forward };
    }
    static vector_from_axis_angle(axis, angle) {
        const half = angle / 2;
        const s = Math.sin(half);
        const a = Point3D.normalize(axis);
        return new Vector4(a.x * s, a.y * s, a.z * s, Math.cos(half));
    }
    static normalize(q) {
        const len = Math.sqrt(q.x ** 2 + q.y ** 2 + q.z ** 2 + q.w ** 2);
        return new Vector4(q.x / len, q.y / len, q.z / len, q.w / len);
    }
    static multiply(a, b) {
        const { x: ax, y: ay, z: az, w: aw } = a;
        const { x: bx, y: by, z: bz, w: bw } = b;
        return new Vector4(aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz);
    }
}
function perspective(fovY, aspect, near, far) {
    const f = 1 / Math.tan(fovY / 2);
    const rangeInv = 1 / (near - far);
    return new Matrix4([
        f / aspect,
        0,
        0,
        0,
        0,
        f,
        0,
        0,
        0,
        0,
        (far + near) * rangeInv,
        2 * far * near * rangeInv,
        0,
        0,
        -1,
        0,
    ]);
}
function orthographic(left, right, bottom, top, near, far) {
    return new Matrix4([
        2 / (right - left),
        0,
        0,
        -(right + left) / (right - left),
        0,
        2 / (top - bottom),
        0,
        -(top + bottom) / (top - bottom),
        0,
        0,
        -2 / (far - near),
        -(far + near) / (far - near),
        0,
        0,
        0,
        1,
    ]);
}
function ndc_to_screen(ndc, width, height) {
    const screenX = ((ndc.x + 1) / 2) * width;
    const screenY = ((1 - ndc.y) / 2) * height; // flip Y because canvas Y increases downwards
    return { x: screenX, y: screenY };
}
class Camera {
    pos = new Vector4(0, 5, -10, 1);
    orientation = new Vector4(0, 0, 0, 1);
    static camera_move(camera, direction, speed, deltaTime) {
        const { right, up, forward } = Vector4.get_basis(camera.orientation);
        const distance = speed * deltaTime;
        const moveVectors = {
            forward: forward,
            back: Point3D.scale(forward, -1),
            right: right,
            left: Point3D.scale(right, -1),
            up: up,
            down: Point3D.scale(up, -1),
        };
        const delta = Point3D.scale(moveVectors[direction], distance);
        return {
            ...camera,
            pos: Vector4.add(camera0.pos, delta),
        };
    }
    static camera_rotate(camera, yawDelta, pitchDelta) {
        const world_up = new Point3D(0, 1, 0);
        const { right } = Vector4.get_basis(camera.orientation);
        const yawQ = Vector4.vector_from_axis_angle(world_up, yawDelta);
        const pitchQ = Vector4.vector_from_axis_angle(right, pitchDelta);
        let newOrientation = Vector4.multiply(yawQ, camera.orientation);
        newOrientation = Vector4.multiply(newOrientation, pitchQ);
        // let { pitch, roll, yaw } = Camera.vector4_to_euler(newOrientation);
        // pitch = Math.max(
        //     -Math.PI / 2 - 0.01,
        //     Math.min(Math.PI / 2 - 0.01, pitch + pitchDelta),
        // );
        // newOrientation = Camera.from_euler(yaw, pitch, roll);
        return {
            ...camera,
            orientation: Vector4.normalize(newOrientation),
        };
    }
    static camera_view_matrix(camera) {
        const { right, up, forward } = Vector4.get_basis(camera.orientation);
        const p = camera.pos;
        const m = Matrix4.identity();
        m.elements[0] = right.x;
        m.elements[1] = up.x;
        m.elements[2] = forward.x;
        m.elements[3] = 0;
        m.elements[4] = right.y;
        m.elements[5] = up.y;
        m.elements[6] = forward.y;
        m.elements[7] = 0;
        m.elements[8] = right.z;
        m.elements[9] = up.z;
        m.elements[10] = forward.z;
        m.elements[11] = 0;
        m.elements[12] = -Point3D.dot(right, p);
        m.elements[13] = -Point3D.dot(up, p);
        m.elements[14] = -Point3D.dot(forward, p);
        m.elements[15] = 1;
        return m;
    }
    static vector4_to_euler(q) {
        const { x, y, z, w } = q;
        const m00 = 1 - 2 * (y * y + z * z);
        const m10 = 2 * (x * y + w * z);
        const m20 = 2 * (x * z - w * y);
        const m21 = 2 * (y * z + w * x);
        const m22 = 1 - 2 * (x * x + y * y);
        const sinPitch = -m20;
        const pitch = Math.asin(Math.max(-1, Math.min(1, sinPitch)));
        let yaw;
        let roll;
        if (Math.abs(sinPitch) > 0.9999) {
            yaw = Math.atan2(-m21, m22) * (sinPitch > 0 ? 1 : -1);
            roll = 0;
        }
        else {
            yaw = Math.atan2(m10, m00);
            roll = Math.atan2(m21, m22);
        }
        return { yaw, pitch, roll };
    }
    static from_euler(yaw, pitch, roll) {
        const yawQ = Vector4.vector_from_axis_angle(new Point3D(0, 1, 0), yaw);
        const pitchQ = Vector4.vector_from_axis_angle(new Point3D(1, 0, 0), pitch);
        const rollQ = Vector4.vector_from_axis_angle(new Point3D(0, 0, 1), roll);
        return Vector4.normalize(Vector4.multiply(Vector4.multiply(yawQ, pitchQ), rollQ));
    }
}
const camera0 = new Camera();
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
// function draw_point({ x, y }: Point) {
//     const size = 10;
//     ctx.fillStyle = "black";
//     ctx.fillRect(x - size / 2, y - size / 2, size, size);
// }
let dt = 0;
var verticies = [];
var faces = [];
let models = [];
function center_model(vertices) {
    if (vertices.length === 0)
        return;
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const v of vertices) {
        if (v.x < minX)
            minX = v.x;
        if (v.y < minY)
            minY = v.y;
        if (v.z < minZ)
            minZ = v.z;
        if (v.x > maxX)
            maxX = v.x;
        if (v.y > maxY)
            maxY = v.y;
        if (v.z > maxZ)
            maxZ = v.z;
    }
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    for (const v of vertices) {
        v.x -= centerX;
        v.y -= centerY;
        v.z -= centerZ;
    }
}
// function to_screen({ x, y, z }: IPoint3D): IPoint {
//     return {
//         x: x / z,
//         y: y / z,
//     };
// }
// function vect_to_screen({ x, y }: IPoint): IPoint {
//     // -1..1 -> 0..2 -> 0..1 -> 0..w ou y
//     return {
//         x: ((x + 1) / 2) * w,
//         y: (1 - (y + 1) / 2) * h, // canvas desenha y de baixo pra cima
//     };
// }
let ds = 0;
function* render_lines() {
    clear();
    const camera_rotation_matrix = Camera.camera_view_matrix(camera0);
    const view_space_matrix = camera_rotation_matrix.multiply(Matrix4.translation(-camera0.pos.x, -camera0.pos.y, -camera0.pos.z));
    const projection_matrix = perspective(Math.PI / 3, w / h, 0.1, 1000);
    const ds_rotation_matrix = Matrix4.rotationY(ds);
    const model_m = Matrix4.identity().multiply(ds_rotation_matrix);
    const offscreen_margin = 150;
    for (const face of faces) {
        if (face.length < 3)
            continue;
        // calcular vetores normais e fazer back-face culling
        // const [vi0, vi1, vi2] = face.slice(0, 3)!;
        // const [v0, v1, v2] = [
        //     new Point3D(verticies[vi0!]!),
        //     new Point3D(verticies[vi1!]!),
        //     new Point3D(verticies[vi2!]!),
        // ];
        // const nv = v2.sub(v0).prod_vetorial(v1.sub(v0));
        // let p0 = view_space_matrix.multiplyVector(
        // first_v.rotate_z(ds).translate3d(camera0.pos.negative()),
        // );
        ctx.fillStyle = `rgba(0, 0, 0, 0.9)`;
        yield () => {
            ctx.beginPath();
            for (let i = 0; i < face.length; i++) {
                const vert = new Point3D(verticies[face[i]]);
                const v4 = new Vector4(vert.x, vert.y, vert.z, 1);
                const world = model_m.multiplyVector(v4);
                const view = view_space_matrix.multiplyVector(world);
                const clip = projection_matrix.multiplyVector(view);
                if (clip.w === 0)
                    continue;
                const ndc = [clip.x / clip.w, clip.y / clip.w, clip.z / clip.w];
                const screen = ndc_to_screen(new Vector4(ndc[0], ndc[1], ndc[2], 1), w, h);
                if (screen.x - offscreen_margin > w ||
                    screen.x + offscreen_margin < 0 ||
                    screen.y - offscreen_margin > h ||
                    screen.y + offscreen_margin < 0)
                    continue;
                if (i === 0)
                    ctx.moveTo(screen.x, screen.y);
                else
                    ctx.lineTo(screen.x, screen.y);
            }
            ctx.closePath();
            ctx.fill();
        };
    }
}
let last_timestamp = 0;
let delta_time = 0;
let now = 0;
let rotation_speed = 1.0;
let fps = 0;
function draw_info(fps) {
    ctx.font = "16px monospace";
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText(`FPS: ${Math.round(fps)}, C0 (XYZ): (${camera0.pos.x.toFixed(3)} ${camera0.pos.y.toFixed(3)} ${camera0.pos.z.toFixed(3)})`, 10, 30);
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
    draw_info(fps);
    now = performance.now();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
//# sourceMappingURL=index.js.map