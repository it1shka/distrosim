import { Process, generator } from './process.js'
import { distance, maxBy, maybe, minBy, remove } from './utils.js'

export const enum ComputerType {
  MIN = 'Min',
  MAX = 'Max', 
  MINMAX = 'MinMax'
}

class ComputerNode {
  private root: HTMLElement
  private nameCaption: HTMLElement
  private image: HTMLImageElement
  private imageCaption: HTMLElement
  private percentCaption: HTMLElement

  private positionX!: number
  private positionY!: number

  private static getComputerImageAndCaption(computerType: ComputerType) {
    switch (computerType) {
      case ComputerType.MIN: return ['/images/min_comp.png', 'Min Computer']
      case ComputerType.MAX: return ['/images/max_comp.png', 'Max Computer']
      case ComputerType.MINMAX: return ['/images/minmax_comp.png', 'MinMax Computer']
    }
  }

  constructor (
    computerType: ComputerType,
    positionX: number,
    positionY: number
  ) {
    // create root
    this.root = document.createElement('figure')
    this.root.classList.add('computer', computerType)

    // create name caption
    this.nameCaption = document.createElement('figcaption')
    this.nameCaption.textContent = 'New Computer'
    this.root.appendChild(this.nameCaption)

    // create image
    this.image = document.createElement('img')
    this.image.setAttribute('draggable', 'false')
    this.root.appendChild(this.image)

    // create image caption
    this.imageCaption = document.createElement('figcaption')
    this.root.appendChild(this.imageCaption)

    // create a caption for percents
    this.percentCaption = document.createElement('figcaption')
    this.percentCaption.textContent = '0%'
    this.root.appendChild(this.percentCaption)

    // setting up the node
    document.body.appendChild(this.root)
    this.setComputerType(computerType)
    this.makeDraggable()
    this.setPosition(positionX, positionY)
  }

  private makeDraggable() {
    this.root.onmousedown = () => {
      this.root.style.zIndex = '1'
      window.addEventListener('mousemove', this.onDrag)
    }
    this.root.onmouseup = () => {
      this.root.style.zIndex = '0'
      window.removeEventListener('mousemove', this.onDrag)
    }
  }

  private onDrag = ({clientX, clientY}: MouseEvent) => {
    this.setPosition(clientX, clientY)
  }

  // getters and setters

  getReference() {
    return this.root
  }

  setComputerType(computerType: ComputerType) {
    const [imageSource, imageCaptionText] = ComputerNode.getComputerImageAndCaption(computerType)
    this.image.src = imageSource
    this.imageCaption.textContent = imageCaptionText
  }

  getPosition() {
    return [this.positionX, this.positionY] as const
  }

  private setPosition(x: number, y: number) {
    this.positionX = x
    this.positionY = y
    this.root.style.left = `${x - this.root.clientWidth / 2}px`
    this.root.style.top = `${y - this.root.clientHeight / 2}px`
  }

  setWorkload(workload: number) {
    this.percentCaption.textContent = `${workload}%`
    const color = ~~(100 - workload / 2)
    this.root.style.backgroundColor = `hsl(6, 100%, ${color}%)`
  }

  setName(name: string) {
    this.nameCaption.textContent = name
  }

  remove() {
    document.body.removeChild(this.root)
  }
}

export interface ComputerProperties {
  computerType: ComputerType
  name: string
  workloadThreshold: number
  requestThreshold: number
  processCoefficient: number
}

export class Computer {
  private node: ComputerNode
  private props: ComputerProperties
  private neighbors = new Set<Computer>()
  private processes = new Array<Process>()
  private workload = 0

  // getters
  getProperties() { return {...this.props}         }
  getNeighbors()  { return [...this.neighbors]     }
  getProcesses()  { return [...this.processes]     }
  getWorkload()   { return this.workload           }
  getPosition()   { return this.node.getPosition() }
  getReference()  { return this.node.getReference()}
  getName()       { return `${this.props.name} (${this.props.computerType})` }
  
  constructor (
    computerType: ComputerType,
    positionX: number,
    positionY: number
  ) {
    this.node = new ComputerNode(computerType, positionX, positionY);
    this.props = {
      computerType,
      name: 'New Computer',
      workloadThreshold: 20,
      requestThreshold: 5,
      processCoefficient: 2
    }
  }

  // method to update computer from UI
  setProperties(newProps: ComputerProperties) {
    this.props = newProps
    this.node.setName(newProps.name)
    this.node.setComputerType(newProps.computerType)
  }

  // some functions to connect/disconnect to neighbors
  connectTo(computer: Computer) {
    this.neighbors.add(computer)
  }

  isConnected(computer: Computer) {
    return this.neighbors.has(computer)
  }

  disconnectFrom(computer: Computer) {
    this.neighbors.delete(computer)
  }

  // main method for updating
  update() {
    this.processes.forEach(process => process.execute())
    this.workload = this.processes
      .map(process => process.workload)
      .reduce((a, b) => a + b, 0)
    this.node.setWorkload(this.workload)
    this.processes = this.processes.filter(process => process.active)
    maybe(this.props.processCoefficient, () => {
      const process = generator.getRandomProcess()
      this.processes.push(process)
    })
    this.balance()
  }

  // additional functions
  getRequestNeighbors() {
    return Array.from(this.neighbors)
      .sort((a, b) => {
        const p = this.getPosition()
        const ad = distance(a.getPosition(), p)
        const bd = distance(b.getPosition(), p)
        return ad - bd
      })
      .slice(0, this.props.requestThreshold)
  }

  forcedProcess(process: Process) {
    this.processes.push(process)
  }

  dispose() {
    this.node.remove()
    this.neighbors.forEach(computer => {
      computer.disconnectFrom(this)
      this.disconnectFrom(computer)
    })
    this.neighbors.clear()
    while (this.processes.length > 0) {
      this.processes.pop()
    }
  }

  requestSendProcess(process: Process): boolean {
    const maxThreshold = 100 - this.props.workloadThreshold
    if (this.workload + process.workload > maxThreshold) {
      return false
    }
    this.processes.push(process)
    return true
  }

  requestReceiveProcess(expectedWorkload: number): Process | null {
    const type = this.props.computerType
    if ((type === ComputerType.MIN || type === ComputerType.MINMAX) && this.workload <= this.props.workloadThreshold) {
      return null
    }
    const processes = this.processes
      .filter(process => process.workload <= expectedWorkload)
    const bestProcess = maxBy(processes, process => process.workload)
    remove(processes, bestProcess)
    return bestProcess
  }

  // function for balancing workload
  private balance() {
    const type = this.props.computerType
    if (type === ComputerType.MIN || type === ComputerType.MINMAX) {
      this.balanceMin()
    }
    if (type === ComputerType.MAX || type === ComputerType.MINMAX) {
      this.balanceMax()
    }
  }

  private balanceMin() {
    const minThreshold = this.props.workloadThreshold
    if (this.workload >= minThreshold) return
    for (const each of this.getRequestNeighbors()) {
      const maybeProcess = each.requestReceiveProcess(minThreshold - this.workload)
      if (maybeProcess != null) {
        this.processes.push(maybeProcess)
        break
      }
    }
  }

  private balanceMax() {
    const maxThreshold = 100 - this.props.workloadThreshold
    if (this.workload <= maxThreshold) return
    const minimal = minBy(this.processes, process => process.workload)
    if (minimal === null) return
    for (const each of this.getRequestNeighbors()) {
      if (each.requestSendProcess(minimal)) {
        remove(this.processes, minimal)
        break
      }
    }
  }
}
