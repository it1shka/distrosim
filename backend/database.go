package backend

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var database *gorm.DB

func DatabaseConnect(databaseFileName string) error {
	db, err := gorm.Open(sqlite.Open(databaseFileName), &gorm.Config{})
	if err != nil {
		return err
	}
	database = db
	db.AutoMigrate(&ComputerModel{}, &DistributedNetworkModel{})
	return nil
}

// MODELS:

type ComputerModel struct {
	NetworkID          uint `gorm:"primaryKey"`
	Name               string
	WorkloadThreshold  uint
	RequestThreshold   uint
	ProcessCoefficient uint
}

type DistributedNetworkModel struct {
	ID          uint `gorm:"primaryKey;autoIncrement"`
	Name        string
	AuthorName  string
	Description *string
}

func saveNetwork(data *DistributedNetworkData) error {
	network := DistributedNetworkModel{
		Name:        data.Name,
		AuthorName:  data.AuthorName,
		Description: data.Description,
	}
	if err := database.Create(&network).Error; err != nil {
		return err
	}
	networkID := network.ID
	for _, each := range data.Computers {
		computer := ComputerModel{
			NetworkID:          networkID,
			Name:               each.Name,
			WorkloadThreshold:  each.WorkloadThreshold,
			RequestThreshold:   each.RequestThreshold,
			ProcessCoefficient: each.ProcessCoefficient,
		}
		if err := database.Create(&computer).Error; err != nil {
			return err
		}
	}
	return nil
}
