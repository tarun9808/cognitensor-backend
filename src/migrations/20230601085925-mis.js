'use strict';

module.exports = {
  async up (queryInterface, sequelize) {
    try{
     queryInterface.createTable('mis',
      {
        id: {
          type: sequelize.UUID,
          defaultValue: sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        report_type: {
          type: sequelize.STRING,
          allowNull: false,
        },
        name: {
          type: sequelize.STRING,
          allowNull: true,
        },
        data1: {
          type: sequelize.STRING,
          allowNull: true,
        },
        data2: {
          type: sequelize.STRING,
          allowNull: true,
        },
        data3: {
          type: sequelize.STRING,
          allowNull: true,
        },  
        data4: {
          type: sequelize.STRING,
          allowNull: true,
        },
        data5: {
          type: sequelize.STRING,
          allowNull: true,
        },
        status: {
          type: sequelize.STRING,
          allowNull: true,
        },
        createdBy:{
          type: sequelize.STRING,
          allowNull: true,
        }, 
        updatedBy:{
          type: sequelize.STRING,
          allowNull: true,
        },
        // createdAt, lastUpdatedAt and deletedAt managed by Sequelize
        createdAt: {
          type: sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: sequelize.DATE,
          allowNull: false,
        },
        deletedAt: {
          type: sequelize.DATE,
          allowNull: true,
        },
      }
        )
    }catch(error)
    {
      console.log("error at creating mis table ",error)
    }
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.dropTable('mis');
  }
};
