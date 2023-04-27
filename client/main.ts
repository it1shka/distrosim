import { Computer, ComputerType } from './computer.js'
import Supervisor from './supervisor.js'
import { find, getNetworkDetails, postRequest, showAlert } from './utils.js'

// here will be logic dedicated to saving / loading networks

interface NetworkDataScheme {
  network: {
    name: string
    authorName: string
    description?: string
  }

  computers: Array<{
    name: string
    computerType: ComputerType
    workloadThreshold: number
    requestThreshold: number
    processCoefficient: number
    positionX: number
    positionY: number
  }>

  connections: Array<{
    firstIndex: number
    secondIndex: number
  }>
}

const saveButton = find<HTMLButtonElement>('#save-button')
saveButton.onclick = async () => {
  try {
    const networkData = await getNetworkDetails()
    if (networkData === null) return
    const computersData = Supervisor.getComputerData()
    const connectionsData = Supervisor.getConnectionsData()

    const scheme: NetworkDataScheme = {
      network: networkData,
      computers: computersData,
      connections: connectionsData
    }

    // and then we should send it to server
    // TODO:
    const responce = await postRequest('/network/new', scheme)
    if (responce.status >= 200 && responce.status < 300) {
      showAlert('Successfully saved your work!')
      return
    }
    const { error } = await responce.json() as { error: string }
    showAlert(error)
  } catch (_) {
    showAlert('Failed to save your network!')
  }
}

async function initialize() {
  try {
    const urlValue = document.location.toString()
    const url = new URL(urlValue)
    const params = url.searchParams
    const id = params.get("id")
    if (id === null) return

    const result = await fetch(`/network/${id}`)
    if (result.status < 200 || result.status >= 300) {
      const { error } = await result.json() as { error: string }
      showAlert(`Failed to retrieve network: ${error}`)
      return
    }

    const scheme = await result.json() as NetworkDataScheme
    showAlert(`Loaded ${scheme.network.name} by ${scheme.network.authorName}`)

    mount(scheme.computers, scheme.connections)
  } catch (_) {
    showAlert('Initialization failed')
  }
}

function mount(computers: NetworkDataScheme['computers'], connections: NetworkDataScheme['connections']) {
  const computerObjects = computers.map(data => {
    const {
      name, computerType, 
      workloadThreshold, requestThreshold, 
      processCoefficient,
      positionX, positionY
    } = data

    const computer = new Computer(computerType, positionX, positionY)
    computer.setProperties({
      name, workloadThreshold, requestThreshold,
      processCoefficient, computerType
    })

    return computer
  })

  connections.forEach(({ firstIndex, secondIndex }) => {
    const a = computerObjects[firstIndex]
    const b = computerObjects[secondIndex]

    a.connectTo(b)
    b.connectTo(a)
  })

  computerObjects.forEach(obj => Supervisor.addComputer(obj))
}

initialize()