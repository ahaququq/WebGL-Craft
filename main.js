let canvas = document.getElementById("main")
let dot = document.getElementById("dot")
let frame_display = document.getElementById("framerate")
let gl

function fatalError(msg) {
    document.body.innerHTML = `<div id="fatalError"><div>${msg.replaceAll("\n","<br>")}</div></div>`
    throw Error("FatalError: " + msg)
}

function getText(url) {
    return fetch(url).then((response) => response.text())
}

const strings = {
    web_gl_not_supported: 'This page requires a browser that supports WebGL.<br/>' +
        '<a href="https://get.webgl.org">Click here for more information.</a>',
    context_failed: "It doesn't appear your computer can support WebGL.<br/>" +
        '<a href="https://get.webgl.org/troubleshooting/">Click here for more information.</a>',
    shader_compilation_failed: (name, error) => `Failed ${name} shader compilation: 
<span class="errorMsg">${error}</span>`,
    shader_creation_failed: "Shader creation failed",
    program_linking_failed: (name, error) => `Failed ${name} program linking: 
<span class="errorMsg">${error}</span>`,
}

async function loadShader(url, type) {
    let src = await getText(url)
    let shader = gl.createShader(type)
    if (shader === null) throw fatalError(strings.shader_creation_failed)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled && !gl.isContextLost()) {
        let error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader)
        throw fatalError(strings.shader_compilation_failed(url, error))
    }
    return shader
}

async function loadProgram(url, attribs) {
    let vertexPromise = loadShader(url + ".vert", gl.VERTEX_SHADER)
    let fragmentPromise = loadShader(url + ".frag", gl.FRAGMENT_SHADER)

    let vertex = await vertexPromise
    let fragment = await fragmentPromise

    let program = gl.createProgram()

    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)

    for (let i = 0; i < attribs.length; ++i)
        gl.bindAttribLocation(program, i, attribs[i]);

    gl.linkProgram(program)

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked && !gl.isContextLost()) {
        const error = gl.getProgramInfoLog(program);

        gl.deleteProgram(program);
        gl.deleteProgram(fragment);
        gl.deleteProgram(vertex);

        throw fatalError(strings.program_linking_failed(url, error))
    }

    return program
}

let shaderProgram
let tri
let index
let index2
let invCameraMatrix = new J3DIMatrix4()
let world

