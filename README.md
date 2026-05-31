# SecureVote

SecureVote adalah aplikasi e-voting berbasis web yang menerapkan konsep blockchain sederhana untuk menjaga integritas data suara. Setiap suara yang masuk akan disimpan dalam bentuk hash dan dihubungkan dengan block sebelumnya menggunakan algoritma SHA-256.

Project ini dibuat sebagai portofolio untuk menunjukkan implementasi dasar autentikasi pengguna, sistem voting, database MySQL, serta konsep blockchain sederhana pada aplikasi web.

## Fitur

1. Registrasi & Login Aman: Enkripsi password menggunakan bcrypt (password_hash) dan verifikasi yang peka terhadap huruf besar/kecil (case-sensitive).
2. Proteksi Brute Force: Akun dikunci sementara selama 5 menit setelah 3 kali gagal login.
3. Simulasi Autentikasi Ganda (2FA OTP): Autentikasi dua faktor berbasis kode OTP 6-digit dengan simulasi pop-up email.
4. Pemisahan Entitas Database: Data admin (admins) dan pemilih (users) berada pada tabel terpisah demi keamanan struktural.
5. Voting Rahasia & Auto-Logout: Pemilih hanya bisa memberikan suara sekali, layar sukses thank-you overlay, dilanjutkan auto-logout otomatis.
6. Blockchain Explorer & Auditor: Panel visual rantai blok transaksi suara real-time di Admin Dashboard.
7. Simulasi Serangan (Tamper Simulator): Simulasi manipulasi data pada database dan pelacakan integritas rantai secara visual (blok berubah merah).
8. Pemulihan Database (Repair Database): Tombol pemulihan instan untuk menyehatkan kembali rantai blok yang rusak (kembali hijau).
9. Sistem Notifikasi Kustom: Toast notifikasi slide-down modern yang premium untuk menggantikan alert() bawaan browser.

## Teknologi

* HTML
* CSS
* JavaScript
* PHP Native
* MySQL
* Bootstrap 5
* SHA-256

## Cara Menjalankan

1. Jalankan Apache dan MySQL melalui XAMPP.
2. Import file `database.sql` ke phpMyAdmin.
3. Simpan project di folder `htdocs`.
4. Buka aplikasi melalui browser.


## Disclaimer / Batasan Simulasi

Project ini dirancang murni sebagai **simulasi konsep (Proof of Concept)** untuk kebutuhan portofolio dan pembelajaran, bukan untuk digunakan dalam pemilu/voting skala riil. Beberapa aspek penting yang perlu diketahui:

1. Blockchain Berbasis Database Terpusat: Implementasi blockchain di sini disimulasikan menggunakan database relasional (MySQL) terpusat untuk mempermudah audit visual integritas hash. Sistem ini tidak menggunakan jaringan terdesentralisasi peer-to-peer (P2P), *smart contract*, maupun algoritma konsensus (seperti PoW/PoS) yang nyata.
2. imulasi Serangan (Tamper Simulator): Fitur "Simulasikan Serangan" memanipulasi baris hash di database untuk mensimulasikan bagaimana rantai hash mendeteksi perubahan data. Pada blockchain riil yang terdesentralisasi, manipulasi data sepihak oleh admin tunggal tidak dimungkinkan karena adanya mekanisme konsensus antar node.
3. Simulasi 2FA OTP: Kode autentikasi dua faktor (2FA) OTP tidak dikirimkan ke kotak masuk email pengguna menggunakan server SMTP sungguhan, melainkan ditampilkan langsung di browser melalui popup notifikasi mock guna kenyamanan demonstrasi lokal.
4. Skema Login & Lockout: Waktu penguncian akun sementara dikonfigurasi selama 5 menit setelah 3 kali gagal login demi kenyamanan pengujian lokal, yang pada sistem nyata biasanya dikonfigurasi lebih lama atau memerlukan verifikasi admin untuk membukanya.

Proyek ini masih terus dikembangkan dan jauh dari kata sempurna. Saya sangat menghargai dan terbuka terhadap segala bentuk masukan, saran, kritik yang membangun, maupun diskusi lebih lanjut mengenai arsitektur keamanan dan blockchain pada aplikasi ini.

Jika Anda menemukan bug, memiliki ide peningkatan fitur, atau ingin berdiskusi mengenai aspek keamanan (*cybersecurity*), silakan sampaikan melalui kontak di bawah ini. Terima kasih!
## Author

Yoseph Delimda 

Informatics Student | Cyber Security Enthusiast | Security Engineer

