let pengeluaran = [
  {
    id: 1,
    jumlah: 25000,
    kategori: "Makanan",
    tanggal: "2026-06-20",
    catatan: "Makan siang"
  },
  {
    id: 2,
    jumlah: 50000,
    kategori: "Transportasi",
    tanggal: "2026-06-21",
    catatan: "Bensin"
  }
];

function tampilkanTanggal() {
  const sekarang = new Date();
  const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const tanggal = sekarang.toLocaleDateString('id-ID', opsi);
  document.getElementById("tanggal-hari-ini").innerHTML = tanggal;
}

function render() {
  const wadah = document.getElementById("daftar-pengeluaran");
  let html = "";

  if (pengeluaran.length === 0) {
    html = `
      <div class="bg-gray-800 rounded-2xl p-6 text-center text-gray-400">
        <p class="text-4xl mb-2">-</p>
        <p>Belum ada transaksi</p>
      </div>
    `;
    wadah.innerHTML = html;
    return;
  }

  pengeluaran.forEach(function(item) {
  html += `
    <div class="bg-gray-800 rounded-2xl p-4 flex justify-between items-center">
      <div>
        <p class="font-semibold text-white">${item.kategori}</p>
        <p class="text-sm text-gray-400">${item.tanggal} • ${item.catatan}</p>
      </div>
      <div class="flex flex-col items-end gap-2">
        <p class="text-red-400 font-bold">-Rp${item.jumlah.toLocaleString('id-ID')}</p>
        <button onclick="hapusPengeluaran(${item.id})"
          class="text-xs text-gray-500 hover:text-red-400 transition">
          Hapus
        </button>
      </div>
    </div>
  `;
});

  wadah.innerHTML = html;
}

function hitungTotal() {
  let total = 0;

  pengeluaran.forEach(function(item) {
    total += item.jumlah;
  });

  document.getElementById("total").innerHTML = "Total: Rp" + total.toLocaleString('id-ID');
}

function tambahPengeluaran() {
  const jumlah = Number(document.getElementById("input-jumlah").value);
  const tanggal = document.getElementById("input-tanggal").value;
  const catatan = document.getElementById("input-catatan").value;

  if (!jumlah || !kategoriDipilih || !tanggal || !catatan) {
    alert("Semua field harus diisi!");
    return;
  }

  if (jumlah <= 0) {
    alert("Jumlah harus lebih dari 0!");
    return;
  }

  const baru = {
    id: Date.now(),
    jumlah: jumlah,
    kategori: kategoriDipilih,
    tanggal: tanggal,
    catatan: catatan
  };

  pengeluaran.push(baru);
  simpanData();
  render();
  hitungTotal();
  tutupModal();
}

function hapusPengeluaran(id) {
  pengeluaran = pengeluaran.filter(function(item) {
    return item.id !== id;
  });
  simpanData();
  render();
  hitungTotal();
}

function simpanData() {
  localStorage.setItem("pengeluaran", JSON.stringify(pengeluaran));
}

function muatData() {
  const data = localStorage.getItem("pengeluaran");
  if (data) {
    pengeluaran = JSON.parse(data);
  }
}

function exportData() {
  const dataStr = JSON.stringify(pengeluaran, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expense-tracker-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      pengeluaran = data;
      simpanData();
      render();
      hitungTotal();
      alert("Data berhasil di-import!");
    } catch {
      alert("File tidak valid!");
    }
  };
  reader.readAsText(file);
}

function renderReports() {
  const container = document.getElementById("ringkasan-kategori");
  
  if (pengeluaran.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center">Belum ada transaksi</p>';
    return;
  }

  // Kelompokkan per kategori
  const perKategori = {};
  pengeluaran.forEach(function(item) {
    if (!perKategori[item.kategori]) {
      perKategori[item.kategori] = 0;
    }
    perKategori[item.kategori] += item.jumlah;
  });

  let html = "";
  for (const kategori in perKategori) {
    html += `
      <div class="flex justify-between items-center bg-gray-700 rounded-xl px-4 py-3">
        <span class="font-medium">${kategori}</span>
        <span class="text-red-400 font-bold">Rp${perKategori[kategori].toLocaleString('id-ID')}</span>
      </div>
    `;
  }
  container.innerHTML = html;
}

function gantiTab(tab) {
  ['home', 'reports', 'settings'].forEach(function(t) {
    document.getElementById('konten-' + t).style.display = 'none';
    document.getElementById('tab-' + t).classList.remove('text-yellow-400');
    document.getElementById('tab-' + t).classList.add('text-gray-500');
  });

  document.getElementById('konten-' + tab).style.display = 'block';
  document.getElementById('tab-' + tab).classList.remove('text-gray-500');
  document.getElementById('tab-' + tab).classList.add('text-yellow-400');

  if (tab === 'reports') renderReports();
}

let kategoriDipilih = "";

function bukaModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  // Reset form
  document.getElementById("input-jumlah").value = "";
  document.getElementById("input-catatan").value = "";
  kategoriDipilih = "";
  // Reset highlight kategori
  document.querySelectorAll(".kategori-btn").forEach(function(btn) {
    btn.classList.remove("bg-yellow-400");
    btn.classList.add("bg-gray-800");
    btn.querySelector("span:last-child").classList.remove("text-gray-900");
    btn.querySelector("span:last-child").classList.add("text-gray-400");
    document.body.style.overflow = "hidden";
  });
}

function tutupModal() {
  const modal = document.getElementById("modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
}

function pilihKategori(kategori) {
  kategoriDipilih = kategori;
  // Reset semua
  document.querySelectorAll(".kategori-btn").forEach(function(btn) {
    btn.classList.remove("bg-yellow-400");
    btn.classList.add("bg-gray-800");
    btn.querySelector("span:last-child").classList.remove("text-gray-900");
    btn.querySelector("span:last-child").classList.add("text-gray-400");
  });
  // Highlight yang dipilih
  const dipilih = document.querySelector(`[data-kategori="${kategori}"]`);
  dipilih.classList.add("bg-yellow-400");
  dipilih.classList.remove("bg-gray-800");
  dipilih.querySelector("span:last-child").classList.add("text-gray-900");
  dipilih.querySelector("span:last-child").classList.remove("text-gray-400");
}

muatData();
tampilkanTanggal();
render();
hitungTotal();

console.log(pengeluaran);