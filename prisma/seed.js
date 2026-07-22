const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const crypto = require('crypto');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Clearing database...');
  await prisma.leave.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.onboardingTask.deleteMany({});
  await prisma.applicant.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.job.deleteMany({});

  console.log('Seeding 10 open/closed jobs...');
  
  const jobFrontend = await prisma.job.create({
    data: {
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salaryRange: '$90,000 - $120,000',
      description: 'We are looking for a Senior Frontend Engineer to build beautiful, responsive web applications using React and Next.js. You will lead UI design implementation, optimize application performance, and work closely with UX designers.',
      requirements: '5+ years experience with React/Next.js; Strong proficiency in CSS and responsive design; Experience with TypeScript and REST/GraphQL APIs; Excellent communication skills.',
      status: 'OPEN',
    },
  });

  const jobHR = await prisma.job.create({
    data: {
      title: 'HR Generalist',
      department: 'Human Resources',
      location: 'New York, NY (Hybrid)',
      type: 'Full-time',
      salaryRange: '$65,000 - $80,000',
      description: 'The HR Generalist will run daily HR operations including recruitment support, employee relations, payroll support, leave tracking, and compliance management. You will work directly with department heads to support employee growth.',
      requirements: '3+ years HR experience; Bachelor degree in HR or related field; SHRM certification is a plus; Experience using HRIS or ERP modules.',
      status: 'OPEN',
    },
  });

  const jobProduct = await prisma.job.create({
    data: {
      title: 'Technical Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salaryRange: '$110,000 - $140,000',
      description: 'We are seeking a TPM to manage the lifecycle of our core platform services. You will translate customer needs into technical specifications and collaborate with engineering to ship products.',
      requirements: '4+ years PM experience; Software engineering background; Experience with agile frameworks; Excellent analytical and problem-solving skills.',
      status: 'OPEN',
    },
  });

  const jobQA = await prisma.job.create({
    data: {
      title: 'QA Automation Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salaryRange: '$80,000 - $100,000',
      description: 'Build automated test suites for our web applications, track defects, and verify fixes in staging and production environment.',
      requirements: '3+ years QA automation; Cypress, Playwright, or Selenium; CI/CD pipeline integration; Experience with API testing.',
      status: 'CLOSED',
    },
  });

  const jobBackend = await prisma.job.create({
    data: {
      title: 'Backend Developer (NodeJS/Go)',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salaryRange: '$95,000 - $125,000',
      description: 'Design and build high-performance microservices. Write clean NodeJS and Go code, manage SQL databases, optimize caching, and deploy services on Kubernetes.',
      requirements: '4+ years backend engineering; Strong Node.js or Golang skills; Experience with PostgreSQL and Redis; Docker & Kubernetes understanding.',
      status: 'OPEN',
    },
  });

  const jobDesign = await prisma.job.create({
    data: {
      title: 'Lead UX/UI Product Designer',
      department: 'Product',
      location: 'New York, NY (Hybrid)',
      type: 'Full-time',
      salaryRange: '$100,000 - $130,000',
      description: 'Lead design processes across web and mobile platforms. Create wireframes, interactive mockups, design systems, and translate user feedback into clean layouts.',
      requirements: '6+ years UI/UX Design; Expert in Figma; Strong portfolio showing complex data product dashboards; Experience collaborating with developers.',
      status: 'OPEN',
    },
  });

  const jobDevOps = await prisma.job.create({
    data: {
      title: 'DevOps & Cloud Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salaryRange: '$105,000 - $135,000',
      description: 'Manage AWS/GCP cloud environments. Set up CI/CD pipelines, optimize infrastructure-as-code scripts, monitor system logs, and ensure strict security policies.',
      requirements: '4+ years DevOps; Terraform expertise; CI/CD tools (Github Actions, Jenkins); AWS or GCP certifications; Scripting in Bash or Python.',
      status: 'OPEN',
    },
  });

  const jobData = await prisma.job.create({
    data: {
      title: 'Data Scientist',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salaryRange: '$120,000 - $150,000',
      description: 'Develop machine learning models to analyze company datasets. Design statistics experiments, build recommendation engines, and communicate insights to leaders.',
      requirements: 'Master or PhD in Statistics, CS, or math; Expert Python programmer (Pandas, Scikit-learn, PyTorch); Experience querying BigQuery/SQL; ML pipeline deployment.',
      status: 'OPEN',
    },
  });

  const jobMarketing = await prisma.job.create({
    data: {
      title: 'Marketing Operations Manager',
      department: 'Marketing',
      location: 'New York, NY (Hybrid)',
      type: 'Full-time',
      salaryRange: '$75,000 - $95,000',
      description: 'Manage marketing tech systems, track campaign operations, optimize advertising funnels, and prepare visual reports on user acquisition.',
      requirements: '3+ years marketing ops; Proficiency in Hubspot, Salesforce, and Google Analytics; Strong data analysis skills; CRM configuration experience.',
      status: 'OPEN',
    },
  });

  const jobAdmin = await prisma.job.create({
    data: {
      title: 'Office Administrator & Coordinator',
      department: 'Administration',
      location: 'Chicago, IL',
      type: 'Full-time',
      salaryRange: '$50,000 - $65,000',
      description: 'Coordinate office facilities, manage administrative supplies, assist human resources with local onboarding, and plan corporate events.',
      requirements: '2+ years admin or coordination; Strong organization; High proficiency in MS Office/Google Workspace; Positive, welcoming personality.',
      status: 'OPEN',
    },
  });

  console.log('Seeding employees...');
  const hrDirector = await prisma.employee.create({
    data: {
      name: 'Alice Green',
      email: 'alice.green@company.com',
      phone: '+1 (555) 019-2834',
      role: 'HR Director',
      department: 'Human Resources',
      joinDate: new Date('2024-01-15'),
      salary: 125000,
      status: 'Active',
    },
  });

  const devLead = await prisma.employee.create({
    data: {
      name: 'Bob White',
      email: 'bob.white@company.com',
      phone: '+1 (555) 014-9988',
      role: 'Engineering Lead',
      department: 'Engineering',
      joinDate: new Date('2024-03-10'),
      salary: 130000,
      status: 'Active',
    },
  });

  const pmLead = await prisma.employee.create({
    data: {
      name: 'Charlie Black',
      email: 'charlie.black@company.com',
      phone: '+1 (555) 018-7711',
      role: 'Product Lead',
      department: 'Product',
      joinDate: new Date('2024-06-01'),
      salary: 115000,
      status: 'Active',
    },
  });

  console.log('Seeding employee leaves...');
  await prisma.leave.create({
    data: {
      employeeId: devLead.id,
      type: 'Annual',
      startDate: new Date('2026-08-10'),
      endDate: new Date('2026-08-17'),
      reason: 'Family summer vacation trip.',
      status: 'APPROVED',
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: pmLead.id,
      type: 'Sick',
      startDate: new Date('2026-07-12'),
      endDate: new Date('2026-07-13'),
      reason: 'Dental surgery recovery.',
      status: 'PENDING',
    },
  });

  console.log('Seeding applicants with transcripts and portfolios...');
  
  // 1. Stage: RECEIVED (Job Frontend)
  const appApplied = await prisma.applicant.create({
    data: {
      id: 'app-track-applied-101',
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      phone: '+1 (555) 021-9922',
      resumeUrl: '/uploads/john_doe_resume.pdf',
      transcriptUrl: '/uploads/john_doe_transcript.pdf',
      portfolioUrl: 'https://johndoe.dev',
      coverLetter: 'I am highly interested in the Frontend position. I have been working with React for 3 years and would love to contribute to your team.',
      status: 'RECEIVED',
      jobId: jobFrontend.id,
    },
  });

  // 2. Stage: SHORTLISTED (Job Frontend)
  const appShortlisted = await prisma.applicant.create({
    data: {
      id: 'app-track-shortlisted-102',
      name: 'Jane Smith',
      email: 'jane.smith@yahoo.com',
      phone: '+1 (555) 022-8833',
      resumeUrl: '/uploads/jane_smith_resume.pdf',
      transcriptUrl: '/uploads/jane_smith_transcript.pdf',
      portfolioUrl: 'https://janesmith.design',
      coverLetter: 'I have extensive experience building scalable user interfaces. Attached is my resume reflecting my experience with React and Tailwind CSS.',
      status: 'SHORTLISTED',
      jobId: jobFrontend.id,
    },
  });

  // 3. Stage: INTERVIEW_SCHEDULED (Job Product)
  const appInterviewScheduled = await prisma.applicant.create({
    data: {
      id: 'app-track-interview-103',
      name: 'Alex Johnson',
      email: 'alex.johnson@outlook.com',
      phone: '+1 (555) 023-7744',
      resumeUrl: '/uploads/alex_johnson_resume.pdf',
      transcriptUrl: '/uploads/alex_johnson_transcript.pdf',
      portfolioUrl: '',
      coverLetter: 'Excited about the TPM role. I have a background in backend engineering and 4 years of Product Management experience at SaaS companies.',
      status: 'INTERVIEW_SCHEDULED',
      jobId: jobProduct.id,
      interviewDate: new Date('2026-07-15T14:00:00Z'),
      interviewer: 'Charlie Black (Product Lead)',
      interviewNotes: 'Scheduled a Zoom call to discuss past technical project achievements and product vision.',
    },
  });

  // 4. Stage: INTERVIEW_CONDUCTED (Job HR)
  const appInterviewConducted = await prisma.applicant.create({
    data: {
      id: 'app-track-conducted-104',
      name: 'Emily Davis',
      email: 'emily.davis@gmail.com',
      phone: '+1 (555) 024-6655',
      resumeUrl: '/uploads/emily_davis_resume.pdf',
      transcriptUrl: '/uploads/emily_davis_transcript.pdf',
      portfolioUrl: '',
      coverLetter: 'Applying for the HR Generalist role. I am skilled in employee relations and payroll compliance, and enjoy fostering positive workspaces.',
      status: 'INTERVIEW_CONDUCTED',
      jobId: jobHR.id,
      interviewDate: new Date('2026-07-09T10:00:00Z'),
      interviewer: 'Alice Green (HR Director)',
      interviewNotes: 'Strong communication skills. Discussed conflict resolution and compliance scenarios. Handled questions with confidence.',
      interviewScore: 'Pass',
    },
  });

  // 5. Stage: OFFER_ISSUED (Job Frontend)
  const appOfferIssued = await prisma.applicant.create({
    data: {
      id: 'app-track-offer-105',
      name: 'Michael Brown',
      email: 'michael.brown@outlook.com',
      phone: '+1 (555) 025-5566',
      resumeUrl: '/uploads/michael_brown_resume.pdf',
      transcriptUrl: '/uploads/michael_brown_transcript.pdf',
      portfolioUrl: 'https://mbrown.me',
      coverLetter: 'I am a passionate UI developer interested in crafting pixel-perfect web screens. Excited to apply.',
      status: 'OFFER_ISSUED',
      jobId: jobFrontend.id,
      interviewDate: new Date('2026-07-05T15:00:00Z'),
      interviewer: 'Bob White (Engineering Lead)',
      interviewNotes: 'Excellent understanding of JavaScript and React hooks. Scored 9/10 in technical coding test. Recommended for hiring.',
      interviewScore: 'Pass',
      salaryOffered: 105000,
      startDate: new Date('2026-08-01'),
      offerLetterUrl: '/uploads/offer_michael_brown.pdf',
    },
  });

  // 6. Stage: ONBOARDING (Job Frontend)
  const appOnboarding = await prisma.applicant.create({
    data: {
      id: 'app-track-onboarding-106',
      name: 'David Miller',
      email: 'david.miller@gmail.com',
      phone: '+1 (555) 026-4477',
      resumeUrl: '/uploads/david_miller_resume.pdf',
      transcriptUrl: '/uploads/david_miller_transcript.pdf',
      portfolioUrl: 'https://davidmiller.codes',
      coverLetter: 'Applying for the Senior Frontend Engineer role. I am eager to apply my 6 years of React engineering expertise to company products.',
      status: 'ONBOARDING',
      jobId: jobFrontend.id,
      interviewDate: new Date('2026-07-02T11:00:00Z'),
      interviewer: 'Bob White (Engineering Lead)',
      interviewNotes: 'Superb architecture knowledge, clean code standards, solid React performance understanding. Recommended.',
      interviewScore: 'Pass',
      salaryOffered: 115000,
      startDate: new Date('2026-07-20'),
      offerLetterUrl: '/uploads/offer_david_miller.pdf',
      signedAt: new Date('2026-07-08T09:30:00Z'),
    },
  });

  // Create onboarding tasks for David Miller
  await prisma.onboardingTask.create({
    data: {
      title: 'Submit ID Proof',
      description: 'Upload a copy of your Government Issued Passport, National ID, or Drivers License.',
      status: 'COMPLETED',
      requiredFile: true,
      fileUrl: '/uploads/david_passport_copy.pdf',
      applicantId: appOnboarding.id,
    },
  });

  await prisma.onboardingTask.create({
    data: {
      title: 'Signed Employment Agreement',
      description: 'Review and sign the official Employment Offer and Contract document.',
      status: 'COMPLETED',
      requiredFile: true,
      fileUrl: '/uploads/offer_david_miller_signed.pdf',
      applicantId: appOnboarding.id,
    },
  });

  await prisma.onboardingTask.create({
    data: {
      title: 'Submit Academic Certificates',
      description: 'Upload your Bachelor / Master degree transcripts or certificates.',
      status: 'PENDING',
      requiredFile: true,
      applicantId: appOnboarding.id,
    },
  });

  await prisma.onboardingTask.create({
    data: {
      title: 'Direct Deposit & Tax Form W-4',
      description: 'Provide bank details and fill the W-4 form to configure your payroll.',
      status: 'PENDING',
      requiredFile: true,
      applicantId: appOnboarding.id,
    },
  });

  // Stage: APPLIED (Job Product)
  await prisma.applicant.create({
    data: {
      id: 'app-track-formally-applied-108',
      name: 'Robert Miller',
      email: 'robert.miller@gmail.com',
      phone: '+1 (555) 029-4455',
      resumeUrl: '/uploads/robert_resume.pdf',
      transcriptUrl: '/uploads/robert_transcript.pdf',
      portfolioUrl: '',
      coverLetter: 'I am highly interested in the PM position. I have been coordinating teams for 4 years.',
      status: 'APPLIED',
      jobId: jobProduct.id,
    },
  });

  // Stage: BOARD_REVIEW (Job Design)
  await prisma.applicant.create({
    data: {
      id: 'app-track-board-review-109',
      name: 'Sarah Connor',
      email: 'sarah.connor@gmail.com',
      phone: '+1 (555) 030-9988',
      resumeUrl: '/uploads/sarah_resume.pdf',
      transcriptUrl: '/uploads/sarah_transcript.pdf',
      portfolioUrl: 'https://sarahdesign.co',
      coverLetter: 'I have a strong eye for visual detail and database product UI layouts. See my portfolio links.',
      status: 'BOARD_REVIEW',
      jobId: jobDesign.id,
    },
  });

  // Stage: OFFER_PREPARING (Job PM)
  await prisma.applicant.create({
    data: {
      id: 'app-track-offer-prep-110',
      name: 'James Bond',
      email: 'james.bond@gmail.com',
      phone: '+1 (555) 007-9900',
      resumeUrl: '/uploads/james_bond_resume.pdf',
      transcriptUrl: '/uploads/james_bond_transcript.pdf',
      portfolioUrl: '',
      coverLetter: 'I am looking for a project lead role. My experience in operations is extensive.',
      status: 'OFFER_PREPARING',
      jobId: jobProduct.id,
    },
  });

  // Stage: OFFER_SENT (Job PM)
  await prisma.applicant.create({
    data: {
      id: 'app-track-offer-sent-111',
      name: 'Emma Watson',
      email: 'emma.watson@gmail.com',
      phone: '+1 (555) 088-1122',
      resumeUrl: '/uploads/emma_watson_resume.pdf',
      transcriptUrl: '/uploads/emma_watson_transcript.pdf',
      portfolioUrl: '',
      coverLetter: 'Seeking a PM or content coordinator role. Happy to share my portfolio.',
      status: 'OFFER_SENT',
      salaryOffered: 110000,
      startDate: new Date('2026-08-01'),
      jobId: jobProduct.id,
    },
  });

  // Stage: DOCUMENTS_RECEIVED (Job QA)
  const appDocsRec = await prisma.applicant.create({
    data: {
      id: 'app-track-docs-rec-112',
      name: 'Daniel Radcliffe',
      email: 'daniel.radcliffe@gmail.com',
      phone: '+1 (555) 099-2233',
      resumeUrl: '/uploads/daniel_resume.pdf',
      transcriptUrl: '/uploads/daniel_transcript.pdf',
      portfolioUrl: '',
      coverLetter: 'I have 5 years in test automation and QA workflows.',
      status: 'DOCUMENTS_RECEIVED',
      salaryOffered: 98000,
      startDate: new Date('2026-07-20'),
      jobId: jobQA.id,
    },
  });

  // Create completed onboarding tasks for daniel so it shows complete docs
  await prisma.onboardingTask.create({
    data: {
      title: 'Submit ID Proof',
      description: 'Upload passport copy.',
      status: 'COMPLETED',
      fileUrl: '/uploads/daniel_passport.pdf',
      requiredFile: true,
      applicantId: appDocsRec.id,
    },
  });
  await prisma.onboardingTask.create({
    data: {
      title: 'Signed Employment Agreement',
      description: 'Sign and return contract.',
      status: 'COMPLETED',
      fileUrl: '/uploads/signed_offer_app-track-docs-rec-112.pdf',
      requiredFile: true,
      applicantId: appDocsRec.id,
    },
  });
  await prisma.onboardingTask.create({
    data: {
      title: 'Submit Academic Certificates',
      description: 'Upload transcripts.',
      status: 'COMPLETED',
      fileUrl: '/uploads/daniel_certificates.pdf',
      requiredFile: true,
      applicantId: appDocsRec.id,
    },
  });
  await prisma.onboardingTask.create({
    data: {
      title: 'Direct Deposit & Tax Form W-4',
      description: 'Configure bank info.',
      status: 'COMPLETED',
      fileUrl: '/uploads/daniel_w4.pdf',
      requiredFile: true,
      applicantId: appDocsRec.id,
    },
  });

  // 7. Stage: REJECTED (Job Frontend)
  const appRejected = await prisma.applicant.create({
    data: {
      id: 'app-track-rejected-107',
      name: 'Jessica Taylor',
      email: 'jessica.taylor@gmail.com',
      phone: '+1 (555) 027-3388',
      resumeUrl: '/uploads/jessica_taylor_resume.pdf',
      transcriptUrl: '/uploads/jessica_taylor_transcript.pdf',
      portfolioUrl: '',
      coverLetter: 'I am a junior web engineer starting my journey in React. I am motivated to learn and grow.',
      status: 'REJECTED',
      jobId: jobFrontend.id,
      interviewNotes: 'Candidate has less than 1 year of experience. The role requires a senior profile with 5+ years of experience. Resume screened out.',
    },
  });

  console.log('Seeding user credentials...');
  await prisma.user.create({
    data: {
      email: 'admin@aurahrm.com',
      password: hashPassword('admin123'),
      role: 'HR_ADMIN'
    }
  });

  await prisma.user.create({
    data: {
      email: 'employee@aurahrm.com',
      password: hashPassword('employee123'),
      role: 'EMPLOYEE'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
