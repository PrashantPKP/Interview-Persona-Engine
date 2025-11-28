# Interview Persona Engine

An AI-powered interview preparation and evaluation platform built with React, Flask, and Groq's language models. Practice interview questions, get AI-generated responses, and receive detailed feedback on your answers.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Active-brightgreen.svg)

## 🌟 Features

- **Interviewer Mode**: Ask custom interview questions and get AI-powered responses based on a comprehensive professional profile
- **Candidate Mode**: Practice interviews with AI-generated questions tailored to specific job roles and experience levels
- **Real-time Feedback**: Get instant ratings, constructive feedback, and grammar suggestions on your answers
- **Answer Improvement**: AI-powered suggestions to enhance and refine your interview responses
- **Job Role Selection**: Choose from 11+ job roles including Full Stack Developer, Frontend Developer, Python Developer, HR Interview, and more
- **Experience Levels**: Separate question difficulty for Fresher and Experienced candidates
- **Interview History**: Track all your practice questions and answers with ratings and feedback
- **Persona Management**: Customizable professional profile to personalize AI responses

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn
- Groq API Key (get it free from [https://console.groq.com/](https://console.groq.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PrashantPKP/Interview-Persona-Engine.git
   cd Interview-Persona-Engine
   ```

2. **Setup Backend (Flask)**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create .env file from .env.example
   copy .env.example .env
   # On macOS/Linux: cp .env.example .env
   
   # Add your Groq API key to .env
   # Edit .env and replace 'your_groq_api_key_here' with your actual key
   ```

3. **Setup Frontend (React)**
   ```bash
   # In a new terminal, from the root directory
   npm install
   ```

### Running the Project

1. **Start the Backend Server**
   ```bash
   cd backend
   python app.py
   # Server will run on http://localhost:5000
   ```

2. **Start the Frontend Server (in another terminal)**
   ```bash
   npm start
   # Frontend will open at http://localhost:3000
   ```

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - Choose your role: Interviewer or Candidate
   - Start practicing!


## 🎯 Usage

### Interviewer Mode
1. Select or skip job role selection (optional)
2. Enter a custom interview question
3. Get AI-generated response based on the professional profile
4. View response history

### Candidate Mode
1. Select your desired job role
2. Choose your experience level (Fresher/Experienced)
3. Click "Start Interview" to receive AI-generated questions
4. Provide your answers
5. Receive instant feedback with:
   - Rating (1-5 stars)
   - Constructive feedback
   - Grammar suggestions
   - AI-improved version of your answer
6. Move to next question or restart the interview

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Groq SDK** - AI model integration
- **Python** - Backend language

### AI/ML
- **Groq Llama 3.1** - Language model for AI responses

### Deployment & DevOps
- **Git/GitHub** - Version control
- **Environment variables** - Secure configuration


## 📝 Customization

### Update Professional Profile
Edit `backend/persona_data.json` to customize:
- Personal information
- Skills and technologies
- Experience and education
- Projects and achievements
- Career goals and preferences

### Add More Job Roles
Update the `jobRoles` array in `src/App.js` to add custom positions

#
## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

The MIT License allows you to:
- ✅ Use the software for any purpose
- ✅ Copy, modify, and distribute
- ✅ Use it commercially
- ⚠️ Must include a copy of the license
- ⚠️ The software is provided "as-is"

## 👨‍💻 Developer

**Prashant Kashiram Parshuramkar**

- **GitHub**: [https://github.com/PrashantPKP](https://github.com/PrashantPKP)
- **LinkedIn**: [https://www.linkedin.com/in/prashantpkp/](https://www.linkedin.com/in/prashantpkp/)
- **Portfolio**: [https://prashantparshuramkar.host20.uk/](https://prashantparshuramkar.host20.uk/)


**Nishant Sonar**

- **GitHub**: [https://github.com/Nishant-sonar](https://github.com/Nishant-sonar)
- **LinkedIn**: [https://www.linkedin.com/in/nishantsonar44/](https://www.linkedin.com/in/nishantsonar44/)
- **Portfolio**: [https://nishantsonar.host20.uk/](https://nishantsonar.host20.uk/)
## 🔗 Repository

- **GitHub Repository**: [https://github.com/PrashantPKP/Interview-Persona-Engine.git](https://github.com/PrashantPKP/Interview-Persona-Engine.git)

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



**Made with ❤️ for aspiring developers and interviewers**

Last Updated: November 2025
