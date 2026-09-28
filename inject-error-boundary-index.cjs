const fs = require('fs');
let content = fs.readFileSync('src/index.tsx', 'utf8');

const errorBoundaryCode = `
window.onerror = function(msg, url, line, col, error) {
  const errDiv = document.createElement('div');
  errDiv.style.padding = '20px';
  errDiv.style.background = '#8b0000';
  errDiv.style.color = 'white';
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.width = '100vw';
  errDiv.style.height = '100vh';
  errDiv.style.zIndex = '999999';
  errDiv.innerHTML = '<h1>Global Crash</h1><pre>' + msg + '\\n' + (error ? error.stack : '') + '</pre>';
  document.body.appendChild(errDiv);
};

window.addEventListener('unhandledrejection', function(event) {
  const errDiv = document.createElement('div');
  errDiv.style.padding = '20px';
  errDiv.style.background = '#8b0000';
  errDiv.style.color = 'white';
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.width = '100vw';
  errDiv.style.height = '100vh';
  errDiv.style.zIndex = '999999';
  errDiv.innerHTML = '<h1>Unhandled Promise Rejection</h1><pre>' + event.reason + '</pre>';
  document.body.appendChild(errDiv);
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#333', color: 'white', minHeight: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
          <h1>React Crash</h1>
          <pre style={{ color: '#ff6b6b', whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            {this.state.error && this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
`;

content = content.replace(/const container = document\.getElementById\('root'\);[\s\S]*$/, errorBoundaryCode);

fs.writeFileSync('src/index.tsx', content);
console.log('index.tsx updated with ErrorBoundary!');