async function init() {
    if (!window.WebGL2RenderingContext) fatalError(strings.web_gl_not_supported)

    gl = canvas.getContext("webgl2")
    if (!gl) fatalError(strings.context_failed)

    console.log(`GL version: ${gl.getParameter(gl.SHADING_LANGUAGE_VERSION)}`)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.enable(gl.CULL_FACE)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.5, 0.6, 0.9, 1.0)
    gl.clearDepth(1)

    resize()

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    shaderProgram = await loadProgram("shader", ["vPosition"])

    tri = bufferFromArray(new Float32Array([
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
         0.5,  0.5, -0.5,

         0.5,  0.5, -0.5,
        -0.5,  0.5, -0.5,
        -0.5, -0.5, -0.5,

         0.5,  0.5,  0.5,
         0.5, -0.5,  0.5,
        -0.5, -0.5,  0.5,

        -0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,
         0.5,  0.5,  0.5,


        -0.5, -0.5, -0.5,
        -0.5,  0.5, -0.5,
        -0.5,  0.5,  0.5,

        -0.5,  0.5,  0.5,
        -0.5, -0.5,  0.5,
        -0.5, -0.5, -0.5,

         0.5,  0.5,  0.5,
         0.5,  0.5, -0.5,
         0.5, -0.5, -0.5,

         0.5, -0.5, -0.5,
         0.5, -0.5,  0.5,
         0.5,  0.5,  0.5,
    ]), gl.ARRAY_BUFFER)

    index = bufferFromArray(new Uint8Array([
         0,  1, 2,
         3,  4, 5,
         6,  7, 8,
         9, 10, 11,

        12, 13, 14,
        15, 16, 17,
        18, 19, 20,
        21, 22, 23]), gl.ELEMENT_ARRAY_BUFFER)
    index2 = bufferFromArray(new Float32Array([
        1, 1, 1,
        2, 2, 2,
        3, 3, 3,
        4, 4, 4,
        5, 5, 5,
        6, 6, 6,
        7, 7, 7,
        8, 8, 8]), gl.ARRAY_BUFFER)

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    // gl.bindBuffer(gl.ARRAY_BUFFER, tri);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index)
    // gl.bindBuffer(gl.ARRAY_BUFFER, index2)

    world = new World()
    world.addChunk(new Chunk("stone"), 0, 0, 0)
    world.addChunk(new Chunk("stone"), 0, 0, 1)
    world.addChunk(new Chunk("stone"), 0, 0, 2)
    world.addChunk(new Chunk("stone"), 0, 1, 0)
    world.addChunk(new Chunk("stone"), 0, 1, 1)
    world.addChunk(new Chunk("stone"), 0, 1, 2)
    world.addChunk(new Chunk("stone"), 0, 2, 0)
    world.addChunk(new Chunk("stone"), 0, 2, 1)
    world.addChunk(new Chunk("stone"), 0, 2, 2)
    world.addChunk(new Chunk("stone"), 1, 0, 0)
    world.addChunk(new Chunk("stone"), 1, 0, 1)
    world.addChunk(new Chunk("stone"), 1, 0, 2)
    world.addChunk(new Chunk("stone"), 1, 1, 0)
    world.addChunk(new Chunk("stone"), 1, 1, 1)
    world.addChunk(new Chunk("stone"), 1, 1, 2)
    world.addChunk(new Chunk("stone"), 1, 2, 0)
    world.addChunk(new Chunk("stone"), 1, 2, 1)
    world.addChunk(new Chunk("stone"), 1, 2, 2)
    world.addChunk(new Chunk("stone"), 2, 0, 0)
    world.addChunk(new Chunk("stone"), 2, 0, 1)
    world.addChunk(new Chunk("stone"), 2, 0, 2)
    world.addChunk(new Chunk("stone"), 2, 1, 0)
    world.addChunk(new Chunk("stone"), 2, 1, 1)
    world.addChunk(new Chunk("stone"), 2, 1, 2)
    world.addChunk(new Chunk("stone"), 2, 2, 0)
    world.addChunk(new Chunk("stone"), 2, 2, 1)
    world.addChunk(new Chunk("stone"), 2, 2, 2)

    // world.setBlock(new Block("stone"), 1, 0, 3)

    main().then(r => console.log(r))
}

function resize() {
    if(canvas.width === canvas.clientWidth && canvas.height === canvas.clientHeight) return
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    gl.viewport(0, 0, canvas.width, canvas.height)
    perspective()
}

let perspectiveMatrix = new J3DIMatrix4()

function perspective() {
    perspectiveMatrix.makeIdentity()
    perspectiveMatrix.perspective(60, canvas.width / canvas.height, -1, 10)
}

function bufferFromArray(data, target) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(target, buffer)
    gl.bufferData(target, data, gl.DYNAMIC_DRAW)
    gl.bindBuffer(target, null)
    return buffer
}

let frameTime = 0
let lastTime = performance.now()
let currentTime = performance.now()
const filterStrength = 20
let testX
let testY
let testZ

function framerate(time) {
    frame_display.innerHTML = `
${(1000/time).toFixed(0)}fps | ${time.toFixed(0)}ms<br>
Yaw: ${yaw.toFixed(0)}&deg; | Pitch: ${pitch.toFixed(0)}&deg;<br>
TX: ${testX}<br>
TY: ${testY}<br>
TZ: ${testZ}`
}

let requestId
let deltaT

async function main() {
    mouseSetup()

    let f = function() {
        currentTime = performance.now()
        deltaT = currentTime - lastTime;
        frameTime += (deltaT - frameTime) / filterStrength
        lastTime = performance.now()
        framerate(frameTime)
        frame(deltaT)
        requestId = requestAnimationFrame(f);
    };
    f(performance.now());
}

let pitch = 24
let yaw = 150
let camX = 0
let camY = 1
let camZ = 1

function frame() {
    dot.innerHTML = ""
    resize()
    movement()
    update()

    debugDot(canvas.width * 0.5, canvas.height * 0.5,  0)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.useProgram(shaderProgram)
    invCameraMatrix.makeIdentity()
    invCameraMatrix.rotate(pitch, 1, 0, 0)
    invCameraMatrix.rotate(yaw, 0, 1, 0)
    invCameraMatrix.scale(2.0, 2.0, 2.0)
    invCameraMatrix.translate(-camX, -camY, -camZ)
    invCameraMatrix.setUniform(gl, gl.getUniformLocation(shaderProgram, "invCamera"), false)
    perspectiveMatrix.setUniform(gl, gl.getUniformLocation(shaderProgram, "perspective"), false)
    gl.uniform2fv(gl.getUniformLocation(shaderProgram, "res"), new Float32Array([canvas.width, canvas.height]))

    gl.bindBuffer(gl.ARRAY_BUFFER, tri)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, index2)
    // gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index)

    gl.drawElements(gl.TRIANGLES, 3 * 2 * 4, gl.UNSIGNED_BYTE, 0)

    world.render()
}

