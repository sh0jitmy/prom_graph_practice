import React, { Component } from 'react';
import './App.css';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import {Bar} from 'react-chartjs-2';
import moment from 'moment'
import { PrometheusDriver, Alert, Metric, QueryResult }  from 'prometheus-query'

const prom = new PrometheusDriver({
	endpoint: 'http://localhost:8428'
});

const query = 'sum(vm_rows{instance="victoriametrics:8428",job="victoriametrics"})'; 
//const query = 'up{instance="victoriametrics:8428",job="victoriametrics"}'; 

class App extends Component {
  constructor(props){
    super(props)

    this.state = {
      showBar: false,
      dataset: {}, // Graph outer object
      apiData: {} // Full request api data
    }
  }

  componentDidMount(){
    this.fetchPrometheusData();
  }

  fetchPrometheusData = () => {
    let labels = [];
    let data = [];
    let currentDate = new Date()
    let previousDate = new Date()
    previousDate.setDate(previousDate.getDate() - 1);
    previousDate.setHours(previousDate.getHours() + 23);
    prom.rangeQuery(query, new Date().getTime() - 24 * 60 * 60 * 1000, new Date(), 6 * 60 * 60)
    .then((res: QueryResult) => {
        console.log("****************", "[rangeQuery] Query:", query, "****************");
        console.log("\n");

        const series = res.result;
        series.forEach((serie) => {
            console.log("[rangeQuery] Serie:", serie.metric.toString());
            console.log("[rangeQuery] Values:\n" + serie.values.join('\n'));
            console.log("\n");
            serie.values.forEach(function(value, index) {
               console.log("time:",value.time);
               console.log("value:",value.value);
               labels.push(moment(value.time).format("HH:mm.ss"));
               //labels.push(moment.unix(value.time).format("hh:mm"));
               data.push(value.value); 
            });
        });
        let dataset = {
            labels: labels,
            datasets: [{
                label: "value",
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1,
                hoverBackgroundColor: 'blue',
                hoverBorderColor: 'blue',
                data: data,
            }]  
        };
        this.setState({
            dataset: dataset,
            showBar: true,
        })
    })//then.res
    .catch(console.error);
  }


  render() {
    return (
      <div className="App">
        <div>
          <h1>Prometheus Monitor</h1>
          {this.state.showBar &&
          <div>
           <Bar
             data={this.state.dataset}
             height={250}
             options={{
               barPercentage: 0.2,
               barThickness: 0.5,
               maintainAspectRatio: false,
               scales: {
                  xAxes: [{
                    ticks: {
                      maxTicksLimit: 20
                    }
                  }],
                  yAxes: [{
                    ticks: {
                      beginAtZero:true
                    }
                 }]
              },
            }}
          />
         </div>}
        </div>
      </div>
    );
  }
}

export default App;
