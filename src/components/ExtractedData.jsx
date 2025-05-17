import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

const ExtractedData = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');

  const validatePDF = (file) => {
    // Check if file exists
    if (!file) {
      return 'Please select a file';
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Please upload a PDF file';
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size should be less than 5MB';
    }

    return null;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const validationError = validatePDF(selectedFile);
    
    if (validationError) {
      setError(validationError);
      setFile(null);
      event.target.value = null; // Reset file input
    } else {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/parse-resume`, formData, {
        headers: {  
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response from server:', response.data);

      if (response.data.error) {
        setError(response.data.details || response.data.error);
        setParsedData(null);
      } else {
        setParsedData(response.data);
        setError('');
      }
    } catch (err) {
      console.error('Error details:', err);
      const errorMessage = err.response?.data?.details || 
                          err.response?.data?.error || 
                          err.message || 
                          'Error parsing resume. Please try again.';
      setError(errorMessage);
      setParsedData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = (data) => {
    if (!data) return null;
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p><span className="font-semibold">Name:</span> {data.full_name || 'N/A'}</p>
            <p><span className="font-semibold">Location:</span> {data.location || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-semibold">Phone:</span> {data.contact?.phone || 'N/A'}</p>
            <p><span className="font-semibold">Email:</span> {data.contact?.email || 'N/A'}</p>
          </div>
        </div>
        {data.contact?.professional_links && Object.keys(data.contact.professional_links).length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Professional Links:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(data.contact.professional_links).map(([platform, link]) => (
                link && (
                  <p key={platform} className="flex items-center gap-2">
                    <span className="font-semibold capitalize">{platform}:</span>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {link}
                    </a>
                  </p>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEducation = (education) => {
    if (!education || !Array.isArray(education)) return null;
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Education</h2>
        <div className="grid gap-4">
          {education.map((edu, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><span className="font-semibold">Degree:</span> {edu.degree || 'N/A'}</p>
                    <p><span className="font-semibold">Institute:</span> {edu.institute || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-semibold">Board/University:</span> {edu.board_university || 'N/A'}</p>
                    <p><span className="font-semibold">Score:</span> {edu.score || 'N/A'}</p>
                    <p><span className="font-semibold">Year:</span> {edu.year || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = (skills) => {
    if (!skills || typeof skills !== 'object') return null;
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(skills).map(([category, skillList]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-lg font-semibold capitalize">
                {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
              </h3>
              <p className="text-gray-700">
                {Array.isArray(skillList) ? skillList.join(', ') : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExperience = (experience) => {
    if (!experience || !Array.isArray(experience)) return null;
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Experience</h2>
        <div className="grid gap-4">
          {experience.map((exp, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{exp.title || 'N/A'}</h3>
                      <p className="text-gray-600">{exp.company || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">{exp.location || 'N/A'}</p>
                      <p className="text-gray-600">{exp.duration || 'N/A'}</p>
                    </div>
                  </div>
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Achievements:</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="text-gray-700">{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = (projects) => {
    if (!projects || !Array.isArray(projects)) return null;
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Projects</h2>
        <div className="grid gap-4">
          {projects.map((project, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{project.name || 'N/A'}</h3>
                    <p className="text-gray-600 mt-2">
                      <span className="font-semibold">Technologies:</span>{' '}
                      {Array.isArray(project.technologies) ? project.technologies.join(', ') : 'N/A'}
                    </p>
                  </div>
                  {project.links && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {project.links.live_site && (
                        <a href={project.links.live_site} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          Live Site
                        </a>
                      )}
                      {project.links.github_repo && (
                        <a href={project.links.github_repo} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:underline">
                          GitHub Repository
                        </a>
                      )}
                    </div>
                  )}
                  {project.achievements && project.achievements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Achievements:</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {project.achievements.map((achievement, i) => (
                          <li key={i} className="text-gray-700">{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="resume-upload"
                />
                <Button variant="outline" className="w-[200px]">
                  <Upload className="mr-2 h-4 w-4" />
                  Select Resume
                </Button>
              </div>
              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  'Parse Resume'
                )}
              </Button>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected file: {file.name}
              </p>
            )}
            {error && (
              <Alert variant="destructive" className="w-full max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {parsedData && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {parsedData.personal_info && renderPersonalInfo(parsedData.personal_info)}
            {parsedData.education && (
              <>
                <Separator />
                {renderEducation(parsedData.education)}
              </>
            )}
            {parsedData.skills && (
              <>
                <Separator />
                {renderSkills(parsedData.skills)}
              </>
            )}
            {parsedData.experience && (
              <>
                <Separator />
                {renderExperience(parsedData.experience)}
              </>
            )}
            {parsedData.projects && (
              <>
                <Separator />
                {renderProjects(parsedData.projects)}
              </>
            )}
            {parsedData.achievements && parsedData.achievements.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Achievements</h2>
                  <ul className="list-disc list-inside space-y-2">
                    {parsedData.achievements.map((achievement, index) => (
                      <li key={index} className="text-gray-700">{achievement}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {parsedData.positions_of_responsibility && parsedData.positions_of_responsibility.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Positions of Responsibility</h2>
                  <ul className="list-disc list-inside space-y-2">
                    {parsedData.positions_of_responsibility.map((position, index) => (
                      <li key={index} className="text-gray-700">{position}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExtractedData;
