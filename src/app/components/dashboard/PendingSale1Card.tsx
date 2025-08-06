import StatsCard from './StatsCard';

export default function PendingSale1Card() {
  const handleResume = () => {
    console.log('Resuming pending sale 1');
    // Handle resume logic here
  };

  return (
    <StatsCard 
      title="Pending sale 1"
      value="₦ 4,000"
      hasResumeLink={true}
      resumeLinkText="Resume"
      onResumeClick={handleResume}
    />
  );
}