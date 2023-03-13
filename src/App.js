import GLBViewer from './GltfViewer';

function App() {
  return (
    <div className="App">
      <GLBViewer src="/models/nft_2.glb" frontText="Front Text" backText="Back Text" />
    </div>
  );
}

export default App;
