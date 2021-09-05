import React, { Component } from "react";
import StorageCDAContract from "./contracts/StorageCDA.json";
import MigrationsContract from "./contracts/Migrations.json";
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
  state = { storageDNI: "", storageHashCDA: "", validate: null, showValidate: true, showRegister: false, numberOfRegistrations: 0, web3: null, accounts: null, contract: null, isDeploymentOwner: true };

  componentDidMount = async () => {
    try {
      // Obtener el proveedor de red y la instancia web3.
      const web3 = await getWeb3();

      // Usar web3 para obtener las cuentas de los usuarios.
      const accounts = await web3.eth.getAccounts();

      // Obtener la instancia del contrato StorageCDA.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StorageCDAContract.networks[networkId];
      const instanceContractStorageCDA = new web3.eth.Contract(
        StorageCDAContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Obtener la instancia del contrato Migrations.
      const deployedNetwork2 = MigrationsContract.networks[networkId];
      const instanceContractMigrations = new web3.eth.Contract(
        MigrationsContract.abi,
        deployedNetwork2 && deployedNetwork2.address,
      );

      // Consultar el dueño del despliegue de los contratos y comparar si es la cuenta con la que se encuentra conectado.
      const deploymentOwner = await instanceContractMigrations.methods.owner().call();
      if (accounts[0] === deploymentOwner) {
        this.setState({ isDeploymentOwner: true });
      } else {
        this.setState({ isDeploymentOwner: false });
      };

      // Establece el estado de web3, cuentas y contrato, y luego procede
      // con la interacción del método del contrato para conocer el número de registros
      this.setState({ web3, accounts, contract: instanceContractStorageCDA, }, this.run);
    } catch (error) {
      // Captura de errores para cualquiera de las operaciones anteriores.
      Swal.fire({
        icon: 'error',
        title: '¡Atención!',
        html: 'No se ha podido cargar',
        timer: 3000,
        confirmButtonText:
          'Aceptar',
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
      Swal.fire({
        title: 'Espere...',
        text: 'Confirme la transacción y espere el mensaje de confirmación (esto tomará un tiempo)...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
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
        text: 'Los campos deben estar completos para validar la autenticidad del certificado digital académico',
      });
    } else {
      const response = await contract.methods.validateCDA(storageDNI, storageHashCDA).call();
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
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
        title: 'Validación de autenticidad realizada, observe el resultado en pantalla'
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
    const isOwner = this.state.isDeploymentOwner
    const isValide = this.state.validate;
    const div_register = this.state.showRegister;
    const div_validate = this.state.showValidate;

    // Método para leer el documento en formato PDF
    const readFile = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.type === "application/pdf") {

        const fileReader = new FileReader();

        // El formato al que se convierte el terxto es a un String binario
        fileReader.readAsBinaryString(file);

        fileReader.onload = () => {
          // console.log(fileReader.result);

          // El algoritmo de función hash criptográfica seleccionado es el SHA256 o HASH256
          const hash256File = sha256(fileReader.result);
          this.setState({ storageHashCDA: hash256File });
          // console.log(hash256File);
        }

        fileReader.onerror = () => {
          console.log(fileReader.error);
        }
      } else {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: 'El archivo seleccionado no es un PDF',
          allowEscapeKey: false,
          allowOutsideClick: false,
          confirmButtonText:
            '<a href="../">Aceptar</a>',
        });
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
                <p className="hide-on-small-and-down">
                  Compruebe que su navegador sea <strong>Chrome</strong>  o <strong>Firefox</strong>. <br />
                  Y tener instalado la extensión <strong>MetaMask</strong> (además <strong>iniciar sesión</strong> o <strong>crear cuenta</strong>), <br /> más información <a href="https://metamask.io/" target="_blank">aquí</a>.
                </p>
                <p className="show-on-small show-on-medium hide-on-med-and-up">Debe ingresar por medio de la aplicación móvil de MetaMask, más información <a href="https://metamask.io/" target="_blank">aquí</a>.</p>
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
          <h5 className="principal-title">Validación de autenticidad de los certificados académicos digitales</h5>
          <br />
        </div>
        <div className="row">
          {div_register === true && isOwner === true &&
            <div className="row">
              <div className="col s12 m6">
                <ul className="tabs container-one">
                  <li className="tab col s6"><button onClick={this.handleChangeValidate}>Validar certificados</button></li>
                  <li className="tab col s6 active"><button className="active" onClick={this.handleChangeRegister}>Registrar certificados</button></li>
                </ul>
              </div>
            </div>
          }
          {div_validate === true && isOwner === true &&
            <div className="row">
              <div className="col s12 m6">
                <ul className="tabs container-one">
                  <li className="tab col s6 active"><button className="active" onClick={this.handleChangeValidate}>Validar certificados</button></li>
                  <li className="tab col s6"><button onClick={this.handleChangeRegister}>Registrar certificados</button></li>
                </ul>
              </div>
            </div>
          }
          <div className="row">
            <div className="col s12">
              <span>Complete los campos correctamente:</span>
            </div>
          </div>

          <div className="row container-two">
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
            <div className="col s12 m1 hide-on-small-and-down"></div>
            <div className="col s12 m1 verticalLine hide-on-small-and-down"></div>

            {/* Sección de inicio indicando que el sistema está listo */}
            {isValide === null &&
              <div className="col s12 m4 center">
                <div className="card-content">
                  <img className='img-initial' src={initial} alt="El sistema está listo" /> <br />
                  <span className="second-title-cost">El sistema está listo</span>
                </div>
              </div>
            }

            {/* Sección de validación positiva de CDA */}
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
            {/* Sección de validación negativa de CDA */}
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
      </div>
    );
  }
}

export default App;