function fullscreen() {
    if (!document.fullscreenElement && document.fullscreenEnabled) document.body.requestFullscreen().then(r => console.log(r)).catch((r) => console.warn(r))
}

function mouseSetup() {
    canvas.addEventListener("click", async () => {
        fullscreen();
        if (!document.pointerLockElement) {
            await canvas.requestPointerLock()
        }
    })
    document.addEventListener("pointerlockerror", lockError)
    document.addEventListener("pointerlockchange", lockChangeAlert)
    document.addEventListener("contextmenu", cancelMenu)
    document.addEventListener("mousemove", mouseMoveUnlocked)
    document.addEventListener("touchmove", touchMove)
    document.addEventListener("touchstart", touchDown)
    document.addEventListener("touchcancel", touchUp)
    document.addEventListener("touchend", touchUp)
}

function cancelMenu(e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
}

function lockError() {
    // alert("Lock failed!")
}

function lockChangeAlert() {
    if (document.pointerLockElement === canvas) {
        console.log("The pointer lock status is now locked");
        document.addEventListener("mousemove", mouseMoveLocked);
        document.removeEventListener("mousemove", mouseMoveUnlocked);
    } else {
        console.log("The pointer lock status is now unlocked");
        document.removeEventListener("mousemove", mouseMoveLocked);
        document.addEventListener("mousemove", mouseMoveUnlocked);
    }
}

let hasTouch = false
let touchId = -1
let touchLastX = -1
let touchLastY = -1
let touchRadiusX = -1
let touchRadiusY = -1
let touchRotation = -1

function touchDown(e) {
    fullscreen()
    if (hasTouch) return
    hasTouch = true
    touchId = e.changedTouches[0].identifier
    touchLastX = e.changedTouches[0].screenX
    touchLastY = e.changedTouches[0].screenY
    touchRadiusX = e.changedTouches[0].radiusX
    touchRadiusY = e.changedTouches[0].radiusY
    touchRotation = e.changedTouches[0].rotationAngle
}

function touchUp() {
    hasTouch = false
}

function touchMove(e) {
    let moveX = 0
    let moveY = 0

    // console.log(e.touches.length)

    for (let i = 0; i < e.touches.length; i++) {
        // console.log(i)
        let v = e.touches[i]
        if(v.identifier === touchId && hasTouch) {
            moveX = touchLastX - v.screenX
            moveY = touchLastY - v.screenY
            touchLastX = v.screenX
            touchLastY = v.screenY
        }
    }

    yaw += moveX * Math.min(deltaT, 100) * 0.01
    pitch += moveY * Math.min(deltaT, 100) * 0.01
    pitch = Math.max(Math.min(pitch, 90), -90)
    yaw %= 360
}

function mouseMoveUnlocked(e) {
    if ((e.buttons & 0b00010) === 0 || e.pointerType === "touch") return
    yaw += e.movementX * Math.min(deltaT, 100) * 0.01
    pitch += e.movementY * Math.min(deltaT, 100) * 0.01
    pitch = Math.max(Math.min(pitch, 90), -90)
    yaw %= 360
}

function mouseMoveLocked(e) {
    yaw += e.movementX * deltaT * 0.1
    pitch += e.movementY * deltaT * 0.1
    pitch = Math.max(Math.min(pitch, 90), -90)
    yaw %= 360
}

function movement() {
    let mx = 0
    let my = 0
    let mz = 0
    mx += keys["d"] === true
    mx -= keys["a"] === true
    my += keys[" "] === true
    my -= keys["Shift"] === true
    mz += keys["s"] === true
    mz -= keys["w"] === true
    const speed = 0.01
    camX += mx * deltaT * speed * Math.cos(yaw / 180 * Math.PI) + mz * deltaT * speed * -Math.sin(yaw / 180 * Math.PI)
    camY += my * deltaT * speed
    camZ += mx * deltaT * speed * Math.sin(yaw / 180 * Math.PI) + mz * deltaT * speed * Math.cos(yaw / 180 * Math.PI)
}

