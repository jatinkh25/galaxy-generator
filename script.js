import { GUI } from 'dat.gui'
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Clock,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  AdditiveBlending,
  Color,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const scene = new Scene()

const params = {}
params.count = 155000
params.size = 0.01
params.radius = 5
params.branches = 3
params.spin = 1.5
params.randomness = 5
params.randomnessPower = 3
params.insideColor = '#ff5588'
params.outsideColor = '#1b3984'

const gui = new GUI()

let pointsGeometry = null
let pointsMaterial = null
let points = null

const generateGalaxy = () => {
  // destroying old galaxies
  if (points != null) {
    pointsGeometry.dispose()
    pointsMaterial.dispose()
    scene.remove(points)
  }

  const positions = new Float32Array(params.count * 3)
  const colors = new Float32Array(params.count * 3)

  const stepAngleSize = Math.PI / params.branches
  let currentAngle = 0

  const insideColor = new Color(params.insideColor)
  const outsideColor = new Color(params.outsideColor)

  for (let i = 0; i < params.count * 3; i += 3) {
    // Positions of particles
    const nextAngle = currentAngle + stepAngleSize

    const dis = Math.random() * params.radius
    const spinAngle = params.spin * dis

    // randomly moving the particles from their base positions in +ve and -ve direction of all 3 axes
    const randomX = Math.pow(Math.random(), params.randomness) * (Math.random() < 0.5 ? 1 : -1)
    const randomY = Math.pow(Math.random(), params.randomness) * (Math.random() < 0.5 ? 1 : -1)
    const randomZ = Math.pow(Math.random(), params.randomness) * (Math.random() < 0.5 ? 1 : -1)

    positions[i] = Math.sin(nextAngle + spinAngle) * dis + randomX
    positions[i + 1] = randomY
    positions[i + 2] = Math.cos(nextAngle + spinAngle) * dis + randomZ

    currentAngle += stepAngleSize

    // Colors of particles
    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, dis / params.radius)
    colors[i] = mixedColor.r
    colors[i + 1] = mixedColor.g
    colors[i + 2] = mixedColor.b
  }

  pointsGeometry = new BufferGeometry()
  pointsGeometry.setAttribute('position', new BufferAttribute(positions, 3))
  pointsGeometry.setAttribute('color', new BufferAttribute(colors, 3))
  console.log(pointsGeometry)

  pointsMaterial = new PointsMaterial({
    size: params.size,
    sizeAttenuation: true,
    depthWrite: true,
    blending: AdditiveBlending,
    vertexColors: true,
  })

  points = new Points(pointsGeometry, pointsMaterial)
  scene.add(points)
}

generateGalaxy()

// Adding the control parameters
gui.add(params, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(params, 'size').min(0.01).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, 'radius').min(5).max(20).step(0.1).onFinishChange(generateGalaxy)
gui.add(params, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(params, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, 'randomness').min(0).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(params, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(params, 'outsideColor').onFinishChange(generateGalaxy)

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const camera = new PerspectiveCamera(90, size.width / size.height)
camera.position.set(0, 5, 3)

const canvas = document.querySelector('canvas.webgl')

const renderer = new WebGLRenderer({ canvas })

// Event for resizing the canvas on window resize
window.addEventListener('resize', () => {
  size.width = window.innerWidth
  size.height = window.innerHeight

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(size.width, size.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Event to Full Screen the window on Double Click
window.addEventListener('dblclick', () => {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

  if (!fullscreenElement) {
    if (canvas.requestFullscreen()) {
      canvas.requestFullscreen()
      return
    }

    canvas.webkitRequestFullscreen()
    return
  }

  if (document.exitFullscreen) {
    document.exitFullscreen()
    return
  }

  if (document.webkitExitFullScreen) {
    document.webkitExitFullScreen()
  }
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

let controls = new OrbitControls(camera, canvas)
// controls.enableZoom = false
controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05
renderer.render(scene, camera)

// Clock
const clock = new Clock()

// render function called on each frame
function render() {
  renderer.render(scene, camera)
  controls.update()

  requestAnimationFrame(render)
}

requestAnimationFrame(render)
