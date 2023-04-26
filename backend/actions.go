package backend

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
