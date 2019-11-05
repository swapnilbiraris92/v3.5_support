<!-- Copyright Asquared IoT Pvt. Ltd. 2019
 Asquared IoT Pvt. Ltd. Confidential Information
 Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta
-->
<template>
  <canvas ref="myChart" :width="width" :height="height"></canvas>
</template>

<script>
    import Chart from 'chart.js';

    export default {
        name: 'performance-chart',
        props: {
            width: {
                type: Number,
                validator: value => value > 0
            },
            height: {
              type: Number,
              validator: value => value > 0
            },
            labels: Array,
            datasets: {
              type: Array,
              required: true
            },
            options: Object
        },
        data() {
            return {
                chart: null
            };
        },
        watch: {
            datasets(newDatasets) {
                this.chart.data.datasets = newDatasets;
                this.chart.update();
            }
        },
        mounted() {
            this.chart = new Chart(this.$refs.myChart, {
                type: 'bar',
                data: {
                    labels: this.labels,
                    datasets: this.datasets
                },
                options: this.options
            });
        },
        beforeDestroy () {
            if (this.chart) {
                this.chart.destroy()
            }
        }
    }
</script>
