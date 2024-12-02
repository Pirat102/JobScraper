import Dashboard from "../components/dashboard/Dashboard";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Market Dashboard</h1>
        <Dashboard />
      </div>
    </div>
  );
};

export default Home;