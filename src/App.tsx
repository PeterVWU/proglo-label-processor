import MultiPDFUploader from './components/MultiPDFUploader';
import './App.css'

function App() {

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Proglo Label Processor</h1>
      <MultiPDFUploader />
    </div>
  )
}

export default App
