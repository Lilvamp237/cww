import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
 
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
          borderRadius: '50%',
        }}
      >
        {/* Heart Icon */}
        <svg
          width="20"
          height="20"
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
        
        {/* Pulse line */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '6px',
            right: '6px',
            height: '2px',
            background: 'white',
            opacity: 0.8,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
