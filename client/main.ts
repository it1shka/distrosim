import Computer from './computer.js'
import { chooseComputerType, find } from './utils.js'

const canvas = find<HTMLCanvasElement>('#fullscreen-canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const spawnOffset = 60

canvas.onclick = async event => {
  const computerType = await chooseComputerType()
  const {clientX, clientY} = event
  new Computer(clientX - spawnOffset, clientY - spawnOffset, computerType)
}