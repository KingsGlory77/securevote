const candidates = [
    {
        id: 1,
        name: 'Ahmad Wijaya - Rina Kartika',
        image: '../assets/img/kandidat1.jpg',
        visi: 'Indonesia Digital, Aman, dan Berdaya Saing Global',
        misi: '1. Mempercepat digitalisasi birokrasi dan layanan publik.\n2. Memperkuat sistem keamanan siber nasional.\n3. Mendorong pertumbuhan startup digital lokal ke kancah global.'
    },
    {
        id: 2,
        name: 'Daniel Saputra - Putri Lestari',
        image: '../assets/img/kandidat2.jpg',
        visi: 'Pembangunan Berkelanjutan untuk Generasi Masa Depan',
        misi: '1. Menerapkan kebijakan ekonomi hijau dan energi ramah lingkungan.\n2. Mengurangi emisi karbon dan melakukan reboisasi hutan masif.\n3. Mengoptimalkan transportasi publik bertenaga listrik.'
    },
    {
        id: 3,
        name: 'Fajar Nugraha - Nabila Putri',
        image: '../assets/img/kandidat3.jpg',
        visi: 'Pendidikan Berkualitas dan Teknologi untuk Semua',
        misi: '1. Pemerataan akses internet cepat gratis untuk sekolah di daerah 3T.\n2. Meningkatkan beasiswa riset teknologi tingkat tinggi.\n3. Revitalisasi kurikulum vokasi berbasis industri AI dan otomatisasi.'
    }
];

function renderCandidates(filteredCandidates) {
    const container = document.getElementById('candidateContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (filteredCandidates.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center my-5">
                <p class="text-secondary">Tidak ada pasangan calon yang cocok dengan kata kunci Anda.</p>
            </div>
        `;
        return;
    }
    
    filteredCandidates.forEach((candidate) => {
        container.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card shadow h-100">
                    <img
                        src="${candidate.image}"
                        class="card-img-top"
                        alt="${candidate.name}"
                        style="cursor: pointer;"
                        onclick="showDetail(${candidate.id})"
                    >
                    <div class="card-body text-center d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="fw-bold mb-2">
                                ${candidate.name}
                            </h5>
                            <p class="text-secondary small text-truncate" style="max-height: 40px;">Visi: "${candidate.visi}"</p>
                        </div>
                        <div class="d-grid gap-2 mt-3">
                            <button
                                class="btn btn-outline-light btn-sm"
                                onclick="showDetail(${candidate.id})"
                            >
                                Lihat Visi-Misi
                            </button>
                            <button
                                class="btn btn-success"
                                onclick="vote(${candidate.id})"
                            >
                                Pilih Paslon
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function showDetail(id) {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    
    overlay.innerHTML = `
        <div class="custom-modal-card">
            <img src="${candidate.image}" class="custom-modal-img" alt="${candidate.name}" style="max-height: 320px; object-fit: contain;">
            <div class="p-4">
                <h4 class="fw-bold text-white mb-3">${candidate.name}</h4>
                <div class="mb-3">
                    <span class="badge bg-primary px-3 py-1 mb-2">VISI</span>
                    <p class="text-light italic" style="font-size: 16px;">"${candidate.visi}"</p>
                </div>
                <div class="mb-4">
                    <span class="badge bg-success px-3 py-1 mb-2">MISI</span>
                    <p class="text-secondary" style="white-space: pre-line; line-height: 1.6; font-size: 14px;">${candidate.misi}</p>
                </div>
                <div class="text-end">
                    <button class="btn btn-outline-light" id="closeDetailBtn">Tutup</button>
                    <button class="btn btn-success ms-2" id="detailVoteBtn">Pilih Paslon</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
    
    const closeDetail = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };
    
    overlay.querySelector('#closeDetailBtn').addEventListener('click', closeDetail);
    overlay.querySelector('#detailVoteBtn').addEventListener('click', () => {
        vote(candidate.id);
        closeDetail();
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeDetail();
    });
}



async function vote(idKandidat) {
    const response = await fetch(
        '../api/vote.php',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_kandidat: idKandidat
            })
        }
    );

    const result = await response.json();

    if (result.status) {
        if (window.showSuccessOverlay) {
            window.showSuccessOverlay(
                'Voting Berhasil!', 
                'Pilihan Anda telah aman tercatat di dalam Blockchain. Terima kasih atas partisipasi Anda!', 
                async () => {
                    try {
                        await fetch('../api/logout.php');
                        window.location.href = 'login.html';
                    } catch (error) {
                        window.location.href = 'login.html';
                    }
                }
            );
        } else {
            showNotification('Voting Berhasil! Mengalihkan...', 'success');
            setTimeout(async () => {
                await fetch('../api/logout.php');
                window.location.href = 'login.html';
            }, 2000);
        }
    } else {
        showNotification(result.message, 'error');
    }
}

// Render candidates at start
renderCandidates(candidates);