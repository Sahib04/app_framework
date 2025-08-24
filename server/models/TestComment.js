const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TestComment = sequelize.define('TestComment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isTeacherReply: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['testId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  TestComment.associate = (models) => {
    TestComment.belongsTo(models.Test, { as: 'test', foreignKey: 'testId' });
    TestComment.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  };

  return TestComment;
};
