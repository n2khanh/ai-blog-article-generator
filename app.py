from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Blog
import google.generativeai as genai
from flask_migrate import Migrate
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
import os
import markdown
from config import Config
from youtube_transcript_api.proxies import WebshareProxyConfig

# Khởi tạo ứng dụng Flask
app = Flask(__name__)
app.config.from_object(Config)

# Khởi tạo các extension
db.init_app(app)
migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Cấu hình Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def get_video_id(youtube_url):
    """Trích xuất ID video từ URL YouTube."""
    parsed_url = urlparse(youtube_url)
    if parsed_url.hostname in ["www.youtube.com", "youtube.com"]:
        # Sử dụng .get() để tránh KeyError nếu tham số 'v' không tồn tại
        video_id_list = parse_qs(parsed_url.query).get("v")
        if video_id_list:
            return video_id_list[0]
    elif parsed_url.hostname == "youtu.be":
        return parsed_url.path[1:]
    return None

@app.route("/")
@login_required
def index():
    blogs = Blog.query.filter_by(user_id=current_user.id).all()
    return render_template("index.html", blogs=blogs)

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]

        if password != confirm_password:
            # Nên sử dụng flash message để hiển thị lỗi
            return "Mật khẩu xác nhận không khớp!" 

        if User.query.filter_by(username=username).first():
            return "User đã tồn tại!"
        
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for("login"))
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for("index"))
        return "Sai username hoặc password!"
    return render_template("login.html")

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))

@app.route("/generate", methods=["POST"])
@login_required
def generate():
    data = request.json
    youtube_url = data.get("youtube_url")
    video_id = get_video_id(youtube_url)

    if not video_id:
        print("Lỗi: Link YouTube không hợp lệ.")
        return jsonify({"error": "❌ Link YouTube không hợp lệ"}), 400

    try:
        # Thay thế cách gọi cũ bằng cách lấy transcript trực tiếp, tránh lỗi proxy
        ytt = YouTubeTranscriptApi()
        transcript_list = ytt.fetch(video_id, languages=['vi', 'en']).to_raw_data()
        transcript_text = " ".join([item["text"] for item in transcript_list])
        
        if len(transcript_text) < 100:
            return jsonify({"error": "❌ Transcript quá ngắn để tạo blog"}), 400

    except Exception as e:
        print(f"Lỗi lấy transcript từ YouTube: {e}")
        return jsonify({"error": f"Lỗi lấy transcript: {str(e)}"}), 500

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = f"Viết một bài blog hấp dẫn, rõ ràng dựa trên transcript sau:\n{transcript_text}"
        response = model.generate_content(prompt)
        blog_article = response.text
        html_article = markdown.markdown(blog_article)
    except Exception as e:
        print(f"Lỗi khi gọi Gemini API: {e}")
        return jsonify({"error": f"Lỗi AI: {str(e)}"}), 500

    try:
        new_blog = Blog(title="Blog của tôi", content=html_article, user_id=current_user.id)
        db.session.add(new_blog)
        db.session.commit()
    except Exception as e:
        print(f"Lỗi khi lưu blog vào DB: {e}")
        return jsonify({"error": f"Lỗi lưu trữ: {str(e)}"}), 500

    return jsonify({"success": True, "content": html_article, "title" : "Blog của tôi"})

# Chỉ chạy server khi file này được thực thi trực tiếp, không phải khi triển khai
if __name__ == "__main__":
    app.run(debug=True)