import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

import { determineChartData } from './data/render-chart-data';

var CanvasJSReact = require('../src/canvasjs/canvasjs.react').default;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: false,
      zipCodes: null,
      options: null,
      chartChoices: ['Pop', 'Rep_zip', 'Dem_zip', 'Unreg_zip']
	};

    this.onFileChange = this.onFileChange.bind(this);
    this.renderAllCharts = this.renderAllCharts.bind(this);
  }

  renderAllCharts = () => {
    const { options, chartChoices, zipCodes } = this.state;
    let chartData;

    try {
      chartData = chartChoices.map(chartChoice => {
        let data = determineChartData(chartChoice, options, zipCodes);
        return (
          <CanvasJSChart options={data}/>
        );
      });
    } catch(err) {
      this.setState({
        error: true,
        loading: false
      });
    }
    return chartData;
  };

  onFileChange = (e) => {
    const data = new FormData();
    if (e.target.files[0]) {
      data.append('file', e.target.files[0]);
      data.append('type', 'bar');
      axios.post("http://localhost:8080/upload", data, {
      }).then(res => {
          this.setState({
            options: res.data.new_data,
            zipCodes: res.data.zipCodes,
            loading: false
          })
      }).catch(err => {
        this.setState({
          error: true,
          loading: false
        });
      });
      this.setState({
        loading: true
      })
    }
  };

  renderContainer = () => {
    const { options, loading, error } = this.state;
    if (loading) {
      return (
        <div className='load-button-container'>
          <h3>Loading</h3>
        </div>
      );
    } else if (!loading && error) {
      return (
        <div className='load-button-container'>
          <h3>ERROR</h3>
        </div>
      );
    } else if (!loading && !options) {
      return (
        <div className='load-button-container'>
          <h3>Upload County Data</h3>
          <label className='input-label'>
            Upload
            <input
              type='file'
              className='input-button'
              onChange={(e) => this.onFileChange(e)}
            />
          </label>
        </div>
      );
    } else {
      const chartData = this.renderAllCharts();
      return (
        <div>
          {chartData}
        </div>
      );
    }
  };

  render() {
    return (
      <div className="chart-container">
        {this.renderContainer()}
      </div>
    )
  }
}

export default App;
