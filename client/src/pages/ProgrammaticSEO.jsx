import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CollegeCard from '../components/colleges/CollegeCard';
import Pagination from '../components/common/Pagination/Pagination';
import Loader from '../components/common/Loader/Loader';
import EnquiryForm from '../components/enquiries/EnquiryForm';
import { collegeService } from '../services/collegeService';

const ProgrammaticSEO = () => {
  const { courseSlug, locationSlug } = useParams();

  // Support both old format ("haryana") and new format ("haryana-colleges")
  const rawLocation = locationSlug || '';
  const location = rawLocation.endsWith('-colleges')
    ? rawLocation.slice(0, -'-colleges'.length)   // "haryana-colleges" → "haryana"
    : rawLocation;

  const courseLabel = courseSlug ? courseSlug.toUpperCase() : '';
  const locationLabel = location ? location.charAt(0).toUpperCase() + location.slice(1) : '';
  const pageTitle = `${courseLabel} Colleges in ${locationLabel} ${new Date().getFullYear()}`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [showEnquiry, setShowEnquiry] = useState(false);
  

  // const courseLabel = courseSlug ? courseSlug.toUpperCase() : '';
  // const locationLabel = location
    // ? location.charAt(0).toUpperCase() + location.slice(1)
    // : '';
  // const pageTitle = `${courseLabel} Colleges in ${locationLabel}`;

  useEffect(() => {
    if (!courseSlug || !location) return;
    setLoading(true);
    setError(null);
    collegeService
      .getCollegesByCourseAndLocation(courseSlug, location, { page, limit: 12 })
      .then((res) => setData(res.data?.data || res.data))
      .catch(() => setError('No colleges found for this combination.'))
      .finally(() => setLoading(false));
  }, [courseSlug, location, page]);

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* SEO Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{pageTitle}</h1>
      <p className="text-gray-600 mb-6">
        Explore top {courseLabel} colleges in {locationLabel}. Compare fees, placements,
        rankings, and reviews to find the best college for you.
      </p>

      {error ? (
        <div className="text-center py-16 text-gray-500">{error}</div>
      ) : (
        <>
          {/* Stats bar */}
          {data?.total > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {data.colleges?.length || 0} of {data.total} colleges
            </p>
          )}

          {/* College grid */}
          {data?.colleges?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.colleges.map((college) => (
                <CollegeCard key={college._id} college={college} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              No colleges found for {courseLabel} in {locationLabel}.
            </div>
          )}

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}

          {/* CTA */}
          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-blue-800 mb-2">
              Need help choosing the right college?
            </h2>
            <p className="text-blue-600 mb-4">
              Our expert counsellors will guide you through admissions for {courseLabel} in {locationLabel}.
            </p>
            <button
              onClick={() => setShowEnquiry(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Free Counselling
            </button>
          </div>

          {showEnquiry && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
                <button
                  onClick={() => setShowEnquiry(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
                <EnquiryForm defaultCourse={courseLabel} defaultCity={locationLabel} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProgrammaticSEO;
