const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div>
            <h3 className="text-center text-lg font-semibold mb-4">KidneyAI</h3>
            <p className="text-center text-gray-400">
              Advanced AI for early detection of kidney cancer through medical
              imaging.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} KidneyAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
