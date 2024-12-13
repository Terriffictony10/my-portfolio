import Image from 'next/image';
import { useRouter } from 'next/router';

export default function SimpleTemplate() {
  const router = useRouter();

  const navigateToIndex = () => {
    router.push('/');
  };

  const navigateToDashboard = () => {
    router.push('/Dashboard');
  };

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100vh', 
        backgroundColor: '#1E90FF', /* Blue background */
        position: 'relative' 
      }}
    >
      {/* Logo in the top-left corner */}
      <div
        style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          cursor: 'pointer' 
        }}
        onClick={navigateToIndex}
      >
        <Image
          src="/Decentralized.png"
          alt="Decentralized Logo"
          width={150}
          height={150}
          priority={true}
        />
      </div>

      {/* Navigation Buttons at the bottom */}
      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
        }}
      >
        <button
          onClick={navigateToIndex}
          style={{
            backgroundColor: '#6c757d',
            border: 'none',
            borderRadius: '5px',
            color: '#fff',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Go to Main Page
        </button>
        <button
          onClick={navigateToDashboard}
          style={{
            backgroundColor: '#6c757d',
            border: 'none',
            borderRadius: '5px',
            color: '#fff',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Go Back to Main Dashboard
        </button>
      </div>
    </div>
  );
}
