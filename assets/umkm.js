const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE";
const urlParams = new URLSearchParams(window.location.search);
const umkmId = urlParams.get("id");

Promise.all([
  fetch(`${sheetBase}/umkm`).then(res => res.json()),
  fetch(`${sheetBase}/produk`).then(res => res.json())
])
.then(([umkm, produk]) => {
  const data = umkm.find(u => u.id_umkm === umkmId);
  if (!data) {
    document.getElementById("umkm-profil").innerHTML = "<p>UMKM tidak ditemukan.</p>";
    return;
  }

  const produkUMKM = produk.filter(p => p.id_umkm === umkmId && p.status === "aktif");

  // Tampilkan profil UMKM
  document.getElementById("umkm-profil").innerHTML = `
    <h2>${data.nama_umkm}</h2>
    <p><strong>Deskripsi:</strong> ${data.deskripsi || '-'}</p>
    <p><strong>Alamat:</strong> ${data.alamat}</p>
    <p><strong>Kecamatan:</strong> ${data.kecamatan}</p>
    <p><strong>Kontak WA:</strong> <a href="https://wa.me/${data.kontak_wa}" target="_blank">${data.kontak_wa}</a></p>
    ${data.latitude && data.longitude ? `
      <div style="margin-top:1rem">
        <iframe width="100%" height="250" style="border:0" loading="lazy"
          src="https://maps.google.com/maps?q=${data.latitude},${data.longitude}&hl=id&z=15&output=embed">
        </iframe>
      </div>` : ''
    }
  `;

  // Tampilkan produk milik UMKM
   document.getElementById("umkm-produk").innerHTML = produkUMKM.map(p => `
  <div class="produk-card">
    <div class="produk-img" onclick='showDetail(${JSON.stringify(p.nama_produk)}, ${JSON.stringify(p.deskripsi)}, "${p.gambar_url}", "${parseInt(p.harga).toLocaleString()}")'>
      <img src="${p.gambar_url}" alt="${p.nama_produk}" />
    </div>
    <div class="produk-info">
      <h3 class="produk-nama">${p.nama_produk}</h3>
      <p class="produk-harga">Rp ${parseInt(p.harga).toLocaleString()}</p>
      <div class="produk-actions">
        <button onclick="toggleKeranjang('${p.id_produk}', this)">➕ Keranjang</button>
        <a href="https://wa.me/${data.kontak_wa}?text=Halo%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(p.nama_produk)}" class="btn-wa" target="_blank">Pesan via WA</a>
      </div>
    </div>
  </div>
`).join('');

})
.catch(err => {
  console.error("Gagal memuat data UMKM:", err);
  document.getElementById("umkm-profil").innerHTML = "<p>Terjadi kesalahan memuat data UMKM.</p>";
});

 function switchView(mode) {
  const container = document.getElementById("umkm-produk");
  if (mode === 'grid') {
    container.classList.remove("list-mode");
  } else {
    container.classList.add("list-mode");
  }
}

function showDetail(nama, deskripsi, gambar, harga) {
  const modal = document.getElementById("produk-modal");
  modal.querySelector(".modal-nama").innerText = nama;
  modal.querySelector(".modal-deskripsi").innerHTML = deskripsi.replace(/\n/g, "<br>");
  modal.querySelector(".modal-gambar").src = gambar;
  modal.querySelector(".modal-harga").innerText = "Rp " + harga;
  modal.style.display = "flex";
}


let keranjang = [];

function toggleKeranjang(id, btn) {
  const index = keranjang.indexOf(id);
  if (index >= 0) {
    keranjang.splice(index, 1);
    btn.innerText = '➕ Keranjang';
  } else {
    keranjang.push(id);
    btn.innerText = '🛒 Hapus';
  }
  console.log('Keranjang:', keranjang);
}

function openCheckout(produk, umkm) {
  if (keranjang.length === 0) {
    alert('Belum ada produk dalam keranjang.');
    return;
  }

  const container = document.getElementById("checkout-items");
  container.innerHTML = '';

  keranjang.forEach(id => {
    const item = produk.find(p => p.id_produk === id);
    container.innerHTML += `
      <div class="checkout-item" data-id="${id}">
        <p><strong>${item.nama_produk}</strong></p>
        <label>Jumlah: <input type="number" min="1" value="1" class="checkout-qty" /></label>
        <button onclick="removeCheckoutItem('${id}')">Hapus</button>
      </div>
    `;
  });

  document.getElementById("checkout-modal").style.display = "flex";

  document.getElementById("checkout-confirm").onclick = () => {
    const items = Array.from(document.querySelectorAll(".checkout-item"));
    const pesan = items.map(i => {
      const nama = i.querySelector("strong").innerText;
      const qty = i.querySelector("input").value;
      return `- ${nama} x ${qty}`;
    }).join("%0A");

    const wa = umkm.kontak_wa;
    const url = `https://wa.me/${wa}?text=Halo,%20saya%20ingin%20memesan:%0A${pesan}`;
    window.open(url, '_blank');
    document.getElementById("checkout-modal").style.display = "none";
  };
}

window.removeCheckoutItem = function(id) {
  keranjang = keranjang.filter(i => i !== id);
  const el = document.querySelector(`.checkout-item[data-id="${id}"]`);
  if (el) el.remove();
};

document.getElementById("checkout-close").onclick = () => {
  document.getElementById("checkout-modal").style.display = "none";
};

