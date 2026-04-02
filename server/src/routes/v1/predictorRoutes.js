const express             = require('express');
const predictorController = require('../../controllers/predictorController');
const { protect }         = require('../../middleware/auth');

const router = express.Router();

router.use(protect); // Login required for all predictor endpoints

router.get('/colleges', predictorController.predictColleges);
router.get('/courses',  predictorController.predictCourses);
router.get('/exams',    predictorController.predictExams);
// Detailed single college-course analysis
router.get('/college-detail', predictorController.getCollegeDetailedAnalysis);
router.get('/colleges-for-course', predictorController.predictCollegesForCourse);
router.get('/exam-college-map',    predictorController.getExamCollegeMap);
router.post('/analyze', predictorController.analyzeResults);



module.exports = router;
