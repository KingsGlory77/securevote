async function loadResults() {
    try {
        const response = await fetch('../api/results.php');
        const results = await response.json();

        const container = document.getElementById('resultContainer');
        if (!container) return;

        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<p class="text-secondary">Belum ada suara masuk.</p>';
            return;
        }

        // Calculate total votes for percentages
        const totalVotes = results.reduce((sum, item) => sum + parseInt(item.total), 0);

        results.forEach((result) => {
            const voteCount = parseInt(result.total);
            const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;

            container.innerHTML += `
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <h6 class="text-white m-0">${result.nama_paslon}</h6>
                        <span class="text-secondary small fw-bold">${voteCount} Suara (${percentage}%)</span>
                    </div>
                    <div class="progress">
                        <div
                            class="progress-bar"
                            role="progressbar"
                            style="width:${percentage}%"
                            aria-valuenow="${percentage}"
                            aria-valuemin="0"
                            aria-valuemax="100"
                        ></div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

async function loadAdminStats() {
    try {
        const response = await fetch('../api/admin_stats.php');
        
        if (response.status === 403) {
            showNotification('Akses ditolak. Silakan login sebagai admin.', 'error');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();
        
        if (data.status) {
            // Update stats indicators
            const totalUsersEl = document.getElementById('totalUsers');
            const totalVotesEl = document.getElementById('totalVotes');
            const blockchainStatusEl = document.getElementById('blockchainStatus');

            if (totalUsersEl) totalUsersEl.innerText = data.total_users;
            if (totalVotesEl) totalVotesEl.innerText = data.total_votes;
            
            if (blockchainStatusEl) {
                if (data.blockchain_valid) {
                    blockchainStatusEl.innerText = 'Valid';
                    blockchainStatusEl.className = 'fw-bold text-success';
                } else {
                    blockchainStatusEl.innerText = 'Terjadi Terobos/Manipulasi!';
                    blockchainStatusEl.className = 'fw-bold text-danger';
                }
            }

            // Update Blockchain Visual Explorer
            const bcContainer = document.getElementById('blockchainContainer');
            if (bcContainer) {
                bcContainer.innerHTML = '';
                
                if (data.blocks.length === 0) {
                    bcContainer.innerHTML = `
                        <div class="col-12 text-center py-4">
                            <p class="text-secondary m-0">Belum ada blok yang tercatat di dalam blockchain.</p>
                        </div>
                    `;
                } else {
                    data.blocks.forEach((block, idx) => {
                        // A block is invalid if it lies at or after the invalid connection point
                        const isNodeInvalid = (data.invalid_index !== -1 && idx >= data.invalid_index);
                        const nodeClass = isNodeInvalid ? 'invalid' : 'valid';
                        const badgeClass = isNodeInvalid ? 'bg-danger' : 'bg-success';
                        const badgeText = isNodeInvalid ? 'Broken' : 'Valid';

                        let blockHtml = `
                            <div class="block-node ${nodeClass}">
                                <div class="block-node-header">
                                    <span class="block-index">Blok #${block.id_block}</span>
                                    <span class="badge ${badgeClass} text-white">${badgeText}</span>
                                </div>
                                <div class="block-hash-label">Data Hash (SHA-256):</div>
                                <div class="block-hash-value mb-2">${block.data_hash.substring(0, 16)}...</div>
                                
                                <div class="block-hash-label">Previous Hash:</div>
                                <div class="block-hash-value mb-2">${block.previous_hash.substring(0, 16)}...</div>
                                
                                <div class="block-hash-label">Current Hash:</div>
                                <div class="block-hash-value">${block.current_hash.substring(0, 16)}...</div>
                            </div>
                        `;

                        // Add link arrow if it's not the last block
                        if (idx < data.blocks.length - 1) {
                            blockHtml += `
                                <div class="block-connector my-2 d-none d-md-block">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                                <div class="block-connector my-2 d-block d-md-none text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="height: 24px; transform: rotate(90deg);">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            `;
                        }

                        bcContainer.innerHTML += blockHtml;
                    });
                }
            }

            // Update Audit Table
            const auditTableBody = document.getElementById('auditTableBody');
            if (auditTableBody) {
                auditTableBody.innerHTML = '';
                
                if (data.blocks.length === 0) {
                    auditTableBody.innerHTML = `
                        <tr>
                            <td colspan="3" class="text-center text-secondary py-3">Belum ada blok untuk diaudit.</td>
                        </tr>
                    `;
                } else {
                    data.blocks.forEach((block, idx) => {
                        const isNodeInvalid = (data.invalid_index !== -1 && idx >= data.invalid_index);
                        const statusBadge = isNodeInvalid 
                            ? `<span class="badge bg-danger text-white">Integrity Breach</span>` 
                            : `<span class="badge bg-success text-white">Verified</span>`;
                            
                        auditTableBody.innerHTML += `
                            <tr>
                                <td class="fw-bold text-white">#${block.id_block}</td>
                                <td class="text-secondary small font-monospace">${block.data_hash}</td>
                                <td class="text-center">${statusBadge}</td>
                            </tr>
                        `;
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

// Bind attack and repair buttons
const attackBtn = document.getElementById('attackBtn');
if (attackBtn) {
    attackBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('../api/simulate_attack.php');
            const result = await response.json();
            showNotification(result.message, result.status ? 'success' : 'error');
            
            // Reload stats and results
            loadAdminStats();
            loadResults();
        } catch (error) {
            console.error('Error simulating attack:', error);
            showNotification('Gagal mensimulasikan serangan.', 'error');
        }
    });
}

const repairBtn = document.getElementById('repairBtn');
if (repairBtn) {
    repairBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('../api/repair_db.php');
            const result = await response.json();
            showNotification(result.message, result.status ? 'success' : 'error');
            
            // Reload stats and results
            loadAdminStats();
            loadResults();
        } catch (error) {
            console.error('Error repairing database:', error);
            showNotification('Gagal memulihkan database.', 'error');
        }
    });
}

// Startup
loadResults();

if (document.getElementById('totalUsers')) {
    loadAdminStats();
}