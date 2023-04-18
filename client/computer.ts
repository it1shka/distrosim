import { Process } from './process.js'

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
    this.root.style.backgroundColor = `hsv(10, ${workload}%, 100%)`
  }

  setName(name: string) {
    this.nameCaption.textContent = name
  }
}

interface ComputerProperties {
  computerType: ComputerType
  name: string
  workloadThreshold: number
  requestThreshold: number
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
      requestThreshold: 5
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

  disconnectFrom(computer: Computer) {
    this.neighbors.delete(computer)
  }

  // main method for updating
  update() {
    
  }
}
