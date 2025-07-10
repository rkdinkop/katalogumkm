const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE";
const urlParams = new URLSearchParams(window.location.search);
const idUMKM = urlParams.get("id");
let keranjang = [];
let produkData = [];

Promise.all([
  fetch(`${sheetBase}/umkm`).then(res => res.json()),
  fetch(`${sheetBase}/produk`).then(res => res.json())
]).then(([umkmData, allProduk]) => {
  const umkm = umkmData.find(u => u.id_umkm === idUMKM);
  if (!umkm) return;

  produkData = allProduk.filter(p => p.id_umkm === idUMKM && p.status === "aktif");

  const umkmProfil = document.getElementById("umkm-profil");
  umkmProfil.innerHTML = `
    <div class="umkm-card">
      <img src="${umkm.logo_url}" alt="${umkm.nama_umkm}" class="umkm-logo" />
      <div class="umkm-meta">
        <h2>${umkm.nama_umkm}</h2>
        <p><strong>Deskripsi:</strong> ${umkm.deskripsi || '-'}</p>
        <p><strong>Alamat:</strong> ${umkm.alamat}</p>
        <p><strong>Kecamatan:</strong> ${umkm.kecamatan}</p>
        <p><strong>Kontak:</strong> <a href="https://wa.me/${umkm.kontak_wa}" target="_blank">${umkm.kontak_wa}</a></p>
        <iframe width="100%" height="200" frameborder="0" style="border:0"
          src="https://www.google.com/maps?q=${umkm.latitude},${umkm.longitude}&hl=id&z=15&output=embed" allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  const container = document.getElementById("umkm-produk");
  container.innerHTML = produkData.map(p => {
    const isFav = keranjang.some(k => k.id_produk === p.id_produk);
    return `
      <div class="produk-card">
        <div class="produk-img" onclick="showDetail('${p.nama_produk}', \`${p.deskripsi}\`, '${p.gambar_url}', '${parseInt(p.harga).toLocaleString()}')">
          <img src="${p.gambar_url}" alt="${p.nama_produk}" />
        </div>
        <div class="produk-info">
          <h3 class="produk-nama">${p.nama_produk}</h3>
          <p class="produk-harga">Rp ${parseInt(p.harga).toLocaleString()}</p>
          <div class="produk-actions">
            <button class="btn-wa" onclick="window.open('https://wa.me/${umkm.kontak_wa}?text=Halo%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(p.nama_produk)}', '_blank')">
              <i class="fab fa-whatsapp"></i>
            </button>
            <button class="btn-fav ${isFav ? 'selected' : ''}" onclick="toggleFav('${p.id_produk}', this)">
              <i class="${isFav ? 'fas fa-check-circle' : 'fas fa-cart-plus'}"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  window.toggleFav = function(id, el) {
    const index = keranjang.findIndex(p => p.id_produk === id);
    if (index !== -1) {
      keranjang.splice(index, 1);
      el.classList.remove('selected');
      el.innerHTML = '<i class="fas fa-cart-plus"></i>';
    } else {
      const produk = produkData.find(p => p.id_produk === id);
      keranjang.push({ id_produk: id, jumlah: 1, ...produk });
      el.classList.add('selected');
      el.innerHTML = '<i class="fas fa-check-circle"></i>';
    }
    updateKeranjangIcon();
    //tampilkanReview();
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

  document.getElementById("modal-close").onclick = () => {
    document.getElementById("produk-modal").style.display = "none";
  };

  document.getElementById("send-wa-btn").onclick = () => {
    if (!keranjang.length) return alert("Keranjang kosong.");
    const pesan = keranjang.map(item => `- ${item.nama_produk} x${item.jumlah} (Rp ${(parseInt(item.harga) * item.jumlah).toLocaleString()})`).join('%0A');
    window.open(`https://wa.me/${umkm.kontak_wa}?text=Halo,%20saya%20tertarik%20membeli:%0A${pesan}`, '_blank');
  };

  tampilkanReview();
  updateKeranjangIcon();

}).catch(err => console.error("Gagal load UMKM:", err));

function tampilkanReview() {
  const reviewSection = document.getElementById("review-section");
  const tbody = document.getElementById("review-table").querySelector("tbody");
  tbody.innerHTML = "";

  if (keranjang.length === 0) {
    reviewSection.style.display = "none";
    return;
  }

  keranjang.forEach((item, idx) => {
    const total = parseInt(item.harga) * item.jumlah;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.nama_produk}</td>
      <td><input type="number" min="1" value="${item.jumlah}" onchange="updateJumlah(${idx}, this.value)" /></td>
      <td>Rp ${parseInt(item.harga).toLocaleString()}</td>
      <td>Rp ${total.toLocaleString()}</td>
      <td><button onclick="hapusItem(${idx})"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
  });

  reviewSection.style.display = "flex";
  reviewSection.scrollIntoView({ behavior: "smooth" });
}

function updateJumlah(index, value) {
  keranjang[index].jumlah = parseInt(value);
  tampilkanReview();
  updateKeranjangIcon();
}

function hapusItem(index) {
  keranjang.splice(index, 1);
  tampilkanReview();
  updateKeranjangIcon();
}

function updateKeranjangIcon() {
  let icon = document.getElementById("floating-cart");
  if (!icon) {
    icon = document.createElement("div");
    icon.id = "floating-cart";
    icon.innerHTML = '<i class="fas fa-shopping-cart"></i><span id="cart-count">0</span>';
    icon.onclick = () => tampilkanReview();
    document.body.appendChild(icon);
  }
  document.getElementById("cart-count").innerText = keranjang.length;
  icon.style.display = keranjang.length ? "flex" : "none";
}

function switchView(mode) {
  const container = document.getElementById("umkm-produk");
  if (mode === 'grid') {
    container.classList.remove("list-mode");
  } else {
    container.classList.add("list-mode");
  }
}