let keys = {}

document.onkeydown = function (event) {
    keys[event.key] = true;
}

document.onkeyup = function (event) {
    keys[event.key] = false;
}

function update() {
    gl.bindBuffer(gl.ARRAY_BUFFER, index2)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([currentTime * 0.001, currentTime * 0.001 + 1, currentTime * 0.001 + 2]))
}

class Block {
    type
    constructor(type) {
        this.type = type
    }

    get solid() {
        return this.type !== "air"
    }

    get rendered() {
        return this.type !== "air"
    }

    static shouldCull = true

    triangles(cull, x, y, z) {
        let p3d = new Pos3D(x, y, z)
        if (!this.rendered) return []
        let vertices = [
            new Vertex(p3d.x - 0.5, p3d.y - 0.5, p3d.z - 0.5, 0, 0, 0, 0, 0),
            new Vertex(p3d.x - 0.5, p3d.y - 0.5, p3d.z + 0.5, 0, 0, 0, 0, 1),
            new Vertex(p3d.x - 0.5, p3d.y + 0.5, p3d.z - 0.5, 0, 0, 0, 1, 0),
            new Vertex(p3d.x - 0.5, p3d.y + 0.5, p3d.z + 0.5, 0, 0, 0, 1, 1),
            new Vertex(p3d.x + 0.5, p3d.y - 0.5, p3d.z - 0.5, 0, 0, 1, 0, 0),
            new Vertex(p3d.x + 0.5, p3d.y - 0.5, p3d.z + 0.5, 0, 0, 1, 0, 1),
            new Vertex(p3d.x + 0.5, p3d.y + 0.5, p3d.z - 0.5, 0, 0, 1, 1, 0),
            new Vertex(p3d.x + 0.5, p3d.y + 0.5, p3d.z + 0.5, 0, 0, 1, 1, 1),
        ]
        let output = []
        if (!cull[0] || !Block.shouldCull) output.push(
            Triangle.fromIndices(vertices, 0, 1, 3),
            Triangle.fromIndices(vertices, 3, 2, 0)
        )
        if (!cull[1] || !Block.shouldCull) output.push(
            Triangle.fromIndices(vertices, 4, 6, 7),
            Triangle.fromIndices(vertices, 7, 5, 4)
        )
        if (!cull[2] || !Block.shouldCull) output.push(
            Triangle.fromIndices(vertices, 0, 4, 5),
            Triangle.fromIndices(vertices, 5, 1, 0)
        )
        if (!cull[3] || !Block.shouldCull) output.push(
            Triangle.fromIndices(vertices, 2, 3, 7),
            Triangle.fromIndices(vertices, 7, 6, 2)
        )
        if (!cull[4] || !Block.shouldCull) output.push(
            Triangle.fromIndices(vertices, 0, 2, 6),
            Triangle.fromIndices(vertices, 6, 4, 0)
        )
        if (!cull[5] || !Block.shouldCull) output.push(
            Triangle.fromIndices(vertices, 1, 5, 7),
            Triangle.fromIndices(vertices, 7, 3, 1)
        )
        return output.flat()
    }
}

class Vertex {
    x
    y
    z
    u
    v
    nx
    ny
    nz

    constructor(x, y, z, u, v, nx, ny, nz) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.u = u;
        this.v = v;
        this.nx = nx;
        this.ny = ny;
        this.nz = nz;
    }

    equal(other) {
        if (!(other instanceof Vertex)) return false
        return (
            other.x === this.x &&
            other.y === this.y &&
            other.z === this.z &&
            other.u === this.u &&
            other.v === this.v &&
            other.nx === this.nx &&
            other.ny === this.ny &&
            other.nz === this.nz
        )
    }

    get array() {
        return [
            this.x, this.y, this.z,
            this.u, this.v,
            this.nx, this.ny, this.nz
        ]
    }
}

class Triangle {
    v1 = new Vertex()
    v2 = new Vertex()
    v3 = new Vertex()

    i1 = null
    i2 = null
    i3 = null

    static quad(vertices, c1, d2, d3, c4) {
        return [
            this.fromIndices(vertices, c1, d2, c4),
            this.fromIndices(vertices, c1, d3, c4)
        ]
    }

    static fromIndices(vertices, i1, i2, i3) {
        return new Triangle(vertices[i1], vertices[i2], vertices[i3])
    }

