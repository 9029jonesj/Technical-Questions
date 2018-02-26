import React, { Component } from 'react';
import './App.css';
import Axios from 'axios';

class AddSensor extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('A sensor was added: ' + this.state.value);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} action="/sensor-management/add-sensor" method="POST">
        <label>
          Latitude, Longitude:
          <input type="text" id="latLon" name="latLon" value={this.state.value} onChange={this.handleChange} placeholder="39.186874, -77.250432" required />
        </label>
        <input type="submit" value="Add Sensor" />
      </form>
    );
  }
}

class DeleteSensor extends Component {
  constructor(props) {
    super(props);
    this.state = {sensor: ''};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    this.setState({sensor: this.props.sensor});
    var url = "/sensor-management/delete-sensor/" + this.props.sensor;
    Axios.delete(url)
      .then(function(res) {
        window.location.href = '/';
        return res;
      })
      .catch(function(error) {
        return error;
      });
    alert('A sensor was removed: ' + this.props.sensor);
  }

  render() {
    return (
      <button onClick={this.handleClick}>Delete Sensor</button>
    )
  }
}

class App extends Component {
  state = { sensors: [] }

  componentDidMount() {
    fetch('/sensors')
      .then(res => res.json())
      .then(allSensors => this.setState({ sensors: allSensors }))
  }

  render() {
    return (
      <div className="App">
        <h1>Sensors Dashboard</h1>
        <AddSensor/>
        <ul>
          {this.state.sensors.map(sensor =>
            <li key={sensor.id}>
              <div>
                Sensor ID: {sensor.id} <br/>
                Sensor Name: {sensor.name} <br/>
                Temperature (°F): {sensor.temp} <br/>
                <DeleteSensor sensor={sensor.id}/>
              </div>
              <br/>
            </li>
          )}
          </ul>
      </div>
    );
  }
}

export default App;
