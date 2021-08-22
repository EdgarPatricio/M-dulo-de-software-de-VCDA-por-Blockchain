import React, { Component } from "react";
import StorageCDAContract from "./contracts/StorageCDA.json";
import getWeb3 from "./getWeb3";

// Librería para generar el hash sha256
import sha256 from "js-sha256";

// Librería para generar las alertas
import Swal from 'sweetalert2'

import "./App.css";

import initial from './img/data-security.svg';
import loading from './img/loading.svg';
import valid from './img/valid.svg';
import invalid from './img/invalid.svg';

class App extends Component {
  state = { storageDNI: "", storageHashCDA: "", validate: null, showValidate: true, showRegister: false, numberOfRegistrations: 0, web3: null, metamask: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Obtener el proveedor de red y la instancia web3.
      const web3 = await getWeb3();
      const metamask = web3.currentProvider.isMetaMask;

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
      // con la interacción del método del contrato para conocer el número de registros
      this.setState({ web3, metamask, accounts, contract: instance }, this.run);
    } catch (error) {
      // Captura de errores para cualquiera de las operaciones anteriores.
      Swal.fire({
        icon: 'error',
        title: '¡Atención!',
        text: 'No se ha podido cargar web3, las cuentas o el contrato. Comprueba la consola para ver los detalles',
      });
      console.error(error);
    }
  };

  // La función run usa el método numbersCDAs para conocer el número de registros de CDAs
  run = async () => {
    const { contract } = this.state;
    const number = await contract.methods.numbersCDAs().call();
    console.log("Número de certificados registrados: " + number);
    this.setState({ numberOfRegistrations: number });
  };

  // La función handleSubmit  usa los métodos para crear el registro de un CDA en la red Blockchain
  // teniendo en cuenta si ya se encuentra registrado o no
  handleSubmit = async () => {
    const { storageDNI, storageHashCDA, accounts, contract } = this.state;
    const registered = await contract.methods.findHash(storageHashCDA).call();
    console.log("registrado: "+registered);

    // Se comprueba que los campos no esten vacios
    if (storageDNI === "" || storageHashCDA === "") {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Los campos deben estar completos para registrar el certificado digital académico en la red Blockchain',
      });
    }
    // Se comprueba que no este registrado
    else if (registered === false) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-start',
        showConfirmButton: false,
        timer: 20000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'info',
        text: 'Confirme la transacción y espere el mensaje de confirmación'
      });
      let result = await contract.methods.createCDA(storageDNI, storageHashCDA).send({ from: accounts[0] });
      console.log(result);
      Swal.fire({
        icon: 'success',
        title: '¡Correcto!',
        text: 'El certificado digital académico se registró en la red Blockchain con éxito',
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'El certificado digital académico ya se encuentra registrado en la red Blockchain',
      });
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
    if (storageDNI === "" || storageHashCDA === "") {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Los campos deben estar completos para validar el certificado digital académico',
      });
    } else {
      const response = await contract.methods.validateCDA(storageDNI, storageHashCDA).call();
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-start',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'info',
        text: 'Validación de autenticidad realizada, observe el resultado en pantalla'
      });
      this.setState({ validate: response });
    }
  };

  // Función para mostrar el formulario de registro
  handleChangeValidate = async () => {
    this.setState({ showValidate: true });
    this.setState({ showRegister: false });
    this.setState({ storageDNI: "" });
    this.setState({ storageHashCDA: "" });
    this.setState({ validate: null });
  };

  // Función para mostrar el formulario de validación
  handleChangeRegister = async () => {
    this.setState({ showValidate: false });
    this.setState({ showRegister: true });
    this.setState({ storageDNI: "" });
    this.setState({ storageHashCDA: "" });
    this.setState({ validate: null });
  };

  render() {
    const isValide = this.state.validate;
    const div_register = this.state.showRegister;
    const div_validate = this.state.showValidate;
    const metamaskIs = this.state.metamask;

    // Método para leer el documento en formato PDF
    const readFile = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const fileReader = new FileReader();

      // El formato al que se convierte el terxto es a un String binario
      fileReader.readAsBinaryString(file);

      fileReader.onload = () => {
        console.log(fileReader.result);

        // El algoritmo de función hash criptográfica seleccionado es el SHA256 o HASH256
        const hash256File = sha256(fileReader.result);
        this.setState({ storageHashCDA: hash256File });
        console.log(hash256File);
      }

      fileReader.onerror = () => {
        console.log(fileReader.error);
      }

    };
    // Se compruba la conexión con web3
    if (!this.state.web3) {
      return (
        <div className="row center">
          <div className="col s12">
            <div className="card">
              <div className="card-content">
                <img className='img-result' src={loading} alt="Cargando Web3, cuentas, y contrato..." /> <br />
                <span className="second-title-cost">Cargando Web3, cuentas, y contrato...</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="container">

        {/* Sección de título */}
        <div className="center">
          <h5 className="principal-title bt-40">Validación de autenticidad de los certificados académicos digitales</h5>
          <br />
        </div>

        {metamaskIs === true &&
          <div>
            <button type="button" className="btn" onClick={this.handleChangeRegister} >Registrar</button> | {' '}
            <button type="button" className="btn" onClick={this.handleChangeValidate} >Validar</button>
            <br />
            <br />
          </div>
        }
        <div className="row">
          <div>
            <span>Complete los campos adecuadamente:</span>
            <br />
            <br />
          </div>

          {/* Sección de registro de CDA */}
          {div_register === true &&
            <div className="col s12 m6">
              <div className="row">
                <div className="input-field">
                  <input id="dni" type="text" name="storageDNI" value={this.state.storageDNI} onChange={this.handleInputChange} />
                  <label className="active">Número de DNI:</label>
                </div>
                <div className="input-field">
                  <label className="active">Hash del documento: {this.state.storageHashCDA}</label><br />
                </div>
                <div className="file-field input-field">
                  <div className="btn">
                    <span>Subir archivo</span>
                    <input type="file" name="inputfile" multiple={false} onChange={readFile} accept=".pdf" />
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

          {/* Sección de validación de CDA */}
          {div_validate === true &&
            <div className="col s12 m6">
              <div className="row">
                <div className="input-field">
                  <input id="dni" type="text" name="storageDNI" value={this.state.storageDNI} onChange={this.handleInputChange} />
                  <label className="active">Número de DNI:</label>
                </div>
                <div className="file-field input-field">
                  <div className="btn">
                    <span>Subir archivo</span>
                    <input type="file" name="inputfile" multiple={false} onChange={readFile} accept=".pdf" />
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

          {/* Sección de registro de CDA */}
          {isValide === null &&
            <div className="col s12 m4 center">
              <div className="card-content">
                <img className='img-initial' src={initial} alt="El sistema está listo" /> <br />
                <span className="second-title-cost">El sistema esta listo</span>
              </div>
            </div>
          }

          {/* Sección de registro de CDA */}
          {isValide === true &&
            <div className="col s12 m4 center">
              <div className="row " >
                <div className="col s12">
                  <div className="card">
                    <div className="card-content">
                      <span className="">El certificado digital académico:</span> <br /> <br />
                      <img className='img-result' src={valid} alt="" /> <br />
                      <span className="second-title-cost">Es auténtico</span>
                    </div>
                    <div className="card-action">
                      <a href="./">Validar otro documento</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          {isValide === false &&
            <div className="col s12 m4 center">
              <div className="row " >
                <div className="col s12">
                  <div className="card">
                    <div className="card-content">
                      <span className="">El certificado digital académico:</span> <br /> <br />
                      <img className='img-result' src={invalid} alt="" /> <br />
                      <span className="red-text-UNL">No es auténtico</span>
                    </div>
                    <div className="card-action">
                      <a href="./">Validar otro documento</a>
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
