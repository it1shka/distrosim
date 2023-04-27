import { ComputerType } from './computer.js'
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