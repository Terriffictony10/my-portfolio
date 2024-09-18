import ProgressBar from 'react-bootstrap/ProgressBar';

const CrowdsaleProgress = ({ maxTokens, tokensSold }) => {
    return (
        <div className='text-center'>
            <ProgressBar now={((tokensSold / maxTokens) * 100)} label={`${(tokensSold / maxTokens) * 100}%`} />
            <p>{tokensSold} / {maxTokens} Tokens sold</p>
        </div>
    );
}

export default CrowdsaleProgress;