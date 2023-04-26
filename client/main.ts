import './supervisor.js'
import { find, getNetworkDetails, showAlert } from './utils.js'

// here will be logic dedicated to saving / loading networks

const saveButton = find<HTMLButtonElement>('#save-button')
saveButton.onclick = async () => {
  const details = await getNetworkDetails()
  showAlert(JSON.stringify(details))
}