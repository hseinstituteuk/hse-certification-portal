let darkMode = false;

document.addEventListener("DOMContentLoaded", () => {
  const modeToggle = document.getElementById("modeToggle");
  if (modeToggle) {
    modeToggle.onclick = () => {
      document.body.classList.toggle("dark-mode");
      darkMode = !darkMode;
    };
  }

  if (window.location.pathname.includes("verify.html")) {
    const params = new URLSearchParams(window.location.search);
    const certNumber = params.get("cert");
    if (certNumber) loadCertificate(certNumber);
  }

  const form = document.getElementById("adminForm");
  if (form) {
    form.onsubmit = handleAdminForm;
  }
});

function suggestSearch(query) {
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      const suggestions = data.filter(c => c.certNumber.toLowerCase().includes(query.toLowerCase()));
      const ul = document.getElementById("suggestions");
      ul.innerHTML = "";
      suggestions.forEach(s => {
        const li = document.createElement("li");
        li.innerText = s.certNumber;
        li.onclick = () => {
          document.getElementById("searchInput").value = s.certNumber;
          ul.innerHTML = "";
        };
        ul.appendChild(li);
      });
    });
}

function searchCertificate() {
  const input = document.getElementById("searchInput").value.trim();
  if (input) {
    window.location.href = `verify.html?cert=${encodeURIComponent(input)}`;
  }
}

function loadCertificate(certNumber) {
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      const match = data.find(c => c.certNumber === certNumber);
      const container = document.getElementById("resultContainer");
      if (match) {
        container.innerHTML = `
          <h2>Certificate Found</h2>
          <img src="${match.certificateImage}" alt="Certificate Image" style="width:300px; border:1px solid #ccc;"/><br/><br/>
          <strong>Name:</strong> ${match.name}<br/>
          <strong>Course:</strong> ${match.course}<br/>
          <strong>Certificate Number:</strong> ${match.certNumber}<br/>
          <strong>Issued:</strong> ${match.issueDate}<br/>
          <strong>Expires:</strong> ${match.expiryDate}<br/>
          <div id="qrcode" style="margin-top:20px;"></div>
        `;
        const qr = new QRCode(document.getElementById("qrcode"), {
          text: window.location.href,
          width: 128,
          height: 128
        });
      } else {
        container.innerHTML = `<h2 style="color:red;">Certificate Not Found</h2><p>Please contact support.</p>`;
      }
    });
}

function handleAdminForm(e) {
  e.preventDefault();
  const pass = document.getElementById("adminPass").value;
  if (pass !== "admin123") {
    document.getElementById("adminMsg").innerText = "Incorrect password.";
    return;
  }

  const reader = new FileReader();
  const file = document.getElementById("certImage").files[0];

  reader.onload = function () {
    const base64Img = reader.result;
    const newCert = {
      name: document.getElementById("name").value,
      course: document.getElementById("course").value,
      certNumber: document.getElementById("certNumber").value,
      issueDate: document.getElementById("issueDate").value,
      expiryDate: document.getElementById("expiryDate").value,
      certificateImage: base64Img
    };

    alert("New certificate object:\n\n" + JSON.stringify(newCert, null, 2));
    document.getElementById("adminMsg").innerText = "Copy the above object and add it manually to data.json.";
  };

  if (file) reader.readAsDataURL(file);
}
