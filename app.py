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

# WSGI Application
# Đây là đối tượng chính mà Render sẽ sử dụng để chạy ứng dụng
# app = Flask(__name__) # Không cần lặp lại dòng này

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def get_video_id(youtube_url):
    parsed_url = urlparse(youtube_url)
    if parsed_url.hostname in ["www.youtube.com", "youtube.com"]:
        # Sử dụng .get() để tránh lỗi nếu 'v' không tồn tại
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
        # Thêm logic xác nhận mật khẩu ở đây
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]
        
        if password != confirm_password:
            # Nên sử dụng flash message để hiển thị lỗi
            return "Mật khẩu xác nhận không khớp!" 

        # Kiểm tra người dùng đã tồn tại
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
        return jsonify({"error": "❌ Link YouTube không hợp lệ"}), 400

    try:
        ytt_api = YouTubeTranscriptApi(
            proxy_config=WebshareProxyConfig(
                proxy_username=os.getenv("PROXY_USERNAME"),
                proxy_password=os.getenv("PROXY_PASSWORD"),
            )
        )
        transcript = ytt_api.fetch(video_id)
        transcript = transcript.to_raw_data()
        text = " ".join([item["text"] for item in transcript])
    except Exception as e:
        return jsonify({"error": f"Lỗi lấy transcript: {str(e)}"}), 500

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = f"Viết một bài blog hấp dẫn, rõ ràng dựa trên transcript sau:\n{text}"
        response = model.generate_content(prompt)
        blog_article = response.text
        html_article = markdown.markdown(blog_article)
    except Exception as e:
        return jsonify({"error": f"Lỗi AI: {str(e)}"}), 500

    new_blog = Blog(title="Blog của tôi", content=html_article, user_id=current_user.id)
    db.session.add(new_blog)
    db.session.commit()

    return jsonify({"success": True, "content": html_article, "title": "Blog của tôi"})

@app.route("/api/test", methods=["POST"])
def test():
    data = request.get_json()
    print("📥 Dữ liệu client gửi lên:", data)
    response = {"message": "Hello", "data": data}
    print("📤 Dữ liệu Flask trả về:", response)
    return jsonify(response)

# Không chạy app trong khối if __name__ == "__main__":
# Render sẽ sử dụng Gunicorn để chạy ứng dụng