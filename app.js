let pengeluaran = [];

function tampilkanTanggal() {
  const sekarang = new Date();
  const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const tanggal = sekarang.toLocaleDateString('id-ID', opsi);
  document.getElementById("tanggal-hari-ini").innerHTML = tanggal;
}

function render() {
  const wadah = document.getElementById("daftar-pengeluaran");
  let html = "";

  // Filter bulan dulu
  const filterBulan = `${tahunAktif}-${String(bulanAktif).padStart(2, '0')}`;
  const terfilter = pengeluaran.filter(function(item) {
    return item.tanggal.substring(0, 7) === filterBulan;
  });

  if (terfilter.length === 0) {
    html = `
      <div class="bg-gray-800 rounded-2xl p-6 text-center text-gray-400">
        <p class="text-4xl mb-2">-</p>
        <p>Belum ada transaksi</p>
      </div>
    `;
    wadah.innerHTML = html;
    return;
  }

  // Urutkan terbaru di atas
  const terurut = [...terfilter].sort(function(a, b) {
    return new Date(b.tanggal) - new Date(a.tanggal);
  });

  // Kelompokkan per tanggal
  const perTanggal = {};
  terurut.forEach(function(item) {
    if (!perTanggal[item.tanggal]) {
      perTanggal[item.tanggal] = [];
    }
    perTanggal[item.tanggal].push(item);
  });

  // Render per grup tanggal
  for (const tanggal in perTanggal) {
    const items = perTanggal[tanggal];
    const totalHari = items.reduce(function(acc, item) {
      return acc + item.jumlah;
    }, 0);

    const tgl = new Date(tanggal + 'T00:00:00');
    const labelTanggal = tgl.toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short'
    });

    html += `
      <div class="flex justify-between items-center px-1 mb-2 mt-4">
        <span class="text-gray-400 text-sm font-medium">${labelTanggal}</span>
        <span class="text-red-400 text-sm font-medium">-Rp${totalHari.toLocaleString('id-ID')}</span>
      </div>
    `;

    const emojiKategori = {
    'Food': '🍔',
    'Beverages': '🧋',
    'Transport': '🚗',
    'Fun/Travel': '✈️',
    'Skincare': '🧴'
};

    items.forEach(function(item) {
      const emoji = emojiKategori[item.kategori] || '💰';
      html += `
        <div class="bg-gray-800 rounded-2xl p-4 flex justify-between items-center mb-2">
          <div class="flex items-center gap-3">
            <div class="bg-gray-700 rounded-2xl w-10 h-10 flex items-center justify-center text-xl">
              ${emoji}
            </div>
            <div>
              <p class="font-semibold text-white">${item.kategori}</p>
              <p class="text-sm text-gray-400">${item.catatan}</p>
            </div>
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
  }

  wadah.innerHTML = html;
}

function hitungTotal() {
  const filterBulan = `${tahunAktif}-${String(bulanAktif).padStart(2, '0')}`;
  let total = 0;

  pengeluaran.forEach(function(item) {
    if (item.tanggal.substring(0, 7) === filterBulan) {
      total += item.jumlah;
    }
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

let chartInstance = null;

function renderReports() {
  const container = document.getElementById("ringkasan-kategori");
  const filterBulan = `${tahunAktif}-${String(bulanAktif).padStart(2, '0')}`;

  // Filter data sesuai bulan aktif
  const terfilter = pengeluaran.filter(function(item) {
    return item.tanggal.substring(0, 7) === filterBulan;
  });

  // Update label bulan di Reports
  const labelBulan = `${namaBulan[bulanAktif - 1]} ${tahunAktif}`;
  document.getElementById("label-bulan-reports").innerHTML = labelBulan;

  if (terfilter.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center">Belum ada transaksi bulan ini</p>';
    document.getElementById("total-reports").innerHTML = "Rp0";
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  // Kelompokkan per kategori
  const perKategori = {};
  terfilter.forEach(function(item) {
    if (!perKategori[item.kategori]) {
      perKategori[item.kategori] = 0;
    }
    perKategori[item.kategori] += item.jumlah;
  });

  const labels = Object.keys(perKategori);
  const data = Object.values(perKategori);
  const warna = {
    'Food': '#f59e0b',
    'Beverages': '#3b82f6',
    'Transport': '#10b981',
    'Fun/Travel': '#8b5cf6',
    'Skincare': '#ec4899'
  };
  const colors = labels.map(function(l) {
    return warna[l] || '#6b7280';
  });

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = document.getElementById('chart-kategori').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#9ca3af',
            padding: 16,
            font: { size: 12 }
          }
        }
      }
    }
  });

  let html = "";
  const total = data.reduce(function(a, b) { return a + b; }, 0);
  document.getElementById("total-reports").innerHTML = "Rp" + total.toLocaleString('id-ID');
  labels.forEach(function(kategori, i) {
    const persen = ((data[i] / total) * 100).toFixed(1);
    html += `
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full" style="background-color: ${colors[i]}"></div>
          <span class="text-white">${kategori}</span>
        </div>
        <div class="text-right">
          <p class="text-white font-bold">Rp${data[i].toLocaleString('id-ID')}</p>
          <p class="text-gray-400 text-xs">${persen}%</p>
        </div>
      </div>
    `;
  });
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

  // Sembunyiin/tampilkan tombol filter bulan
  const btnFilter = document.getElementById('btn-filter-bulan');
  btnFilter.style.visibility = tab === 'settings' ? 'hidden' : 'visible';

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
  });
  document.body.style.overflow = "hidden";
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

const namaBulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
let tahunDipilih = new Date().getFullYear();
let bulanDipilih = new Date().getMonth() + 1;
let bulanAktif = new Date().getMonth() + 1;
let tahunAktif = new Date().getFullYear();

function bukaFilterBulan() {
  tahunDipilih = tahunAktif;
  bulanDipilih = bulanAktif;
  renderGridBulan();
  document.getElementById("popup-bulan").classList.remove("hidden");
  document.getElementById("popup-bulan").classList.add("flex");
  document.body.style.overflow = "hidden";
}

function tutupFilterBulan() {
  document.getElementById("popup-bulan").classList.add("hidden");
  document.getElementById("popup-bulan").classList.remove("flex");
  document.body.style.overflow = "";
}

function gantiTahun(arah) {
  tahunDipilih += arah;
  renderGridBulan();
}

function resetBulan() {
  tahunDipilih = new Date().getFullYear();
  bulanDipilih = new Date().getMonth() + 1;
  renderGridBulan();
}

function renderGridBulan() {
  document.getElementById("label-tahun").innerHTML = tahunDipilih;
  let html = "";
  for (let i = 1; i <= 12; i++) {
    const aktif = i === bulanDipilih && tahunDipilih === tahunAktif;
    const dipilihSekarang = i === bulanDipilih && tahunDipilih === tahunDipilih;
    html += `
      <button onclick="pilihBulanGrid(${i})"
        class="rounded-2xl py-3 text-sm font-bold transition ${i === bulanDipilih ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'}">
        ${namaBulan[i-1]}
      </button>
    `;
  }
  document.getElementById("grid-bulan").innerHTML = html;
}

function pilihBulanGrid(bulan) {
  bulanDipilih = bulan;
  renderGridBulan();
}

function konfirmasiBulan() {
  bulanAktif = bulanDipilih;
  tahunAktif = tahunDipilih;
  const labelBulan = namaBulan[bulanAktif - 1];
  document.getElementById("label-filter-bulan").innerHTML = labelBulan;
  tutupFilterBulan();
  render();
  hitungTotal();
  renderReports();
}

muatData();
tampilkanTanggal();
render();
hitungTotal();
document.getElementById("label-filter-bulan").innerHTML = namaBulan[bulanAktif - 1]; // ← tambah ini

console.log(pengeluaran);