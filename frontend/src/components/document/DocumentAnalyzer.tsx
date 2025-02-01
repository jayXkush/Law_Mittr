import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemIcon
} from '@mui/material';
import { motion } from 'framer-motion';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAuth } from '../../context/AuthContext';

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  legalActs: { name: string; definition: string; application: string }[];
  legalImplications: string[];
  recommendations: string[];
}

const DocumentAnalyzer = () => {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Accept PDF, Word documents, and common image formats
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF, Word document, or image file (JPG, JPEG, PNG)');
        setFile(null);
      }
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Convert file to text content
      const fileContent = await getFileContent(file);
      
      // Call Gemini API
      const API_KEY = 'AIzaSyB99T6jpCq62Jp2CrvoU8m_GFujDqNOdpc';
      
      // Optimize the content length if it's too long
      let optimizedContent = fileContent;
      if (fileContent.length > 10000) {
        optimizedContent = fileContent.substring(0, 10000) + '... (content truncated for length)';
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this document and provide a structured analysis with all sections marked clearly:

SUMMARY:
Brief overview of the document (2-3 sentences)

KEY POINTS:
1.
2.
3.

LEGAL ACTS AND CLAUSES:
1. [Act/Clause Name]:
   Definition: [Brief definition]
   Application: [How it applies to this document]
2. [Act/Clause Name]:
   Definition: [Brief definition]
   Application: [How it applies to this document]

LEGAL IMPLICATIONS:
1.
2.
3.

RECOMMENDATIONS:
1.
2.
3.


Content: ${optimizedContent}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800, // Increased to accommodate longer summary
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        // Handle specific error cases
        if (errorData.error?.message?.includes('quota')) {
          throw new Error('API quota exceeded. Please try again later or contact support for a higher quota limit.');
        } else if (errorData.error?.message?.includes('rate limit')) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else {
          throw new Error(errorData.error?.message || 'Failed to analyze document');
        }
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      // Parse Gemini's response
      const text = data.candidates[0].content.parts[0].text;
      
      // Extract sections using more precise regex patterns with clear boundaries
      const extractSection = (text: string, sectionName: string, nextSection: string): string[] => {
        const pattern = new RegExp(`${sectionName}:(.*?)(?=${nextSection}|$)`, 's');
        const match = text.match(pattern);
        if (!match) return [];
        
        return match[1]
          .trim()
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && /^\d+\./.test(line))
          .map(line => line.replace(/^\d+\.\s*/, '').replace(/\*/g, '').trim());
      };

      const extractActsAndClauses = (text: string): { name: string; definition: string; application: string }[] => {
        const pattern = /LEGAL ACTS AND CLAUSES:(.*?)(?=LEGAL IMPLICATIONS:|$)/s;
        const match = text.match(pattern);
        if (!match) return [];

        const actsSection = match[1].trim();
        const acts = actsSection.split(/\d+\./).slice(1); // Skip the first empty element

        return acts.map(act => {
          const lines = act.trim().split('\n').map(line => line.trim());
          const name = lines[0].replace(':', '').trim().replace(/\*/g, '');
          const definition = lines.find(line => line.startsWith('Definition:'))?.replace('Definition:', '').trim().replace(/\*/g, '') || '';
          const application = lines.find(line => line.startsWith('Application:'))?.replace('Application:', '').trim().replace(/\*/g, '') || '';
          
          return { name, definition, application };
        }).filter(act => act.name && (act.definition || act.application));
      };

      const sections = {
        summary: text.match(/SUMMARY:(.*?)(?=KEY POINTS:|$)/s)?.[1]?.trim().replace(/\*/g, '') || 'No summary available',
        keyPoints: extractSection(text, 'KEY POINTS', 'LEGAL ACTS AND CLAUSES'),
        legalActs: extractActsAndClauses(text),
        legalImplications: extractSection(text, 'LEGAL IMPLICATIONS', 'RECOMMENDATIONS'),
        recommendations: extractSection(text, 'RECOMMENDATIONS', '$')
      };

      // Ensure we have at least placeholder text for empty sections
      if (sections.keyPoints.length === 0) sections.keyPoints = ['No key points available'];
      if (sections.legalImplications.length === 0) sections.legalImplications = ['No legal implications available'];
      if (sections.recommendations.length === 0) sections.recommendations = ['No recommendations available'];

      setAnalysis({
        summary: sections.summary,
        keyPoints: sections.keyPoints,
        legalActs: sections.legalActs,
        legalImplications: sections.legalImplications,
        recommendations: sections.recommendations
      });
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze document. Please try again.';
      setError(errorMessage);
      
      // Show a more helpful message in the UI
      if (errorMessage.includes('quota')) {
        setError('The document analysis service is currently unavailable due to high demand. Please try again in a few minutes or contact support if the issue persists.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get file content based on file type
  const getFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          if (file.type.includes('image/')) {
            // For images, we'll return the base64 data
            const base64Data = e.target?.result as string;
            resolve(base64Data);
          } else {
            // For documents, we'll return the text content
            const text = e.target?.result as string;
            resolve(text);
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      if (file.type.includes('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{
              mb: 4,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Document & Image Analysis
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <input
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="document-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="document-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                sx={{
                  py: 2,
                  px: 4,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Upload Document
              </Button>
            </label>

            {file && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {file.name}
                </Typography>
                <Button
                  variant="contained"
                  onClick={analyzeDocument}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Analyze Document'
                  )}
                </Button>
              </Box>
            )}

            {analysis && (
              <Box sx={{ width: '100%', mt: 4 }}>
                <Typography variant="h5" gutterBottom sx={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600,
                  mb: 3
                }}>
                  Analysis Results
                </Typography>
                
                <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
                    Summary
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: '#334155' }}>
                    {analysis.summary}
                  </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
                    Key Points
                  </Typography>
                  <List>
                    {analysis.keyPoints.map((point, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <div style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            backgroundColor: '#2563eb',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px'
                          }}>
                            {index + 1}
                          </div>
                        </ListItemIcon>
                        <ListItemText primary={point} sx={{ color: '#334155' }} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
                    Legal Acts and Clauses
                  </Typography>
                  <List>
                    {analysis.legalActs.map((act, index) => (
                      <ListItem key={index} sx={{ py: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle1" sx={{ color: '#1e40af', fontWeight: 600, mb: 1 }}>
                          {act.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155', mb: 1 }}>
                          <strong>Definition:</strong> {act.definition}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          <strong>Application:</strong> {act.application}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
                    Legal Implications
                  </Typography>
                  <List>
                    {analysis.legalImplications.map((implication, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <div style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            backgroundColor: '#2563eb',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px'
                          }}>
                            {index + 1}
                          </div>
                        </ListItemIcon>
                        <ListItemText primary={implication} sx={{ color: '#334155' }} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1e40af', fontWeight: 600 }}>
                    Recommendations
                  </Typography>
                  <List>
                    {analysis.recommendations.map((recommendation, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <div style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            backgroundColor: '#2563eb',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px'
                          }}>
                            {index + 1}
                          </div>
                        </ListItemIcon>
                        <ListItemText primary={recommendation} sx={{ color: '#334155' }} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default DocumentAnalyzer;
