
const Loader = ({ fullPage = false, message = "Loading..." }) => {
  const keyframes = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.85;
        transform: scale(0.98);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease-in-out'
  };

  const logoContainerStyle = {
    marginBottom: '30px',
    animation: 'pulse 2s ease-in-out infinite'
  };

  const messageStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#011744',
    marginTop: '20px',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(255, 255, 255, 0.8)'
  };

  const subMessageStyle = {
    fontSize: '14px',
    color: '#566a7f',
    marginTop: '8px',
    textAlign: 'center',
    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
  };

  // Vimano Tech Brand Logo SVG
  const BrandLogo = () => (
    <svg
      width="250"
      height="56"
      viewBox="0 0 252 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))' }}
    >
      <path
        d="M18 42.184C25.732 42.184 32 35.916 32 28.184C32 20.452 25.732 14.184 18 14.184C10.268 14.184 4 20.452 4 28.184C4 35.916 10.268 42.184 18 42.184Z"
        fill="#011744"
      />
      <path
        d="M31.7715 14.184C33.61 14.184 35.4305 14.5461 37.1291 15.2497C38.8276 15.9533 40.371 16.9845 41.671 18.2845C42.971 19.5845 44.0022 21.1279 44.7058 22.8264C45.4094 24.525 45.7715 26.3455 45.7715 28.184C45.7715 30.0225 45.4094 31.843 44.7058 33.5416C44.0022 35.2401 42.971 36.7835 41.671 38.0835C40.371 39.3835 38.8276 40.4147 37.129 41.1183C35.4305 41.8219 33.61 42.184 31.7715 42.184V28.184V14.184Z"
        fill="#011744"
      />
      <path
        d="M59.6115 15.36H64.1869L69.563 32L74.9389 15.36H79.6109L71.5789 37.184H67.4829L59.6115 15.36ZM83.5229 15.04C84.6429 15.04 85.9549 15.968 85.9549 17.376C85.9549 18.656 84.8989 19.712 83.6189 19.712C82.2429 19.712 81.2829 18.624 81.2829 17.376C81.2829 16.064 82.4029 15.04 83.5229 15.04ZM81.6349 22.304H85.6029V37.184H81.6349V22.304ZM98.171 21.952C100.219 21.952 101.595 22.976 102.363 24.896C103.483 22.944 105.019 21.952 106.939 21.952C109.915 21.952 111.643 24.224 111.643 27.04V37.184H107.675V27.936C107.675 27.04 107.035 25.952 105.915 25.952C104.059 25.952 102.747 28.192 102.747 30.624V37.184H98.779V28.288C98.779 27.008 98.1389 25.984 97.0189 25.984C95.1949 25.984 93.8509 28.256 93.8509 30.88V37.184H89.8829V22.304H93.5949L93.8189 24.608H93.8829C94.8749 22.912 96.283 21.952 98.171 21.952ZM121.931 21.952C126.251 21.952 128.587 24.48 128.587 27.712V31.968C128.587 34.016 129.067 35.744 129.931 37.184H125.291C124.939 36.544 124.811 36.128 124.715 35.264C123.403 36.896 121.899 37.536 120.075 37.536C116.939 37.536 114.667 35.328 114.667 32.736C114.667 31.712 114.955 30.88 115.531 30.208C116.651 28.896 118.603 28.224 123.467 27.488L124.523 27.328C124.235 26.016 122.795 25.216 121.227 25.216C119.755 25.216 118.219 25.664 116.139 27.04V23.424C117.963 22.528 119.883 21.952 121.931 21.952ZM118.795 32.736C118.795 33.856 119.819 34.4 120.939 34.4C122.859 34.4 124.555 32.704 124.907 30.112C120.555 30.688 118.795 31.2 118.795 32.736ZM141.523 21.952C144.947 21.952 146.771 24.288 146.771 27.36V37.184H142.803V28.448C142.803 27.072 142.355 25.792 140.627 25.792C138.355 25.792 136.819 28.192 136.819 31.008V37.184H132.851V22.304H136.499L136.819 24.64C137.971 22.848 139.443 21.952 141.523 21.952ZM157.954 21.952C163.01 21.952 166.338 25.504 166.338 29.76C166.338 33.984 162.914 37.536 158.114 37.536C153.41 37.536 149.986 34.176 149.986 29.792C149.986 25.408 153.634 21.952 157.954 21.952ZM154.242 29.728C154.242 32.256 156.098 34.016 158.242 34.016C160.45 34.016 162.082 31.968 162.082 29.792C162.082 27.68 160.546 25.472 158.242 25.472C156.002 25.472 154.242 27.296 154.242 29.728Z"
        fill="#FF661F"
      />
      <path
        d="M167.682 15.36H184.29V19.008H177.986V37.184H173.826V19.008H167.682V15.36ZM191.699 21.952C195.987 21.952 199.091 24.96 199.091 29.728V30.272H188.083C188.723 32.768 190.739 33.888 192.627 33.888C194.803 33.888 196.723 32.832 198.515 31.424V35.488C195.955 36.896 193.907 37.536 191.987 37.536C187.283 37.536 183.955 33.92 183.955 29.792C183.955 25.696 187.251 21.952 191.699 21.952ZM188.435 27.552H194.803C194.547 25.856 193.107 24.928 191.827 24.928C190.323 24.928 188.947 25.92 188.435 27.552ZM209.074 21.952C210.706 21.952 212.21 22.4 213.586 23.328V27.264C211.858 25.76 210.546 25.6 209.682 25.6C207.346 25.6 205.554 27.328 205.554 29.76C205.554 32.096 207.186 33.888 209.618 33.888C211.314 33.888 212.562 32.992 213.586 32.224V36.16C212.05 37.088 210.418 37.536 208.85 37.536C204.466 37.536 201.298 33.92 201.298 29.824C201.298 25.696 204.498 21.952 209.074 21.952ZM216.883 15.36H220.851V24.64H220.915C221.907 22.912 223.507 21.952 225.555 21.952C228.883 21.952 230.739 24.32 230.739 27.424V37.184H226.771V28.192C226.771 26.528 225.683 25.792 224.531 25.792C222.387 25.792 220.851 28.128 220.851 31.008V37.184H216.883V15.36Z"
        fill="#011744"
      />
      <path
        d="M233.879 13H239.783V13.72H237.239V21.184H236.423V13.72H233.879V13ZM240.825 13H241.785L244.509 17.884L247.257 13H248.229V21.184H247.485V16.108C247.485 15.82 247.509 15.148 247.581 13.768H247.485C246.909 14.956 246.741 15.292 246.357 15.988L244.509 19.324L242.889 16.396C242.757 16.156 242.157 15.04 241.581 13.804H241.485C241.521 14.872 241.581 16.072 241.581 16.756V21.184H240.825V13Z"
        fill="#011744"
      />
    </svg>
  );

  if (!fullPage) {
    // Small inline loader (original behavior)
    const smallLoaderStyle = {
      '--uib-size': '20px',
      '--uib-color': '#696cff',
      '--uib-speed': '0.9s',
      '--uib-stroke': '3px',
      '--mask-size': 'calc(var(--uib-size) / 2 - var(--uib-stroke))',
      position: 'relative',
      display: 'inline-block',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'var(--uib-size)',
      width: 'var(--uib-size)',
      WebkitMask: 'radial-gradient(circle var(--mask-size), transparent 99%, #000 100%)',
      mask: 'radial-gradient(circle var(--mask-size), transparent 99%, #000 100%)',
      backgroundImage: 'conic-gradient(transparent 25%, var(--uib-color))',
      animation: 'spin var(--uib-speed) linear infinite',
      borderRadius: '50%'
    };

    return (
      <div>
        <style>{keyframes}</style>
        <div style={smallLoaderStyle}></div>
      </div>
    );
  }

  // Full page loader with brand logo
  return (
    <>
      <style>{keyframes}</style>
      <div style={overlayStyle}>
        <div style={logoContainerStyle}>
          <BrandLogo />
        </div>
        <div style={messageStyle}>{message}</div>
        <div style={subMessageStyle}>Please wait...</div>
      </div>
    </>
  );
};

