let resultsChart = null;

async function loadResults() {
    try {
        const response = await fetch('../api/results.php');
        
        if (response.status === 403) {
            window.location.href = 'dashboard.html';
            return;
        }

        const results = await response.json();

        const table = document.getElementById('resultTable');
        if (!table) return;
        
        table.innerHTML = '';

        // Calculate total votes for percentages
        const totalVotes = results.reduce((sum, item) => sum + parseInt(item.total), 0);

        // Prep data arrays for Chart.js
        const labels = [];
        const voteCounts = [];
        const colors = [
            'rgba(59, 130, 246, 0.85)', // Blue
            'rgba(16, 185, 129, 0.85)', // Green
            'rgba(245, 158, 11, 0.85)', // Amber
            'rgba(139, 92, 246, 0.85)'  // Violet
        ];
        const borderColors = [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#8b5cf6'
        ];

        results.forEach((result, idx) => {
            const voteCount = parseInt(result.total);
            const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : '0.0';

            // Add to table
            table.innerHTML += `
                <tr>
                    <td class="fw-bold text-white">${result.nama_paslon}</td>
                    <td class="text-center fw-bold text-white">${voteCount}</td>
                    <td class="text-center text-secondary">${percentage}%</td>
                </tr>
            `;

            labels.push(result.nama_paslon);
            voteCounts.push(voteCount);
        });

        // Initialize Chart.js Doughnut
        const ctx = document.getElementById('resultsChart');
        if (ctx) {
            // Destroy existing chart to prevent canvas redraw issues
            if (resultsChart) {
                resultsChart.destroy();
            }

            // If no votes have been cast yet, show dummy dataset to look clean
            const finalCounts = totalVotes > 0 ? voteCounts : [1, 1, 1];
            const finalColors = totalVotes > 0 ? colors.slice(0, results.length) : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)'];
            const finalBorderColors = totalVotes > 0 ? borderColors.slice(0, results.length) : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)'];

            resultsChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: finalCounts,
                        backgroundColor: finalColors,
                        borderColor: finalBorderColors,
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#9ca3af',
                                font: {
                                    family: 'Outfit',
                                    size: 13
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    if (totalVotes === 0) return 'Belum ada suara';
                                    const value = context.raw;
                                    const percent = ((value / totalVotes) * 100).toFixed(1);
                                    return ` ${context.label}: ${value} suara (${percent}%)`;
                                }
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

    } catch (error) {
        console.error('Error loading results:', error);
    }
}

loadResults();