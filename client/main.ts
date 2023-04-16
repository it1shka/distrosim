import ComputerElement from './computer.js'
import Drawer from './drawer.js'
import { chooseComputerType, find } from './utils.js'

const computers = new Array<ComputerElement>()

const canvas = find<HTMLCanvasElement>('#fullscreen-canvas')
const drawer = new Drawer(canvas)

setInterval(() => {
  const positions = computers.map(({x, y}) => [x, y] as const)
  drawer.connectPoints(positions)
}, 1000 / 60)

canvas.onclick = async event => {
  const computerType = await chooseComputerType()
  if (computerType === null) return
  const {clientX, clientY} = event
  const computer = new ComputerElement(clientX, clientY, computerType)
  computers.push(computer)
}