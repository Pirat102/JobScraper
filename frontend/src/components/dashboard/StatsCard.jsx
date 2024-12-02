const StatsCard = ({ title, children }) => {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
        <div className="space-y-2">
          {children}
        </div>
      </div>
    );
  };
  
  export default StatsCard;