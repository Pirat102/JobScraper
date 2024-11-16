import '../styles/Pagination.css';

const Pagination = ({ next, previous, onPageChange }) => {
  if (!next && !previous) return null;

  return (
    <nav className="pagination-nav">
      <button
        onClick={() => onPageChange(previous)}
        disabled={!previous}
        className="pagination-button"
      >
        Previous
      </button>
      
      <button
        onClick={() => onPageChange(next)}
        disabled={!next}
        className="pagination-button"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;