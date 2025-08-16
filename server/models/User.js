const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'teacher', 'student', 'parent'),
    allowNull: false,
    defaultValue: 'student'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Address fields
  address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Role-specific fields
  studentId: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  grade: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  graduationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // Teacher-specific fields
  department: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  specialization: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // Parent-specific fields
  children: {
    type: DataTypes.JSON, // Array of student IDs
    allowNull: true
  },
  // Admin-specific fields
  permissions: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
      if (user.role === 'student' && !user.studentId) {
        user.studentId = await User.generateStudentId();
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.update({
      lockUntil: null,
      loginAttempts: 1
    });
  }
  
  const newLoginAttempts = this.loginAttempts + 1;
  const updates = { loginAttempts: newLoginAttempts };
  
  // Lock account after 5 failed attempts
  if (newLoginAttempts >= 5 && !this.isLocked()) {
    updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  }
  
  return await this.update(updates);
};

User.prototype.resetLoginAttempts = async function() {
  return await this.update({
    loginAttempts: 0,
    lockUntil: null
  });
};

User.prototype.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Static methods
User.generateStudentId = async function() {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await User.count({ where: { role: 'student' } });
  return `STU${year}${(count + 1).toString().padStart(4, '0')}`;
};

// Virtual fields (getters)
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.getAge = function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

module.exports = User;
