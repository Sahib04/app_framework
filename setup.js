const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import database and models
const { sequelize, testConnection } = require('./server/config/database');
const User = require('./server/models/User');
const Course = require('./server/models/Course');
const Subject = require('./server/models/Subject');

// Sample data
const sampleUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@school.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1234567890',
    isEmailVerified: true,
    isActive: true,
    adminPermissions: ['user_management', 'course_management', 'financial_management', 'system_config'],
    adminDepartment: 'Administration'
  },
  {
    firstName: 'John',
    lastName: 'Teacher',
    email: 'teacher@school.com',
    password: 'teacher123',
    role: 'teacher',
    phone: '+1234567891',
    isEmailVerified: true,
    isActive: true,
    teacherQualifications: [
      {
        degree: 'Master of Education',
        institution: 'University of Education',
        year: 2020
      }
    ],
    teacherExperience: 5,
    teacherDepartment: 'Mathematics'
  },
  {
    firstName: 'Alice',
    lastName: 'Student',
    email: 'student@school.com',
    password: 'student123',
    role: 'student',
    phone: '+1234567892',
    isEmailVerified: true,
    isActive: true,
    studentId: '20240001',
    studentGrade: '10',
    studentSection: 'A',
    enrollmentDate: new Date(),
    emergencyContactName: 'Bob Parent',
    emergencyContactRelationship: 'Father',
    emergencyContactPhone: '+1234567893'
  },
  {
    firstName: 'Bob',
    lastName: 'Parent',
    email: 'parent@school.com',
    password: 'parent123',
    role: 'parent',
    phone: '+1234567893',
    isEmailVerified: true,
    isActive: true,
    parentOccupation: 'Engineer',
    parentEmployer: 'Tech Corp'
  }
];

const sampleSubjects = [
  {
    name: 'Mathematics',
    code: 'MATH',
    description: 'Study of numbers, quantities, shapes, and patterns',
    department: 'Mathematics',
    gradeLevel: '9-12',
    color: '#EF4444',
    icon: 'calculator'
  },
  {
    name: 'Science',
    code: 'SCI',
    description: 'Study of the natural world and its phenomena',
    department: 'Science',
    gradeLevel: '9-12',
    color: '#10B981',
    icon: 'flask'
  },
  {
    name: 'English',
    code: 'ENG',
    description: 'Study of language, literature, and communication',
    department: 'English',
    gradeLevel: '9-12',
    color: '#3B82F6',
    icon: 'book-open'
  },
  {
    name: 'History',
    code: 'HIST',
    description: 'Study of past events and their impact on society',
    department: 'Social Studies',
    gradeLevel: '9-12',
    color: '#F59E0B',
    icon: 'landmark'
  }
];

