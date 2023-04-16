import ComputerElement from './computer.js'
import { chooseComputerType, find } from './utils.js'

const canvas = find<HTMLCanvasElement>('#fullscreen-canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

canvas.onclick = async event => {
  const computerType = await chooseComputerType()
  if (computerType === null) return
  const {clientX, clientY} = event
  new ComputerElement(clientX, clientY, computerType)
}