const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  // Basic Information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },

  // Assessment Information
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: [true, 'Assessment is required']
  },
  assessmentType: {
    type: String,
    enum: ['exam', 'quiz', 'assignment', 'project', 'presentation', 'participation', 'homework', 'lab', 'midterm', 'final'],
    required: [true, 'Assessment type is required']
  },
  assessmentName: {
    type: String,
    required: [true, 'Assessment name is required'],
    trim: true
  },

  // Grade Details
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  maxScore: {
    type: Number,
    required: [true, 'Maximum score is required'],
    min: [1, 'Maximum score must be at least 1']
  },
  percentage: {
    type: Number,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'I', 'W', 'P', 'NP'],
    uppercase: true
  },
  gradePoints: {
    type: Number,
    min: [0, 'Grade points cannot be negative'],
    max: [4, 'Grade points cannot exceed 4']
  },

  // Weight and Category
  weight: {
    type: Number,
    default: 1,
    min: [0, 'Weight cannot be negative']
  },
  category: {
    type: String,
    enum: ['exams', 'assignments', 'participation', 'projects', 'quizzes', 'homework', 'labs'],
    required: [true, 'Category is required']
  },

  // Submission Details
  submittedAt: {
    type: Date
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  isLate: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: [0, 'Late penalty cannot be negative']
  },

  // Feedback and Comments
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  },
  comments: {
    type: String,
    maxlength: [1000, 'Comments cannot exceed 1000 characters']
  },
  rubric: [{
    criterion: String,
    score: Number,
    maxScore: Number,
    feedback: String
  }],

  // Status and Verification
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'published', 'disputed', 'revised'],
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String,
    maxlength: [500, 'Dispute reason cannot exceed 500 characters']
  },

  // Curving and Adjustments
  isCurved: {
    type: Boolean,
    default: false
  },
  curveAdjustment: {
    type: Number,
    default: 0
  },
  originalScore: {
    type: Number
  },
  adjustmentReason: {
    type: String,
    maxlength: [500, 'Adjustment reason cannot exceed 500 characters']
  },

  // Academic Period
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  semester: {
    type: String,
    enum: ['fall', 'spring', 'summer', 'winter'],
    required: [true, 'Semester is required']
  },
  term: {
    type: String,
    trim: true
  },

  // Attachments and Files
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculated percentage
gradeSchema.virtual('calculatedPercentage').get(function() {
  if (this.maxScore && this.maxScore > 0) {
    return Math.round((this.score / this.maxScore) * 100);
  }
  return this.percentage || 0;
});

// Virtual for grade status
gradeSchema.virtual('gradeStatus').get(function() {
  if (this.percentage >= 90) return 'excellent';
  if (this.percentage >= 80) return 'good';
  if (this.percentage >= 70) return 'satisfactory';
  if (this.percentage >= 60) return 'needs_improvement';
  return 'failing';
});

// Virtual for is passing
gradeSchema.virtual('isPassing').get(function() {
  return this.percentage >= 60;
});

// Indexes
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ student: 1, academicYear: 1, semester: 1 });
gradeSchema.index({ course: 1, assessment: 1 });
gradeSchema.index({ teacher: 1, gradedAt: 1 });
gradeSchema.index({ status: 1 });
gradeSchema.index({ assessmentType: 1 });
gradeSchema.index({ category: 1 });

// Compound indexes for efficient queries
gradeSchema.index({ student: 1, course: 1, assessmentType: 1 });
gradeSchema.index({ course: 1, assessment: 1, status: 1 });

// Pre-save middleware to calculate percentage and letter grade
gradeSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.score !== undefined && this.maxScore && this.maxScore > 0) {
    this.percentage = Math.round((this.score / this.maxScore) * 100);
  }

  // Calculate letter grade based on percentage
  if (this.percentage !== undefined) {
    this.letterGrade = this.calculateLetterGrade(this.percentage);
    this.gradePoints = this.calculateGradePoints(this.letterGrade);
  }

  // Apply late penalty
  if (this.isLate && this.latePenalty > 0) {
    this.score = Math.max(0, this.score - this.latePenalty);
  }

  next();
});

// Instance method to calculate letter grade
gradeSchema.methods.calculateLetterGrade = function(percentage) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
};

// Instance method to calculate grade points
gradeSchema.methods.calculateGradePoints = function(letterGrade) {
  const gradePointMap = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0, 'I': 0.0, 'W': 0.0, 'P': 0.0, 'NP': 0.0
  };
  return gradePointMap[letterGrade] || 0.0;
};

// Static method to find student grades
gradeSchema.statics.findStudentGrades = function(studentId, courseId = null, academicYear = null, semester = null) {
  const query = { student: studentId };
  
  if (courseId) query.course = courseId;
  if (academicYear) query.academicYear = academicYear;
  if (semester) query.semester = semester;
  
  return this.find(query)
    .populate('course assessment teacher')
    .sort({ gradedAt: -1 });
};

// Static method to calculate GPA
gradeSchema.statics.calculateGPA = function(studentId, academicYear = null, semester = null) {
  const query = { student: studentId };
  
  if (academicYear) query.academicYear = academicYear;
  if (semester) query.semester = semester;
  
  return this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      totalGradePoints: { $sum: '$gradePoints' },
      totalCredits: { $sum: 1 },
      averagePercentage: { $avg: '$percentage' }
    }}
  ]);
};

// Instance method to publish grade
gradeSchema.methods.publishGrade = function() {
  this.isPublished = true;
  this.publishedAt = new Date();
  this.status = 'published';
  return this.save();
};

// Instance method to dispute grade
gradeSchema.methods.disputeGrade = function(reason) {
  this.isDisputed = true;
  this.disputeReason = reason;
  this.status = 'disputed';
  return this.save();
};

module.exports = mongoose.model('Grade', gradeSchema);
