from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [FRONTEND_URL]}})


# Groq API key configuration
API_KEY = os.getenv('GROQ_API_KEY')

if not API_KEY:
    raise ValueError("No Groq API key found. Please set GROQ_API_KEY in .env file")

def load_persona_data():
    """Load persona data from JSON file"""
    try:
        with open('persona_data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "name": "Sample User",
            "background": "No persona data found. Please create persona_data.json",
            "skills": [],
            "experience": []
        }

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Handle interview questions and return AI-generated responses"""
    try:
        data = request.json
        question = data.get('question', '')
        job_role = data.get('jobRole', '')
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        # Load persona data
        persona = load_persona_data()
        
        # Build context from persona data
        skills = persona.get('skills', {})
        if isinstance(skills, dict):
            all_skills = []
            for category, skill_list in skills.items():
                if isinstance(skill_list, list):
                    all_skills.extend(skill_list)
            skills_str = ', '.join(all_skills)
        else:
            skills_str = ', '.join(skills) if isinstance(skills, list) else str(skills)
        
        # Add job role context if provided
        role_context = f"You are applying for a {job_role} position. " if job_role else ""
        
        context = f"""You are {persona.get('name', 'a professional')}, a motivated fresher looking to start your career as a Full Stack Web Developer. 
{role_context}Answer the following interview question as if you are this person, based on their background and experience.

IMPORTANT INSTRUCTIONS:
- Be enthusiastic, positive, and eager to get the job
- For yes/no questions, answer directly with "Yes" or "No" followed by a brief positive statement
- For open-ended questions like "Tell me about yourself", provide detailed, comprehensive answers
- If asked about unknown technologies/skills, say you're eager to learn them quickly
- Show confidence in your existing skills while being open to learning new ones
- For questions about work conditions (night shifts, relocation, etc.), always be positive and agreeable
- Focus on getting hired - emphasize your adaptability and learning ability
{f"- Tailor your answer to highlight skills and experience relevant to {job_role}" if job_role else ""}

Background: {persona.get('background', '')}
Skills: {skills_str}
Experience: {json.dumps(persona.get('experience', []), indent=2)}
Education: {json.dumps(persona.get('education', []), indent=2)}
Projects: {json.dumps(persona.get('projects', []), indent=2)}
Key Strengths: Quick learner, adaptable, passionate about web development

Question: {question}

