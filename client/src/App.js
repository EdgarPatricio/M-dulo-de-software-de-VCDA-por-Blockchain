import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import "./App.css";

import loading from './img/loading.svg';
import valid from './img/valid.svg';
import invalid from './img/invalid.svg';

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Obtener el proveedor de red y la instancia web3.
      const web3 = await getWeb3();

      // Usar web3 para obtener las cuentas de los usuarios.
      const accounts = await web3.eth.getAccounts();

      // Obtener la instancia del contrato.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
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
    await contract.methods.set(5).send({ from: accounts[0] });

    // Obtener el valor del contrato para demostrar que ha funcionado.
    const response = await contract.methods.get().call();

    // Actualizar el estado con el resultado.
    this.setState({ storageValue: response });
  };

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
      <div className="App">
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 42</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    );
  }
}

export default App;
