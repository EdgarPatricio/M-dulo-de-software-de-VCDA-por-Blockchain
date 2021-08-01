import React, { Component } from "react";
import StorageCDAContract from "./contracts/StorageCDA.json";
import getWeb3 from "./getWeb3";

import "./App.css";

import loading from './img/loading.svg';
import valid from './img/valid.svg';
import invalid from './img/invalid.svg';

class App extends Component {
  state = { storageDNI: "", storageHashCDA: "", validate: null, showValidate: true, showRegister: false, numberOfRegistrations: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Obtener el proveedor de red y la instancia web3.
      const web3 = await getWeb3();

      // Usar web3 para obtener las cuentas de los usuarios.
      const accounts = await web3.eth.getAccounts();

      // Obtener la instancia del contrato.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StorageCDAContract.networks[networkId];
      const instance = new web3.eth.Contract(
        StorageCDAContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Establece el estado de web3, cuentas y contrato, y luego procede
      // con la interacción del método del contrato para conocer el número de registros.
      this.setState({ web3, accounts, contract: instance }, this.run);
    } catch (error) {
      // Captura de errores para cualquiera de las operaciones anteriores.
      alert(
        `No se ha podido cargar la web3, las cuentas o el contrato. Comprueba la consola para ver los detalles.`,
      );
      console.error(error);
    }
  };

  // La función run usa el método numbersCDAs para conocer el número de registros de CDAs
  run = async () => {
    const { contract } = this.state;
    const number = await contract.methods.numbersCDAs().call();
    console.log(number);
    this.setState({ numberOfRegistrations: number });
  };

  // La función handleSubmit  usa los métodos para crear el registro de un CDA en la red Blockchain
  // teniendo en cuenta si ya se encuentra registrado o no
  handleSubmit = async () => {
    const { storageDNI, storageHashCDA, accounts, contract } = this.state;
    const registered = await contract.methods.validateCDA(storageDNI, storageHashCDA).call();
    if (registered == false) {
      let result = await contract.methods.createCDA(storageDNI, storageHashCDA).send({ from: accounts[0] });
      console.log(result);
      alert("El certificado digital académico se registró en la red Blockchain con éxito");
    } else {
      alert("El certificado digital académico ya se encuentra registrado en la red Blockchain");
    }

    // Se actualiza el estado del número de registros para mostrar en pantalla
    const number = await contract.methods.numbersCDAs().call();
    this.setState({ numberOfRegistrations: number });

  };

  // Función para obtener los valores de los inputs en el formulario
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  };

  // Función para validar si el CDA es o no autentico
  handleValidate = async () => {
    const { storageDNI, storageHashCDA, contract } = this.state;
    const response = await contract.methods.validateCDA(storageDNI, storageHashCDA).call();
    this.setState({ validate: response });
  };

  // Función para mostrar el formulario de registro
  handleChangeValidate = async () => {
    this.setState({ showValidate: true });
    this.setState({ showRegister: false });
  };

  // Función para mostrar el formulario de validación
  handleChangeRegister = async () => {
    this.setState({ showValidate: false });
    this.setState({ showRegister: true });
  };

  render() {
    const isValide = this.state.validate;
    const div_register = this.state.showRegister;
    const div_validate = this.state.showValidate;
    if (!this.state.web3) {
      return (
        <div className="row center">
          <div className="col s12">
            <div className="card">
              <div className="card-content">
                <img className='img-result' src={loading} /> <br />
                <span className="second-title-cost">Cargando Web3, cuentas, y contrato...</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="container">
        <div className="center">
          <h5 className="principal-title bt-40">Validación de autenticidad de los certificados académicos digitales</h5>
          <br />
          <br />
          <br />
        </div>
        <button type="button" className="btn" onClick={this.handleChangeRegister} >Registrar</button> | {' '}
        <button type="button" className="btn" onClick={this.handleChangeValidate} >Validar</button>
        <br />
        <br />
        <div className="row">
          {div_register == true &&
            <div className="col s12 m6">
              <div className="row">
                <div className="input-field">
                  <input id="dni" type="text" name="storageDNI" value={this.state.storageDNI} onChange={this.handleInputChange} />
                  <label className="active">Número de DNI:</label>
                </div>
                <div className="input-field">
                  <label className="active">Hash del documento:</label>
                  <input type="text" id="output" name="storageHashCDA" value={this.state.storageHashCDA} onChange={this.handleInputChange} />
                </div>
                <div className="file-field input-field">
                  <div className="btn">
                    <span>Subir archivo</span>
                    <input type="file" id="inputfile" name="inputfile" />
                  </div>
                  <div className="file-path-wrapper">
                    <input className="file-path validate" placeholder="Subir el certificado digital académico en formato .pdf" type="text" />
                  </div>
                </div>
              </div>
              <div className="center">
                <button type="button" className="btn btnBlueUNL" onClick={this.handleSubmit}>Registrar en Blockchain</button>
              </div>
              <p>Número de certificados digitales académicos registrados en Blockchain: {this.state.numberOfRegistrations}</p>
            </div>
          }

          {div_validate == true &&
            <div className="col s12 m6">
              <div className="row">
                <div className="input-field">
                  <input id="dni" type="text" name="storageDNI" value={this.state.storageDNI} onChange={this.handleInputChange} />
                  <label className="active">Número de DNI:</label>
                </div>
                <div className="input-field">
                  <label className="active">Hash del documento:</label>
                  <input type="text" id="output" name="storageHashCDA" value={this.state.storageHashCDA} onChange={this.handleInputChange} />
                </div>
                <div className="file-field input-field">
                  <div className="btn">
                    <span>Subir archivo</span>
                    <input type="file" id="inputfile" name="inputfile" />
                  </div>
                  <div className="file-path-wrapper">
                    <input className="file-path validate" placeholder="Subir el certificado digital académico en formato .pdf" type="text" />
                  </div>
                </div>
              </div>
              <div className="center">
                <button type="button" className="btn btnBlueUNL" onClick={this.handleValidate}>Validar</button>
              </div>
            </div>
          }
          <div className="col s12 m1 "  ></div>
          <div className="col s12 m1 verticalLine"></div>
          {isValide == null &&
            <div className="col s12 m4 center">
              <div className="row " >
                <div className="col s12">
                  <div className="card">
                    <div className="card-content">
                      <img className='img-result' src={loading} /> <br />
                      <span className="second-title-cost">Esperando ...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          {isValide == true &&
            <div className="col s12 m4 center">
              <div className="row " >
                <div className="col s12">
                  <div className="card">
                    <div className="card-content">
                      <span className="">El certificado digital académico:</span> <br /> <br />
                      <img className='img-result' src={valid} /> <br />
                      <span className="second-title-cost">Es auténtico</span>
                    </div>
                    <div className="card-action">
                      <a href="./">Verificar otro documento</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          {isValide == false &&
            <div className="col s12 m4 center">
              <div className="row " >
                <div className="col s12">
                  <div className="card">
                    <div className="card-content">
                      <span className="">El certificado digital académico:</span> <br /> <br />
                      <img className='img-result' src={invalid} /> <br />
                      <span className="red-text-UNL">No es auténtico</span>
                    </div>
                    <div className="card-action">
                      <a href="./">Verificar otro documento</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

        </div>
      </div>
    );
  }
}

export default App;