    constructor(v1, v2, v3) {
        if (!(v1 instanceof Vertex)) throw TypeError("v1 is not instance of Vertex")
        if (!(v2 instanceof Vertex)) throw TypeError("v2 is not instance of Vertex")
        if (!(v3 instanceof Vertex)) throw TypeError("v3 is not instance of Vertex")

        this.v1 = v1
        this.v2 = v2
        this.v3 = v3
    }

    get index() {
        return [this.i1, this.i2, this.i3]
    }

    get array() {
        return [this.v1.array, this.v2.array, this.v3.array].flat()
    }
}

class Pos3D {
    x
    y
    z

    constructor(x, y, z) {
        if (x instanceof Pos3D) {
            this.x = x.x
            this.y = x.y
            this.z = x.z
            return
        }
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toString() {
        return `Pos3D(${this.x}, ${this.y}, ${this.z})`
    }
}

const chunkSize = 16

class Chunk {
    blocks

    constructor(type) {
        this.blocks = []
        for (let i = 0; i < chunkSize; i++) {
            let a = []
            for (let j = 0; j < chunkSize; j++) {
                let b = []
                for (let k = 0; k < chunkSize; k++) {
                    b.push(new Block(type))
                }
                a.push(b)
            }
            this.blocks.push(a)
        }
    }

    setBlock(block, x, y, z) {
        let p3d = new Pos3D(x, y, z)
        this.blocks[p3d.x][p3d.y][p3d.z] = block
        return block
    }

    getBlock(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        return this.blocks[p3d.x][p3d.y][p3d.z]
    }

    genMesh(neighbours, x, y, z) {
        let p3d = new Pos3D(x, y, z)
        let triangles = []
        for (let i = 0; i < chunkSize; i++) {
            for (let j = 0; j < chunkSize; j++) {
                for (let k = 0; k < chunkSize; k++) {
                    let cull = []

                    if (i > 0) cull.push(this.blocks[i - 1][j][k].solid)
                    else if (neighbours[0] !== null) {
                        let block = neighbours[0].getBlock(chunkSize - 1, j, k)
                        if(block === undefined) cull.push(false)
                        else cull.push(block.solid)
                    } else cull.push(false)

                    if (i < chunkSize - 1) cull.push(this.blocks[i + 1][j][k].solid)
                    else if (neighbours[1] !== null) {
                        let block = neighbours[1].getBlock(0, j, k)
                        if(block === undefined) cull.push(false)
                        else cull.push(block.solid)
                    } else cull.push(false)

                    if (j > 0) cull.push(this.blocks[i][j - 1][k].solid)
                    else if (neighbours[2] !== null) {
                        let block = neighbours[2].getBlock(i, chunkSize - 1, k)
                        if(block === undefined) cull.push(false)
                        else cull.push(block.solid)
                    } else cull.push(false)

                    if (j < chunkSize - 1) cull.push(this.blocks[i][j + 1][k].solid)
                    else if (neighbours[3] !== null) {
                        let block = neighbours[3].getBlock(i, 0, k)
                        if(block === undefined) cull.push(false)
                        else cull.push(block.solid)
                    } else cull.push(false)

                    if (k > 0) cull.push(this.blocks[i][j][k - 1].solid)
                    else if (neighbours[4] !== null) {
                        let block = neighbours[4].getBlock(i, j, chunkSize - 1)
                        if(block === undefined) cull.push(false)
                        else cull.push(block.solid)
                    } else cull.push(false)

                    if (k < chunkSize - 1) cull.push(this.blocks[i][j][k + 1].solid)
                    else if (neighbours[5] !== null) {
                        let block = neighbours[5].getBlock(i, j, 0)
                        if(block === undefined) cull.push(false)
                        else cull.push(block.solid)
                    } else cull.push(false)
                    triangles.push(this.blocks[i][j][k].triangles(cull, i + p3d.x, j + p3d.y, k + p3d.z))
                }
            }
        }
        triangles = triangles.flat()

        console.log(triangles)

        let vertices = []

        if (false) triangles.forEach((v, i) => {
            let newVertices = [v.v1, v.v2, v.v3]
            let ids = []
            for (let j = 0; j < newVertices.length; j++) {
                let old = vertices.indexOf(newVertices[j])
                if (old === -1) {
                    ids.push(vertices.length)
                    vertices.push(newVertices[j])
                } else {
                    ids.push(old)
                }
            }
            triangles[i].i1 = ids[0]
            triangles[i].i2 = ids[1]
            triangles[i].i3 = ids[2]
        })

        triangles.forEach((tri) => {
            if (!(tri instanceof Triangle)) throw "garbage"
            tri.i1 = vertices.length
            vertices.push(tri.v1)
            tri.i2 = vertices.length
            vertices.push(tri.v2)
            tri.i3 = vertices.length
            vertices.push(tri.v3)
        })

        let elements = triangles.map((v) => v.index)
        let vertexValues = vertices.map((v) => v.array).flat()

        return {array: vertexValues, elementArray: elements.flat(), amount: elements.length}
    }
}

function debugDot(dotX, dotY, dotZ) {
    let newDot = document.createElement("div")
    newDot.style.left = `${dotX}px`
    newDot.style.top = `${dotY}px`
    newDot.style.zIndex = `${(dotZ * -50 + 1000).toFixed()}`
    dot.appendChild(newDot)
}

class World {
    chunks = {}

