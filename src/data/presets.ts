export interface PresetExample {
  title: string;
  badge: string;
  payload: any;
}

export const PRESETS_NOTES: PresetExample[] = [
  {
    title: 'Data Structures: Binary Search Trees (BST)',
    badge: 'CS / 2nd Year',
    payload: {
      topic: 'Binary Search Trees (BST) - Insertion, Search, Traversal, and Time Complexity',
      academicYear: '2nd Year',
      detailLevel: 'standard',
    },
  },
  {
    title: 'Operating Systems: Process vs Thread & Scheduling',
    badge: 'CS / 2nd Year',
    payload: {
      topic: 'Difference between Process and Thread, PCB, Context Switching, and Round Robin Scheduling',
      academicYear: '2nd Year',
      detailLevel: 'comprehensive',
    },
  },
  {
    title: 'Engineering Mathematics: Eigenvalues & Eigenvectors',
    badge: 'Math / 1st Year',
    payload: {
      topic: 'Eigenvalues and Eigenvectors - Characteristic equation, geometric intuition and applications',
      academicYear: '1st Year',
      detailLevel: 'standard',
    },
  },
  {
    title: 'Digital Electronics: Flip-Flops (SR, JK, D, T)',
    badge: 'ECE / 1st Year',
    payload: {
      topic: 'Flip-Flops in Digital Electronics - SR, JK, D, T Flip Flop truth tables, excitation tables and racing conditions',
      academicYear: '1st Year',
      detailLevel: 'standard',
    },
  },
];

export const PRESETS_CONCEPTS: PresetExample[] = [
  {
    title: 'Pointers in C and Memory Addresses',
    badge: 'Programming',
    payload: {
      concept: 'Pointers in C, memory addresses, dereferencing (* and &), and why segmentation faults happen',
      analogyStyle: 'everyday-life',
    },
  },
  {
    title: 'Object-Oriented: Polymorphism & Inheritance',
    badge: 'OOP',
    payload: {
      concept: 'Polymorphism (Method Overriding vs Overloading) and Class Inheritance in Java/C++',
      analogyStyle: 'gaming',
    },
  },
  {
    title: 'Computer Networks: TCP 3-Way Handshake',
    badge: 'Networking',
    payload: {
      concept: 'TCP 3-Way Handshake (SYN, SYN-ACK, ACK) and reliable packet connection vs UDP',
      analogyStyle: 'phone-call-or-delivery',
    },
  },
  {
    title: 'Database Systems: ACID Properties in Transactions',
    badge: 'DBMS',
    payload: {
      concept: 'ACID Properties in Relational Databases (Atomicity, Consistency, Isolation, Durability)',
      analogyStyle: 'bank-atm-transfer',
    },
  },
];

export const PRESETS_QUIZ: PresetExample[] = [
  {
    title: 'Arrays & Linked Lists Essentials',
    badge: 'Data Structures',
    payload: {
      topic: 'Array vs Singly Linked List: time complexities, random access, dynamic sizing, memory overhead',
      difficulty: 'college exam style',
    },
  },
  {
    title: 'Python Basics: Loops, Slicing & Scope',
    badge: 'Python',
    payload: {
      topic: 'Python control flow, list comprehensions, slicing indices, mutable vs immutable types',
      difficulty: 'beginner',
    },
  },
  {
    title: 'Database Management: SQL Joins & Keys',
    badge: 'DBMS',
    payload: {
      topic: 'SQL Primary Key, Foreign Key, INNER JOIN, LEFT JOIN, and GROUP BY clauses',
      difficulty: 'college exam style',
    },
  },
  {
    title: 'Calculus: Derivatives & Critical Points',
    badge: 'Math',
    payload: {
      topic: 'Limits, Product Rule, Quotient Rule, Chain Rule, and finding local maxima/minima',
      difficulty: 'college exam style',
    },
  },
];

