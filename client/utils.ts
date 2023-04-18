import { ComputerType } from './computer.js'

export function castToComputerType(value: string) {
  if (!['Min', 'Max', 'MinMax'].includes(value)) {
    throw new Error(`Unknown computer type: ${value}`)
  }
  return value as ComputerType
}

export const chooseComputerType = () => new Promise<ComputerType | null>((resolve, reject) => {
  const panel = document.querySelector<HTMLDivElement>('.choose-panel')
  if (panel === null) {
    reject('Failed to choose computer type: no panel was found')
    return
  }
  panel.onclick = () => {
    panel.classList.add('hidden')
    resolve(null)
  }
  const figures = panel.querySelectorAll('figure')
  figures.forEach(figure => {
    const computerType = figure.getAttribute('computerType')
    if (computerType === null) {
      console.warn('No computerType attribute was specified')
      return
    }
    figure.onclick = event => {
      event.stopPropagation()
      panel.classList.add('hidden')
      try {
        const casted = castToComputerType(computerType)
        resolve(casted)
      } catch {
        reject(`Unknown computer type: ${computerType}`)
      }
    }
  })
  panel.classList.remove('hidden')
})

export function find<T extends Element = Element>(query: string) {
  const maybeElement = document.querySelector(query)
  if (maybeElement === null) {
    throw new Error(`Failed to find element "${query}"`)
  }
  return maybeElement as T
}

export function eachPair<T>(array: T[]): Array<readonly [T, T]> {
  const output = []
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      output.push([array[i], array[j]] as const)
    }
  }
  return output
}

export function randInt(start: number, end: number) {
  const delta = end - start + 1
  const value = start + Math.random() * delta
  return ~~value
}

export function randomElement<T>(array: T[]) {
  const index = randInt(0, array.length - 1)
  return array[index]
}

export function maybe<T>(probability: number, action: () => T): T | null {
  if (randInt(1, 100) <= probability) {
    return action()
  }
  return null
}

export function distance([x1, y1]: readonly [number, number], [x2, y2]: readonly [number, number]) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

export function maxBy<T>(array: T[], selector: (value: T) => number) {
  let max = -Infinity
  let maxElement: T | null = null
  for (const each of array) {
    const comp = selector(each)
    if (comp > max) {
      max = comp
      maxElement = each
    }
  }
  return maxElement
}

export function minBy<T>(array: T[], selector: (value: T) => number) {
  let min = Infinity
  let minElement: T | null = null
  for (const each of array) {
    const comp = selector(each)
    if (comp < min) {
      min = comp
      minElement = each
    }
  }
  return minElement
}

export function remove<T>(array: T[], element: T) {
  const index = array.indexOf(element)
  if (index === -1) return false
  array.splice(index, 1)
  return true
}