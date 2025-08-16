async function generateBlog() {
    const url = document.getElementById("youtubeUrl").value;
    const loading = document.getElementById("loading");
    const result = document.getElementById("result");

    loading.style.display = "block";
    result.innerHTML = "";

    try {
        const res = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await res.json();
        loading.style.display = "none";

        if (data.error) {
            result.innerHTML = `<p style="color:red;">${data.error}</p>`;
        } else {
            result.innerHTML = `<h2>✅ Blog Generated:</h2><p>${data.article}</p>`;
        }
    } catch (err) {
        loading.style.display = "none";
        result.innerHTML = `<p style="color:red;">Lỗi: ${err}</p>`;
    }
}
