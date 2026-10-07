// Durasi maksimal sesi: 2 Menit (dalam milidetik = 120.000 ms)
const DURASI_MAKSIMAL = 2 * 60 * 1000; 

// 1. MEMILIH ELEMEN DOM
const layarLogin = document.getElementById('layar-login');
const layarDashboard = document.getElementById('layar-dashboard');
const formLogin = document.getElementById('form-login');
const tombolLogout = document.getElementById('tombol-logout');
const teksPengguna = document.getElementById('teks-pengguna');
const teksWaktu = document.getElementById('waktu-mundur');
const inputUsername = document.getElementById('username');

// Variabel untuk menyimpan mesin penghitung agar bisa dihentikan
let intervalPenghitung;

// 2. FUNGSI LOGOUT (MENGHAPUS SAVE DATA)
function eksekusiLogout() {
    // Menghapus data sesi (save data) dari Local Storage
    localStorage.removeItem('waktuLogin');
    localStorage.removeItem('namaPengguna');
    
    // Mematikan mesin loop timer di background
    clearInterval(intervalPenghitung);
    
    // Menukar kelas CSS untuk mengembalikan tampilan ke layar login
    layarDashboard.classList.add('sembunyi');
    layarLogin.classList.remove('sembunyi');
}

// 3. FUNGSI PENGHITUNG WAKTU MUNDUR
function perbaruiTimer(waktuTersimpan) {
    // Date.now() menghasilkan angka absolut dalam milidetik sejak 1 Jan 1970
    const waktuSekarang = Date.now();
    
    // Selisih antara waktu saat ini dengan waktu saat pengguna menekan tombol login
    const waktuBerjalan = waktuSekarang - waktuTersimpan;
    const sisaWaktu = DURASI_MAKSIMAL - waktuBerjalan;

    // Jika waktu menyentuh angka 0 atau negatif
    if (sisaWaktu <= 0) {
        alert('Sesi Anda telah berakhir (Lebih dari 2 menit). Sistem memaksa Anda keluar.');
        eksekusiLogout();
        return; // Menghentikan fungsi agar tidak melanjutkan ke baris bawah
    }

    // Mengonversi sisa milidetik ke format matematis Menit dan Detik
    const menit = Math.floor(sisaWaktu / 1000 / 60);
    const detik = Math.floor((sisaWaktu / 1000) % 60);
    
    // padStart memastikan angka selalu 2 digit (contoh: '9' menjadi '09')
    const teksMenit = menit.toString().padStart(2, '0');
    const teksDetik = detik.toString().padStart(2, '0');
    
    // Memperbarui UI tampilan sisa waktu
    teksWaktu.textContent = `${teksMenit}:${teksDetik}`;
}

// 4. FUNGSI MEMERIKSA STATUS LOGIN (LOAD GAME)
function periksaSesiLogin() {
    // Memeriksa brankas Local Storage
    const waktuLoginTersimpan = localStorage.getItem('waktuLogin');
    const namaTersimpan = localStorage.getItem('namaPengguna');

    if (waktuLoginTersimpan) {
        const waktuSekarang = Date.now();
        const waktuBerjalan = waktuSekarang - parseInt(waktuLoginTersimpan);

        // Jika pengguna menutup browser lalu membukanya 5 menit kemudian
        if (waktuBerjalan >= DURASI_MAKSIMAL) {
            eksekusiLogout(); // Langsung hapus sesi
        } else {
            // Jika sesi masih valid, ganti layar ke Dashboard
            teksPengguna.textContent = namaTersimpan;
            layarLogin.classList.add('sembunyi');
            layarDashboard.classList.remove('sembunyi');
            
            // Panggil timer sekali agar tidak ada jeda kosong
            perbaruiTimer(parseInt(waktuLoginTersimpan));
            
            // Nyalakan mesin loop untuk mengulang fungsi perbaruiTimer setiap 1000 milidetik (1 detik)
            intervalPenghitung = setInterval(function() {
                perbaruiTimer(parseInt(waktuLoginTersimpan));
            }, 1000);
        }
    }
}

// 5. MENDENGARKAN EVENT LOGIN (CREATE SAVE DATA)
formLogin.addEventListener('submit', function(event) {
    // Mencegah sifat bawaan form HTML yang selalu me-refresh halaman saat disubmit
    event.preventDefault(); 

    const nama = inputUsername.value;
    const waktuSekarang = Date.now(); 

    // Menyimpan status dan timestamp ke Local Storage
    localStorage.setItem('namaPengguna', nama);
    localStorage.setItem('waktuLogin', waktuSekarang.toString());

    // Membersihkan kolom ketikan
    formLogin.reset();

    // Jalankan pengecekan untuk langsung pindah layar
    periksaSesiLogin();
});

// 6. MENDENGARKAN EVENT LOGOUT MANUAL
tombolLogout.addEventListener('click', eksekusiLogout);

// 7. INISIALISASI SAAT HALAMAN PERTAMA DIMUAT
// Dieksekusi otomatis oleh browser sesaat setelah file script ini terbaca
periksaSesiLogin();