import { Computer, ComputerProperties } from './computer.js'
import Drawer from './drawer.js'
import { chooseComputerType, find, showAlert } from './utils.js'

export default class Supervisor {
  private selectedComputer: Computer | null = null
  private computers = new Array<Computer>()
  private drawer: Drawer

  private drawDeltaTime = 1000 / 60
  private updateDeltaTime = 250

  private panel = find<HTMLDivElement>('.computer-panel')
  private computerForm = new ComputerInformationForm(this.panel)

  // dynamic stats
  private neighborsList = find<HTMLUListElement>('#neighbors-list')
  private processesList = find<HTMLUListElement>('#processes-list')

  constructor() {
    const canvas = find<HTMLCanvasElement>('#fullscreen-canvas')
    canvas.onclick = this.onCanvasClick
    this.drawer = new Drawer(canvas)

    const button = find<HTMLButtonElement>("#apply-button")
    button.onclick = this.onFormApply

    setInterval(this.drawLoop, this.drawDeltaTime)
    setInterval(this.updateLoop, this.updateDeltaTime)
  }

  private drawLoop = () => {
    this.drawer.clear()
    this.drawer.drawGrid()
    for (const each of this.computers) {
      const points = this.getNeighborPoints(each)
      this.drawer.connectPoints(each.getPosition(), points, each === this.selectedComputer)
    }

    const selected = this.selectedComputer
    if (selected === null) return
    const points = this.getNeighborPoints(selected)
    this.drawer.connectPoints(selected.getPosition(), points, true)
  }

  private getNeighborPoints(computer: Computer) {
    const connected = computer
        .getNeighbors()
        .map(each => each.getPosition())
    return connected
  }

  private updateLoop = () => {
    for (const each of this.computers) {
      each.update()
    }
    this.updateProcessesList()
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
    this.onComputerClick(computer)
  }

  private onComputerClick = (computer: Computer) => {
    const currentRef = computer.getReference()
    if (this.selectedComputer === computer) {
      currentRef.classList.remove('active')
      this.selectedComputer = null
    } else {
      currentRef.classList.add('active')
      const prevRef = this.selectedComputer?.getReference()
      if (prevRef !== null) {
        prevRef?.classList.remove('active')
      }
      this.selectedComputer = computer
    }
    this.updateComputerPanel()
  }

  private updateComputerPanel() {
    if (this.selectedComputer === null) {
      this.panel.classList.add('hidden')
      return
    }
    this.computerForm.loadComputerProperties(this.selectedComputer.getProperties())
    this.updateProcessesList()
    this.updateNeighborsList()
    this.panel.classList.remove('hidden')
  }

  private onFormApply = () => {
    if (this.selectedComputer === null) return
    const maybeProps = this.computerForm.getComputerProperties()
    if (maybeProps instanceof Error) {
      const message = `Failed to apply properties: ${maybeProps.message}`
      showAlert(message)
      return
    }
    this.selectedComputer.setProperties(maybeProps)
  }

  private applyLengthToListElement(list: HTMLElement, length: number) {
    while (length > list.children.length) {
      list.append(document.createElement('li'))
    }
    while (length < list.children.length) {
      list.removeChild(list.lastElementChild!)
    }
  }

  private updateProcessesList() {
    if (this.selectedComputer === null) return
    const processes = this.selectedComputer.getProcesses()
    this.applyLengthToListElement(this.processesList, processes.length)
    var listElements = Array.from(this.processesList.children)
    for (let i = 0; i < processes.length; i++) {
      const element = listElements[i]
      const {name, workload} = processes[i]
      element.textContent = `${name} (${workload}%)`
      const color = ~~(100 - workload / 2);
      (element as HTMLElement).style.backgroundColor = `hsl(6, 100%, ${color}%)`
    }
  }

