const forward:vec3 = [0, 0, 1]
const up:vec3 = [0, 1, 0]
const right:vec3 = [1, 0, 0]
const zero:vec3 = [0, 0, 0]

type vec3=[number,number,number];


function rotvec(vec:vec3, axis:vec3, th:number):vec3 {
    const [l, m, n] = axis
    const [x, y, z] = vec
    const [costh, sinth] = [Math.cos(th), Math.sin(th)]
    
    const sub_1_costh = 1 - costh;
    const mat_11 = l * l * sub_1_costh + costh
    const mat_12 = m * l * sub_1_costh - n * sinth
    const mat_13 = n * l * sub_1_costh + m * sinth

    const mat_21 = l * m * sub_1_costh + n * sinth
    const mat_22 = m * m * sub_1_costh + costh
    const mat_23 = n * m * sub_1_costh - l * sinth

    const mat_31 = l * n * sub_1_costh - m * sinth
    const mat_32 = m * n * sub_1_costh + l * sinth
    const mat_33 = n * n * sub_1_costh + costh
    return [
        x * mat_11 + y * mat_12 + z * mat_13,
        x * mat_21 + y * mat_22 + z * mat_23,
        x * mat_31 + y * mat_32 + z * mat_33,
    ];
}
function roteuler(vec:vec3, rot:vec3) {
    if (rot[2] != 0) { vec = rotvec(vec, forward, rot[2]) }
    if (rot[0] != 0) { vec = rotvec(vec, right, rot[0]) }
    if (rot[1] != 0) { vec = rotvec(vec, up, rot[1]) }
    return vec
}

function scale(vec:vec3, p:number):vec3 {
    return [vec[0] * p, vec[1] * p, vec[2] * p]
}
function copy(v0:vec3):vec3 {
    return [v0[0], v0[1], v0[2]]
}
function add(v0:vec3, v:vec3):vec3 {
    return [v0[0] + v[0], v0[1] + v[1], v0[2] + v[2]]
}
function subtract(v0:vec3, v:vec3):vec3 {
    return [v0[0] - v[0], v0[1] - v[1], v0[2] - v[2]]
}
function mag(v:vec3):number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
}
function normalize(v:vec3):vec3 {
    const p = 1 / mag(v)
    return [v[0] * p, v[1] * p, v[2] * p]
}
function dot(u:vec3, v:vec3):number {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
}
function cross(u:vec3, v:vec3):vec3 {
    return [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    ]
}
function angcos(u:vec3, v:vec3):number {
    return dot(u, v) / (mag(u) * mag(v))
}
function ang(u:vec3, v:vec3):number {
    return Math.acos(angcos(u, v))
}
function toeuler(v0:vec3):vec3 {
    const ep = 5
    let ma = 2 * PI
    let mr:vec3 = [0, 0, 0]
    let cnt = 0
    for (let x = -180; x < 180; x += ep) {
        for (let y = -90; y < 90; y += ep) {
            cnt++;
            const r:vec3 = [rad(x), rad(y), 0]
            const v = roteuler([0, 0, 1], r)
            const a = ang(v0, v)
            if (a < rad(ep)) {
                return r
            }
            if (a < ma) {
                ma = a
                mr = r
            }
        }
    }
    return mr
}
function lerp(u:vec3, v:vec3, p:number):vec3 {
    return [
        u[0] * (1 - p) + v[0] * p,
        u[1] * (1 - p) + v[1] * p,
        u[2] * (1 - p) + v[2] * p,
    ]
}

const v3={
    forward,
    up,
    right,
    zero,
    rotvec,
    roteuler,
    scale,
    copy,
    add,
    subtract,
    mag,
    normalize,
    dot,
    cross,
    angcos,
    ang,
    toeuler,
    lerp,
};