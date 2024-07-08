const styles = getComputedStyle(document.documentElement);
const textColor = styles.getPropertyValue('--text-color');
const highlightColor = styles.getPropertyValue('--highlight');
const semiHighlightColor = styles.getPropertyValue('--semi-highlight');

const ctx = document.getElementById('graphCanvas');

function startChart() {
    const labels = [];
    for (let i = 0; i < 20; i++) {
        labels.push(i);
    }

    const dataset1 = [Math.floor(Math.random() * 20) + 7];
    const dataset2 = [Math.floor(Math.random() * 20) + 7];
    for (let i = 0; i < labels.length; i++) {
        dataset1.push(dataset1.at(-1) + Math.floor(Math.random() * 20) + 7);
        dataset2.push(dataset2.at(-1) + Math.floor(Math.random() * 20) + 7);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Cole',
                    data: dataset1,
                    borderColor: highlightColor
                },
                {
                    label: 'test',
                    data: dataset2,
                    borderColor: semiHighlightColor
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        text: "Points",
                        display: true
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    title: {
                        text: "Turn",
                        display: true
                    },
                    grid: {
                        display: false
                    }
                }
            },
            devicePixelRatio: 2,
            elements: {
                line: {
                    tension: 0.25,
                    borderWidth: 5,
                    borderCapStyle: "round"
                },
                point: {
                    pointStyle: false
                }
            },
            plugins: {
                tooltip: {
                    enabled: false
                },
                legend: {
                    position: "chartArea",
                    align: "start",
                    labels: {
                        boxHeight: 0
                    }
                }
            }
        }
    });
}