import ProgressBar from 'react-bootstrap/ProgressBar';

const CrowdsaleProgress = ({ maxTokens, tokensSold, fundingGoal }) => {
  const maxTokensNum = parseFloat(maxTokens);
  const tokensSoldNum = parseFloat(tokensSold);
  const fundingGoalNum = parseFloat(fundingGoal);
  const tokenSalePercentage = maxTokensNum > 0 ? (tokensSoldNum / maxTokensNum) * 100 : 0;
  const fundsRaised = (tokenSalePercentage / 100) * fundingGoalNum;
  return (
    <div className="text-center" style={{ fontSize: '0.6rem' }}>
      <ProgressBar now={tokenSalePercentage} label={`${tokenSalePercentage.toFixed(2)}%`} style={{ height: '1.5rem' }} />
      <p style={{ marginTop: '0.2rem', fontSize: "1.5rem" }}>
        {fundsRaised.toFixed(2)} ETH raised out of {fundingGoalNum} ETH
      </p>
    </div>
  );
};

export default CrowdsaleProgress;
