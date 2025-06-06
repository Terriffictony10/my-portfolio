import React from 'react';
import AnimatedCircularProgressBar from './magicui/animated-circular-progress-bar';

const CrowdsaleProgress = ({ maxTokens, tokensSold, fundingGoal }) => {
  const maxTokensNum = parseFloat(maxTokens);
  const tokensSoldNum = parseFloat(tokensSold);
  const fundingGoalNum = parseFloat(fundingGoal);
  const currentPercent = maxTokensNum > 0 ? ((tokensSoldNum / maxTokensNum) * 100).toFixed(0) : 0;

  return (
    <div style={{ color: "black"}}>
      <AnimatedCircularProgressBar
      className="mobileProgressBar"
        value={tokensSoldNum}
        min={0}
        max={maxTokensNum}
        gaugePrimaryColor="limegreen"
        gaugeSecondaryColor="darkgreen"
      />
      <p className="crowdsale-buy-text mt-2 text-xl text-black" style={{ transform: 'translateX(-50px)' }}>
        {tokensSoldNum} / {maxTokensNum} tokens sold ( {currentPercent}% )
      </p>
      <p className=" crowdsale-buy-text info-text mt-2 text-black" style={{ transform: 'translateX(-50px)' }}>
        {((tokensSoldNum / maxTokensNum) * fundingGoalNum).toFixed(2)} ETH raised out of {fundingGoalNum} ETH
      </p>
    </div>
  );
};

export default CrowdsaleProgress;
