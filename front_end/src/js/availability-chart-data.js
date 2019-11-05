//Copyright Asquared IoT Pvt. Ltd. 2019
//Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta
import numeral from 'numeral';

export const availabilityChartData = {
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
    lineTension: 1,
    legend: {
      labels: {
        usePointStyle: true,
      }
    },
    scales: {
      yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: value => numeral(value).format('00.00')
          },
          scaleLabel: {
            display: true,
            labelString: 'Minutes'
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
            //const value = parseInt(tooltipItem.yLabel) + ":" + parseInt((tooltipItem.yLabel%1) * 60)
            const value = numeral(parseInt(tooltipItem.yLabel)).format('00') + ":" + numeral(parseInt((tooltipItem.yLabel%1) * 60)).format('00')
    
            return `${label}: ${value}`;
          }
        }
      }


  }
}

export default availabilityChartData;