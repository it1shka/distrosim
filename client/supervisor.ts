import { Computer } from './computer.js'
import Drawer from './drawer.js'
import { chooseComputerType, find } from './utils.js'

export default class Supervisor {
  private selectedComputer: Computer | null = null
  private computers = new Array<Computer>()
  private drawer: Drawer

  private drawDeltaTime = 1000 / 60
  private updateDeltaTime = 250

  constructor() {
    const canvas = find<HTMLCanvasElement>('#fullscreen-canvas')
    canvas.onclick = this.onCanvasClick
    this.drawer = new Drawer(canvas)

    setInterval(this.drawLoop, this.drawDeltaTime)
    setInterval(this.updateLoop, this.updateDeltaTime)
  }

  private drawLoop = () => {
    this.drawer.clear()
    this.drawer.drawGrid()
    for (const each of this.computers) {
      const points = this.getJoinedPoints(each)
      this.drawer.connectPoints(points)
    }
    if (this.selectedComputer === null) return

    const selectedPoints = this.getJoinedPoints(this.selectedComputer)
    const origin = selectedPoints[0]
    for (let i = 1; i < selectedPoints.length; i++) {
      this.drawer.connectPoints([ selectedPoints[i], origin ], true)
    }
  }

  private getJoinedPoints(computer: Computer) {
    const connected = computer
        .getNeighbors()
        .map(each => each.getPosition())
    connected.unshift(computer.getPosition())
    return connected
  }

  private updateLoop = () => {
    for (const each of this.computers) {
      each.update()
    }
  }

  private onCanvasClick = async ({clientX, clientY}: MouseEvent) => {
    const computerType = await chooseComputerType()
    if (computerType === null) return
    const computer = new Computer(computerType, clientX, clientY)

    // just for a test right now
    for (const each of this.computers) {
      computer.connectTo(each)
      each.connectTo(computer)
    }

    computer.getReference()
      .addEventListener('dblclick', () => this.onComputerClick(computer))
    this.computers.push(computer)
  }

  private onComputerClick = (computer: Computer) => {
    if (this.selectedComputer === computer) {
      this.selectedComputer = null
    } else {
      this.selectedComputer = computer
    }
  }
}