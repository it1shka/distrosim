export const enum ComputerType {
  MIN = 'Min',
  MAX = 'Max', 
  MINMAX = 'MinMax'
}

function getComputerImageAndCaption(computerType: ComputerType) {
  switch (computerType) {
    case ComputerType.MIN: return ['/images/min_comp.png', 'Min Computer']
    case ComputerType.MAX: return ['/images/max_comp.png', 'Max Computer']
    case ComputerType.MINMAX: return ['/images/minmax_comp.png', 'MinMax Computer']
  }
}

function makeNodeDraggable(node: HTMLElement) {
  const tracker = ({clientX, clientY}: MouseEvent) => { 
    setComputerNodePosition(node, clientX, clientY) 
  }
  node.onmousedown = () => {
    node.style.zIndex = '1'
    document.addEventListener('mousemove', tracker)
  }
  node.onmouseup = () => {
    node.style.zIndex = '0'
    document.removeEventListener('mousemove', tracker)
  }
}

function createComputerNode(computerType: ComputerType) {
  const ref = document.createElement('figure')
  ref.classList.add('computer', computerType)
  const image = document.createElement('img')
  image.setAttribute('draggable', 'false')
  ref.appendChild(image)
  const caption = document.createElement('figcaption')
  ref.appendChild(caption)
  const [imageSource, captionText] = getComputerImageAndCaption(computerType)
  image.src = imageSource
  caption.textContent = captionText
  document.body.appendChild(ref)
  makeNodeDraggable(ref)
  return ref
}

function setComputerNodePosition(node: HTMLElement, x: number, y: number) {
  node.style.left = `${x - node.clientWidth / 2}px`
  node.style.top = `${y - node.clientHeight / 2}px`
}

function getComputerNodePosition(node: HTMLElement) {
  const { left, top } = node.style
  const [cornerX, cornerY] = [left, top].map(e => Number(e.slice(0, e.length - 2)))
  return [cornerX + node.clientWidth / 2, cornerY + node.clientHeight / 2] as const
}

export class Computer {
  private element: HTMLElement

  get position() {
    return getComputerNodePosition(this.element)
  }

  constructor (
    private readonly computerType: ComputerType,
    positionX: number,
    positionY: number,
  ) {
    this.element = createComputerNode(computerType)
    setComputerNodePosition(this.element, positionX, positionY)
  }

}
