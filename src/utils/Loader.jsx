const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(244, 246, 249, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999
      }}>
        <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
      </div>
    );
  }

  return <div className="spinner" />;
};

export default Loader;
