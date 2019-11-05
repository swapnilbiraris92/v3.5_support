import numeral from 'numeral';

export const qualityChartData = {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      { // one line graph
        label: 'Machine01',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(50, 115, 220, 0.3)', // Blue
          'rgba(50, 115, 220, 0.3)',
          'rgba(50, 115, 220, 0.3)',
          'rgba(50, 115, 220, 0.3)',
          'rgba(50, 115, 220, 0.3)',
        ],
        borderColor: [
          'rgba(50, 115, 220, 0.5)',
          'rgba(50, 115, 220, 0.5)',
          'rgba(50, 115, 220, 0.5)',
          'rgba(50, 115, 220, 0.5)',
          'rgba(50, 115, 220, 0.5)',
        ],
        borderWidth: 3
      },
      { // another line graph
        label: 'Machine02',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(255, 56, 96, 0.3)', // Green
          'rgba(255, 56, 96, 0.3)',
          'rgba(255, 56, 96, 0.3)',
          'rgba(255, 56, 96, 0.3)',
          'rgba(255, 56, 96, 0.3)',
        ],
        borderColor: [
          'rgba(255, 56, 96, 0.5)',
          'rgba(255, 56, 96, 0.5)',
          'rgba(255, 56, 96, 0.5)',
          'rgba(255, 56, 96, 0.5)',
          'rgba(255, 56, 96, 0.5)',
        ],
        borderWidth: 3
      }
    ]
  },
  options: {
    responsive: true,
    
    maintainAspectRatio: false,
    legend: {
      labels: {
        usePointStyle: true,
      }
    },
    lineTension: 1,
    scales: {
      yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: value => numeral(value/100).format('%00.0')
          }
        }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Time in hours'
        },
        maxBarThickness: 8,
      }]

    },
tooltips: {
        mode: 'index',
        callbacks: {
          label(tooltipItem, data) {
            const label = data.datasets[tooltipItem.datasetIndex].label;
            const value = numeral(tooltipItem.yLabel/100).format('%00.00');
            //const value = numeral(parseInt(tooltipItem.yLabel)).format('00') + ":" + numeral(parseInt((tooltipItem.yLabel%1) * 60)).format('00')
            return `${label}: ${value}`;
          }
        }
      }


  }
}

export default qualityChartData;