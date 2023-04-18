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