    addChunk(chunk, x, y, z) {
        let p3d = new Pos3D(x, y, z)
        this.chunks[p3d] = {pos: p3d, chunk: chunk}
        this.markDirty()
    }

    getChunk(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        let entry = this.chunks[p3d.toString()]
        if (entry === undefined) return null
        return entry.chunk
    }

    blockPos(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        return new Pos3D(
            p3d.x * chunkSize,
            p3d.y * chunkSize,
            p3d.z * chunkSize
        )
    }

    offsetBlockPos(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        let chunk = this.chunkPos(p3d)
        let pos = this.blockPos(chunk)
        return new Pos3D(
            p3d.x - pos.x,
            p3d.y - pos.y,
            p3d.z - pos.z
        )
    }

    chunkPos(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        return new Pos3D(
            Math.floor(p3d.x / chunkSize),
            Math.floor(p3d.y / chunkSize),
            Math.floor(p3d.z / chunkSize)
        )
    }

    getBlock(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        let chunk = this.chunkPos(p3d)
        let pos = this.offsetBlockPos(p3d)
        return this.getChunk(chunk).getBlock(pos.x, pos.y, pos.z)
    }

    setBlock(block, x, y, z) {
        let p3d = new Pos3D(x, y, z)
        let chunk = this.chunkPos(p3d)
        let pos = this.offsetBlockPos(p3d)
        this.markDirty()
        let cache = this.meshCache[chunk.toString()]
        if (cache !== undefined) cache.dirty = true
        return this.getChunk(chunk).setBlock(block, pos.x, pos.y, pos.z)
    }

    mesh() {
        let meshes = []
        let list = Object.entries(this.chunks)
        list.forEach((pair) => {
            let pos = pair[1].pos
            let old = this.meshCache[pos.toString()]
            if (old === undefined || old.dirty) {
                let chunk = pair[1].chunk
                let res = chunk.genMesh([
                    this.getChunk(pos.x - 1, pos.y, pos.z),
                    this.getChunk(pos.x + 1, pos.y, pos.z),
                    this.getChunk(pos.x, pos.y - 1, pos.z),
                    this.getChunk(pos.x, pos.y + 1, pos.z),
                    this.getChunk(pos.x, pos.y, pos.z - 1),
                    this.getChunk(pos.x, pos.y, pos.z + 1)
                ], this.blockPos(pos))
                meshes.push({pos: pos, mesh: res, dirty: false, buffered: false})
            } else {
                meshes.push(old)
            }
        })
        return meshes
    }

    meshCache = []
    meshUpToDate = false

    markDirty() {
        this.meshUpToDate = false
    }

    updateIfNeeded() {
        if (!this.meshUpToDate) this.update()
    }

    shouldMesh = true

