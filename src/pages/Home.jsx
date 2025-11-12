import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/footer";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Advanced Kidney Cancer Detection
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Leverage the power of AI for early and accurate detection of kidney
            cancer from medical imaging.
          </p>
          <div className="space-x-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
            </Link>
            <a
              href="#how-it-works"
              className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-medium border border-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers cutting-edge technology for kidney cancer
              detection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Analysis",
                description:
                  "Advanced machine learning algorithms for accurate detection of kidney anomalies.",
                icon: "🔍",
              },
              {
                title: "Fast Results",
                description:
                  "Get instant analysis and results to speed up diagnosis and treatment planning.",
                icon: "⚡",
              },
              {
                title: "Secure & Private",
                description:
                  "Your data is encrypted and protected with the highest security standards.",
                icon: "🔒",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to get your kidney scan analyzed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "1",
                title: "Upload Scan",
                description:
                  "Securely upload your kidney scan images to our platform.",
              },
              {
                number: "2",
                title: "AI Analysis",
                description:
                  "Our AI processes the images to detect potential anomalies.",
              },
              {
                number: "3",
                title: "Get Results",
                description: "Receive detailed analysis and recommendations.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join thousands of healthcare professionals using our platform for
            accurate kidney cancer detection.
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/signup"}
            className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors inline-block"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
