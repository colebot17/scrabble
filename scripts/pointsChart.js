const styles = getComputedStyle(document.documentElement);
const textColor = styles.getPropertyValue('--text-color');
const highlightColor = styles.getPropertyValue('--highlight');
const semiHighlightColor = styles.getPropertyValue('--semi-highlight');

Chart.defaults.color = textColor;

const ctx = document.getElementById('graphCanvas');

function startChart(data) {
    // const labels = [];
    // for (let i = 0; i < 20; i++) {
    //     labels.push(i);
    // }

    // const dataset1 = [Math.floor(Math.random() * 20) + 7];
    // const dataset2 = [Math.floor(Math.random() * 20) + 7];
    // for (let i = 0; i < labels.length; i++) {
    //     dataset1.push(dataset1.at(-1) + Math.floor(Math.random() * 20) + 7);
    //     dataset2.push(dataset2.at(-1) + Math.floor(Math.random() * 20) + 7);
    // }

    const labels = [];
    for (let i = 0; i < game.turn; i++) {
        labels.push(i);
    }

    const datasets = [];
    for (let i = 0; i < game.players.length; i++) {
        d = [];
        for (let j = 0; j < labels.length; j++) {
            const words = game.words.filter(a => a.turn === j && a.player === game.players[i].id);
            let turnPoints = d.at(-1) || 0;
            for (let k = 0; k < words.length; k++) {
                turnPoints += words[k].points;
            }
            d.push(turnPoints);
        }
        const currentPlayer = game.players[i].id == account.id;
        datasets.push({
            label: game.players[i].name,
            data: d,
            borderColor: currentPlayer ? highlightColor : semiHighlightColor,
            order: currentPlayer ? 0 : 1
        });
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
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
                    borderCapStyle: "round",
                    stepped: false
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