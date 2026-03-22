// ═══════════════════════════════════════════════
// CAMPUSGARH — DUMMY DATA STORE
// ═══════════════════════════════════════════════

const CG_DATA = {

  colleges: [
    {
      id: 1, slug: "iit-delhi",
      name: "Indian Institute of Technology, Delhi",
      shortName: "IIT Delhi",
      city: "New Delhi", state: "Delhi",
      type: "Engineering", ownership: "Government",
      established: 1961, ranking: 1,
      rating: 4.8, reviews: 1240,
      fees: "₹2.2L/yr", totalFees: "₹8.8L",
      naacGrade: "A++",
      emoji: "🏛️",
      color: "#1B4FD8",
      tags: ["Engineering", "Research", "IIT"],
      courses: ["B.Tech", "M.Tech", "PhD", "MBA"],
      placements: { avg: "₹18 LPA", highest: "₹2.4 Cr", companies: 420 },
      facilities: ["Library", "Hostel", "Sports", "Labs", "Cafeteria", "Gym"],
      about: "IIT Delhi is one of India's most prestigious technical institutes, known for cutting-edge research and world-class infrastructure. Established in 1961, it has produced some of India's finest engineers and scientists.",
      highlights: ["NIRF Rank #2", "JEE Advanced admission", "QS World Rank 185", "320+ faculty"],
      examsAccepted: ["JEE Advanced"],
      website: "iitd.ac.in",
      affiliatedTo: "Autonomous (Deemed University)"
    },
    {
      id: 2, slug: "iim-ahmedabad",
      name: "Indian Institute of Management, Ahmedabad",
      shortName: "IIM-A",
      city: "Ahmedabad", state: "Gujarat",
      type: "Management", ownership: "Government",
      established: 1961, ranking: 1,
      rating: 4.9, reviews: 890,
      fees: "₹11L/yr", totalFees: "₹23L",
      naacGrade: "A++",
      emoji: "🎓",
      color: "#C9A84C",
      tags: ["MBA", "Management", "IIM"],
      courses: ["MBA (PGP)", "MBA-FABM", "PhD", "Executive MBA"],
      placements: { avg: "₹32 LPA", highest: "₹1.1 Cr", companies: 180 },
      facilities: ["Library", "Hostel", "Case Room", "Cafeteria", "Sports"],
      about: "IIM Ahmedabad is Asia's top business school, consistently ranked #1 in India for MBA. Its rigorous case-based learning and stellar alumni network make it the most sought-after management institution.",
      highlights: ["FT Global MBA Rank #24", "CAT admission", "₹32 LPA avg placement", "180+ recruiters"],
      examsAccepted: ["CAT"],
      website: "iima.ac.in",
      affiliatedTo: "Autonomous (Institute of National Importance)"
    },
    {
      id: 3, slug: "aiims-delhi",
      name: "All India Institute of Medical Sciences",
      shortName: "AIIMS Delhi",
      city: "New Delhi", state: "Delhi",
      type: "Medical", ownership: "Government",
      established: 1956, ranking: 1,
      rating: 4.9, reviews: 2100,
      fees: "₹1.5K/yr", totalFees: "₹7.5K",
      naacGrade: "A++",
      emoji: "🏥",
      color: "#1A6B4A",
      tags: ["MBBS", "Medical", "AIIMS"],
      courses: ["MBBS", "MD", "MS", "PhD", "B.Sc Nursing"],
      placements: { avg: "₹12 LPA", highest: "₹40 LPA", companies: 50 },
      facilities: ["Hospital", "Library", "Hostel", "Research Labs", "Sports"],
      about: "AIIMS Delhi is the crown jewel of Indian medical education. With a 1,500-bed hospital and some of the finest faculty in the world, it remains the dream destination for every NEET aspirant.",
      highlights: ["NIRF Rank #1 Medical", "NEET admission", "1500-bed hospital", "95+ year legacy"],
      examsAccepted: ["NEET UG"],
      website: "aiims.edu",
      affiliatedTo: "Autonomous (Institute of National Importance)"
    },
    {
      id: 4, slug: "bits-pilani",
      name: "BITS Pilani",
      shortName: "BITS Pilani",
      city: "Pilani", state: "Rajasthan",
      type: "Engineering", ownership: "Private",
      established: 1964, ranking: 27,
      rating: 4.6, reviews: 3200,
      fees: "₹5.2L/yr", totalFees: "₹20.8L",
      naacGrade: "A",
      emoji: "⚡",
      color: "#7C3AED",
      tags: ["Engineering", "Tech", "Private"],
      courses: ["B.E.", "M.E.", "MBA", "M.Sc", "PhD"],
      placements: { avg: "₹15 LPA", highest: "₹1.2 Cr", companies: 350 },
      facilities: ["Library", "Hostel", "Sports", "Labs", "Food Court"],
      about: "BITS Pilani is India's top private engineering university, known for its Practice School internship program, flexible curriculum, and stellar startup culture.",
      highlights: ["NIRF Rank #27", "BITSAT admission", "Practice School program", "700+ startups"],
      examsAccepted: ["BITSAT"],
      website: "bits-pilani.ac.in",
      affiliatedTo: "Deemed University"
    },
    {
      id: 5, slug: "delhi-university",
      name: "University of Delhi",
      shortName: "DU",
      city: "New Delhi", state: "Delhi",
      type: "Arts & Science", ownership: "Government",
      established: 1922, ranking: 11,
      rating: 4.3, reviews: 5400,
      fees: "₹15K/yr", totalFees: "₹45K",
      naacGrade: "A++",
      emoji: "📚",
      color: "#0A5C99",
      tags: ["Arts", "Science", "Commerce", "Central University"],
      courses: ["B.A.", "B.Com", "B.Sc", "LLB", "MA", "M.Com"],
      placements: { avg: "₹6 LPA", highest: "₹45 LPA", companies: 200 },
      facilities: ["Library", "Hostels", "Sports", "Cafeteria", "Labs"],
      about: "University of Delhi is India's most prestigious central university with 90+ colleges across North Campus and South Campus. Known for its vibrant culture, student life, and academic excellence.",
      highlights: ["NIRF Rank #11", "CUET admission", "90+ affiliated colleges", "Centenary institution"],
      examsAccepted: ["CUET"],
      website: "du.ac.in",
      affiliatedTo: "Central University"
    },
    {
      id: 6, slug: "nlsiu-bangalore",
      name: "National Law School of India University",
      shortName: "NLSIU",
      city: "Bangalore", state: "Karnataka",
      type: "Law", ownership: "Government",
      established: 1988, ranking: 1,
      rating: 4.8, reviews: 420,
      fees: "₹2.4L/yr", totalFees: "₹12L",
      naacGrade: "A+",
      emoji: "⚖️",
      color: "#92400E",
      tags: ["Law", "NLU", "CLAT"],
      courses: ["BA LLB", "LLM", "PhD"],
      placements: { avg: "₹14 LPA", highest: "₹60 LPA", companies: 75 },
      facilities: ["Library", "Moot Court", "Hostel", "Sports"],
      about: "NLSIU Bangalore is India's premier law school, topping the NIRF law rankings every year. Founded in 1988, it pioneered the five-year integrated LLB program in India.",
      highlights: ["NIRF Rank #1 Law", "CLAT admission", "Supreme Court alumni", "30+ year legacy"],
      examsAccepted: ["CLAT"],
      website: "nls.ac.in",
      affiliatedTo: "Deemed University"
    }
  ],

  courses: [
    { id: 1, name: "B.Tech Computer Science", icon: "💻", color: "#EDE9FE", iconColor: "#7C3AED", duration: "4 Years", level: "UG", colleges: 1240, avgFees: "₹3.5L/yr", type: "Engineering", popular: true, desc: "India's most sought-after course covering algorithms, AI, software development and more." },
    { id: 2, name: "MBBS", icon: "🩺", color: "#DCFCE7", iconColor: "#16A34A", duration: "5.5 Years", level: "UG", colleges: 650, avgFees: "₹8L/yr", type: "Medical", popular: true, desc: "The gateway to becoming a doctor — covering anatomy, physiology, clinical medicine and surgery." },
    { id: 3, name: "MBA", icon: "📊", color: "#FEF3C7", iconColor: "#D97706", duration: "2 Years", level: "PG", colleges: 4500, avgFees: "₹6L/yr", type: "Management", popular: true, desc: "Build leadership, strategy and business acumen at India's finest B-Schools." },
    { id: 4, name: "B.Tech Mechanical", icon: "⚙️", color: "#FEE2E2", iconColor: "#DC2626", duration: "4 Years", level: "UG", colleges: 980, avgFees: "₹2.8L/yr", type: "Engineering", desc: "Design, build and innovate — covering thermodynamics, manufacturing and robotics." },
    { id: 5, name: "B.Com (Hons)", icon: "🏦", color: "#E0F2FE", iconColor: "#0284C7", duration: "3 Years", level: "UG", colleges: 3200, avgFees: "₹45K/yr", type: "Commerce", popular: true, desc: "Build your foundation in accounting, finance, taxation and business law." },
    { id: 6, name: "BA LLB", icon: "⚖️", color: "#FDF4FF", iconColor: "#9333EA", duration: "5 Years", level: "UG", colleges: 220, avgFees: "₹2L/yr", type: "Law", desc: "The integrated law program combining arts with legal knowledge — perfect for aspiring lawyers." },
    { id: 7, name: "B.Sc Data Science", icon: "📈", color: "#F0FDF4", iconColor: "#15803D", duration: "3 Years", level: "UG", colleges: 380, avgFees: "₹1.5L/yr", type: "Science", desc: "Statistics, machine learning, Python and big data — the skill set of the future." },
    { id: 8, name: "BDS", icon: "🦷", color: "#FFF7ED", iconColor: "#EA580C", duration: "5 Years", level: "UG", colleges: 310, avgFees: "₹5L/yr", type: "Medical", desc: "Dental surgery, oral medicine and public health — a rewarding and stable medical career." },
  ],

  exams: [
    {
      id: 1, name: "JEE Advanced",
      fullName: "Joint Entrance Examination Advanced",
      category: "Engineering",
      icon: "⚡",
      color: "#1B4FD8",
      desc: "Gateway to the prestigious IITs — one of the toughest entrance exams in the world.",
      conductedBy: "IIT Kanpur (2024)",
      examDate: "May 26, 2025",
      regDeadline: "May 7, 2025",
      appFee: "₹3,000 (Gen) / ₹1,400 (SC/ST/PwD)",
      mode: "Computer-Based",
      duration: "3 hrs × 2 Papers",
      eligibility: "JEE Main qualified, Top 2.5 lakh",
      website: "jeeadv.ac.in",
      syllabusHighlights: ["Physics", "Chemistry", "Mathematics"],
      syllabus: "Class 11–12 PCM with special emphasis on problem-solving depth"
    },
    {
      id: 2, name: "JEE Main",
      fullName: "Joint Entrance Examination Main",
      category: "Engineering",
      icon: "🔬",
      color: "#0284C7",
      desc: "The primary gateway to NITs, IIITs, and GFTIs — taken by 12+ lakh students annually.",
      conductedBy: "NTA",
      examDate: "Jan & Apr 2025",
      regDeadline: "Nov 30, 2024",
      appFee: "₹1,000 (Gen) / ₹500 (SC/ST)",
      mode: "Computer-Based",
      duration: "3 hours",
      eligibility: "Class 12 with PCM",
      website: "jeemain.nta.nic.in",
      syllabusHighlights: ["Physics", "Chemistry", "Maths"],
      syllabus: "Class 11–12 NCERT based Physics, Chemistry & Mathematics"
    },
    {
      id: 3, name: "NEET UG",
      fullName: "National Eligibility cum Entrance Test (UG)",
      category: "Medical",
      icon: "🩺",
      color: "#16A34A",
      desc: "The sole entrance exam for MBBS and BDS admissions across India — conducted by NTA.",
      conductedBy: "NTA",
      examDate: "May 4, 2025",
      regDeadline: "Mar 7, 2025",
      appFee: "₹1,700 (Gen)",
      mode: "Pen & Paper (OMR)",
      duration: "3 hours 20 minutes",
      eligibility: "Class 12 with PCB, min 50%",
      website: "neet.nta.nic.in",
      syllabusHighlights: ["Physics", "Chemistry", "Biology"],
      syllabus: "Class 11–12 NCERT Physics, Chemistry & Biology"
    },
    {
      id: 4, name: "CAT",
      fullName: "Common Admission Test",
      category: "Management",
      icon: "📊",
      color: "#D97706",
      desc: "India's most prestigious MBA entrance exam — gateway to IIMs and top B-schools.",
      conductedBy: "IIM Calcutta (2024)",
      examDate: "Nov 24, 2024",
      regDeadline: "Sep 13, 2024",
      appFee: "₹2,400 (Gen) / ₹1,200 (SC/ST/PwD)",
      mode: "Computer-Based",
      duration: "2 hours",
      eligibility: "Bachelor's degree with 50% marks",
      website: "iimcat.ac.in",
      syllabusHighlights: ["VARC", "DILR", "QA"],
      syllabus: "Verbal Ability & Reading Comprehension, Data Interpretation & Logical Reasoning, Quantitative Aptitude"
    },
    {
      id: 5, name: "CLAT",
      fullName: "Common Law Admission Test",
      category: "Law",
      icon: "⚖️",
      color: "#9333EA",
      desc: "Centralized admission to 24 National Law Universities — for aspiring lawyers.",
      conductedBy: "CLAT Consortium",
      examDate: "Dec 1, 2024",
      regDeadline: "Nov 15, 2024",
      appFee: "₹4,000 (Gen) / ₹3,500 (SC/ST)",
      mode: "Computer-Based",
      duration: "2 hours",
      eligibility: "Class 12 with min 45% (40% for SC/ST)",
      website: "consortiumofnlus.ac.in",
      syllabusHighlights: ["English", "GK", "Legal Aptitude", "Logical Reasoning", "Mathematics"],
      syllabus: "English, General Knowledge & Current Affairs, Legal Aptitude, Logical Reasoning, Elementary Mathematics"
    },
    {
      id: 6, name: "CUET",
      fullName: "Common University Entrance Test",
      category: "UG Admissions",
      icon: "📚",
      color: "#0F766E",
      desc: "Central entrance for 250+ universities including DU, JNU, BHU — launched in 2022.",
      conductedBy: "NTA",
      examDate: "May 2025",
      regDeadline: "Mar 2025",
      appFee: "₹650 (Gen)",
      mode: "Computer-Based",
      duration: "Varies by subject",
      eligibility: "Class 12 (any stream)",
      website: "cuet.samarth.ac.in",
      syllabusHighlights: ["Domain Subjects", "Language", "General Test"],
      syllabus: "Domain-specific subjects as per Class 12 + Language + General Test"
    },
  ],

  reviews: [
    { id: 1, collegeId: 1, author: "Arjun Sharma", avatar: "AS", college: "IIT Delhi", batch: "B.Tech 2022", rating: 5, title: "World-class research opportunities", text: "The research facilities at IIT Delhi are unparalleled. I got to work directly with professors on funded projects and had multiple paper publications before graduation. The internship culture is incredible.", date: "2 days ago" },
    { id: 2, collegeId: 2, author: "Priya Nair", avatar: "PN", college: "IIM Ahmedabad", batch: "MBA 2023", rating: 5, title: "Transformed my thinking completely", text: "IIM-A doesn't just teach you management — it reshapes how you think. The case methodology is intense but worth every sleepless night. My cohort alone has 4 founders now.", date: "1 week ago" },
    { id: 3, collegeId: 3, author: "Rohan Mehta", avatar: "RM", college: "AIIMS Delhi", batch: "MBBS 2024", rating: 5, title: "The best medical training in India", text: "The clinical exposure at AIIMS is extraordinary. By third year you're seeing cases that most doctors encounter in a lifetime. The teaching hospitals handle 10,000+ OPD patients daily.", date: "3 days ago" },
    { id: 4, collegeId: 4, author: "Sneha Patel", avatar: "SP", college: "BITS Pilani", batch: "B.E. 2023", rating: 4, title: "Startup culture is unmatched", text: "BITS gave me the freedom to explore. The Practice School program got me a 6-month internship at Google Bangalore. The campus startup scene is buzzing with energy.", date: "5 days ago" },
    { id: 5, collegeId: 5, author: "Kavya Reddy", avatar: "KR", college: "Delhi University", batch: "B.A. 2024", rating: 4, title: "Vibrant campus life and great faculty", text: "DU's North Campus has an energy that's hard to describe. The faculty at my college were genuinely invested in us. The festival circuit alone makes it worth it.", date: "1 week ago" },
    { id: 6, collegeId: 6, author: "Aditya Kumar", avatar: "AK", college: "NLSIU", batch: "BA LLB 2022", rating: 5, title: "Best legal education in the country", text: "NLSIU's Moot Court program is legendary. By second year I was competing at international competitions. The alumni network opens doors everywhere — from Supreme Court to London.", date: "4 days ago" },
  ],

  trustItems: [
    "500+ Colleges Listed", "1.2 Lakh+ Students Helped", "Verified Reviews Only",
    "Zero Bias Guaranteed", "Real Campus Reports", "Ethical Counsellors",
    "No Commission Model", "Student-First Always", "Founded by Students",
    "Trusted by Parents", "Ground Truth Data", "Free for Everyone"
  ]
};

// Helper functions
function getCollege(slug) {
  return CG_DATA.colleges.find(c => c.slug === slug);
}
function getCollegeById(id) {
  return CG_DATA.colleges.find(c => c.id === id);
}
function getReviewsForCollege(collegeId) {
  return CG_DATA.reviews.filter(r => r.collegeId === collegeId);
}
function searchColleges(query) {
  const q = query.toLowerCase();
  return CG_DATA.colleges.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.city.toLowerCase().includes(q) ||
    c.type.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );
}
function searchCourses(query) {
  const q = query.toLowerCase();
  return CG_DATA.courses.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.type.toLowerCase().includes(q)
  );
}
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '½';
  for (let i = full + (half ? 1 : 0); i < 5; i++) s += '☆';
  return s;
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}