export const enum ComputerType {
  MIN = 'Min',
  MAX = 'Max', 
  MINMAX = 'MinMax'
}

export function castToComputerType(value: string) {
  if (!['Min', 'Max', 'MinMax'].includes(value)) {
    throw new Error(`Unknown computer type: ${value}`)
  }
  return value as ComputerType
}

export const chooseComputerType = () => new Promise<ComputerType>((resolve, reject) => {
  const panel = document.querySelector('.choose-panel')
  if (panel === null) {
    reject('Failed to choose computer type: no panel was found')
    return
  }
  const figures = panel.querySelectorAll('figure')
  figures.forEach(figure => {
    const computerType = figure.getAttribute('computerType')
    if (computerType === null) {
      console.warn('No computerType attribute was specified')
      return
    }
    figure.onclick = () => {
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