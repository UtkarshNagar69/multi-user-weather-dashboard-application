export default function CityCardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: '24px', minHeight: '230px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div className="skeleton" style={{ width: '130px', height: '20px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '45px', height: '12px' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
        </div>
      </div>

      {/* Weather display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 20px' }}>
        <div className="skeleton" style={{ width: '68px', height: '68px', borderRadius: '18px', flexShrink: 0 }} />
        <div>
          <div className="skeleton" style={{ width: '100px', height: '40px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '80px', height: '14px' }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px', display: 'flex', gap: '8px' }}>
        <div className="skeleton" style={{ width: '85px', height: '30px', borderRadius: '20px' }} />
        <div className="skeleton" style={{ width: '65px', height: '30px', borderRadius: '20px' }} />
        <div className="skeleton" style={{ width: '95px', height: '30px', borderRadius: '20px' }} />
      </div>
    </div>
  );
}