    update() {
        if (this.shouldMesh) this.meshCache = this.mesh()
        this.markAllBuffersExcess()
        this.meshCache.forEach((v) => {
            if (v.buffered) return
            v.buffered = true
            let pos = v.pos
            let mesh = v.mesh
            let array = mesh.array
            let elementArray = mesh.elementArray
            let amount = mesh.amount
            let buffers = this.getOrCreateBuffers(pos)
            this.setBuffersLength(amount, pos)
            this.setUsedBuffers(true, pos)
            this.linkDataBuffers(array, elementArray, pos)
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.array.buffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.DYNAMIC_DRAW)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.elementArray.buffer)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(elementArray), gl.DYNAMIC_DRAW)
        })
        this.deleteExcessBuffers()
        this.meshUpToDate = true
    }

    arrayBuffers = {}
    elementArrayBuffers = {}

    newBuffers(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        this.arrayBuffers[p3d] = {buffer: gl.createBuffer(), used: true, pos: p3d}
        this.elementArrayBuffers[p3d] = {buffer: gl.createBuffer(), used: true, pos: p3d, amount: 0}
        return {
            array: this.arrayBuffers[p3d.toString()],
            elementArray: this.elementArrayBuffers[p3d.toString()]
        }
    }

    setBuffersLength(length, x, y, z) {
        let p3d = new Pos3D(x, y, z)
        this.elementArrayBuffers[p3d.toString()].amount = length
    }

    linkDataBuffers(array, elementArray, x, y, z) {
        let p3d = new Pos3D(x, y, z)
        this.arrayBuffers[p3d.toString()].data = array
        this.elementArrayBuffers[p3d.toString()].data = elementArray
    }

    setUsedBuffers(used, x, y, z) {
        let p3d = new Pos3D(x, y, z)
        this.arrayBuffers[p3d.toString()].used = used
        this.elementArrayBuffers[p3d.toString()].used = used
    }

    getOrCreateBuffers(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        if (this.arrayBuffers.hasOwnProperty(p3d.toString())) return this.getBuffers(p3d)
        return this.newBuffers(p3d)
    }

    getBuffers(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        return {
            array: this.arrayBuffers[p3d.toString()],
            elementArray: this.elementArrayBuffers[p3d.toString()]
        }
    }

    markAllBuffersExcess() {
        for (let i = 0; i < this.arrayBuffers.length; i++) {
            let array = this.arrayBuffers[i]
            if (!array.used) {
                // this.setUsedBuffers(false, array.pos)
            }
        }
    }

    deleteExcessBuffers() {
        for (let i = 0; i < this.arrayBuffers.length; i++) {
            let array = this.arrayBuffers[i]
            if (!array.used) {
                this.deleteBuffers(array.pos)
            }
        }
    }

    deleteBuffers(x, y, z) {
        let p3d = new Pos3D(x, y, z)
        let index = p3d.toString();
        let array = this.arrayBuffers[index].buffer
        let elementArray = this.elementArrayBuffers[index].buffer
        gl.deleteBuffer(array)
        gl.deleteBuffer(elementArray)
        delete this.arrayBuffers[index]
        delete this.elementArrayBuffers[index]
    }

    init() {
        gl.enableVertexAttribArray(0)
    }

    render() {
        this.updateIfNeeded()
        let arrayList = Object.entries(this.arrayBuffers)
        let elementArrayList = Object.entries(this.elementArrayBuffers)
        for (let i = 0; i < arrayList.length; i++) {
            let id = arrayList[i][0]
            gl.bindBuffer(gl.ARRAY_BUFFER, this.arrayBuffers[id].buffer)
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 4 * 8, 0)
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 8, 3 * 4)
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 4 * 8, 5 * 4)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementArrayBuffers[id].buffer)
            gl.drawElements(gl.TRIANGLES, this.elementArrayBuffers[id].amount * 3, gl.UNSIGNED_INT, 0)
            // console.log("Draw: ", id)

            let d = this.arrayBuffers[id].data

            for (let j = 0; j < d.length && false;) {
                let x = this.arrayBuffers[id].data[j++]
                let y = this.arrayBuffers[id].data[j++]
                let z = this.arrayBuffers[id].data[j++]
                let u = this.arrayBuffers[id].data[j++]
                let v = this.arrayBuffers[id].data[j++]
                let nx = this.arrayBuffers[id].data[j++]
                let ny = this.arrayBuffers[id].data[j++]
                let nz = this.arrayBuffers[id].data[j++]

                let transPerspectiveMatrix = new J3DIMatrix4(invCameraMatrix)
                transPerspectiveMatrix.multiply(perspectiveMatrix)
                // transPerspectiveMatrix.transpose()
                // transPerspectiveMatrix.invert()

                let arr = transPerspectiveMatrix.getAsArray()

                x = arr[0] * x + arr[1] * y + arr[2] * z + arr[3] * 0.5
                y = arr[4] * x + arr[5] * y + arr[6] * z + arr[7] * 0.5
                z = arr[8] * x + arr[9] * y + arr[10] * z + arr[11] * 0.5
                let w = arr[12] * x + arr[13] * y + arr[14] * z + arr[15] * 0.5

                x /= w
                y /= w
                z /= w

                let dotX = x * canvas.width
                let dotY = y * canvas.height
                let dotZ = z

                if (j === 8) {
                    testX = x
                    testY = y
                    testZ = z
                }

                debugDot(dotX, dotY, dotZ);
            }
        }
    }
}

