from flask import Flask, render_template, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
import google.generativeai as genai
from dotenv import load_dotenv
from dotenv import find_dotenv
import os
import markdown


app = Flask(__name__)
load_dotenv(find_dotenv())
# Lấy API key từ biến môi trường
GEMINI_API_KEY = os.environ.get('GEMENI_API_KEY')

client = genai.configure(
    api_key= GEMINI_API_KEY,
)

def get_video_id(youtube_url):
    """Trích xuất video_id từ link YouTube"""
    parsed_url = urlparse(youtube_url)
    if parsed_url.hostname in ["www.youtube.com", "youtube.com"]:
        return parse_qs(parsed_url.query)["v"][0]
    elif parsed_url.hostname == "youtu.be":
        return parsed_url.path[1:]
    return None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    youtube_url = data.get("url")
    video_id = get_video_id(youtube_url)

    if not video_id:
        return jsonify({"error": "❌ Link YouTube không hợp lệ"}), 400

    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id)
        transcript = transcript.to_raw_data()
        text = " ".join([item["text"] for item in transcript])
    except Exception as e:
        return jsonify({"error": f"Lỗi lấy transcript: {str(e)}"}), 500

    # Gọi OpenAI để viết blog
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = f"Viết một bài blog hấp dẫn, rõ ràng dựa trên transcript sau:\n{text}"
        response = model.generate_content(prompt)
        blog_article = response.text
        html_article = markdown.markdown(blog_article)
    except Exception as e:
        return jsonify({"error": f"Lỗi AI: {str(e)}"}), 500

    return jsonify({"article": html_article})

if __name__ == "__main__":
    app.run(debug=True)
