const SUPABASE_URL = 'https://dnudglrwjftrkqtmnwcq.supabase.co';

const SUPABASE_KEY = 'sb_publishable_5yNAinYJAzskYOOEWbBrPA_3PqnfXp1';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const titleInput = document.getElementById("titleInput");
const memoInput = document.getElementById("memoInput");
const saveBtn = document.getElementById("saveBtn");
const recordList = document.getElementById("recordList");

let currentImage = "";

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        currentImage = e.target.result;
        preview.src = currentImage;
        preview.style.display = "block";
    };

    reader.readAsDataURL(file);
});

saveBtn.addEventListener("click", saveRecord);

async function saveRecord() {

    const title = titleInput.value.trim();
    const memo = memoInput.value.trim();

    if (!title) {
        alert("제목을 입력하세요.");
        return;
    }

    let imageUrl = "";

    const file = imageInput.files[0];

    if (file) {

        const fileName =
            `${Date.now()}-${file.name}`;

        const { error: uploadError } =
            await supabaseClient.storage
                .from("photos")
                .upload(fileName, file);

        if (uploadError) {
            alert("사진 업로드 실패");
            console.error(uploadError);
            return;
        }

        const { data } =
            supabaseClient.storage
                .from("photos")
                .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
    }

    const { error } =
        await supabaseClient
            .from("records")
            .insert([
                {
                    title: title,
                    memo: memo,
                    image_url: imageUrl
                }
            ]);

    if (error) {
        alert("저장 실패");
        console.error(error);
        return;
    }

    titleInput.value = "";
    memoInput.value = "";
    imageInput.value = "";
    preview.style.display = "none";

    renderRecords();
}

function deleteRecord(id) {

    const result = confirm("삭제하시겠습니까?");

    if (!result) return;

    let records =
        JSON.parse(localStorage.getItem("museumRecords")) || [];

    records = records.filter(
        record => record.id !== id
    );

    localStorage.setItem(
        "museumRecords",
        JSON.stringify(records)
    );

    renderRecords();
}

function renderRecords() {

    const records =
        JSON.parse(localStorage.getItem("museumRecords")) || [];

    recordList.innerHTML = "";

    records.forEach(record => {

        const div = document.createElement("div");

        div.className = "record";

        div.innerHTML = `
            ${record.image ?
            `<img src="${record.image}">`
            : ""}

            <div class="record-title">
                ${record.title}
            </div>

            <div class="record-date">
                ${record.createdAt}
            </div>

            <div>
                ${record.memo}
            </div>

            <button
                class="delete-btn"
                onclick="deleteRecord(${record.id})">
                삭제
            </button>
        `;

        recordList.appendChild(div);
    });
}

renderRecords();
