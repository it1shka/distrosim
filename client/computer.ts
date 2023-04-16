import { ComputerType } from './utils.js'

export default class Computer {
  private ref: HTMLElement
  private _x = -1
  private _y = -1

  get x() { return this._x }
  private set x(value: number) {
    this._x = value
    this.ref.style.left = `${value - this.ref.clientWidth / 2}px`
  }

  get y() { return this._y }
  private set y(value: number) {
    this._y = value
    this.ref.style.top = `${value - this.ref.clientHeight / 2}px`
  }

  constructor (
    positionX: number,
    positionY: number,
    readonly computerType: ComputerType
  ) {
    this.ref = this.createRef()
    this.x = positionX
    this.y = positionY
    this.enableDragging()
    document.body.appendChild(this.ref)
  }

  private createRef() {
    const ref = document.createElement('figure')
    ref.classList.add('computer', this.computerType)
    const image = document.createElement('img')
    image.setAttribute('draggable', 'false')
    ref.appendChild(image)
    const caption = document.createElement('figcaption')
    ref.appendChild(caption)
    const [imageSource, captionText] = this.getImageAndCaption()
    image.src = imageSource
    caption.textContent = captionText
    return ref
  }

  private getImageAndCaption() {
    switch (this.computerType) {
      case ComputerType.MIN: return ['/images/min_comp.png', 'Min Computer']
      case ComputerType.MAX: return ['/images/max_comp.png', 'Max Computer']
      case ComputerType.MINMAX: return ['/images/minmax_comp.png', 'MinMax Computer']
    }
  }

  private enableDragging() {
    this.ref.addEventListener('mousedown', () => {
      document.addEventListener('mousemove', this.onDrag)
    })
    this.ref.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', this.onDrag)
    })
  }

  private onDrag = ({clientX, clientY}: MouseEvent) => {
    this.x = clientX
    this.y = clientY
  }
}