Answer positively and appropriately (brief for simple questions, detailed for complex ones):"""
        
        # Get API key
        api_key = API_KEY
        
        # Create Groq client with API key
        client = Groq(api_key=api_key)
        
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant that answers interview questions on behalf of a job candidate. Always be positive, enthusiastic, and focused on getting the job. For yes/no questions, start with a clear 'Yes' or 'No'. Always show willingness to learn and adapt. Adjust answer length based on the question - be brief for simple questions, detailed for complex ones."
                },
                {
                    "role": "user",
                    "content": context,
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.5,
            max_tokens=1024,
        )
        
        answer = chat_completion.choices[0].message.content
        
        return jsonify({
            'question': question,
            'answer': answer
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/persona', methods=['GET'])
def get_persona():
    """Get current persona data"""
    persona = load_persona_data()
    return jsonify(persona)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Interview Persona Engine is running'})

@app.route('/api/start-interview', methods=['POST'])
def start_interview():
    """Start candidate interview mode"""
    try:
        data = request.json
        job_role = data.get('jobRole', 'Software Developer')
        experience_level = data.get('experienceLevel', 'Fresher')
        
        if not API_KEY:
            raise ValueError("No API key available")
            
        client = Groq(api_key=API_KEY)
        
        # Customize interview based on experience level
        if experience_level == 'Fresher':
            level_prompt = f"Generate an entry-level interview question suitable for fresh graduates or candidates with 0-2 years of experience applying for a {job_role} position. Focus on fundamental concepts and basic skills."
        else:
            level_prompt = f"Generate an experienced-level interview question suitable for candidates with 3+ years of experience applying for a {job_role} position. Focus on advanced concepts, system design, or complex problem-solving."
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": level_prompt + " Only return the question, nothing else."}],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=150,
        )
        
        question = chat_completion.choices[0].message.content
        
        return jsonify({'question': question})
        
    except Exception as e:
        print(f"Error in start_interview: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/evaluate-answer', methods=['POST'])
def evaluate_answer():
    """Evaluate candidate's answer"""
    try:
        data = request.json
        question = data.get('question', '')
        answer = data.get('answer', '')
        job_role = data.get('jobRole', 'Software Developer')
        experience_level = data.get('experienceLevel', 'Fresher')
        
        api_key = API_KEY
        client = Groq(api_key=api_key)
        
        # Adjust evaluation criteria based on experience level
        if experience_level == 'Fresher':
            evaluation_criteria = "Evaluate considering this is a fresher/entry-level candidate. Focus on fundamental understanding, clarity of explanation, and willingness to learn. Be encouraging and constructive."
        else:
            evaluation_criteria = "Evaluate considering this is an experienced-level candidate. Expect detailed technical knowledge, real-world examples, best practices, and demonstration of expertise. Be more critical and thorough."
        
        prompt = f"""You are an expert interviewer for a {job_role} position at {experience_level} level.

{evaluation_criteria}

Interview Question: {question}

Candidate's Answer: {answer}

Evaluate this answer on the following criteria:
1. Content relevance and accuracy
2. Communication clarity
3. Grammar and language quality

Provide:
- A rating from 1-5 (5 being excellent)
- Constructive feedback (2-3 sentences)
- List any major grammar/language issues (if any)

Format your response EXACTLY as:
RATING: [number]
FEEDBACK: [your feedback]
GRAMMAR: [comma-separated issues, or "None"]"""
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.5,
            max_tokens=300,
        )
        
        response_text = chat_completion.choices[0].message.content
        
        # Parse the response
        rating = 3
        feedback_text = "Good effort! Keep practicing."
        grammar_issues = []
        
        lines = response_text.split('\n')
        for line in lines:
            if line.startswith('RATING:'):
                try:
                    rating = int(line.split(':')[1].strip()[0])
                except:
                    rating = 3
            elif line.startswith('FEEDBACK:'):
                feedback_text = line.split(':', 1)[1].strip()
            elif line.startswith('GRAMMAR:'):
                grammar_text = line.split(':', 1)[1].strip()
                if grammar_text.lower() != 'none':
                    grammar_issues = [g.strip() for g in grammar_text.split(',')]
        
        return jsonify({
            'rating': rating,
            'feedback': feedback_text,
            'grammarIssues': grammar_issues
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/next-question', methods=['POST'])
def next_question():
    """Get next interview question"""
    try:
        data = request.json
        job_role = data.get('jobRole', 'Software Developer')
        question_number = data.get('questionNumber', 1)
        experience_level = data.get('experienceLevel', 'Fresher')
        
        api_key = API_KEY
        client = Groq(api_key=api_key)
        
        # Customize question based on experience level
        if experience_level == 'Fresher':
            level_prompt = f"Generate entry-level interview question #{question_number} for a {job_role} position. Focus on fundamentals and basic concepts suitable for fresh graduates."
        else:
            level_prompt = f"Generate experienced-level interview question #{question_number} for a {job_role} position. Focus on advanced topics, system design, or real-world scenarios suitable for experienced professionals."
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": level_prompt + " Only return the question, nothing else."}],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=150,
        )
        
        question = chat_completion.choices[0].message.content
        
        return jsonify({'question': question})
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/improve-answer', methods=['POST'])
def improve_answer():
    """Improve candidate's answer"""
    try:
        data = request.json
        question = data.get('question', '')
        answer = data.get('answer', '')
        job_role = data.get('jobRole', 'Software Developer')
        
        api_key = API_KEY
        client = Groq(api_key=api_key)
        
        prompt = f"""You are an expert career coach for {job_role} positions.

Interview Question: {question}

Candidate's Original Answer: {answer}

Rewrite this answer to be more professional, articulate, and impressive while maintaining the candidate's key points. Make it concise, confident, and interview-ready.

Only return the improved answer, nothing else."""
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.6,
            max_tokens=400,
        )
        
        improved = chat_completion.choices[0].message.content
        
        return jsonify({'improvedAnswer': improved})
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Interview Persona Engine Backend...")
    print(f"API Key configured: {bool(API_KEY)}")
    app.run(debug=True, host='0.0.0.0', port=5000)

