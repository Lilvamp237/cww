import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 180,
  height: 180,
}
 
export const contentType = 'image/png'
 
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
          borderRadius: '20%',
        }}
      >
        {/* Heart Icon */}
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 21C12 21 4 14 4 8C4 5 6 3 9 3C10.5 3 12 4 12 6C12 4 13.5 3 15 3C18 3 20 5 20 8C20 14 12 21 12 21Z"
            fill="white"
            opacity="0.95"
          />
        </svg>
        
        {/* Pulse Line */}
        <div
          style={{
            display: 'flex',
            width: '140px',
            height: '4px',
            background: 'white',
            opacity: 0.9,
            marginTop: '10px',
          }}
        />
        
        {/* Plus Sign */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            right: '30px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#3b82f6',
              display: 'flex',
            }}
          >
            +
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