const sampleCourses = [
  {
    code: 'MATH101',
    title: 'Introduction to Mathematics',
    description: 'A comprehensive introduction to fundamental mathematical concepts including algebra, geometry, and basic calculus.',
    shortDescription: 'Fundamental mathematics course for beginners',
    credits: 3,
    duration: 16,
    level: 'beginner',
    grade: '9-10',
    category: 'core',
    maxCapacity: 30,
    academicYear: '2024-2025',
    semester: 'fall',
    tuition: 500.00,
    status: 'active',
    isPublished: true,
    enrollmentOpen: true,
    learningObjectives: [
      'Understand basic mathematical operations',
      'Solve algebraic equations',
      'Apply geometric principles',
      'Develop problem-solving skills'
    ],
    assessmentMethods: ['exam', 'quiz', 'assignment', 'project'],
    gradingPolicy: {
      exams: 40,
      assignments: 30,
      participation: 15,
      projects: 15
    },
    syllabus: [
      {
        week: 1,
        topic: 'Introduction to Algebra',
        description: 'Basic algebraic concepts and operations',
        materials: ['Textbook Chapter 1', 'Online Resources']
      },
      {
        week: 2,
        topic: 'Linear Equations',
        description: 'Solving linear equations and inequalities',
        materials: ['Textbook Chapter 2', 'Practice Problems']
      }
    ],
    textbooks: [
      {
        title: 'Mathematics Fundamentals',
        author: 'Dr. Smith',
        isbn: '978-1234567890',
        required: true,
        price: 75.00
      }
    ],
    resources: [
      {
        title: 'Khan Academy Math',
        type: 'link',
        url: 'https://www.khanacademy.org/math',
        description: 'Online math tutorials and practice'
      }
    ],
    schedule: [
      {
        day: 'monday',
        startTime: '09:00',
        endTime: '10:30',
        room: '101',
        building: 'Main Hall'
      },
      {
        day: 'wednesday',
        startTime: '09:00',
        endTime: '10:30',
        room: '101',
        building: 'Main Hall'
      }
    ],
    tags: ['mathematics', 'algebra', 'beginner'],
    keywords: ['math', 'algebra', 'equations', 'geometry']
  },
  {
    code: 'SCI101',
    title: 'Introduction to Science',
    description: 'A comprehensive introduction to scientific principles, methods, and discoveries.',
    shortDescription: 'Fundamental science course for beginners',
    credits: 3,
    duration: 16,
    level: 'beginner',
    grade: '9-10',
    category: 'core',
    maxCapacity: 25,
    academicYear: '2024-2025',
    semester: 'fall',
    tuition: 500.00,
    status: 'active',
    isPublished: true,
    enrollmentOpen: true,
    learningObjectives: [
      'Understand basic scientific principles',
      'Conduct laboratory experiments safely',
      'Apply scientific method',
      'Develop critical thinking skills'
    ],
    assessmentMethods: ['exam', 'lab', 'assignment', 'presentation'],
    gradingPolicy: {
      exams: 35,
      labs: 30,
      assignments: 20,
      participation: 15
    },
    syllabus: [
      {
        week: 1,
        topic: 'Scientific Method',
        description: 'Introduction to scientific inquiry and methodology',
        materials: ['Lab Manual', 'Safety Guidelines']
      },
      {
        week: 2,
        topic: 'Basic Chemistry',
        description: 'Introduction to chemical principles and reactions',
        materials: ['Chemistry Kit', 'Textbook Chapter 1']
      }
    ],
    textbooks: [
      {
        title: 'Science Fundamentals',
        author: 'Dr. Johnson',
        isbn: '978-0987654321',
        required: true,
        price: 80.00
      }
    ],
    resources: [
      {
        title: 'Virtual Lab Simulations',
        type: 'link',
        url: 'https://phet.colorado.edu/',
        description: 'Interactive science simulations'
      }
    ],
    schedule: [
      {
        day: 'tuesday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'Lab 201',
        building: 'Science Wing'
      },
      {
        day: 'thursday',
        startTime: '10:00',
        endTime: '11:30',
        room: 'Lab 201',
        building: 'Science Wing'
      }
    ],
    tags: ['science', 'chemistry', 'laboratory'],
    keywords: ['science', 'chemistry', 'experiments', 'lab']
  }
];

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');

    // Test database connection
    await testConnection();

    // Sync all models with database
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log('✅ Database models synced');

    // Create subjects first
    console.log('📚 Creating sample subjects...');
    const createdSubjects = [];
    for (const subjectData of sampleSubjects) {
      const subject = await Subject.create(subjectData);
      createdSubjects.push(subject);
      console.log(`✅ Created subject: ${subject.name}`);
    }

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    // Create courses
    console.log('📚 Creating sample courses...');
    const teacher = createdUsers.find(u => u.role === 'teacher');
    const mathSubject = createdSubjects.find(s => s.code === 'MATH');
    const sciSubject = createdSubjects.find(s => s.code === 'SCI');
    
    for (const courseData of sampleCourses) {
      const subjectId = courseData.code.startsWith('MATH') ? mathSubject.id : sciSubject.id;
      const course = await Course.create({
        ...courseData,
        instructorId: teacher.id,
        subjectId: subjectId
      });
      console.log(`✅ Created course: ${course.code} - ${course.title}`);
    }

    // Update teacher with subjects
    if (teacher) {
      teacher.teacherSubjects = createdSubjects.map(s => s.id);
      await teacher.save();
      console.log('✅ Updated teacher with subjects');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Sample Users Created:');
    sampleUsers.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });
    
    console.log('\n📚 Sample Subjects Created:');
    sampleSubjects.forEach(subject => {
      console.log(`   ${subject.code}: ${subject.name}`);
    });
    
    console.log('\n📚 Sample Courses Created:');
    sampleCourses.forEach(course => {
      console.log(`   ${course.code}: ${course.title}`);
    });

    console.log('\n🔗 You can now start the application:');
    console.log('   npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
