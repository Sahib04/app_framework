const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TestSubmission = sequelize.define('TestSubmission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('submitted', 'graded', 'late'),
      defaultValue: 'submitted'
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    testId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Tests',
        key: 'id'
      }
    },
    studentId: {
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
        fields: ['testId']
      },
      {
        fields: ['studentId']
      },
      {
        fields: ['status']
      }
    ]
  });

  TestSubmission.associate = (models) => {
    TestSubmission.belongsTo(models.Test, { as: 'test', foreignKey: 'testId' });
    TestSubmission.belongsTo(models.User, { as: 'student', foreignKey: 'studentId' });
  };

  return TestSubmission;
};
