import { eachPair } from './utils.js'

export default class Drawer {
  private ctx: CanvasRenderingContext2D

  private gridColor = 'rgb(222, 222, 222)'
  private gridGap = 40
  private gridOffset = 0
  private offsetSpeed = 0.25

  constructor (
    private readonly canvas: HTMLCanvasElement
  ) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
      throw new Error('Failed to load canvas context 2D')
    }
    this.ctx = ctx
  }

  private clear() {
    this.ctx.fillStyle = 'rgba(0,0,0,0)'
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  private drawGrid() {
    this.ctx.strokeStyle = this.gridColor
    for (let x = this.gridOffset; x < this.canvas.width; x += this.gridGap) {
      this.drawLine(x, 0, x, this.canvas.height)
    }
    for (let y = this.gridOffset; y < this.canvas.height; y += this.gridGap) {
      this.drawLine(0, y, this.canvas.width, y)
    }
    this.gridOffset += this.offsetSpeed
    this.gridOffset %= this.gridGap
  }

  connectPoints(points: Array<readonly [number, number]>) {
    this.clear()
    this.drawGrid()

    this.ctx.strokeStyle = 'rgb(64, 46, 14)'
    for (const [a, b] of eachPair(points)) {
      this.drawLine(...a, ...b)
    }
  }
}