import Sequelize from "sequelize";
import { Table, Model, Column, DataType, HasMany, HasOne } from "sequelize-typescript";

@Table({
  tableName: "mis",
  paranoid: true,
  timestamps: true,
  hooks: {
    // afterDestroy: (instance, options) => {
    //   instance.getUserRoles().then((userRoles) => {
    //     userRoles.forEach(userRole => {
    //       userRole.destroy(options);
    //     });
    //   }

    //   ); // Softdelete on userrole table
    // }
  }
})

export class Mis extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue:DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  report_type!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  data1!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  data2!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  data3!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  data4!: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  data5!: string;
 
  @Column({
    type: DataType.ENUM('Active','Inactive','Deleted'),
    allowNull: false,
  })
  status!: string;
  

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  createdBy!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  updatedBy!: string;
  
  
  
  
  // createdAt, lastUpdatedAt and deletedAt managed by Sequelize
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  })
  createdAt!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  updatedAt!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  deletedAt!: string | null;


}