  private updateNeighborsList() {
    if (this.selectedComputer === null) return
    const neighbors = this.computers.filter(computer => computer !== this.selectedComputer)
    this.applyLengthToListElement(this.neighborsList, neighbors.length)
    const neighborsElements = Array.from(this.neighborsList.children)
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i]
      const element = neighborsElements[i] as HTMLElement
      element.textContent = neighbor.getName()
      if (this.selectedComputer.isConnected(neighbor)) {
        element.classList.add('connected')
      } else {
        element.classList.remove('connected')
      }
      // todo: onclick removes or adds connection
      element.onclick = () => {
        if (this.selectedComputer === null) {
          return
        }
        if (this.selectedComputer.isConnected(neighbor)) {
          element.classList.remove('connected')
          this.selectedComputer.disconnectFrom(neighbor)
          neighbor.disconnectFrom(this.selectedComputer)
        } else {
          element.classList.add('connected')
          this.selectedComputer.connectTo(neighbor)
          neighbor.connectTo(this.selectedComputer)
        }
      }
    }
  }
}

class ComputerInformationForm {
  private nameInput: HTMLInputElement
  private typeInput: HTMLSelectElement
  private workloadThresholdInput: HTMLInputElement
  private requestThresholdInput: HTMLInputElement
  private processCoefficientInput: HTMLInputElement

  constructor (
    private readonly root: HTMLElement,
  ) {
    this.nameInput = this.getInput('computer-name')
    this.typeInput = this.getInput('computer-type')
    this.workloadThresholdInput = this.getInput('workload-threshold')
    this.requestThresholdInput = this.getInput('request-threshold')
    this.processCoefficientInput = this.getInput('load-coefficient')
  }

  private getInput<T extends HTMLElement = HTMLInputElement>(id: string) {
    const element = this.root.querySelector('#' + id)
    if (element === null) {
      throw new Error(`Failed to find input with id "${id}"`)
    }
    return element as T
  }

  loadComputerProperties(props: ComputerProperties) {
    this.nameInput.value = props.name
    this.typeInput.value = props.computerType
    this.workloadThresholdInput.value = String(props.workloadThreshold)
    this.requestThresholdInput.value = String(props.requestThreshold)
    this.processCoefficientInput.value = String(props.processCoefficient)
  }

  getComputerProperties(): ComputerProperties | Error {
    const name = this.nameInput.value
    const computerType = this.getCheckedOption(this.typeInput)
    const workloadThreshold = this.getCheckedInteger(this.workloadThresholdInput)
    const requestThreshold = this.getCheckedInteger(this.requestThresholdInput)
    const processCoefficient = this.getCheckedInteger(this.processCoefficientInput)

    const errors = [
      name, computerType,
      workloadThreshold, requestThreshold,
      processCoefficient
    ].filter(( e ): e is Error => e instanceof Error)

    if (errors.length > 0) {
      return new Error(errors.map(err => err.message.toLowerCase()).join(', '))
    }

    return {
      name, computerType,
      workloadThreshold, requestThreshold,
      processCoefficient
    } as ComputerProperties
  }

  private getCheckedOption(select: HTMLSelectElement) {
    const value = select.value
    const optionElements = Array.from(select.querySelectorAll('option'))
    const options = optionElements.map(option => {
      return option.getAttribute("value")
    })
    if (options.includes(value)) {
      return value
    }
    return new Error(`Unacceptable option: ${value}`)
  }

  private getCheckedInteger(input: HTMLInputElement) {
    const value = input.value
    const name = input.getAttribute('name') ?? 'Unknown'
    if (!/^\d+$/.test(value)) {
      return new Error(`Not a positive integer: ${name}`)
    }
    const integer = Number(value)
    const min = Number(input.getAttribute('min') ?? '-Infinity')
    const max = Number(input.getAttribute('max') ?? 'Infinity')
    if (integer < min || integer > max) {
      return new Error(`Integer of ${name} is not in range ${min}...${max}`)
    }
    return integer
  }
}