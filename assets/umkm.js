const user = JSON.parse(localStorage.getItem("user") || "null");

if (!user) {
  alert("Anda harus login terlebih dahulu.");
  window.location.href = "login.html";
}

const kontakWA = user ? umkm.kontak_wa : umkm.kontak_wa.replace(/(\d{4})\d+/, '$1*****');
const linkWA = user ? `https://wa.me/${umkm.kontak_wa}` : '#';


const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE";
const urlParams = new URLSearchParams(window.location.search);
const idUMKM = urlParams.get("id");
let keranjang = [];
let keranjangQty = {}; // { id_produk: jumlah }

Promise.all([
  fetch(`${sheetBase}/umkm`).then(res => res.json()),
  fetch(`${sheetBase}/produk`).then(res => res.json())
]).then(([umkmData, produkData]) => {
  const umkm = umkmData.find(u => u.id_umkm === idUMKM);
  if (!umkm) return;

  const umkmProfil = document.getElementById("umkm-profil");
  umkmProfil.innerHTML = `
    <div class="umkm-card">
      <img src="${umkm.logo_url}" alt="${umkm.nama_umkm}" class="umkm-logo" />
      <div class="umkm-meta">
        <h2>${umkm.nama_umkm}</h2>
        <p><strong>Deskripsi:</strong> ${umkm.deskripsi_umkm || '-'}</p>
        <p><strong>Alamat:</strong> ${umkm.alamat}</p>
        <p><strong>Kecamatan:</strong> ${umkm.kecamatan}</p>
        <p><strong>Kontak:</strong> <a href="https://wa.me/${umkm.kontak_wa}" target="_blank">${umkm.kontak_wa}</a></p>
      </div>
      <div>
        <iframe width="100%" height="200" frameborder="0" style="border:0"
          src="https://www.google.com/maps?q=${umkm.lat},${umkm.lng}&hl=id&z=15&output=embed" allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  const produkUMKM = produkData.filter(p => p.id_umkm === idUMKM && p.status === "aktif");
  const container = document.getElementById("umkm-produk");
  container.innerHTML = produkUMKM.map(p => {
    const isFav = keranjang.includes(p.id_produk);
    return `
      <div class="produk-card">
        <div class="produk-img" onclick="showDetail('${p.nama_produk}', \`${p.deskripsi_produk}\`, '${p.gambar_url}', '${parseInt(p.harga).toLocaleString()}')">
          <img src="${p.gambar_url}" alt="${p.nama_produk}" />
        </div>
        <div class="produk-info">
          <h3 class="produk-nama">${p.nama_produk}</h3>
          <p class="produk-harga">Rp ${parseInt(p.harga).toLocaleString()}</p>
          <div class="produk-actions">
            <button class="btn-wa" onclick="window.open('https://wa.me/${umkm.kontak_wa}?text=Halo%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(p.nama_produk)}', '_blank')">Pesan via WA</button>
            <button class="btn-fav ${isFav ? 'selected' : ''}" onclick="toggleFav('${p.id_produk}', this)">${isFav ? '🛒 Hapus' : '➕ Keranjang'}</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  updateCartIcon();

  window.toggleFav = function(id, el) {
  if (keranjang.includes(id)) {
    keranjang = keranjang.filter(i => i !== id);
    delete keranjangQty[id]; // hapus jumlahnya juga
    el.classList.remove('selected');
    el.innerText = '➕ Keranjang';
  } else {
    keranjang.push(id);
    keranjangQty[id] = 1; // default qty 1
    el.classList.add('selected');
    el.innerText = '🛒 Hapus';
  }
  updateCartIcon();
};


  window.showDetail = function(nama, deskripsi, gambar, harga) {
    const modal = document.getElementById("produk-modal");
    modal.querySelector(".modal-nama").innerText = nama;
    modal.querySelector(".modal-deskripsi").innerHTML = deskripsi.replace(/\n/g, "<br>");
    modal.querySelector(".modal-gambar").src = gambar;
    modal.querySelector(".modal-harga").innerText = "Rp " + harga;
    modal.querySelector(".modal-gambar").onclick = function () {
      this.classList.toggle("zoomed");
    };
    modal.style.display = "flex";
  };

  document.getElementById("floating-cart").addEventListener("click", () => {
  document.getElementById("review-section").classList.add("active");
  renderReview();
});

  function updateCartIcon() {
    const icon = document.getElementById("floating-cart");
    const count = document.getElementById("cart-count");
    if (keranjang.length > 0) {
      icon.style.display = "flex";
      count.innerText = keranjang.length;
    } else {
      icon.style.display = "none";
    }
  }

  function renderReview() {
  const tbody = document.querySelector("#review-table tbody");
  tbody.innerHTML = "";
  let totalHarga = 0;

  keranjang.forEach(id => {
    const p = produkUMKM.find(pr => pr.id_produk === id);
    const qty = keranjangQty[id] || 1;
    const harga = parseInt(p.harga);
    const total = qty * harga;
    totalHarga += total;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.nama_produk}</td>
      <td>
        <button onclick="ubahQty('${id}', -1)">-</button>
        <span>${qty}</span>
        <button onclick="ubahQty('${id}', 1)">+</button>
      </td>
      <td>Rp ${harga.toLocaleString()}</td>
      <td>Rp ${total.toLocaleString()}</td>
      <td><button onclick="removeFromCart('${id}')">🗑️</button></td>
    `;
    tbody.appendChild(row);
  });
}

  window.ubahQty = function(id, delta) {
  if (!(id in keranjangQty)) return;
  keranjangQty[id] += delta;
  if (keranjangQty[id] <= 0) {
    removeFromCart(id);
  } else {
    renderReview();
  }
};
  

  window.removeFromCart = function(id) {
  keranjang = keranjang.filter(i => i !== id);
  delete keranjangQty[id];
  updateCartIcon();
  renderReview();

  const toggleBtn = document.querySelector(`button[onclick*="toggleFav('${id}"]`);
  if (toggleBtn) {
    toggleBtn.classList.remove("selected");
    toggleBtn.innerText = '➕ Keranjang';
  }
};

  document.getElementById("floating-cart").addEventListener("click", () => {
  document.getElementById("review-section").classList.add("active");
  renderReview(); // ini akan isi ulang tabel
});

document.getElementById("review-close").addEventListener("click", () => {
  document.getElementById("review-section").classList.remove("active");
});

  document.getElementById("modal-close").onclick = () => {
  document.getElementById("produk-modal").style.display = "none";
};

  document.getElementById("send-wa-btn").addEventListener("click", () => {
    if (!keranjang.length) return;
    const pesan = keranjang.map(id => {
      const p = produkUMKM.find(pr => pr.id_produk === id);
      return `- ${p.nama_produk} (Rp ${parseInt(p.harga).toLocaleString()})`;
    }).join("%0A");
    window.open(`https://wa.me/${umkm.kontak_wa}?text=Halo,%20saya%20tertarik%20dengan%20produk:%0A${pesan}`, '_blank');
  });

}).catch(err => console.error("Gagal load UMKM:", err));

function switchView(mode) {
  const container = document.getElementById("umkm-produk");
  if (mode === 'grid') {
    container.classList.remove("list-mode");
  } else {
    container.classList.add("list-mode");
  }
}

const webhookURL = "https://script.google.com/macros/s/AKfycbxo8WrzRSXc-9BsGpxikY57fkqmgQT9Zbgfm5v1asgTjRJyXohBbyWm5-gUNYpZt9o/exec";

function kirimTransaksi(produkList, total) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  fetch(webhookURL, {
    method: "POST",
    body: JSON.stringify({
      nama_user: user.nama,
      wa_user: user.wa,
      produk: produkList.map(p => p.nama_produk).join(", "),
      qty: produkList.length,
      total: total
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => console.log("Terkirim ke Sheet!"));
}

