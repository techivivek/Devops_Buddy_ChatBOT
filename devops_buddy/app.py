from flask import Flask, request, jsonify, render_template
import random
from datetime import datetime

app = Flask(__name__)

# Load Q&A from txt file with enhanced parsing
def load_qa():
    qa_pairs = []
    with open("qa_data.txt", "r", encoding="utf-8") as file:
        current_questions = []
        current_answer = ""
        reading_answer = False
        
        for line in file:
            line = line.strip()
            
            if line.startswith("Q:"):
                if reading_answer and current_questions and current_answer:
                    qa_pairs.append((current_questions, current_answer))
                    current_questions = []
                    current_answer = ""
                reading_answer = False
                current_questions.append(line[2:].strip().lower())
            elif line.startswith("A:"):
                reading_answer = True
                current_answer = line[2:].strip()
            elif reading_answer and line:
                current_answer += "\n" + line
            elif not line:  # Empty line indicates end of Q&A block
                if current_questions and current_answer:
                    qa_pairs.append((current_questions, current_answer))
                current_questions = []
                current_answer = ""
                reading_answer = False
        
        # Add the last Q&A pair if file doesn't end with empty line
        if current_questions and current_answer:
            qa_pairs.append((current_questions, current_answer))
    
    return qa_pairs

qa_data = load_qa()

# Fun responses for casual chat
fun_responses = {
    "greeting": [
        "Hey there! 👋 What DevOps topic can we explore today?",
        "Hello! Ready to automate something?",
        "Hi! Let's make your DevOps journey smoother!"
    ],
    "thanks": [
        "You're welcome! Happy deploying! 🚀",
        "Anytime! Remember to keep your pipelines green!",
        "No problem! That's what I'm containerized for! 😊"
    ],
    "joke": [
        "Why do DevOps engineers prefer containers? Because they hate commitment issues!",
        "How many DevOps engineers does it take to change a light bulb? None, they automate it!",
        "Why did the server break up with the database? It needed more No-SQL! 😂"
    ]
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_answer", methods=["POST"])
def get_answer():
    user_question = request.json.get("question", "").lower().strip()
    
    # Check for exact matches first
    for questions, answer in qa_data:
        if user_question in questions:
            return jsonify({
                "answer": answer,
                "is_fun": False
            })
    
    # Check for fun/casual questions
    if user_question in ["hi", "hello", "hey", "hi there", "greetings"]:
        return jsonify({
            "answer": random.choice(fun_responses["greeting"]),
            "is_fun": True
        })
    elif user_question in ["thank you", "thanks", "appreciate it"]:
        return jsonify({
            "answer": random.choice(fun_responses["thanks"]),
            "is_fun": True
        })
    elif "joke" in user_question or "funny" in user_question or "laugh" in user_question:
        return jsonify({
            "answer": random.choice(fun_responses["joke"]),
            "is_fun": True
        })
    
    # Try partial matching if no exact match found
    for questions, answer in qa_data:
        for question in questions:
            if user_question in question or question in user_question:
                return jsonify({
                    "answer": answer,
                    "is_fun": False
                })
    
    # If no match found
    return jsonify({
        "answer": "Hmm, I'm not sure about that one. Could you try rephrasing or ask about a specific DevOps topic? I'm happy to help with concepts, tools, or best practices!",
        "is_fun": False
    })

if __name__ == "__main__":
    app.run(debug=True)