export const PRESETS_QUESTIONS: PresetExample[] = [
  {
    title: 'Data Structures & Algorithms Semester Revision',
    badge: 'CS Core',
    payload: {
      subject: 'Data Structures and Algorithms',
      topic: 'Stack and Queue implementations, Infix to Postfix conversion, and Binary Tree traversals',
    },
  },
  {
    title: 'Object-Oriented Programming with Java',
    badge: 'Software Eng.',
    payload: {
      subject: 'Object-Oriented Programming (Java)',
      topic: 'Abstract classes vs Interfaces, Exception Handling (try-catch-finally), and JVM Architecture',
    },
  },
  {
    title: 'Database Management Systems (DBMS)',
    badge: 'DBMS',
    payload: {
      subject: 'Database Management Systems',
      topic: 'Normalization (1NF, 2NF, 3NF, BCNF), Functional Dependencies, and ER Diagrams',
    },
  },
  {
    title: 'Computer Organization & Architecture (COA)',
    badge: 'Hardware',
    payload: {
      subject: 'Computer Organization',
      topic: 'Von Neumann Architecture, Cache Memory mapping techniques, and Instruction Pipelining hazards',
    },
  },
];

export const PRESETS_CODE: PresetExample[] = [
  {
    title: 'Python: Recursive Fibonacci with Base Cases',
    badge: 'Python',
    payload: {
      language: 'python',
      code: `def fibonacci(n):
    # Base cases: first two numbers in sequence
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    # Recursive step: sum of previous two terms
    return fibonacci(n - 1) + fibonacci(n - 2)

# Print first 6 numbers
for i in range(6):
    print(f"fib({i}) = {fibonacci(i)}")`,
    },
  },
  {
    title: 'C: Swapping Two Numbers Using Pointers',
    badge: 'C Language',
    payload: {
      language: 'c',
      code: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;  // Dereference pointer a to get its value
    *a = *b;        // Copy value at address b into address a
    *b = temp;      // Put stored temp value into address b
}

int main() {
    int x = 10, y = 20;
    printf("Before: x = %d, y = %d\\n", x, y);
    swap(&x, &y);   // Pass memory addresses
    printf("After:  x = %d, y = %d\\n", x, y);
    return 0;
}`,
    },
  },
  {
    title: 'Java: Encapsulation with Student Class & Getters',
    badge: 'Java',
    payload: {
      language: 'java',
      code: `public class Student {
    private String name;
    private double gpa;

    public Student(String name, double gpa) {
        this.name = name;
        setGpa(gpa);
    }

    public void setGpa(double gpa) {
        if (gpa >= 0.0 && gpa <= 4.0) {
            this.gpa = gpa;
        } else {
            System.out.println("Invalid GPA value!");
        }
    }

    public double getGpa() {
        return this.gpa;
    }
}`,
    },
  },
  {
    title: 'HTML & CSS: Semantic Card with Flexbox Layout',
    badge: 'HTML',
    payload: {
      language: 'html',
      code: `<article class="profile-card">
  <header class="card-header">
    <img src="avatar.jpg" alt="Student Profile" class="avatar" />
    <h2>Sarah Jenkins</h2>
    <span class="badge">Computer Science '26</span>
  </header>
  <main class="card-body">
    <p>Exploring data structures and modern web development.</p>
  </main>
  <footer class="card-footer">
    <button type="button" class="btn-primary">Connect</button>
  </footer>
</article>`,
    },
  },
];

export const PRESETS_PLANNER: PresetExample[] = [
  {
    title: 'Semester Midterm Crunch (3 Core Subjects)',
    badge: 'Midterms',
    payload: {
      subjects: ['Data Structures & Algorithms', 'Discrete Mathematics', 'Digital Electronics'],
      dailyHours: 4,
      totalDays: 7,
      targetGoal: 'Mid-Semester Exam Preparation',
      weakAreas: 'Recursion trees, Karnaugh Maps, Graph traversal proofs',
      preferredStudyTime: 'Late Afternoon to Evening',
    },
  },
  {
    title: 'Weekend Catchup & Assignment Sprint',
    badge: 'Weekend',
    payload: {
      subjects: ['Python Programming Lab', 'Calculus II', 'Physics for Engineers'],
      dailyHours: 5,
      totalDays: 3,
      targetGoal: 'Lab Submissions & Weekly Problem Sets',
      weakAreas: 'Integration by parts, Matrix transformations',
      preferredStudyTime: 'Morning (09:00 AM - 02:00 PM)',
    },
  },
  {
    title: 'Freshman Exam Readiness (Balanced 10-Day Plan)',
    badge: 'Finals',
    payload: {
      subjects: ['C Programming', 'Engineering Physics', 'Basic Electrical Engineering', 'Calculus'],
      dailyHours: 3.5,
      totalDays: 7,
      targetGoal: 'End-Semester Theory Clearance',
      weakAreas: 'Pointers in C, AC circuit analysis',
      preferredStudyTime: 'Early Morning & Post-Dinner',
    },
  },
];
