import { Spinner } from 'react-bootstrap';

const CrowdsaleLoading = () => {
	 return (
        <div className='text-center my-5'>
            <Spinner animation="grow" />
            <p className='my-2'>Loading Data...</p>
        </div>
    );
}
export default CrowdsaleLoading;