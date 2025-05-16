import React, { useState } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

const ATSChecker = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid PDF file')
      setFile(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('pdf_doc', file)

    try {
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || 'Failed to process resume')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#eab308'
    return '#ef4444'
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ATS Score Checker</h1>
          <p className="mt-2 text-gray-600">Upload your resume to get ATS score and detailed analysis</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF only</p>
                </div>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </label>
            </div>
            {file && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Selected file: {file.name}</p>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Analyze Resume'}
                </button>
              </div>
            )}
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {/* ATS Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ATS Score Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score Display */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 mb-4">
                    <CircularProgressbar
                      value={result.ats_score}
                      text={`${result.ats_score}%`}
                      styles={buildStyles({
                        pathColor: getScoreColor(result.ats_score),
                        textColor: getScoreColor(result.ats_score),
                      })}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Score</h3>
                    <p className="text-sm text-gray-600">
                      {result.ats_score >= 80 ? 'Excellent! Your resume is well-optimized for ATS systems.' :
                       result.ats_score >= 60 ? 'Good! Your resume has potential but could use some improvements.' :
                       'Your resume needs significant improvements to pass ATS screening.'}
                    </p>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
                  
                  {/* Formatting Score */}
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Formatting</span>
                      <span className="text-sm font-medium text-gray-900">85/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Your resume has good formatting with clear sections and consistent styling.</p>
                  </div>

                  {/* Keywords Score */}
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Keywords & Skills</span>
                      <span className="text-sm font-medium text-gray-900">75/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Good technical skills listed, but could benefit from more industry-specific keywords.</p>
                  </div>

                  {/* Experience Score */}
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Experience Description</span>
                      <span className="text-sm font-medium text-gray-900">90/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Excellent use of metrics and achievements in experience descriptions.</p>
                  </div>

                  {/* Education Score */}
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Education</span>
                      <span className="text-sm font-medium text-gray-900">95/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Clear education history with relevant details and achievements.</p>
                  </div>
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions for Improvement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <h4 className="font-medium text-blue-900 mb-2">Keywords Optimization</h4>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                      <li>Add more industry-specific technical terms</li>
                      <li>Include relevant certifications</li>
                      <li>Highlight specific tools and technologies</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <h4 className="font-medium text-blue-900 mb-2">Format Enhancement</h4>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                      <li>Ensure consistent date formats</li>
                      <li>Use standard section headings</li>
                      <li>Maintain consistent bullet point style</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <h4 className="font-medium text-blue-900 mb-2">Content Structure</h4>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                      <li>Quantify more achievements with metrics</li>
                      <li>Add more action verbs to descriptions</li>
                      <li>Include relevant industry buzzwords</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <h4 className="font-medium text-blue-900 mb-2">Best Practices</h4>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                      <li>Keep file size under 500KB</li>
                      <li>Use standard fonts (Arial, Times New Roman)</li>
                      <li>Save in PDF format for best compatibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ATSChecker
