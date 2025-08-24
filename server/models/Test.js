const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Test = sequelize.define('Test', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topic: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    totalMarks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100
      }
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false,
      validate: {
        min: 15,
        max: 300
      }
    },
    announcementDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    conductDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'active', 'completed', 'cancelled'),
      defaultValue: 'upcoming'
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['teacherId']
      },
      {
        fields: ['subject']
      },
      {
        fields: ['conductDate']
      },
      {
        fields: ['status']
      }
    ]
  });

  Test.associate = (models) => {
    Test.belongsTo(models.User, { as: 'teacher', foreignKey: 'teacherId' });
    Test.hasMany(models.TestComment, { as: 'comments', foreignKey: 'testId' });
    Test.hasMany(models.TestSubmission, { as: 'submissions', foreignKey: 'testId' });
  };

  return Test;
};
