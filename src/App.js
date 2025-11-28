import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL
  : 'http://localhost:5000/api';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState('home'); 
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [aiQuestion, setAiQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [candidateHistory, setCandidateHistory] = useState([]);

  const [expandedHistoryItems, setExpandedHistoryItems] = useState([]);

  const jobRoles = [
    'Full Stack Developer',
    'Backend Developer',
    'Python Developer',
    'React Developer',
    'Software Engineer',
    'Cloud Engineer'
  ];

  useEffect(() => {
    loadPersona();
  }, []);

  const loadPersona = async () => {
    try {
      const response = await axios.get(`${API_URL}/persona`);
      setPersona(response.data);
    } catch (err) {
      console.error('Error loading persona:', err);
      setError('Could not load persona data. Make sure the backend is running.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await axios.post(`${API_URL}/ask`, {
        question: question,
        jobRole: selectedRole
      });

      const newAnswer = response.data.answer;
      setAnswer(newAnswer);
      
      setHistory([
        { question, answer: newAnswer, timestamp: new Date() },
        ...history
      ]);
      
      setQuestion('');
    } catch (err) {
      console.error('Error asking question:', err);
      setError('Error getting response. Please check if the backend is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setAnswer('');
  };

  const startCandidateInterview = async () => {
    if (!selectedRole) {
      setError('Please select a job role to start the interview');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/start-interview`, {
        jobRole: selectedRole,
        experienceLevel: experienceLevel
      });
      
      setAiQuestion(response.data.question);
      setInterviewStarted(true);
      setCurrentQuestionIndex(1);
    } catch (err) {
      console.error('Error starting interview:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Error starting interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitCandidateAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Please provide an answer');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/evaluate-answer`, {
        question: aiQuestion,
        answer: userAnswer,
        jobRole: selectedRole,
        experienceLevel: experienceLevel
      });
      
      setFeedback(response.data);
      setCandidateHistory([
        ...candidateHistory,
        {
          question: aiQuestion,
          answer: userAnswer,
          rating: response.data.rating,
          feedback: response.data.feedback,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error('Error evaluating answer:', err);
      setError('Error evaluating answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    setLoading(true);
    setError('');
    setUserAnswer('');
    setFeedback(null);
    
    try {
      const response = await axios.post(`${API_URL}/next-question`, {
        jobRole: selectedRole,
        questionNumber: currentQuestionIndex + 1,
        experienceLevel: experienceLevel
      });
      
      setAiQuestion(response.data.question);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } catch (err) {
      console.error('Error getting next question:', err);
      setError('Error getting next question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const improveAnswer = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/improve-answer`, {
        question: aiQuestion,
        answer: userAnswer,
        jobRole: selectedRole
      });
      
      setFeedback({
        ...feedback,
        improvedAnswer: response.data.improvedAnswer
      });
      
      // Update history with improved answer
      const updatedHistory = [...candidateHistory];
      updatedHistory[updatedHistory.length - 1] = {
        ...updatedHistory[updatedHistory.length - 1],
        improvedAnswer: response.data.improvedAnswer
      };
      setCandidateHistory(updatedHistory);
    } catch (err) {
      console.error('Error improving answer:', err);
      setError('Error improving answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setCurrentQuestionIndex(0);
    setAiQuestion('');
    setUserAnswer('');
    setFeedback(null);
    setCandidateHistory([]);
    setSelectedRole('');
  };

  const goToHome = () => {
    setCurrentPage('home');
    setSelectedRole('');
    setHistory([]);
    setQuestion('');
    setAnswer('');
    setError('');
    setExpandedHistoryItems([]);
    resetInterview();
  };

  const selectRole = (role) => {
    setCurrentPage(role);
    setHistory([]);
    setAnswer('');
    setError('');
    setExpandedHistoryItems([]);
    if (role === 'candidate') {
      resetInterview();
    }
  };

  const toggleHistoryItem = (index) => {
    setExpandedHistoryItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // HOME PAGE
  if (currentPage === 'home') {
    return (
      <div className="App">
        <div className="home-container">
          <div className="home-content">
            <div className="home-header">
              <h1 className="home-title"><img src={process.env.PUBLIC_URL + "/favicon.ico"} alt="icon" className="title-icon" /> Interview Persona Engine</h1>
              <p className="home-subtitle">Your AI-Powered Interview Companion</p>
            </div>

            <div className="home-description">
              <p className="description-text">
                Welcome to the Interview Persona Engine - an intelligent platform designed to help you excel in your interview journey. 
                Whether you're preparing for interviews or conducting them, our AI-powered system is here to assist you.
              </p>
              <p className="description-text">
                Choose your role to get started and experience personalized interview assistance tailored to your needs.
              </p>
            </div>

            <div className="role-selection">
              <h2 className="selection-title">Choose Your Role</h2>
              <div className="role-cards-container">
                <button className="role-card-button interviewer" onClick={() => selectRole('interviewer')}>
                  <div className="role-card-icon">👔</div>
                  <h3 className="role-card-title">Interviewer Mode</h3>
                  <p className="role-card-description">Ask questions and get AI-powered answers based on a comprehensive professional profile</p>
                  <span className="role-card-arrow">→</span>
                </button>
                <button className="role-card-button candidate" onClick={() => selectRole('candidate')}>
                  <div className="role-card-icon">🎓</div>
                  <h3 className="role-card-title">Candidate Mode</h3>
                  <p className="role-card-description">Practice interviews with AI-generated questions and receive detailed feedback on your answers</p>
                  <span className="role-card-arrow">→</span>
                </button>
              </div>
            </div>
          </div>

          <footer className="home-footer">
            <p>Made with ❤️ by <a href="https://github.com" target="_blank" rel="noopener noreferrer">Your Name</a></p>
          </footer>
        </div>
      </div>
    );
  }

  // INTERVIEWER/CANDIDATE PAGES

  return (
    <div className="App">
      <div className="page-header-bar">
        <button className="back-home-btn" onClick={goToHome}>← Back to Home</button>
        <h1><img src={process.env.PUBLIC_URL + "/favicon.ico"} alt="icon" className="title-icon" /> Interview Persona Engine <span className="mode-badge">{currentPage === 'interviewer' ? 'Interviewer' : 'Candidate'}</span></h1>
      </div>

      <div className="page-layout">
        <div className="left-panel">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Select Job Role {currentPage === 'candidate' ? '(Required)' : '(Optional)'}:</label>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                className="form-select"
                disabled={interviewStarted}
              >
                <option value="">{currentPage === 'candidate' ? 'Choose a role...' : 'General Interview'}</option>
                {jobRoles.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {currentPage === 'candidate' && (
              <div className="form-group">
                <label className="form-label">Experience Level:</label>
                <div className="experience-buttons">
                  <button
                    className={`exp-btn ${experienceLevel === 'Fresher' ? 'active' : ''}`}
                    onClick={() => setExperienceLevel('Fresher')}
                    disabled={interviewStarted}
                  >
                    🎓 Fresher
                  </button>
                  <button
                    className={`exp-btn ${experienceLevel === 'Experienced' ? 'active' : ''}`}
                    onClick={() => setExperienceLevel('Experienced')}
                    disabled={interviewStarted}
                  >
                    💼 Experienced
                  </button>
                </div>
              </div>
            )}
          </div>

          {currentPage === 'interviewer' && (
            <>
              <form onSubmit={handleSubmit} className="question-form">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask an interview question..."
                  rows="4"
                  disabled={loading}
                  className="question-input"
                />
                <button 
                  type="submit" 
                  disabled={loading || !question.trim()}
                  className="submit-button"
                >
                  {loading ? 'Thinking...' : 'Ask Question'}
                </button>
              </form>

              {error && <div className="error-message">⚠️ {error}</div>}
              {loading && <div className="loading"><div className="spinner"></div><p>Generating response...</p></div>}
              {answer && !loading && (
                <div className="answer-card">
                  <h3>Response:</h3>
                  <div className="answer-text">{answer}</div>
                </div>
              )}
            </>
          )}

          {currentPage === 'candidate' && (
            <>
              {!interviewStarted ? (
                <div className="start-section">
                  <button 
                    onClick={startCandidateInterview}
                    disabled={!selectedRole || loading}
                    className="start-button"
                  >
                    {loading ? 'Starting...' : '🚀 Start Interview'}
                  </button>
                  {!selectedRole && <p className="hint-text">Select a job role to begin</p>}
                </div>
              ) : (
                <>
                  <div className="question-badge">Question {currentQuestionIndex}</div>
                  <div className="ai-question-card">
                    <h3>Interview Question:</h3>
                    <p className="ai-question-text">{aiQuestion}</p>
                  </div>

                  {!feedback ? (
                    <>
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        rows="6"
                        disabled={loading}
                        className="question-input"
                      />
                      <button 
                        onClick={submitCandidateAnswer}
                        disabled={loading || !userAnswer.trim()}
                        className="submit-button"
                      >
                        {loading ? 'Evaluating...' : '✓ Submit Answer'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="feedback-card">
                        <div className="rating-section">
                          <h3>Rating:</h3>
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= feedback.rating ? 'star filled' : 'star'}>★</span>
                            ))}
                            <span className="rating-text">{feedback.rating}/5</span>
                          </div>
                        </div>
                        <div className="feedback-section">
                          <h3>Feedback:</h3>
                          <p className="feedback-text">{feedback.feedback}</p>
                        </div>
                        {feedback.grammarIssues && feedback.grammarIssues.length > 0 && (
                          <div className="grammar-section">
                            <h3>Grammar Suggestions:</h3>
                            <ul className="grammar-list">
                              {feedback.grammarIssues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feedback.improvedAnswer && (
                          <div className="improved-answer-section">
                            <h3>Improved Answer:</h3>
                            <p className="improved-answer-text">{feedback.improvedAnswer}</p>
                          </div>
                        )}
                      </div>
                      <div className="action-buttons">
                        <button onClick={nextQuestion} disabled={loading} className="next-button">
                          {loading ? 'Loading...' : '➡️ Next'}
                        </button>
                        {!feedback.improvedAnswer && (
                          <button onClick={improveAnswer} disabled={loading} className="improve-button">
                            {loading ? 'Improving...' : '✨ Improve'}
                          </button>
                        )}
                        <button onClick={resetInterview} className="reset-button">🔄 Restart</button>
                      </div>
                    </>
                  )}
                </>
              )}
              {error && <div className="error-message">⚠️ {error}</div>}
            </>
          )}
        </div>

        <div className="right-panel">
          <h3 className="history-title">{currentPage === 'interviewer' ? 'Interview History' : 'Practice History'}</h3>
          {currentPage === 'interviewer' ? (
            history.length > 0 ? (
              <>
                <button onClick={clearHistory} className="clear-btn">Clear</button>
                <div className="history-list">
                  {history.map((item, index) => (
                    <div key={index} className="history-item">
                      <div className="history-header-row" onClick={() => toggleHistoryItem(index)}>
                        <span className="expand-icon">{expandedHistoryItems.includes(index) ? '▼' : '▶'}</span>
                        <div className="history-question-compact">
                          <strong>Q:</strong> {item.question}
                        </div>
                      </div>
                      {expandedHistoryItems.includes(index) && (
                        <div className="history-content-expanded">
                          <div className="history-answer"><strong>A:</strong> {item.answer}</div>
                          <div className="history-timestamp">{item.timestamp.toLocaleTimeString()}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="empty-message">No questions yet</p>
            )
          ) : (
            candidateHistory.length > 0 ? (
              <div className="history-list">
                {candidateHistory.map((item, index) => (
                  <div key={index} className="history-item candidate-history">
                    <div className="history-header-row" onClick={() => toggleHistoryItem(index)}>
                      <span className="expand-icon">{expandedHistoryItems.includes(index) ? '▼' : '▶'}</span>
                      <div className="history-question-compact">
                        <span className="history-question-number">Q{index + 1}</span> {item.question}
                      </div>
                    </div>
                    {expandedHistoryItems.includes(index) && (
                      <div className="history-content-expanded">
                        <div className="history-answer">
                          <strong>A:</strong> {item.improvedAnswer || item.answer}
                          {item.improvedAnswer && <span className="improved-badge">✨</span>}
                        </div>
                        <div className="history-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= item.rating ? 'star filled small' : 'star small'}>★</span>
                          ))}
                          <span className="rating-value">({item.rating}/5)</span>
                        </div>
                        <div className="history-timestamp">{item.timestamp.toLocaleTimeString()}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No practice yet</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
