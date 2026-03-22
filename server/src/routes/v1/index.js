const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const collegeRoutes = require('./collegeRoutes');
const courseRoutes = require('./courseRoutes');
const examRoutes = require('./examRoutes');
const reviewRoutes = require('./reviewRoutes');
const blogRoutes = require('./blogRoutes');
const enquiryRoutes = require('./enquiryRoutes');
const comparisonRoutes = require('./comparisonRoutes');
const mediaRoutes = require('./mediaRoutes');
const importExportRoutes = require('./importExportRoutes');
const adminRoutes = require('./adminRoutes');
const collegeCourseRoutes = require('./collegeCourseRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/colleges', collegeRoutes);
router.use('/courses', courseRoutes);
router.use('/exams', examRoutes);
router.use('/reviews', reviewRoutes);
router.use('/blogs', blogRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/comparisons', comparisonRoutes);
router.use('/media', mediaRoutes);
router.use('/import-export', importExportRoutes);
router.use('/admin', adminRoutes);
router.use('/college-courses', collegeCourseRoutes);

module.exports = router;