init().then(r => r)

//fatalError("Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores possimus illo eum doloribus reiciendis recusandae, explicabo dolores tempore, et, natus nisi illum? Itaque dignissimos quod aspernatur modi corporis nulla! Consectetur, porro tempora! Atque velit commodi ipsa quibusdam ipsum delectus explicabo exercitationem soluta! Veniam nostrum laborum dolorem assumenda tenetur enim quo vero amet ducimus esse illo quidem earum molestias corporis libero eveniet, omnis velit fuga quas nam ea et. Magni sint iste vel enim adipisci, ad exercitationem ratione minus, optio, veritatis vero molestias cumque! Earum, accusantium. Dolore accusantium porro, quas accusamus ut voluptatem corrupti obcaecati consequuntur optio quasi, facilis perspiciatis vitae est? Laborum expedita, unde quae exercitationem quo adipisci nihil neque delectus commodi voluptas tempore non distinctio odio perspiciatis aspernatur veritatis ipsum eaque fugit architecto aliquam corrupti repudiandae iste! Atque in aspernatur earum autem inventore sequi debitis molestias fugiat fuga impedit, culpa vitae quibusdam iste eaque, iusto expedita. Deleniti quisquam amet enim doloremque repellendus, ratione illum provident obcaecati laudantium necessitatibus quia vitae voluptatem cum quasi nostrum aliquid voluptates, adipisci tempora quam velit quaerat minus. Asperiores, harum pariatur explicabo, natus cum modi inventore illo error itaque porro laboriosam deleniti accusamus sit quam eveniet autem. Accusantium, ipsam ab? Pariatur minus consequuntur hic tempora ipsum itaque earum aliquam minima repellendus velit quos corrupti, a totam explicabo sunt non, odio nisi optio ipsam autem officia alias omnis unde eum? Molestiae reiciendis nihil laboriosam eveniet impedit ipsum quia, molestias eaque vel quidem repudiandae exercitationem, alias numquam dolorem. Eum inventore vel repellat ipsam esse voluptate doloribus? Pariatur sapiente repellat quas recusandae commodi eum sed nostrum iusto illo, dolore placeat quasi mollitia dignissimos alias adipisci exercitationem ipsam cumque vero magnam dolorem atque? Ipsum nobis numquam totam, accusamus similique fugit soluta sit expedita optio voluptate nulla accusantium? Earum consequuntur deleniti, provident velit sapiente labore dignissimos at distinctio non officia recusandae quod placeat necessitatibus a nihil eligendi incidunt qui doloremque, dicta odit. Quasi debitis velit veniam facilis. Qui veritatis, inventore ipsum ipsa eos earum neque voluptate obcaecati officiis, natus ipsam placeat at. At, sed cumque. Excepturi necessitatibus nostrum commodi accusamus dolore? Dolore veniam in, labore dicta beatae placeat veritatis perspiciatis! Soluta, mollitia officia nulla expedita pariatur amet consequatur fugiat aliquid, illum omnis nisi esse, excepturi ea praesentium libero iure facere eaque ipsa officiis dicta minus sint! Beatae alias nisi doloribus itaque neque deserunt. Illo, labore commodi esse id repellat eligendi mollitia incidunt quam accusantium dolorum ab repellendus nobis, optio dignissimos quas nihil laborum at ducimus accusamus deserunt voluptates velit fuga. At a vel magni. Libero facilis, corporis dignissimos ad perferendis aspernatur quia debitis quibusdam fugiat tenetur laudantium dolorem, qui dolore harum soluta saepe mollitia reprehenderit earum fuga vero suscipit, vel asperiores aliquam dolor. Repellat officiis dolorem ducimus ullam dolore labore voluptatem doloribus recusandae aliquid animi provident voluptatum omnis cupiditate tenetur dolores accusantium quod eius pariatur eligendi, accusamus eos hic temporibus odio sit? Ducimus ipsam molestias minima suscipit, nihil delectus aspernatur neque repellat ut doloribus facilis. Quae consectetur ratione sequi neque, adipisci laudantium iusto quidem minima suscipit assumenda nesciunt rem veniam.")