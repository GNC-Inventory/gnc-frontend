import StatsCard from './StatsCard';

export default function PendingSale2Card() {
  const handleResume = () => {
    console.log('Resuming pending sale 2');
    // Handle resume logic here
  };

  return (
    <StatsCard 
      title="Pending sale 2"
      value="₦ 43,000"
      hasResumeLink={true}
      resumeLinkText="Resume"
      onResumeClick={handleResume}
    />
  );
}