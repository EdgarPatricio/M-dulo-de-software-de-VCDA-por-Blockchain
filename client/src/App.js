import React, { Component } from "react";
import StorageCDAContract from "./contracts/StorageCDA.json";
import getWeb3 from "./getWeb3";

import "./App.css";

import loading from './img/loading.svg';
//import valid from './img/valid.svg';
//import invalid from './img/invalid.svg';

class App extends Component {
  //state = { dni:"1104717572", hash_cda:"012345678911118aervg1er9", web3: null, accounts: null, contract: null };
  state = { storageDNI:null, storageHashCDA:null, web3: null, accounts: null, contract: null};

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
      // con un ejemplo de interacción con los métodos del contrato.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Captura de errores para cualquiera de las operaciones anteriores.
      alert(
        `No se ha podido cargar la web3, las cuentas o el contrato. Comprueba la consola para ver los detalles.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Almacena un valor determinado, 5 por defecto.
    await contract.methods.createCDA("1104717572","hashdelcocumento1").send({ from: accounts[0] });

    // Obtener el valor del contrato para demostrar que ha funcionado.
    const response = await contract.methods.validateCDA("1104717572","hashdelcocumento1").call();

    // Actualizar el estado con el resultado.
    this.setState({ storageDNI: response });
  };
  handleSubmit = async () =>{
    const { dni, hash_cda} = this.state;
    let result = await this.StorageCDAContract.methods.createCDA(dni,hash_cda).send({from: this.accounts[0]});
    console.log(result);
    alert("El certificado digital fue registrado en la Blockchain con éxito");
  }

  render() {
    if (!this.state.web3) {
      return (
        <div className="row ">
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
        <div className="row">
          <div className="col s12 m6">
            <div className="row">
              <div className="input-field">
                <input id="first_name2" type="text" name="dni" value="{this.stage.dni}" placeholder="Ingrese el número de DNI al que le pertenece el certificado digital académico" className="validate"/>
                <label className="active" for="first_name2">Número de DNI:</label>
              </div>
              <div className="file-field input-field">
                <div className="btn">
                  <span>Subir archivo</span>
                  <input type="file"/>
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path validate" placeholder="Subir el certificado digital académico en formato .pdf" type="text"/>
                </div>
              </div>
              <div className="input-field">
                <input id="hash256" type="number" name="hash_cda" value="{this.state.cost}" />
                <label className="active" for="hash256">Hash del documento:</label>
              </div>

            </div>
            <div className="center">
              <button type="button" className="btn btnBlueUNL" onClick={this.handleSubmit}>Registrar en Blockchain</button>
            </div>
          </div>
          <div className="col s12 m1 "  ></div>
          <div className="col s12 m1 verticalLine"></div>
          <div className="col s12 m4 center">

            <div className="row " >
              <div className="col s12">
                <div className="card">
                  <div className="card-content">
                    <span className="">El certificado digital académico es:</span> <br /> <br />
                    <img className='img-result' src={loading} /> <br />
                    <span className="second-title-cost">Es auténtico</span>
                  </div>
                  <div className="card-action">
                    <a href="#">Verificar otro documento</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
