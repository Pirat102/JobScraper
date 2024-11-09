import { useState, useEffect } from "react";
import api from "../api";
import Job from "../components/Job";

function Home() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getJobs();
  }, []);

  const getJobs = () => {
    api
      .get("api/jobs/")
      .then((res) => res.data)
      .then((data) => {
        setJobs(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };

  return (
    <div>
      Home
      <div>
        <h2>Jobs</h2>
        {jobs.map((job) => (
          <Job job={job} key={job.id} />
        ))}
      </div>
    </div>
  );
}
export default Home;
