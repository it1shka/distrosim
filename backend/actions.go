package backend

import "errors"

func saveNetwork(scheme *NetworkDataScheme) error {
	network := DistributedNetworkModel{
		Name:        scheme.Network.Name,
		AuthorName:  scheme.Network.AuthorName,
		Description: scheme.Network.Description,
	}
	if err := database.Create(&network).Error; err != nil {
		return err
	}

	computers := make([]ComputerModel, len(scheme.Computers))
	for i, computerData := range scheme.Computers {
		computer := ComputerModel{
			NetworkID:          network.ID,
			Index:              uint(i),
			ComputerType:       computerData.ComputerType,
			Name:               computerData.Name,
			WorkloadThreshold:  computerData.WorkloadThreshold,
			RequestThreshold:   computerData.RequestThreshold,
			ProcessCoefficient: computerData.ProcessCoefficient,
		}
		computers[i] = computer
	}
	if err := database.CreateInBatches(computers, 100).Error; err != nil {
		return err
	}

	connections := make([]ConnectionModel, len(scheme.Connections))
	for i, connectionData := range scheme.Connections {
		connection := ConnectionModel{
			NetworkID:   network.ID,
			FirstIndex:  connectionData.FirstIndex,
			SecondIndex: connectionData.SecondIndex,
		}
		connections[i] = connection
	}
	if err := database.CreateInBatches(connections, 100).Error; err != nil {
		return err
	}

	return nil
}

const pageSize = 10

func getPage(page int) (networks []DistributedNetworkModel, err error) {
	networks, err = nil, nil
	offset := (page - 1) * pageSize
	result := database.Offset(offset).Limit(pageSize).Find(&networks)
	if result.Error != nil {
		err = result.Error
	}
	return
}

func getNetwork(id uint) (*DistributedNetworkModel, error) {
	var network DistributedNetworkModel
	if err := database.Find(&network, id).Error; err != nil {
		return nil, err
	}
	return &network, nil
}

func getNetworkById(id uint) (*NetworkDataScheme, error) {
	var networkData DistributedNetworkModel
	if err := database.Find(&networkData, id).Error; err != nil {
		return nil, err
	}

	var computersData []ComputerModel
	result := database.Find(&computersData, "network_id = ?", networkData.ID)
	if result.Error != nil {
		return nil, result.Error
	}

	var connectionsData []ConnectionModel
	result = database.Find(&connectionsData, "network_id = ?", networkData.ID)
	if result.Error != nil {
		return nil, result.Error
	}

	networkScheme := NetworkInformationScheme{
		Name:        networkData.Name,
		AuthorName:  networkData.AuthorName,
		Description: networkData.Description,
	}

	computersScheme := make([]ComputerScheme, len(computersData))
	for _, each := range computersData {
		computerScheme := ComputerScheme{
			Name:               each.Name,
			ComputerType:       each.ComputerType,
			WorkloadThreshold:  each.WorkloadThreshold,
			RequestThreshold:   each.RequestThreshold,
			ProcessCoefficient: each.ProcessCoefficient,
		}
		if each.Index >= uint(len(computersScheme)) {
			return nil, errors.New("wrong computer index")
		}
		computersScheme[each.Index] = computerScheme
	}

	connectionsScheme := make([]ConnectionScheme, len(connectionsData))
	for i, each := range connectionsData {
		connectionsScheme[i] = ConnectionScheme{
			FirstIndex:  each.FirstIndex,
			SecondIndex: each.SecondIndex,
		}
	}

	return &NetworkDataScheme{
		Network:     networkScheme,
		Computers:   computersScheme,
		Connections: connectionsScheme,
	}, nil
}
