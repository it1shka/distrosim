import { Computer } from './computer.js'
import Drawer from './drawer.js'
import { chooseComputerType, find } from './utils.js'

const computers = new Array<Computer>()

const canvas = find<HTMLCanvasElement>('#fullscreen-canvas')
const drawer = new Drawer(canvas)

setInterval(() => {
  const positions = computers.map(computer => computer.getPosition())
  drawer.clear()
  drawer.drawGrid()
  drawer.connectPoints(positions, false)
}, 1000 / 60)

canvas.onclick = async event => {
  const computerType = await chooseComputerType()
  if (computerType === null) return
  const {clientX, clientY} = event
  const computer = new Computer(computerType, clientX, clientY)
  computers.push(computer)
}