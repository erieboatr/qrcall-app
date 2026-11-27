import { ImageResponse } from 'next/og'

export const ogAlt = 'QRcall — QR code service calls for maintenance teams'
export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const priorities = [
  { label: 'Critical', color: '#dc2626' },
  { label: 'High', color: '#f97316' },
  { label: 'Medium', color: '#eab308' },
  { label: 'Low', color: '#16a34a' },
]

export function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 84,
              height: 84,
              borderRadius: 18,
              backgroundColor: '#dc2626',
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            QR
          </div>
          <div style={{ fontSize: 48, fontWeight: 700 }}>QRcall</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            QR code service calls
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            for maintenance teams
          </div>
          <div style={{ marginTop: 16, fontSize: 28, color: '#cbd5e1' }}>
            Scan a code. Live color-coded board. On-duty SMS only.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {priorities.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backgroundColor: '#1e293b',
                borderRadius: 999,
                padding: '12px 20px',
                fontSize: 24,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  backgroundColor: item.color,
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...ogSize },
  )
}
