const styles = getComputedStyle(document.documentElement);
const textColor = styles.getPropertyValue('--text-color');
const textColorLight = styles.getPropertyValue('--text-color-light');
const selectionColor = styles.getPropertyValue('--selection-color');
const highlightColor = styles.getPropertyValue('--highlight');
const semiHighlightColor = styles.getPropertyValue('--semi-highlight');

const LINE_COLORS = [
    "#4F5BFF",
    "#5497FF",
    "#ED57FF",
    "#FF5757",
    "#FFAF57"
]

Chart.defaults.color = textColor;
Chart.defaults.borderColor = selectionColor;

const ctx = document.getElementById('graphCanvas');
ctx.classList.remove('hidden');

const unavailableMessage = document.getElementById('graphUnavailableMessage');
unavailableMessage.classList.add('hidden');

let chart;

function startChart() {
    let canShowChart = true;

    const labels = [];
    for (let i = 0; i < game.turn; i++) {
        labels.push(i);
    }

    const datasets = [];
    let lineColorIndex = 0;
    for (let i = 0; i < game.players.length; i++) {
        d = [];
        for (let j = 0; j < labels.length; j++) {
            const words = game.words.filter(a => a.turn === j && a.player === game.players[i].id);
            let turnPoints = d.at(-1)?.y || 0;
            for (let k = 0; k < words.length; k++) {
                turnPoints += words[k].points;
            }
            if (words.length) d.push({x: j, y: turnPoints});
        }
        const currentPlayer = game.players[i].id == account.id;
        datasets.push({
            label: game.players[i].name + (currentPlayer ? " (you)" : ""),
            data: d,
            borderColor: currentPlayer ? highlightColor : LINE_COLORS[lineColorIndex++ % LINE_COLORS.length],
            order: currentPlayer ? 0 : 1,
            borderWidth: currentPlayer ? 7 : 5
        });
        if (d.length < 2) {
            ctx.classList.add('hidden');
            unavailableMessage.classList.remove('hidden');
        }
    }

    chart = new Chart(ctx, {
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
            maintainAspectRatio: false,
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

function destroyChart() {
    if (chart) chart.destroy();
}