// UniversalLoader - Spinner loader for page transitions
export const UniversalLoader = ({ message = "Loading..." }) => {
  const keyframes = `
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(223, 223, 223, 0.3)',
    backdropFilter: 'blur(1px)',
    WebkitBackdropFilter: 'blur(3px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    animation: 'fadeIn 0.2s ease-in-out'
  };

  const spinnerContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const spinnerStyle = {
    width: '80px',
    height: '80px',
    animation: 'spin 1s linear infinite'
  };

  const messageStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#011744',
    marginTop: '24px',
    textAlign: 'center'
  };

  const subMessageStyle = {
    fontSize: '14px',
    color: '#566a7f',
    marginTop: '8px',
    textAlign: 'center'
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={overlayStyle}>
        <div style={spinnerContainerStyle}>
          <img
            src="https://static.wixstatic.com/media/567acd_0c5a07a9ef374c05a512faac4d674538%7Emv2.png/v1/fill/w_192%2Ch_192%2Clg_1%2Cusm_0.66_1.00_0.01/567acd_0c5a07a9ef374c05a512faac4d674538%7Emv2.png"
            alt="Loading"
            style={spinnerStyle}
          />
          <div style={messageStyle}>{message}</div>
          <div style={subMessageStyle}>Please wait...</div>
        </div>
      </div>
    </>
  );
};

export default Loader;



// import React from "react";

// const Loader = () => {
//   const loaderStyle = {
//     '--uib-size': '20px',
//     '--uib-color': 'white',
//     '--uib-speed': '0.9s',
//     '--uib-stroke': '5px',
//     '--mask-size': 'calc(var(--uib-size) / 2 - var(--uib-stroke))',
//     position: 'relative',
//     display: 'inline-block',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 'var(--uib-size)',
//     width: 'var(--uib-size)',
//     WebkitMask: 'radial-gradient(circle var(--mask-size), transparent 99%, #000 100%)',
//     mask: 'radial-gradient(circle var(--mask-size), transparent 99%, #000 100%)',
//     backgroundImage: 'conic-gradient(transparent 25%, var(--uib-color))',
//     animation: 'spin var(--uib-speed) linear infinite',
//     borderRadius: '50%'
//   };

//   const keyframes = `
//     @keyframes spin {
//       0% {
//         transform: rotate(0deg);
//       }
//       100% {
//         transform: rotate(360deg);
//       }
//     }
//   `;

//   return (
//     <div>
//       <style>{keyframes}</style>
//       <div style={loaderStyle}></div>
//     </div>
//   );
// };

// export default Loader;
